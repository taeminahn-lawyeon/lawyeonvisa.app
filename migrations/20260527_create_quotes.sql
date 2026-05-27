-- migrations/20260527_create_quotes.sql
-- 스레드 내 견적 → 결제 링크 기능을 위한 quotes 테이블
-- 관리자가 케이스별 임의 금액 견적을 발송하고, 고객이 같은 스레드에서
-- Toss(국내, 자동 승인) / Wise(해외, 수동 확인)로 결제하는 흐름을 지원한다.

CREATE TABLE IF NOT EXISTS public.quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  agency_fee    integer NOT NULL DEFAULT 0,
  govt_fee      integer NOT NULL DEFAULT 0,
  total_amount  integer NOT NULL,
  currency      text    NOT NULL DEFAULT 'KRW',

  status        text    NOT NULL DEFAULT 'sent'
                  CHECK (status IN ('sent','paid','expired','cancelled')),

  payment_method text   NOT NULL DEFAULT 'toss'
                  CHECK (payment_method IN ('toss','wise')),

  toss_order_id text,
  payment_key   text,
  paid_via      text CHECK (paid_via IS NULL OR paid_via IN ('toss','wise')),
  paid_at       timestamptz,

  message_id    uuid,
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_thread_id     ON public.quotes(thread_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status        ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_toss_order_id ON public.quotes(toss_order_id);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 고객: 본인 소유 스레드의 견적만 SELECT (수정/생성 불가)
DROP POLICY IF EXISTS quotes_owner_select ON public.quotes;
CREATE POLICY quotes_owner_select
  ON public.quotes
  FOR SELECT
  USING (
    thread_id IN (SELECT id FROM public.threads WHERE user_id = auth.uid())
  );

-- 관리자(super_admin/admin/staff): 전체 작업
-- admins 테이블 또는 profiles.role 기준으로 폭넓게 허용
DROP POLICY IF EXISTS quotes_admin_all ON public.quotes;
CREATE POLICY quotes_admin_all
  ON public.quotes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND role IN ('super_admin','admin','staff')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('super_admin','admin','staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND role IN ('super_admin','admin','staff')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('super_admin','admin','staff')
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ quotes 테이블 및 RLS 정책 생성 완료';
END $$;

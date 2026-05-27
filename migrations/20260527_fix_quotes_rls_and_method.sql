-- migrations/20260527_fix_quotes_rls_and_method.sql
-- 1) quotes 테이블에 payment_method 컬럼 추가 (toss / wise — 관리자가 발송 시 선택)
-- 2) RLS 정책 재생성 (정책 누락으로 모든 접근이 거부되던 문제 수정)
--    관리자 인식을 admins 테이블 OR profiles.role 양쪽으로 폭넓게 허용

-- 1) 결제 수단 컬럼
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'toss';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotes_payment_method_check'
  ) THEN
    ALTER TABLE public.quotes
      ADD CONSTRAINT quotes_payment_method_check
      CHECK (payment_method IN ('toss','wise'));
  END IF;
END $$;

-- 2) RLS 정책 재생성
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 고객: 본인 소유 스레드의 견적만 SELECT
DROP POLICY IF EXISTS quotes_owner_select ON public.quotes;
CREATE POLICY quotes_owner_select
  ON public.quotes
  FOR SELECT
  USING (
    thread_id IN (SELECT id FROM public.threads WHERE user_id = auth.uid())
  );

-- 관리자: 전체 작업 (admins 테이블 또는 profiles.role 기준)
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
  RAISE NOTICE '✅ quotes payment_method 컬럼 + RLS 정책 재생성 완료';
END $$;

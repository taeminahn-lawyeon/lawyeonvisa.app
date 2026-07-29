-- migrations/20260729_create_inquiries.sql
-- 온라인 문의(Inquiry) 접수 테이블
--
-- 배경: 기존에는 문의 접수 시 threads 를 생성해 쓰레드로 상담을 진행했으나,
--       쓰레드는 카드/WISE 결제 링크 전달 용도로만 사용하도록 정책이 변경되었다.
--       문의는 이 테이블에 적재하고 담당자 메일(ADMIN_EMAIL)로 전달한다.
--
-- 접수 경로(source):
--   consultation          — 온라인 상담 신청 (consultation 페이지, 상세 폼)
--   service               — 서비스별 상담 신청 (consultation-request.html)
--   urgent                — 긴급 상담 신청 (urgent-consultation-request.html)
--   business_immigration  — 사업이민 사전 상담 (business-immigration-request.html)
--
-- 비로그인 방문자도 접수하므로 anon INSERT 를 허용한다(기업 자문·방문 예약과 동일 정책).
-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS public.inquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 로그인 상태로 문의했다면 기록(선택). 비로그인 문의는 NULL.
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  source        text NOT NULL DEFAULT 'consultation'
                  CHECK (source IN ('consultation', 'service', 'urgent', 'business_immigration')),
  service_name  text,            -- 선택한 서비스명(있는 경우)

  name          text NOT NULL,
  phone         text NOT NULL,
  email         text,

  category      text,            -- 상담 사안 분야
  in_korea      boolean,         -- 국내 체류 여부
  visa_type     text,            -- 체류 자격(국내 체류 시)
  visa_expiry   date,            -- 체류 만료일(국내 체류 시)
  country       text,            -- 현재 체류 국가(국외 체류 시)
  message       text,            -- 상담 내용

  lang          text NOT NULL DEFAULT 'ko',

  status        text NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested', 'contacted', 'closed')),

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status  ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_source  ON public.inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON public.inquiries(created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 방문자 누구나(비로그인 포함) 문의 접수 가능
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
CREATE POLICY inquiries_public_insert
  ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 로그인 사용자는 자신의 문의만 조회 가능
DROP POLICY IF EXISTS inquiries_owner_select ON public.inquiries;
CREATE POLICY inquiries_owner_select
  ON public.inquiries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 관리자(super_admin, admin, staff)는 전체 접근
DROP POLICY IF EXISTS inquiries_admin_all ON public.inquiries;
CREATE POLICY inquiries_admin_all
  ON public.inquiries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.admins a
        JOIN auth.users u ON u.email = a.email
       WHERE u.id = auth.uid()
         AND a.role IN ('super_admin', 'admin', 'staff')
    )
  );

COMMENT ON TABLE public.inquiries IS
  '온라인 문의 접수 — 쓰레드를 만들지 않고 담당자 메일로 전달되는 상담 신청';
COMMENT ON COLUMN public.inquiries.source IS
  '접수 경로 (consultation / service / urgent / business_immigration)';

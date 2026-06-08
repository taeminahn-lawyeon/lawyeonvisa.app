-- migrations/20260608_create_corporate_inquiries.sql
-- 기업 자문(Corporate Advisory) 문의 저장 테이블.
-- 기업 자문 문의는 로그인 없이도 접수 가능하므로 anon INSERT 를 허용한다.
-- 조회/관리는 super_admin 만(또는 로그인 사용자 본인 레코드).

CREATE TABLE IF NOT EXISTS public.corporate_inquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 로그인 상태로 문의했다면 user_id 기록(선택). 비로그인 문의는 NULL.
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  name          text NOT NULL,
  company       text,            -- 회사/기관명(선택)
  phone         text NOT NULL,
  email         text,            -- 이메일(선택)
  message       text,            -- 문의 내용(선택)
  lang          text NOT NULL DEFAULT 'ko' CHECK (lang IN ('ko','en')),

  status        text NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested','contacted','closed')),

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_status  ON public.corporate_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_user_id ON public.corporate_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_inquiries_created ON public.corporate_inquiries(created_at);

ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- 방문자 누구나(비로그인 포함) 문의 접수 가능
DROP POLICY IF EXISTS corporate_inquiries_public_insert ON public.corporate_inquiries;
CREATE POLICY corporate_inquiries_public_insert
  ON public.corporate_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 로그인 사용자는 자신의 문의만 조회 가능
DROP POLICY IF EXISTS corporate_inquiries_owner_select ON public.corporate_inquiries;
CREATE POLICY corporate_inquiries_owner_select
  ON public.corporate_inquiries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- super_admin: 전체 조회·관리
DROP POLICY IF EXISTS corporate_inquiries_super_admin_all ON public.corporate_inquiries;
CREATE POLICY corporate_inquiries_super_admin_all
  ON public.corporate_inquiries
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

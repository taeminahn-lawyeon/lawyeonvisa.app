-- migrations/20260420_create_system_errors.sql
-- 시스템 에러 로그용 범용 테이블
-- 쓰레드 생성 실패 등 클라이언트/서버 측 오류 추적에 사용
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-8-3

CREATE TABLE IF NOT EXISTS public.system_errors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type    text        NOT NULL,
  error_code    text,
  request_id    text,
  context       jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  resolved_by   uuid        REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_system_errors_error_type
  ON public.system_errors(error_type);

-- 대시보드 뱃지용 부분 인덱스 (미해결만)
CREATE INDEX IF NOT EXISTS idx_system_errors_unresolved
  ON public.system_errors(created_at DESC)
  WHERE resolved_at IS NULL;

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- super_admin: SELECT/UPDATE 허용
DROP POLICY IF EXISTS system_errors_super_admin_select ON public.system_errors;
CREATE POLICY system_errors_super_admin_select
  ON public.system_errors
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

DROP POLICY IF EXISTS system_errors_super_admin_update ON public.system_errors;
CREATE POLICY system_errors_super_admin_update
  ON public.system_errors
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

-- INSERT: 인증된 사용자 허용. user_id 위조 방지(NULL 또는 본인만)
DROP POLICY IF EXISTS system_errors_insert ON public.system_errors;
CREATE POLICY system_errors_insert
  ON public.system_errors
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

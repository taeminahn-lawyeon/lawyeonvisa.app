-- migrations/20260420_create_consultation_requests.sql
-- 사업이민 상담 신청 시점의 스냅샷 테이블 신규 생성
-- 콘솔 확인 결과 기존 consultation_requests 테이블은 존재하지 않음 (CREATE 분기)
-- 기존 일반 상담(consultation-request.html)은 이 테이블을 사용하지 않고 threads에 직접 INSERT
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-1-2

CREATE TABLE IF NOT EXISTS public.consultation_requests (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type             text NOT NULL DEFAULT 'general'
                              CHECK (request_type IN ('general','business_immigration')),

  -- threads(id) 참조 — 순환 외래키 회피를 위해 FK 없이 인덱스만 생성
  thread_id                uuid,

  -- 사업이민 전용 스냅샷 필드 (9개)
  nationality              text,
  residence_country        text,
  visa_type_interest       text
                              CHECK (visa_type_interest IS NULL
                                     OR visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  family_composition       jsonb,
  children_count           integer,
  timeline                 text
                              CHECK (timeline IS NULL
                                     OR timeline IN ('3months','6months','1year','over1year','undecided')),
  message                  text,
  contact_method           text
                              CHECK (contact_method IS NULL
                                     OR contact_method IN ('email','thread','phone')),
  email                    text,

  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consult_requests_user_id
  ON public.consultation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_consult_requests_thread_id
  ON public.consultation_requests(thread_id);
CREATE INDEX IF NOT EXISTS idx_consult_requests_request_type
  ON public.consultation_requests(request_type);

ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- 고객: 자기 레코드 SELECT/INSERT
DROP POLICY IF EXISTS consult_requests_owner_select
  ON public.consultation_requests;
CREATE POLICY consult_requests_owner_select
  ON public.consultation_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS consult_requests_owner_insert
  ON public.consultation_requests;
CREATE POLICY consult_requests_owner_insert
  ON public.consultation_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- super_admin: 전체 작업
DROP POLICY IF EXISTS consult_requests_super_admin_all
  ON public.consultation_requests;
CREATE POLICY consult_requests_super_admin_all
  ON public.consultation_requests
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));

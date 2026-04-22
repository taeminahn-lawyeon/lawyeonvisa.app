-- ============================================================================
-- 사업이민 섹션 통합 마이그레이션 SQL (1회 실행용)
-- ============================================================================
--
-- 개별 마이그레이션 7건을 하나로 묶은 스크립트입니다.
-- Supabase Dashboard → SQL Editor에 전체 복사/붙여넣기 → Run.
--
-- 구성:
--   Part 1/7 — business_immigration_profiles 테이블
--   Part 2/7 — profile_completed 자동 계산 트리거
--   Part 3/7 — consultation_requests 테이블
--   Part 4/7 — threads 테이블 컬럼 추가
--   Part 5/7 — business-immigration-documents Storage 버킷 + RLS
--   Part 6/7 — system_errors 테이블
--   Part 7/7 — create_business_immigration_request RPC 함수
--
--   말미: 검증 쿼리 (생성 여부 일괄 확인)
--
-- 안전장치:
--   - BEGIN ... COMMIT 단일 트랜잭션. 중간 어느 한 줄이라도 실패하면
--     모든 변경이 자동 롤백됩니다.
--   - 각 CREATE/ALTER에 IF NOT EXISTS 또는 DROP ... IF EXISTS 사용으로
--     재실행 안전(idempotent).
--
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14
-- ============================================================================

BEGIN;


-- ============================================================================
-- Part 1/7 — business_immigration_profiles 테이블 (섹션 14-1-1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.business_immigration_profiles (
  user_id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed            boolean     NOT NULL DEFAULT false,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  last_name_en                 text        NOT NULL,
  first_name_en                text        NOT NULL,
  full_name_native             text,
  nationality                  text        NOT NULL,
  passport_number              text        NOT NULL,
  passport_expiry              date        NOT NULL,
  birth_date                   date        NOT NULL,
  gender                       text        NOT NULL
                                 CHECK (gender IN ('male','female','other')),
  residence_country            text        NOT NULL,
  home_address                 text,
  home_phone                   text,
  email                        text        NOT NULL,
  native_language              text        NOT NULL,
  preferred_contact_method     text        NOT NULL
                                 CHECK (preferred_contact_method IN ('email','thread','phone')),
  family_composition           jsonb,
  visa_type_interest           text        NOT NULL
                                 CHECK (visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  timeline                     text
                                 CHECK (timeline IS NULL
                                        OR timeline IN ('3months','6months','1year','over1year','undecided')),
  preferred_industry           text,
  preferred_location           text,
  funding_source               text,
  education_background         text,
  work_experience              text,
  korea_visit_history          text,
  korean_language_proficiency  text,
  criminal_record              boolean
);

CREATE INDEX IF NOT EXISTS idx_biz_profiles_nationality
  ON public.business_immigration_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_biz_profiles_visa_type_interest
  ON public.business_immigration_profiles(visa_type_interest);
CREATE INDEX IF NOT EXISTS idx_biz_profiles_profile_completed
  ON public.business_immigration_profiles(profile_completed)
  WHERE profile_completed = false;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_biz_profiles_set_updated_at
  ON public.business_immigration_profiles;
CREATE TRIGGER trg_biz_profiles_set_updated_at
  BEFORE UPDATE ON public.business_immigration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.business_immigration_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biz_profiles_owner_select ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_owner_select
  ON public.business_immigration_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS biz_profiles_owner_insert ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_owner_insert
  ON public.business_immigration_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS biz_profiles_owner_update ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_owner_update
  ON public.business_immigration_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS biz_profiles_super_admin_all ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_super_admin_all
  ON public.business_immigration_profiles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'::user_role
  ));


-- ============================================================================
-- Part 2/7 — profile_completed 자동 계산 트리거 (섹션 14-6)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.compute_biz_profile_completed()
  RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.profile_completed := (
    NEW.nationality        IS NOT NULL AND
    NEW.residence_country  IS NOT NULL AND
    NEW.visa_type_interest IS NOT NULL
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_biz_profile_compute_completed
  ON public.business_immigration_profiles;
CREATE TRIGGER trg_biz_profile_compute_completed
  BEFORE INSERT OR UPDATE ON public.business_immigration_profiles
  FOR EACH ROW EXECUTE FUNCTION public.compute_biz_profile_completed();


-- ============================================================================
-- Part 3/7 — consultation_requests 테이블 (섹션 14-1-2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.consultation_requests (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type             text NOT NULL DEFAULT 'general'
                              CHECK (request_type IN ('general','business_immigration')),
  thread_id                uuid,
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

DROP POLICY IF EXISTS consult_requests_owner_select ON public.consultation_requests;
CREATE POLICY consult_requests_owner_select
  ON public.consultation_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS consult_requests_owner_insert ON public.consultation_requests;
CREATE POLICY consult_requests_owner_insert
  ON public.consultation_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS consult_requests_super_admin_all ON public.consultation_requests;
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


-- ============================================================================
-- Part 4/7 — threads 테이블 컬럼 추가 (섹션 14-2)
-- ============================================================================

ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS request_type                text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS business_immigration_status text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'threads_request_type_check'
      AND conrelid = 'public.threads'::regclass
  ) THEN
    ALTER TABLE public.threads
      ADD CONSTRAINT threads_request_type_check
        CHECK (request_type IN ('general','business_immigration'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'threads_biz_status_check'
      AND conrelid = 'public.threads'::regclass
  ) THEN
    ALTER TABLE public.threads
      ADD CONSTRAINT threads_biz_status_check
        CHECK (
          business_immigration_status IS NULL
          OR business_immigration_status IN (
               'pre_consultation',
               'detailed_consultation',
               'stage1_engaged',
               'stage1_completed',
               'stage2_engaged',
               'visa_issued',
               'aftercare',
               'archived'
             )
        );
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_threads_request_type
  ON public.threads(request_type);
CREATE INDEX IF NOT EXISTS idx_threads_biz_status
  ON public.threads(business_immigration_status)
  WHERE business_immigration_status IS NOT NULL;


-- ============================================================================
-- Part 5/7 — business-immigration-documents 버킷 + RLS (섹션 14-3)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-immigration-documents',
  'business-immigration-documents',
  false,
  52428800,
  ARRAY['application/pdf','image/jpeg','image/png','image/heic']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS biz_docs_owner_select ON storage.objects;
CREATE POLICY biz_docs_owner_select
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS biz_docs_owner_insert ON storage.objects;
CREATE POLICY biz_docs_owner_insert
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[2] IN
        ('passport','criminal_record','education','family','funding','contracts')
  );

DROP POLICY IF EXISTS biz_docs_owner_update ON storage.objects;
CREATE POLICY biz_docs_owner_update
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS biz_docs_owner_delete ON storage.objects;
CREATE POLICY biz_docs_owner_delete
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS biz_docs_super_admin_all ON storage.objects;
CREATE POLICY biz_docs_super_admin_all
  ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'business-immigration-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'::user_role
    )
  )
  WITH CHECK (
    bucket_id = 'business-immigration-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'::user_role
    )
  );


-- ============================================================================
-- Part 6/7 — system_errors 테이블 (섹션 14-8-3)
-- ============================================================================

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
CREATE INDEX IF NOT EXISTS idx_system_errors_unresolved
  ON public.system_errors(created_at DESC)
  WHERE resolved_at IS NULL;

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS system_errors_insert ON public.system_errors;
CREATE POLICY system_errors_insert
  ON public.system_errors
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());


-- ============================================================================
-- Part 7/7 — create_business_immigration_request RPC 함수 (섹션 14-8-4)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_business_immigration_request(
  p_nationality         text,
  p_residence_country   text,
  p_visa_type_interest  text,
  p_family_composition  jsonb,
  p_children_count      integer,
  p_timeline            text,
  p_message             text,
  p_contact_method      text,
  p_email               text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid := auth.uid();
  v_request_id uuid;
  v_thread_id  uuid;
  v_order_id   text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  v_order_id := 'BIZ-' || (extract(epoch FROM now())::bigint)::text;

  INSERT INTO public.consultation_requests (
    user_id, request_type,
    nationality, residence_country, visa_type_interest,
    family_composition, children_count, timeline,
    message, contact_method, email
  ) VALUES (
    v_user_id, 'business_immigration',
    p_nationality, p_residence_country, p_visa_type_interest,
    p_family_composition, p_children_count, p_timeline,
    p_message, p_contact_method, p_email
  )
  RETURNING id INTO v_request_id;

  INSERT INTO public.threads (
    user_id, service_name, status, amount, order_id,
    request_type, business_immigration_status,
    is_consulting, organization
  ) VALUES (
    v_user_id,
    'Business Immigration Consultation',
    'active',
    0,
    v_order_id,
    'business_immigration',
    'pre_consultation',
    true,
    'business_immigration'
  )
  RETURNING id INTO v_thread_id;

  UPDATE public.consultation_requests
     SET thread_id = v_thread_id
   WHERE id = v_request_id;

  RETURN jsonb_build_object(
    'request_id', v_request_id,
    'thread_id',  v_thread_id,
    'order_id',   v_order_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_business_immigration_request(
  text, text, text, jsonb, integer, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_business_immigration_request(
  text, text, text, jsonb, integer, text, text, text, text
) TO authenticated;


COMMIT;


-- ============================================================================
-- 검증 쿼리 (마이그레이션 성공 확인)
-- ============================================================================
-- 아래 쿼리들을 추가로 실행해 모든 항목이 정상 생성되었는지 확인하세요.
-- 각 쿼리의 기대 결과가 설명되어 있습니다.

-- (1) 신규 테이블 3개 확인 — 3행 반환 기대
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('business_immigration_profiles','consultation_requests','system_errors')
ORDER BY tablename;

-- (2) threads 신규 컬럼 2개 확인 — 2행 반환 기대
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'threads'
  AND column_name  IN ('request_type','business_immigration_status')
ORDER BY column_name;

-- (3) Storage 버킷 확인 — 1행 반환 기대
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'business-immigration-documents';

-- (4) Storage RLS 정책 확인 — 5행 반환 기대 (biz_docs_*)
SELECT policyname
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'biz_docs_%'
ORDER BY policyname;

-- (5) 트리거 2개 확인 — 2행 반환 기대
SELECT tgname
FROM pg_trigger
WHERE tgname IN ('trg_biz_profiles_set_updated_at','trg_biz_profile_compute_completed')
ORDER BY tgname;

-- (6) RPC 함수 확인 — 1행 반환 기대
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'create_business_immigration_request';

-- (7) profile_completed 트리거 동작 스모크 테스트 (선택 — 사용자 1명 필요)
-- 실제 사용자 UUID로 교체 후 실행. INSERT 후 profile_completed가 true인지 확인.
-- INSERT INTO public.business_immigration_profiles (
--   user_id, last_name_en, first_name_en, nationality, passport_number,
--   passport_expiry, birth_date, gender,
--   residence_country, email, native_language, preferred_contact_method,
--   visa_type_interest
-- ) VALUES (
--   '실제-user-uuid'::uuid, 'Test', 'User', 'KR', 'P000000', '2030-12-31',
--   '1990-01-01', 'other', 'KR', 'test@example.com', 'Korean', 'email', 'D-9-4'
-- );
-- SELECT user_id, profile_completed FROM public.business_immigration_profiles
-- WHERE user_id = '실제-user-uuid'::uuid;

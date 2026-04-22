-- migrations/20260420_create_business_immigration_profiles.sql
-- 사업이민 지원자 전용 프로필 테이블 생성
-- 기존 public.profiles는 변경하지 않고 별도 테이블로 분리
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-1-1

CREATE TABLE IF NOT EXISTS public.business_immigration_profiles (
  -- 메타
  user_id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed            boolean     NOT NULL DEFAULT false,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),

  -- 기본 정보 (8)
  last_name_en                 text        NOT NULL,
  first_name_en                text        NOT NULL,
  full_name_native             text,
  nationality                  text        NOT NULL,
  passport_number              text        NOT NULL,
  passport_expiry              date        NOT NULL,
  birth_date                   date        NOT NULL,
  gender                       text        NOT NULL
                                 CHECK (gender IN ('male','female','other')),

  -- 거주·연락 (6)
  residence_country            text        NOT NULL,
  home_address                 text,
  home_phone                   text,
  email                        text        NOT NULL,
  native_language              text        NOT NULL,
  preferred_contact_method     text        NOT NULL
                                 CHECK (preferred_contact_method IN ('email','thread','phone')),

  -- 가족 구성 (1)
  family_composition           jsonb,

  -- 이민 의도 (5)
  visa_type_interest           text        NOT NULL
                                 CHECK (visa_type_interest IN ('D-9-4','D-9-5','undecided')),
  timeline                     text
                                 CHECK (timeline IS NULL
                                        OR timeline IN ('3months','6months','1year','over1year','undecided')),
  preferred_industry           text,
  preferred_location           text,
  funding_source               text,

  -- 배경 (5)
  education_background         text,
  work_experience              text,
  korea_visit_history          text,
  korean_language_proficiency  text,
  criminal_record              boolean
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_biz_profiles_nationality
  ON public.business_immigration_profiles(nationality);

CREATE INDEX IF NOT EXISTS idx_biz_profiles_visa_type_interest
  ON public.business_immigration_profiles(visa_type_interest);

-- 미완 프로필 대시보드 조회용 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_biz_profiles_profile_completed
  ON public.business_immigration_profiles(profile_completed)
  WHERE profile_completed = false;

-- updated_at 자동 갱신 공용 함수 (이미 존재하면 교체)
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
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

-- RLS 활성화
ALTER TABLE public.business_immigration_profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 고객은 자기 레코드만 SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS biz_profiles_owner_select
  ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_owner_select
  ON public.business_immigration_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS biz_profiles_owner_insert
  ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_owner_insert
  ON public.business_immigration_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS biz_profiles_owner_update
  ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_owner_update
  ON public.business_immigration_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 정책: super_admin은 전체 작업 허용
DROP POLICY IF EXISTS biz_profiles_super_admin_all
  ON public.business_immigration_profiles;
CREATE POLICY biz_profiles_super_admin_all
  ON public.business_immigration_profiles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
  ));

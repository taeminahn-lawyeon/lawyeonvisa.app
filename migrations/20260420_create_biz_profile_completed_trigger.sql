-- migrations/20260420_create_biz_profile_completed_trigger.sql
-- business_immigration_profiles.profile_completed 자동 계산 트리거
-- 필수 3개 필드(nationality, residence_country, visa_type_interest)가 모두 NOT NULL이면 true
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-6

-- 사전 조건: 20260420_create_business_immigration_profiles.sql 먼저 적용

CREATE OR REPLACE FUNCTION public.compute_biz_profile_completed()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
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

-- 기존 행이 있다면 재평가 (마이그레이션 재적용 대비)
UPDATE public.business_immigration_profiles
   SET updated_at = updated_at;  -- BEFORE UPDATE 트리거가 재계산 수행

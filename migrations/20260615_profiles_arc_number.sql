-- migrations/20260615_profiles_arc_number.sql
-- profile-submit 개편: 여권번호(passport_number)와 외국인등록번호(arc_number)를
-- 분리 저장한다. 기존에는 ARC 번호를 passport_number 에 저장했으나, 이제
-- passport_number 에는 실제 여권번호를, arc_number 에는 외국인등록번호 또는
-- 국내거소신고번호를 저장한다.
-- is_in_korea / country 컬럼은 20260609_profiles_residence_fields.sql 에서 추가됨.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS arc_number text;  -- 외국인등록번호 / 국내거소신고번호 (국내 체류자)

-- migrations/20260609_profiles_residence_fields.sql
-- 마이페이지 체류 상태 / 온라인 상담 인테이크용 추가 컬럼.
-- visa_type, visa_expiry_date 는 기존에 존재(profile-submit). 여기서는
-- '현재 국내 체류 여부'와 '국내 미체류 시 체류 국가'를 추가한다.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_in_korea   boolean,
  ADD COLUMN IF NOT EXISTS country       text,   -- 거주(체류) 국가: ISO2 또는 국가명
  ADD COLUMN IF NOT EXISTS matter_category text; -- 최근 상담 사안 분야(참고용)

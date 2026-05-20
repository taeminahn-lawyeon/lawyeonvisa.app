-- 2026.05 — KDU → FEU 브랜드 통합
-- 극동대 전용 페이지의 URL/특강코드/내부 식별자를 KDU → FEU 로 통일하면서
-- 기존 DB 레코드도 마이그레이션.
--
-- 사용법: Supabase SQL Editor 에 본 파일 전체를 붙여넣고 Run.
-- 멱등(idempotent) — 여러 번 실행해도 안전합니다.
--
-- 영향 범위:
--   - profiles.organization 'kdu' → 'feu'
--   - threads.organization 'kdu' → 'feu'
--   - threads.service_name 의 '(KDU)' → '(FEU)' 그리고 '-kdu' suffix → '-feu'
--   - blog_posts 등 다른 테이블에는 kdu 식별자가 없음

BEGIN;

-- 1) profiles 테이블
UPDATE public.profiles
SET organization = 'feu'
WHERE organization = 'kdu';

-- 2) threads.organization
UPDATE public.threads
SET organization = 'feu'
WHERE organization = 'kdu';

-- 3) threads.service_name 안에 들어가 있는 '(KDU)' 문구 변경
UPDATE public.threads
SET service_name = REPLACE(service_name, '(KDU)', '(FEU)')
WHERE service_name LIKE '%(KDU)%';

-- 4) order_id / 기타 식별자에 'd10-1-kdu' 같은 형태가 들어있다면 변환
--    (현재 시스템에서는 service_name 만 사용하지만 안전망 차원)
UPDATE public.threads
SET service_name = REPLACE(service_name, '-kdu', '-feu')
WHERE service_name LIKE '%-kdu%';

COMMIT;

-- 검증
-- SELECT id, service_name, organization FROM public.threads WHERE organization = 'feu' OR service_name ILIKE '%feu%';
-- SELECT id, name, organization FROM public.profiles WHERE organization = 'feu';

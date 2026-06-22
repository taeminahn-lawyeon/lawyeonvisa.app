-- migrations/20260612_backfill_chosun_organization_threads.sql
-- 2026-06-12 (KST) 에 열린 쓰레드는 모두 조선대 전용 페이지(service-chosun.html)를
-- 통해 생성되었으나 organization 이 'chosun' 으로 표기되지 않은 건이 있어 보정.
--
-- 배경:
--  service-chosun.html → service-apply-general.html?org=chosun 경로로 쓰레드가
--  생성되지만, 일부 경로(상담/사전상담 등)에서 org 파라미터가 누락되어
--  organization 이 NULL 또는 'general' 로 저장되었음.
--
-- 휴리스틱: 2026-06-12(KST) 생성 + organization 미표기(NULL/general) → chosun 간주.
--  (사용자 확인: 해당 일자 쓰레드는 전부 조선대 페이지를 통해 개설됨)

-- 1) 해당 일자 쓰레드 organization 보정
UPDATE public.threads
SET organization = 'chosun'
WHERE (organization IS NULL OR organization = 'general')
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date = DATE '2026-06-12';

-- 2) 보정된 쓰레드 소유자의 profiles.organization 도 함께 보정 (미표기 건만)
UPDATE public.profiles p
SET organization = 'chosun'
FROM (
  SELECT DISTINCT user_id
  FROM public.threads
  WHERE organization = 'chosun'
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date = DATE '2026-06-12'
    AND user_id IS NOT NULL
) sub
WHERE p.id = sub.user_id
  AND p.organization IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ 2026-06-12 조선대 쓰레드 organization 백필 완료';
END $$;

-- 확인용 쿼리:
-- SELECT id, service_name, organization, created_at
-- FROM public.threads
-- WHERE (created_at AT TIME ZONE 'Asia/Seoul')::date = DATE '2026-06-12'
-- ORDER BY created_at;

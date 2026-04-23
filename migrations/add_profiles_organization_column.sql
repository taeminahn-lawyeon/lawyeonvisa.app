-- profiles 테이블에 organization 컬럼 추가
-- 가입 경로별 소속 단체 식별 ('chosun', 'kdu' 등)
-- admin-dashboard 회원관리 탭의 "소속 단체" 컬럼/필터/badge 인프라가 이 컬럼을 참조함
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization TEXT;

-- 기존 회원 백필: threads.organization 이 'chosun' 또는 'kdu' 인 사용자에게 동일 값 부여
-- 한 사용자가 여러 organization 의 thread 를 가진 경우 가장 최근 thread 의 값 사용
UPDATE public.profiles p
SET organization = sub.organization
FROM (
  SELECT DISTINCT ON (user_id) user_id, organization
  FROM public.threads
  WHERE organization IS NOT NULL
  ORDER BY user_id, created_at DESC
) sub
WHERE p.id = sub.user_id
  AND p.organization IS NULL;

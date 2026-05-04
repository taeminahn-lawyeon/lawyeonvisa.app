-- 조선대 강의(2026-04-10, 코드 CHOSUN0410) 당일 가입자 중
-- profiles.organization 이 비어있는 회원을 'chosun' 으로 보정.
--
-- 배경:
--  login-chosun.html 에서 OAuth 콜백 시 기존 프로필이 존재하면
--  organization='chosun' 업데이트가 skip 되던 버그가 있었음.
--  thread 까지 만든 회원은 add_profiles_organization_column.sql 에서
--  threads.organization 기준으로 이미 백필 완료. 이 마이그레이션은
--  thread 를 만들지 않고 가입만 한 회원을 대상으로 함.
--
-- 휴리스틱: 강의 당일(KST) 가입 + organization NULL → chosun 간주.
-- 정확도가 100% 는 아니므로 (당일에 일반 가입한 사용자도 포함될 수 있음)
-- 필요시 수동 보정.

UPDATE public.profiles
SET organization = 'chosun'
WHERE organization IS NULL
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date = DATE '2026-04-10';

-- migrations/20260610_reservations_add_email_visa.sql
-- 방문 예약(reservations)에 이메일·현재 비자 컬럼 추가 (선택 입력).
-- 멱등(IF NOT EXISTS): 여러 번 실행해도 안전.
-- 적용 전에는 프런트엔드가 자동으로 email/visa 를 memo 에 합쳐 저장하므로
-- 이 마이그레이션을 적용하지 않아도 예약은 정상 동작한다(데이터 유실 없음).

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS visa  text;

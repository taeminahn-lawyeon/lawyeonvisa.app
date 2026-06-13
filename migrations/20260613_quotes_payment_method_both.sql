-- migrations/20260613_quotes_payment_method_both.sql
-- 견적 발송 시 Toss와 Wise 결제 링크를 동시에 제공하도록 변경
-- payment_method 에 'both' 값을 허용하고 기본값을 'both' 로 변경

-- 1) 기존 CHECK 제약 제거 후 'both' 포함하여 재생성
ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_payment_method_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_payment_method_check
  CHECK (payment_method IN ('toss','wise','both'));

-- 2) 신규 견적 기본값을 'both' 로 변경 (Toss + Wise 동시 제공)
ALTER TABLE public.quotes
  ALTER COLUMN payment_method SET DEFAULT 'both';

DO $$
BEGIN
  RAISE NOTICE '✅ quotes payment_method 에 both 허용 + 기본값 both 적용 완료';
END $$;

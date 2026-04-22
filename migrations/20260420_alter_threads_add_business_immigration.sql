-- migrations/20260420_alter_threads_add_business_immigration.sql
-- threads 테이블에 request_type, business_immigration_status 컬럼 추가
-- 콘솔 확인 결과 threads.status 컬럼 타입은 'text' (ENUM 아님) → ALTER TYPE 불필요
-- 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-2

ALTER TABLE public.threads
  ADD COLUMN IF NOT EXISTS request_type                text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS business_immigration_status text;

-- CHECK 제약 (IF NOT EXISTS는 constraint에 쓸 수 없어 DO 블록으로 처리)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'threads_request_type_check'
      AND conrelid = 'public.threads'::regclass
  ) THEN
    ALTER TABLE public.threads
      ADD CONSTRAINT threads_request_type_check
        CHECK (request_type IN ('general','business_immigration'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'threads_biz_status_check'
      AND conrelid = 'public.threads'::regclass
  ) THEN
    ALTER TABLE public.threads
      ADD CONSTRAINT threads_biz_status_check
        CHECK (
          business_immigration_status IS NULL
          OR business_immigration_status IN (
               'pre_consultation',
               'detailed_consultation',
               'stage1_engaged',
               'stage1_completed',
               'stage2_engaged',
               'visa_issued',
               'aftercare',
               'archived'
             )
        );
  END IF;
END$$;

-- 사업이민 쓰레드는 status='active' 고정 → 기존 status 값과 공존 (text 컬럼이므로 별도 CHECK 불필요)

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_threads_request_type
  ON public.threads(request_type);

CREATE INDEX IF NOT EXISTS idx_threads_biz_status
  ON public.threads(business_immigration_status)
  WHERE business_immigration_status IS NOT NULL;

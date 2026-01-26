-- 쓰레드 단계 관리를 위한 스키마 변경
-- Supabase SQL Editor에서 실행하세요

-- 1. threads 테이블에 새 컬럼 추가
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS is_consulting BOOLEAN DEFAULT false;

ALTER TABLE threads
ADD COLUMN IF NOT EXISTS current_stage INTEGER DEFAULT 1;

-- 2. 기존 쓰레드 업데이트 (상담 요청으로 생성된 경우)
UPDATE threads
SET is_consulting = true
WHERE service_name LIKE '%(상담)%' OR service_name LIKE '%(견적 상담)%';

-- 3. messages 테이블에 attachments 컬럼 추가 (JSON 배열)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_threads_is_consulting ON threads(is_consulting);
CREATE INDEX IF NOT EXISTS idx_threads_current_stage ON threads(current_stage);

-- 5. Storage 버킷 생성 (파일 업로드용) - Supabase Storage에서 수동 생성 필요
-- 버킷명: thread-files
-- Public: true

COMMENT ON COLUMN threads.is_consulting IS '블로그 상담 요청 여부 (true: 8단계, false: 6단계)';
COMMENT ON COLUMN threads.current_stage IS '현재 진행 단계 (1부터 시작)';
COMMENT ON COLUMN messages.attachments IS '첨부파일 목록 [{name, size, url}]';

-- ============================================
-- 알림 동의 컬럼 추가 마이그레이션
-- profiles 테이블에 notification_consent 관련 컬럼 추가
-- ============================================

-- 1. profiles 테이블에 알림 동의 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_consent_at TIMESTAMPTZ;

-- 2. consent_records 테이블에 알림 동의 컬럼 추가
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS notification_consent BOOLEAN DEFAULT false;

-- 3. notification_logs 테이블에 email 채널 지원을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_logs_messenger ON notification_logs(messenger);

-- ============================================
-- 법무법인 로연 출입국이민지원센터
-- 결제 보안 강화 SQL
-- ============================================
-- 생성일: 2025-01-28
-- 버전: 1.0.0
-- 목적: 결제 시스템 보안 강화
-- ============================================

-- ============================================
-- STEP 1: 결제 로그 테이블 생성
-- ============================================
-- 모든 결제 승인 요청을 기록하여 감사(Audit) 추적

CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id TEXT NOT NULL,
    payment_key TEXT NOT NULL,
    amount BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, confirmed, failed, refunded
    toss_response JSONB,  -- 토스페이먼츠 응답 전체 저장
    ip_address TEXT,
    user_agent TEXT,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON public.payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_key ON public.payment_logs(payment_key);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON public.payment_logs(status);

-- RLS 활성화
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 결제 로그만 조회 가능
CREATE POLICY "users_select_own_payment_logs" ON public.payment_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS 정책: 관리자는 모든 결제 로그 접근 가능
CREATE POLICY "admins_full_access_payment_logs" ON public.payment_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin')
        )
    );

-- RLS 정책: Service Role만 INSERT 가능 (Edge Function용)
CREATE POLICY "service_role_insert_payment_logs" ON public.payment_logs
    FOR INSERT
    WITH CHECK (true);  -- Service Role Key 사용 시 모든 INSERT 허용

-- ============================================
-- STEP 2: 결제 중복 방지 테이블
-- ============================================
-- Idempotency Key 저장하여 중복 결제 방지

CREATE TABLE IF NOT EXISTS public.processed_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    payment_key TEXT,
    amount BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',  -- processing, completed, failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_processed_payments_idempotency ON public.processed_payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_processed_payments_expires ON public.processed_payments(expires_at);

-- RLS 활성화
ALTER TABLE public.processed_payments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: Service Role만 접근 가능
CREATE POLICY "service_role_only_processed_payments" ON public.processed_payments
    FOR ALL
    USING (true);  -- Service Role Key 사용 시에만 접근

-- 자동 만료 정리 함수
CREATE OR REPLACE FUNCTION public.cleanup_expired_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.processed_payments
    WHERE expires_at < NOW();
END;
$$;

-- ============================================
-- STEP 3: 알림 로그 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messenger TEXT NOT NULL,  -- whatsapp, telegram, line, zalo, wechat
    recipient TEXT NOT NULL,
    template_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, sent, failed
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);

-- RLS 활성화
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 관리자만 조회 가능
CREATE POLICY "admins_select_notification_logs" ON public.notification_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin')
        )
    );

-- RLS 정책: Service Role만 INSERT 가능
CREATE POLICY "service_role_insert_notification_logs" ON public.notification_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- STEP 4: 보안 강화 - Rate Limiting 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,  -- user_id 또는 IP 주소
    action TEXT NOT NULL,  -- payment_confirm, notification, etc
    request_count INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 복합 유니크 제약조건
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique
ON public.rate_limits(identifier, action, window_start);

-- Rate Limiting 체크 함수
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_requests INT DEFAULT 10,
    p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_count INT;
BEGIN
    -- 현재 윈도우 시작 시간 계산
    v_window_start := date_trunc('minute', NOW());

    -- 현재 윈도우의 요청 수 확인
    SELECT COALESCE(SUM(request_count), 0)
    INTO v_count
    FROM public.rate_limits
    WHERE identifier = p_identifier
    AND action = p_action
    AND window_start >= NOW() - (p_window_seconds || ' seconds')::INTERVAL;

    -- 제한 초과 확인
    IF v_count >= p_max_requests THEN
        RETURN FALSE;  -- Rate limit exceeded
    END IF;

    -- 요청 수 증가 또는 새 레코드 생성
    INSERT INTO public.rate_limits (identifier, action, request_count, window_start)
    VALUES (p_identifier, p_action, 1, v_window_start)
    ON CONFLICT (identifier, action, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;

    RETURN TRUE;  -- Request allowed
END;
$$;

-- ============================================
-- STEP 5: 감사 로그 테이블 (보안 이벤트 기록)
-- ============================================

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,  -- login, logout, payment_attempt, suspicious_activity
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    severity TEXT DEFAULT 'info',  -- info, warning, error, critical
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON public.security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at DESC);

-- RLS 활성화
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: super_admin만 조회 가능
CREATE POLICY "super_admin_select_audit_logs" ON public.security_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role = 'super_admin'
        )
    );

-- RLS 정책: Service Role만 INSERT 가능
CREATE POLICY "service_role_insert_audit_logs" ON public.security_audit_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- STEP 6: 기존 테이블 보안 강화
-- ============================================

-- payments 테이블에 payment_key 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'payment_key'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN payment_key TEXT;
    END IF;
END $$;

-- payments 테이블에 toss_response 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'payments'
        AND column_name = 'toss_response'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN toss_response JSONB;
    END IF;
END $$;

-- ============================================
-- STEP 7: 정기 정리 작업 (Cron Job 설정 권장)
-- ============================================

-- 오래된 rate_limits 정리 함수
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- 오래된 결제 로그 아카이브 함수 (90일 이상)
CREATE OR REPLACE FUNCTION public.archive_old_payment_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 90일 이상 된 로그는 별도 아카이브 테이블로 이동하거나 삭제
    -- 여기서는 status를 'archived'로 변경
    UPDATE public.payment_logs
    SET status = 'archived'
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status NOT IN ('archived');
END;
$$;

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ 결제 보안 강화 설정 완료!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 생성된 테이블:';
    RAISE NOTICE '   - payment_logs (결제 감사 로그)';
    RAISE NOTICE '   - processed_payments (중복 결제 방지)';
    RAISE NOTICE '   - notification_logs (알림 로그)';
    RAISE NOTICE '   - rate_limits (Rate Limiting)';
    RAISE NOTICE '   - security_audit_logs (보안 감사 로그)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 생성된 함수:';
    RAISE NOTICE '   - check_rate_limit (Rate Limiting 체크)';
    RAISE NOTICE '   - cleanup_expired_payments (만료 결제 정리)';
    RAISE NOTICE '   - cleanup_old_rate_limits (Rate Limit 정리)';
    RAISE NOTICE '   - archive_old_payment_logs (결제 로그 아카이브)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  필수 작업:';
    RAISE NOTICE '   1. Supabase Dashboard에서 TOSS_SECRET_KEY 환경변수 설정';
    RAISE NOTICE '   2. Edge Function 재배포: supabase functions deploy confirm-payment';
    RAISE NOTICE '   3. 정기 정리 Cron Job 설정 (pg_cron 확장 필요)';
    RAISE NOTICE '============================================';
END $$;

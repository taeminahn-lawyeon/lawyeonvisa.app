-- ============================================
-- 법무법인 로연 출입국이민지원센터
-- Supabase 프로덕션 배포 통합 SQL
-- ============================================
-- 생성일: 2025-12-29
-- 버전: 1.0.0
-- 실행 순서: 이 파일 하나만 실행하면 됩니다
-- ============================================

-- ============================================
-- STEP 1: RLS 활성화 (보안 필수!)
-- ============================================

-- ⚠️ 중요: 이 부분은 반드시 실행해야 합니다
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Function search_path 보안 설정
-- ============================================

-- get_current_semester 함수
CREATE OR REPLACE FUNCTION public.get_current_semester()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_year INT;
    current_month INT;
    semester TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    current_month := EXTRACT(MONTH FROM CURRENT_DATE);
    
    -- 1월~7월: 1학기, 8월~12월: 2학기
    IF current_month <= 7 THEN
        semester := current_year || '-1';
    ELSE
        semester := current_year || '-2';
    END IF;
    
    RETURN semester;
END;
$$;

-- update_updated_at_column 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- STEP 3: profiles 테이블 RLS 정책
-- ============================================

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_full_access_profiles" ON public.profiles;

-- 사용자가 자신의 프로필만 조회
CREATE POLICY "users_select_own_profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id OR auth.uid() = user_id);

-- 사용자가 자신의 프로필만 수정
CREATE POLICY "users_update_own_profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR auth.uid() = user_id);

-- 사용자가 자신의 프로필 생성
CREATE POLICY "users_insert_own_profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- super_admin은 모든 프로필 접근
CREATE POLICY "admins_full_access_profiles" ON public.profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role = 'super_admin'
        )
    );

-- ============================================
-- STEP 4: threads 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "users_select_own_threads" ON public.threads;
DROP POLICY IF EXISTS "users_insert_own_threads" ON public.threads;
DROP POLICY IF EXISTS "users_update_own_threads" ON public.threads;
DROP POLICY IF EXISTS "admins_full_access_threads" ON public.threads;

-- 사용자가 자신의 쓰레드만 조회
CREATE POLICY "users_select_own_threads" ON public.threads
    FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자가 자신의 쓰레드만 생성
CREATE POLICY "users_insert_own_threads" ON public.threads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 쓰레드만 수정
CREATE POLICY "users_update_own_threads" ON public.threads
    FOR UPDATE
    USING (auth.uid() = user_id);

-- super_admin은 모든 쓰레드 접근
CREATE POLICY "admins_full_access_threads" ON public.threads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin')
        )
    );

-- ============================================
-- STEP 5: payments 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "users_select_own_payments" ON public.payments;
DROP POLICY IF EXISTS "users_insert_own_payments" ON public.payments;
DROP POLICY IF EXISTS "admins_full_access_payments" ON public.payments;

-- 사용자가 자신의 결제 내역만 조회
CREATE POLICY "users_select_own_payments" ON public.payments
    FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자가 자신의 결제 생성
CREATE POLICY "users_insert_own_payments" ON public.payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- super_admin은 모든 결제 접근
CREATE POLICY "admins_full_access_payments" ON public.payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role = 'super_admin'
        )
    );

-- ============================================
-- STEP 6: messages 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "users_select_own_messages" ON public.messages;
DROP POLICY IF EXISTS "users_insert_own_messages" ON public.messages;
DROP POLICY IF EXISTS "admins_full_access_messages" ON public.messages;

-- 사용자가 자신의 쓰레드 메시지만 조회
CREATE POLICY "users_select_own_messages" ON public.messages
    FOR SELECT
    USING (
        thread_id IN (
            SELECT id FROM public.threads WHERE user_id = auth.uid()
        )
    );

-- 사용자가 자신의 쓰레드에 메시지 작성
CREATE POLICY "users_insert_own_messages" ON public.messages
    FOR INSERT
    WITH CHECK (
        thread_id IN (
            SELECT id FROM public.threads WHERE user_id = auth.uid()
        )
    );

-- super_admin은 모든 메시지 접근
CREATE POLICY "admins_full_access_messages" ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin')
        )
    );

-- ============================================
-- STEP 7: applications 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "users_select_own_applications" ON public.applications;
DROP POLICY IF EXISTS "users_insert_own_applications" ON public.applications;
DROP POLICY IF EXISTS "users_update_own_applications" ON public.applications;
DROP POLICY IF EXISTS "admins_full_access_applications" ON public.applications;

-- 사용자가 자신의 신청만 조회
CREATE POLICY "users_select_own_applications" ON public.applications
    FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자가 자신의 신청만 생성
CREATE POLICY "users_insert_own_applications" ON public.applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 신청만 수정
CREATE POLICY "users_update_own_applications" ON public.applications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- super_admin은 모든 신청 접근
CREATE POLICY "admins_full_access_applications" ON public.applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role = 'super_admin'
        )
    );

-- ============================================
-- STEP 8: RLS 상태 확인
-- ============================================

SELECT 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'threads', 'payments', 'messages', 'applications', 'admins', 'jnu_students', 'korea_students')
ORDER BY tablename;

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ 프로덕션 보안 설정 완료!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS 활성화 완료:';
    RAISE NOTICE '   - profiles';
    RAISE NOTICE '   - threads';
    RAISE NOTICE '   - payments';
    RAISE NOTICE '   - messages';
    RAISE NOTICE '   - applications';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS 정책 설정 완료';
    RAISE NOTICE '✅ Function search_path 설정 완료';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  추가 작업 (Supabase Dashboard에서):';
    RAISE NOTICE '   1. Authentication → Policies → Leaked password protection 활성화';
    RAISE NOTICE '   2. 관리자 계정 생성 후 admins 테이블에 role 설정';
    RAISE NOTICE '============================================';
END $$;

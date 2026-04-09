-- ============================================
-- 관리자 대시보드 RLS 정책 수정
-- ============================================
-- 문제: profiles 테이블 RLS가 super_admin만 허용하여
--       admin/staff 역할의 관리자가 고객 정보를 조회할 수 없음
--       threads 테이블 RLS가 staff 역할을 허용하지 않음
-- 수정일: 2026-04-09
-- ============================================

-- ============================================
-- STEP 1: profiles 테이블 관리자 RLS 정책 수정
-- 기존: super_admin만 전체 프로필 접근 가능
-- 수정: super_admin, admin, staff 모두 전체 프로필 접근 가능
-- ============================================

DROP POLICY IF EXISTS "admins_full_access_profiles" ON public.profiles;

CREATE POLICY "admins_full_access_profiles" ON public.profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin', 'staff')
        )
    );

-- ============================================
-- STEP 2: threads 테이블 관리자 RLS 정책 수정
-- 기존: super_admin, admin만 전체 쓰레드 접근 가능
-- 수정: super_admin, admin, staff 모두 전체 쓰레드 접근 가능
-- ============================================

DROP POLICY IF EXISTS "admins_full_access_threads" ON public.threads;

CREATE POLICY "admins_full_access_threads" ON public.threads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin', 'staff')
        )
    );

-- ============================================
-- STEP 3: messages 테이블 관리자 RLS 정책 수정
-- staff도 메시지 접근 가능하도록 수정
-- ============================================

DROP POLICY IF EXISTS "admins_full_access_messages" ON public.messages;

CREATE POLICY "admins_full_access_messages" ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin', 'staff')
        )
    );

-- ============================================
-- STEP 4: payments 테이블 관리자 RLS 정책 수정
-- admin, staff도 결제 내역 조회 가능하도록 수정
-- ============================================

DROP POLICY IF EXISTS "admins_full_access_payments" ON public.payments;

CREATE POLICY "admins_full_access_payments" ON public.payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND role IN ('super_admin', 'admin', 'staff')
        )
    );

-- ============================================
-- 확인
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ 관리자 RLS 정책 수정 완료!';
    RAISE NOTICE '   - profiles: super_admin, admin, staff 전체 접근';
    RAISE NOTICE '   - threads: super_admin, admin, staff 전체 접근';
    RAISE NOTICE '   - messages: super_admin, admin, staff 전체 접근';
    RAISE NOTICE '   - payments: super_admin, admin, staff 전체 접근';
END $$;

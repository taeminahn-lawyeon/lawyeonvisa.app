/**
 * js/business-immigration.js
 *
 * 사업이민 섹션 전용 클라이언트 로직.
 * - 쓰레드 페이지 상단 배너(profile-completed 판정 기반)
 * - 상담 신청 폼 제출 (RPC + 실패 시 토스트 재시도)
 * - 관리자 대시보드 system_errors 뱃지 갱신
 * - 사업이민 welcome 메시지 빌더
 *
 * 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-7, 14-8
 *
 * 의존성:
 *   - js/supabase-client.js (supabaseClient, getUserProfile, isProfileCompleteForRequest,
 *     createBusinessImmigrationRequest, logSystemError, createWelcomeMessage 등)
 *   - js/i18n.js (window.i18n)
 *   - js/ui-components.js (토스트 유틸)
 *
 * 각 함수는 필요한 DOM 요소가 없으면 조기 반환하므로 여러 페이지에서 로드해도 안전.
 */

'use strict';

// ============================================
// 1. 쓰레드 배너 (섹션 14-7)
// ============================================

/**
 * 현재 쓰레드가 사업이민이고 프로필이 미완성이면 상단 배너 표시.
 * 기존 D-10-1·일반 경로에는 영향 없음(request_type 체크로 조기 반환).
 */
async function evaluateThreadProfileBanner() {
    const banner = document.getElementById('thread-profile-banner');
    if (!banner) return;
    // 사업이민 신청 페이지에서 폼이 삭제되어 별도 프로필 작성 단계가 없음.
    // 따라서 사업이민 쓰레드에서도 배너를 항상 숨김.
    // 일반 쓰레드에는 원래도 배너가 뜨지 않음(기존 로직에서 request_type 체크).
    banner.classList.add('thread-banner-hidden');
}

// ============================================
// 2. 재시도 가능 토스트 (섹션 14-8-5)
// ============================================

/**
 * 에러 토스트 + 재시도 버튼.
 * 기존 `ui-components.js`의 토스트 유틸이 번역 키를 직접 받지 않으므로,
 * 호출 측에서 `i18n.translate()` 결과를 전달.
 */
function showToastWithRetry(message, onRetry) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-error toast-with-retry';

    const retryLabel = (window.i18n && i18n.translate)
        ? i18n.translate('common.retry')
        : 'Retry';

    toast.innerHTML =
        '<span class="toast-message"></span>' +
        '<button class="toast-retry" type="button"></button>' +
        '<button class="toast-close" type="button" aria-label="close">×</button>';

    // 안전하게 textContent로 삽입 (XSS 방지)
    toast.querySelector('.toast-message').textContent = message;
    toast.querySelector('.toast-retry').textContent = retryLabel;

    toast.querySelector('.toast-retry').addEventListener('click', function () {
        hideToast(toast);
        if (typeof onRetry === 'function') onRetry();
    });
    toast.querySelector('.toast-close').addEventListener('click', function () {
        hideToast(toast);
    });

    container.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 10);
    // 자동 숨김 없음 — 사용자 조치 전까지 유지
}

function hideToast(toast) {
    if (!toast) return;
    toast.classList.remove('show');
    setTimeout(function () {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
}

// ============================================
// 3. 사업이민 상담 신청 폼 제출 (섹션 14-8-4)
// ============================================

/**
 * 폼을 읽어 RPC 호출 → 성공 시 쓰레드로 이동, 실패 시 토스트 재시도.
 * 사업이민 상담 신청 페이지(`business-immigration-request.html`)에서만 호출됨.
 */
async function submitBusinessImmigrationRequest() {
    const form = document.getElementById('biz-request-form');
    if (!form) return;

    // 로그인 체크
    const session = await supabaseClient.auth.getSession();
    if (!session?.data?.session) {
        alert((window.i18n && i18n.translate) ? i18n.translate('biz.form.auto_reply') : '로그인이 필요합니다.');
        if (typeof window.signInWithGoogle === 'function') window.signInWithGoogle();
        return;
    }
    const user = session.data.session.user;

    // 약관 동의 체크 (폼 필드는 제거되고 약관 체크박스만 남음)
    const consentCheck = form.querySelector('#consultConsentCheck');
    if (consentCheck && !consentCheck.checked) {
        alert((window.i18n && i18n.translate) ? i18n.translate('consultation.consentRequired') : '이용약관 및 개인정보 처리방침에 동의해 주세요.');
        return;
    }

    // 상세 정보는 본 상담 쓰레드에서 수집. 이메일만 Google OAuth에서 자동.
    const formData = {
        nationality: null,
        residence_country: null,
        visa_type_interest: null,
        family_composition: null,
        children_count: null,
        timeline: null,
        message: null,
        contact_method: null,
        email: user?.email || null
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        // 1) RPC 호출 — consultation_requests + threads 원자적 INSERT
        const result = await createBusinessImmigrationRequest(formData);
        if (!result.success) throw new Error(result.error || 'RPC failed');

        const threadId = result.data.thread_id;

        // 2) 환영 메시지 (RPC 외부, 실패해도 쓰레드 자체는 진행)
        try {
            const welcomeHtml = buildBusinessImmigrationWelcome();
            await createWelcomeMessage(threadId, 'Business Immigration Consultation', {
                requestType: 'business_immigration',
                customHtml: welcomeHtml
            });
        } catch (welcomeErr) {
            await logSystemError({
                error_type: 'welcome_message',
                request_id: String(threadId),
                context: { message: welcomeErr?.message }
            });
            // welcome 실패는 무음 진행
        }

        // 3) 쓰레드로 리다이렉트
        location.href = 'thread-general-v2.html?id=' + encodeURIComponent(threadId);

    } catch (err) {
        await logSystemError({
            error_type: 'thread_creation',
            error_code: err?.code,
            context: {
                message: err?.message,
                form_summary: {
                    nationality: formData.nationality,
                    visa_type_interest: formData.visa_type_interest
                }
            }
        });

        const msg = (window.i18n && i18n.translate)
            ? i18n.translate('biz.error.thread_creation')
            : 'Failed to create the thread. Please try again.';

        showToastWithRetry(msg, submitBusinessImmigrationRequest);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ============================================
// 4. 사업이민 welcome 메시지 빌더 (섹션 14-7-5)
// ============================================

/**
 * 사업이민 쓰레드 환영 메시지 HTML 생성.
 * "Enter Basic Info" 링크 없음 — 프로필 안내는 상단 배너가 담당.
 */
function buildBusinessImmigrationWelcome() {
    const t = (key, fallback) => {
        if (window.i18n && i18n.translate) {
            const v = i18n.translate(key);
            return v && v !== key ? v : fallback;
        }
        return fallback;
    };

    return (
        '<p>' + escapeHtml(t('biz.welcome.greeting', '사업이민 사전 상담을 신청해 주셔서 감사합니다.')) + '</p>' +
        '<ol>' +
        '<li>' + escapeHtml(t('biz.welcome.step1', '먼저 프로필 정보를 입력해 주시면 담당자가 맞춤 경로를 안내해 드립니다.')) + '</li>' +
        '<li>' + escapeHtml(t('biz.welcome.step2', '담당자가 본 상담 일정을 이 쓰레드에서 제안드립니다.')) + '</li>' +
        '<li>' + escapeHtml(t('biz.welcome.step3', '추가 문서가 필요한 경우 업로드 요청을 드립니다.')) + '</li>' +
        '</ol>' +
        '<p>' + escapeHtml(t('biz.welcome.closing', '궁금한 점이 있으시면 이 쓰레드에 자유롭게 적어 주세요.')) + '</p>'
    );
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// 5. 관리자 대시보드 system_errors 뱃지 (섹션 14-8-6)
// ============================================

/**
 * 사업이민 쓰레드 페이지 우측 세로 5단계 사이드바 렌더.
 * DB 8단계 business_immigration_status → UI 5단계 매핑:
 *   1. 사전 상담: pre_consultation
 *   2. 본 상담: detailed_consultation
 *   3. 착수: stage1_engaged, stage1_completed
 *   4. 정착: stage2_engaged, visa_issued
 *   5. 사후관리: aftercare
 *   (archived는 전체 완료 상태)
 */
function mapBizStatusToStage(status) {
    if (!status) return 0;
    const map = {
        pre_consultation: 1,
        detailed_consultation: 2,
        stage1_engaged: 3,
        stage1_completed: 3,
        stage2_engaged: 4,
        visa_issued: 4,
        aftercare: 5,
        archived: 5
    };
    return map[status] || 0;
}

async function renderBizImmigrationSidebar() {
    const sidebar = document.getElementById('bizImmigrationSidebar');
    if (!sidebar || !window.supabaseClient) return;

    const threadId = new URLSearchParams(location.search).get('id');
    if (!threadId) return;

    try {
        const { data: thread } = await supabaseClient
            .from('threads')
            .select('id, request_type, business_immigration_status')
            .eq('id', threadId)
            .maybeSingle();

        // 일반 쓰레드: 사업이민 섹션 숨김 유지, 기존 섹션 그대로
        if (!thread || thread.request_type !== 'business_immigration') {
            sidebar.classList.add('biz-sidebar-hidden');
            return;
        }

        // 사업이민 쓰레드: 기존 사이드바 섹션 숨김 + 사업이민 5단계 표시
        // (고객용 · 관리자 페이지 양쪽에서 동일 id/class 재사용)
        document.querySelectorAll(
            '#threadProgressSection, #threadSubmittedFilesSection, #threadFeeSection, .visa-thread-default-section'
        ).forEach(function (el) { el.style.display = 'none'; });

        const currentStage = mapBizStatusToStage(thread.business_immigration_status);
        const isArchived = thread.business_immigration_status === 'archived';

        sidebar.querySelectorAll('.biz-sidebar-step').forEach(function (el) {
            const stage = parseInt(el.getAttribute('data-stage'), 10);
            el.classList.remove('biz-sidebar-step-current', 'biz-sidebar-step-done', 'biz-sidebar-step-upcoming');
            if (isArchived) {
                el.classList.add('biz-sidebar-step-done');
            } else if (stage < currentStage) {
                el.classList.add('biz-sidebar-step-done');
            } else if (stage === currentStage) {
                el.classList.add('biz-sidebar-step-current');
            } else {
                el.classList.add('biz-sidebar-step-upcoming');
            }
        });

        sidebar.classList.remove('biz-sidebar-hidden');
    } catch (err) {
        console.error('[biz sidebar]', err);
    }
}

async function refreshSystemErrorsBadge() {
    const badge = document.getElementById('system-errors-badge');
    if (!badge || !window.supabaseClient) return;

    try {
        const { count, error } = await supabaseClient
            .from('system_errors')
            .select('id', { count: 'exact', head: true })
            .is('resolved_at', null);

        if (error) {
            console.warn('[system-errors-badge] query error:', error);
            badge.classList.add('nav-badge-hidden');
            return;
        }

        if (count && count > 0) {
            badge.textContent = String(count);
            badge.classList.remove('nav-badge-hidden');
        } else {
            badge.classList.add('nav-badge-hidden');
        }
    } catch (e) {
        console.warn('[system-errors-badge] exception:', e);
    }
}

// ============================================
// 자동 초기화
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // 쓰레드 페이지에서만 배너 평가(해당 DOM 없으면 조기 반환됨)
    evaluateThreadProfileBanner();

    // 쓰레드 페이지에서만 사업이민 사이드바 렌더(해당 DOM 없으면 조기 반환됨)
    renderBizImmigrationSidebar();

    // 관리자 대시보드에서만 뱃지 갱신(해당 DOM 없으면 조기 반환됨)
    refreshSystemErrorsBadge();

    // 상담 신청 페이지에서만 폼 이벤트 바인딩
    const form = document.getElementById('biz-request-form');
    if (form) {
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            submitBusinessImmigrationRequest();
        });
    }
});

// 외부 호출용으로 window에 노출 (필요 시)
window.businessImmigration = {
    evaluateThreadProfileBanner: evaluateThreadProfileBanner,
    renderBizImmigrationSidebar: renderBizImmigrationSidebar,
    submitBusinessImmigrationRequest: submitBusinessImmigrationRequest,
    refreshSystemErrorsBadge: refreshSystemErrorsBadge,
    showToastWithRetry: showToastWithRetry,
    buildBusinessImmigrationWelcome: buildBusinessImmigrationWelcome,
    mapBizStatusToStage: mapBizStatusToStage
};

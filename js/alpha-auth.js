// ============================================
// 알파 테스트 인증 체크
// ============================================

(function() {
    // 인증 페이지 자체는 체크 제외
    if (window.location.pathname.includes('auth.html')) {
        return;
    }

    // 관리자 로그인 페이지는 체크 제외
    if (window.location.pathname.includes('admin-login.html')) {
        return;
    }

    // 알파 테스트 인증 확인
    if (sessionStorage.getItem('alpha_auth') !== 'true') {
        window.location.href = '/auth.html';
    }
})();

console.log('🔐 알파 테스트 인증 확인 완료');

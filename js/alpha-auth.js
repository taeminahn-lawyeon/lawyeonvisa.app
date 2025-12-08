// ============================================
// 알파 테스트 인증 체크
// ============================================

// 즉시 실행 함수로 감싸기
(function() {
    'use strict';
    
    // 현재 페이지 경로
    var currentPath = window.location.pathname;
    
    // 인증 페이지 자체는 체크 제외
    if (currentPath.indexOf('auth.html') !== -1) {
        console.log('🔓 인증 페이지 - 체크 생략');
        return;
    }

    // 관리자 로그인 페이지는 체크 제외
    if (currentPath.indexOf('admin-login.html') !== -1) {
        console.log('🔓 관리자 로그인 페이지 - 체크 생략');
        return;
    }

    // 알파 테스트 인증 확인
    var isAuthenticated = sessionStorage.getItem('alpha_auth') === 'true';
    
    if (!isAuthenticated) {
        console.log('🔒 인증 필요 - auth.html로 리디렉션');
        window.location.href = '/auth.html';
    } else {
        console.log('✅ 알파 테스트 인증 확인 완료');
    }
})();

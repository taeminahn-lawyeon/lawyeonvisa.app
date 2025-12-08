// 서비스 신청 가격 데이터
const servicePricing = {
    // 체류자격·기간 (14개)
    'stay-status-change': {
        id: 'stay-status-change',
        name: '체류자격 변경 허가',
        category: '체류자격·기간',
        price: {
            general: 1050000,
            partner: 950000
        },
        description: '다른 체류자격으로 변경하는 경우',
        processingDays: '14일',
        requiredDocs: ['여권 사본', '외국인등록증', '변경사유서', '재정증명서류']
    },
    'stay-extension': {
        id: 'stay-extension',
        name: '체류기간 연장 허가',
        category: '체류자격·기간',
        price: {
            general: 510000,
            partner: 200000
        },
        description: '현재 체류자격 유지하며 기간 연장',
        processingDays: '7-14일',
        requiredDocs: ['여권 사본', '외국인등록증', '재학증명서 또는 재직증명서']
    },
    'stay-extension-poor': {
        id: 'stay-extension-poor',
        name: '체류기간 연장 허가 (학업불량)',
        category: '체류자격·기간',
        price: {
            general: 720000,
            partner: 220000
        },
        description: '학업 성적 미달 시 연장 신청',
        processingDays: '14-21일',
        requiredDocs: ['여권 사본', '외국인등록증', '성적증명서', '학업계획서']
    },
    'status-change-d2': {
        id: 'status-change-d2',
        name: '체류자격 변경 (→ D-2)',
        category: '체류자격·기간',
        price: {
            general: 780000,
            partner: 380000
        },
        description: 'D-2 유학비자로 변경',
        processingDays: '14일',
        requiredDocs: ['입학허가서', '재정증명', '학력증명서']
    },
    'status-change-d10': {
        id: 'status-change-d10',
        name: '체류자격 변경 (→ D-10)',
        category: '체류자격·기간',
        price: {
            general: 820000,
            partner: 320000
        },
        description: 'D-10 구직비자로 변경',
        processingDays: '14-21일',
        requiredDocs: ['졸업증명서', '성적증명서', '구직활동계획서']
    },
    'status-change-e7': {
        id: 'status-change-e7',
        name: '체류자격 변경 (→ E-7)',
        category: '체류자격·기간',
        price: {
            general: 2050000,
            partner: 1850000
        },
        description: 'E-7 특정활동비자로 변경',
        processingDays: '21-30일',
        requiredDocs: ['근로계약서', '표준협력인정서', '학위증명서', '경력증명서']
    },
    'stay-permit-outside': {
        id: 'stay-permit-outside',
        name: '체류허가 (체류자격 부여)',
        category: '체류자격·기간',
        price: {
            general: 1200000,
            partner: 1000000
        },
        description: '국외에서 체류자격 부여 받은 경우',
        processingDays: '14일',
        requiredDocs: ['여권', '사증', '입국 관련 증빙서류']
    },
    'activity-outside-qualification': {
        id: 'activity-outside-qualification',
        name: '체류자격외 활동허가',
        category: '체류자격·기간',
        price: {
            general: 300000,
            partner: 200000
        },
        description: '현재 자격 외 다른 활동 허가',
        processingDays: '7-14일',
        requiredDocs: ['활동계획서', '고용주 추천서']
    },
    'reentry-permit': {
        id: 'reentry-permit',
        name: '재입국허가',
        category: '체류자격·기간',
        price: {
            general: 150000,
            partner: 100000
        },
        description: '출국 후 재입국 허가',
        processingDays: '3-5일',
        requiredDocs: ['여권', '외국인등록증']
    },
    'stay-qualification-confirmation': {
        id: 'stay-qualification-confirmation',
        name: '체류자격 확인',
        category: '체류자격·기간',
        price: {
            general: 200000,
            partner: 150000
        },
        description: '현재 체류자격 상태 확인',
        processingDays: '3-7일',
        requiredDocs: ['여권', '외국인등록증']
    },

    // 등록·신고 (11개)
    'alien-registration': {
        id: 'alien-registration',
        name: '외국인등록 신청',
        category: '등록·신고',
        price: {
            general: 350000,
            partner: 250000
        },
        description: '90일 이상 체류 시 필수 등록',
        processingDays: '7-14일',
        requiredDocs: ['여권', '증명사진', '체류지 증빙']
    },
    'residence-change-report': {
        id: 'residence-change-report',
        name: '체류지 변경 신고',
        category: '등록·신고',
        price: {
            general: 100000,
            partner: 80000
        },
        description: '거주지 이전 시 신고',
        processingDays: '즉시',
        requiredDocs: ['외국인등록증', '임대차계약서']
    },
    'arc-reissue': {
        id: 'arc-reissue',
        name: '외국인등록증 재발급',
        category: '등록·신고',
        price: {
            general: 200000,
            partner: 150000
        },
        description: '분실, 훼손 시 재발급',
        processingDays: '7일',
        requiredDocs: ['분실신고서', '증명사진']
    },
    'passport-info-change': {
        id: 'passport-info-change',
        name: '여권 발급 등 사실 신고',
        category: '등록·신고',
        price: {
            general: 150000,
            partner: 100000
        },
        description: '여권 정보 변경 신고',
        processingDays: '3-5일',
        requiredDocs: ['신여권', '외국인등록증']
    },
    'employment-change-report': {
        id: 'employment-change-report',
        name: '고용변동 등 사실 신고',
        category: '등록·신고',
        price: {
            general: 150000,
            partner: 100000
        },
        description: '직장 변경, 퇴사 신고',
        processingDays: '즉시',
        requiredDocs: ['근로계약서 또는 퇴직증명서']
    },

    // 증명서 (4개)
    'residence-fact-certificate': {
        id: 'residence-fact-certificate',
        name: '체류지 사실증명',
        category: '증명서',
        price: {
            general: 50000,
            partner: 30000
        },
        description: '현재 거주 사실 증명서',
        processingDays: '즉시',
        requiredDocs: ['신분증']
    },
    'alien-registration-fact-certificate': {
        id: 'alien-registration-fact-certificate',
        name: '외국인등록 사실증명',
        category: '증명서',
        price: {
            general: 50000,
            partner: 30000
        },
        description: '외국인등록 이력 증명',
        processingDays: '즉시',
        requiredDocs: ['외국인등록증']
    },
    'entry-exit-fact-certificate': {
        id: 'entry-exit-fact-certificate',
        name: '출입국에 관한 사실증명',
        category: '증명서',
        price: {
            general: 50000,
            partner: 30000
        },
        description: '출입국 기록 증명서',
        processingDays: '즉시',
        requiredDocs: ['여권']
    },
    'naturalization-fact-certificate': {
        id: 'naturalization-fact-certificate',
        name: '귀화 허가 사실증명',
        category: '증명서',
        price: {
            general: 50000,
            partner: 30000
        },
        description: '귀화 이력 증명',
        processingDays: '즉시',
        requiredDocs: ['신분증']
    },

    // 프리미엄 서비스
    'visa-prediagnosis-d10': {
        id: 'visa-prediagnosis-d10',
        name: 'D-10 비자 변경 사전진단',
        category: '프리미엄',
        price: {
            general: 55000,
            partner: 0
        },
        description: 'D-10 변경 가능성 사전 검토',
        processingDays: '1-3일',
        requiredDocs: ['성적증명서', '졸업(예정)증명서']
    },
    'visa-prediagnosis-e7': {
        id: 'visa-prediagnosis-e7',
        name: 'E-7 비자 변경 사전진단',
        category: '프리미엄',
        price: {
            general: 55000,
            partner: 0
        },
        description: 'E-7 변경 가능성 사전 검토',
        processingDays: '1-3일',
        requiredDocs: ['성적증명서', '졸업증명서', '근로계약서(예정)']
    },
    'emergency-relief': {
        id: 'emergency-relief',
        name: '긴급구제·동행조사·처분취소소송',
        category: '프리미엄',
        price: {
            general: 3000000,
            partner: 2800000
        },
        description: '출국명령, 강제퇴거 긴급 대응',
        processingDays: '즉시 착수',
        requiredDocs: ['관련 공문서', '여권', '체류 관련 모든 서류']
    }
};

// 카테고리별 서비스 목록 반환
function getServicesByCategory(category) {
    return Object.values(servicePricing).filter(service => service.category === category);
}

// 서비스 ID로 가격 정보 조회
function getServicePrice(serviceId, userType = 'general') {
    const service = servicePricing[serviceId];
    if (!service) return null;
    
    return {
        ...service,
        displayPrice: service.price[userType],
        userType: userType,
        discount: userType === 'partner' ? Math.round((1 - service.price.partner / service.price.general) * 100) : 0
    };
}

// 사용자 타입 확인 (협약대학 여부)
function getUserType() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email || '';
    
    // 전남대, 서울대 이메일 체크
    if (email.includes('@jnu.ac.kr') || email.includes('@snu.ac.kr')) {
        return 'partner';
    }
    return 'general';
}

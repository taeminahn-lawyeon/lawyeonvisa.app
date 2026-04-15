// 서비스 신청 가격 데이터
// NOTE: 실제 결제 흐름은 service-apply-general.html 내부의 인라인 servicePricing을 사용합니다.
// 이 파일은 다른 페이지에서 서비스 가격 정보를 참조할 때 사용됩니다.
const servicePricing = {
    // ── 프리미엄 서비스 ──
    'visa-prediagnosis': {
        id: 'visa-prediagnosis',
        name: 'Visa Legal Advice',
        nameKo: '비자 법률 상담',
        category: '프리미엄',
        price: { general: 55000, partner: 0 },
        govFee: 0,
        description: 'Visa change, overstay risk, immigration law consultation'
    },
    'emergency-legal': {
        id: 'emergency-legal',
        name: 'Immigration Dispute Resolution',
        nameKo: '긴급구제·동행조사·처분취소소송',
        category: '프리미엄',
        price: { general: 3000000, partner: 2800000 },
        govFee: 0,
        description: 'Criminal investigation, deportation defense, visa denial appeals',
        deferredPayment: true
    },
    'pre-consultation': {
        id: 'pre-consultation',
        name: 'Pre-Consultation',
        nameKo: '사전 상담',
        category: '프리미엄',
        price: { general: 0, partner: 0 },
        govFee: 0,
        description: 'Free initial consultation via navigator',
        deferredPayment: true,
        hidden: true
    },

    // ── 교육·구직 ──
    'd4-to-d2-change': {
        id: 'd4-to-d2-change',
        name: 'D-4→D-2 Student Visa Change',
        nameKo: 'D-4→D-2 유학 비자 변경',
        category: '교육·구직',
        price: { general: 110000, partner: 110000 },
        govFee: 119000,
        description: 'Language course to degree program'
    },
    'd10-1-change': {
        id: 'd10-1-change',
        name: 'D-10-1 Job Seeker Visa Change',
        nameKo: 'D-10-1 일반구직 비자 변경',
        category: '교육·구직',
        price: { general: 220000, partner: 55000 },
        govFee: 100000,
        description: 'General job seeking visa'
    },
    'd10-1-dhu': {
        id: 'd10-1-dhu',
        name: 'D-10-1 General Job Seeker Visa (DHU)',
        nameKo: 'D-10-1 일반구직 비자 변경 (대구한의대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Daegu Haany University special rate',
        organization: 'dhu'
    },
    'd10-1-chosun': {
        id: 'd10-1-chosun',
        name: 'D-10-1 General Job Seeker Visa (Chosun)',
        nameKo: 'D-10-1 일반구직 비자 변경 (조선대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Chosun University special rate',
        organization: 'chosun'
    },
    'd10-2-change': {
        id: 'd10-2-change',
        name: 'D-10-2 Tech Startup Job Seeker',
        nameKo: 'D-10-2 기술창업구직 비자 변경',
        category: '교육·구직',
        price: { general: 330000, partner: 55000 },
        govFee: 100000,
        description: 'Startup preparation visa'
    },
    'd10-2-chosun': {
        id: 'd10-2-chosun',
        name: 'D-10-2 Tech Startup Job Seeker (Chosun)',
        nameKo: 'D-10-2 기술창업구직 비자 변경 (조선대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Chosun University special rate',
        organization: 'chosun'
    },
    'd10-3-change': {
        id: 'd10-3-change',
        name: 'D-10-3 High-tech Intern Visa',
        nameKo: 'D-10-3 첨단기술인턴 비자 변경',
        category: '교육·구직',
        price: { general: 330000, partner: 55000 },
        govFee: 100000,
        description: 'Advanced technology internship'
    },
    'd10-3-chosun': {
        id: 'd10-3-chosun',
        name: 'D-10-3 High-tech Intern Visa (Chosun)',
        nameKo: 'D-10-3 첨단기술인턴 비자 변경 (조선대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Chosun University special rate',
        organization: 'chosun'
    },
    'd10-t-change': {
        id: 'd10-t-change',
        name: 'D-10-T Top Talent Job Seeker',
        nameKo: 'D-10-T 최우수인재구직 비자 변경',
        category: '교육·구직',
        price: { general: 330000, partner: 55000 },
        govFee: 100000,
        description: 'Elite university graduate visa'
    },
    'd10-t-chosun': {
        id: 'd10-t-chosun',
        name: 'D-10-T Top Talent Job Seeker (Chosun)',
        nameKo: 'D-10-T 최우수인재구직 비자 변경 (조선대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Chosun University special rate',
        organization: 'chosun'
    },
    'd2-qualification-change-chosun': {
        id: 'd2-qualification-change-chosun',
        name: 'D-2 Qualification Change (Chosun)',
        nameKo: 'D-2 자격변경 (조선대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'D-4, D-2 sub-status change',
        organization: 'chosun'
    },
    'd10-1-kdu': {
        id: 'd10-1-kdu',
        name: 'D-10-1 General Job Seeker Visa (KDU)',
        nameKo: 'D-10-1 일반구직 비자 변경 (극동대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Far East University special rate',
        organization: 'kdu'
    },
    'd10-2-kdu': {
        id: 'd10-2-kdu',
        name: 'D-10-2 Tech Startup Job Seeker (KDU)',
        nameKo: 'D-10-2 기술창업구직 비자 변경 (극동대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Far East University special rate',
        organization: 'kdu'
    },
    'd10-3-kdu': {
        id: 'd10-3-kdu',
        name: 'D-10-3 High-tech Intern Visa (KDU)',
        nameKo: 'D-10-3 첨단기술인턴 비자 변경 (극동대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Far East University special rate',
        organization: 'kdu'
    },
    'd10-t-kdu': {
        id: 'd10-t-kdu',
        name: 'D-10-T Top Talent Job Seeker (KDU)',
        nameKo: 'D-10-T 최우수인재구직 비자 변경 (극동대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'Far East University special rate',
        organization: 'kdu'
    },
    'd2-qualification-change-kdu': {
        id: 'd2-qualification-change-kdu',
        name: 'D-2 Qualification Change (KDU)',
        nameKo: 'D-2 자격변경 (극동대)',
        category: '교육·구직',
        price: { general: 55000, partner: 55000 },
        govFee: 100000,
        description: 'D-4, D-2 sub-status change',
        organization: 'kdu'
    },
    'd2-d4-extension': {
        id: 'd2-d4-extension',
        name: 'D-2, D-4 Visa Extension',
        nameKo: 'D-2, D-4 비자 연장',
        category: '교육·구직',
        price: { general: 110000, partner: 110000 },
        govFee: 50000,
        description: 'Student visa renewal'
    },
    'd10-extension': {
        id: 'd10-extension',
        name: 'D-10 Visa Extension',
        nameKo: 'D-10 비자 연장',
        category: '교육·구직',
        price: { general: 220000, partner: 220000 },
        govFee: 50000,
        description: 'Job seeker visa renewal'
    },
    'parttime-permit': {
        id: 'parttime-permit',
        name: 'Part-time Work Permit',
        nameKo: '시간제취업 허가',
        category: '교육·구직',
        price: { general: 33000, partner: 33000 },
        govFee: 0,
        description: 'D-2, D-4 part-time employment'
    },
    'parttime-change': {
        id: 'parttime-change',
        name: 'Part-time Work Change Report',
        nameKo: '시간제취업 변경 신고',
        category: '교육·구직',
        price: { general: 33000, partner: 33000 },
        govFee: 0,
        description: 'Part-time employment change notification'
    },
    'd10-parttime-permit': {
        id: 'd10-parttime-permit',
        name: 'D-10 Part-time Work Permit',
        nameKo: 'D-10 시간제취업 허가',
        category: '교육·구직',
        price: { general: 33000, partner: 33000 },
        govFee: 0,
        description: 'D-10 visa part-time employment'
    },
    'intern-report': {
        id: 'intern-report',
        name: 'Internship Start/Change Report',
        nameKo: '연수개시 및 기관변경 신고',
        category: '교육·구직',
        price: { general: 110000, partner: 110000 },
        govFee: 0,
        description: 'D-10 internship notification'
    },
    'parent-invite': {
        id: 'parent-invite',
        name: 'Student Parent Invitation',
        nameKo: '외국인 유학생 부모 초청',
        category: '교육·구직',
        price: { general: 550000, partner: 550000 },
        govFee: 60000,
        description: 'Excellent student parent visa'
    },

    // ── 취업·워크 ──
    'e7-4-change': {
        id: 'e7-4-change',
        name: 'E-7-4 Skilled Worker Visa',
        nameKo: '숙련기능인력 E-7-4 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 119000,
        description: 'E-9/H-2 skilled transition'
    },
    'e7-4r-change': {
        id: 'e7-4r-change',
        name: 'E-7-4R Regional Skilled Worker',
        nameKo: '지역특화 E-7-4R 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 119000,
        description: 'Depopulated area skilled worker'
    },
    'e7-change': {
        id: 'e7-change',
        name: 'E-7 Professional Visa Change',
        nameKo: '특정활동 E-7 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 100000,
        description: 'Professional employment visa'
    },
    'f2-7-change': {
        id: 'f2-7-change',
        name: 'F-2-7 Points-based Residence',
        nameKo: '우수인재 거주 F-2-7 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 100000,
        description: 'Outstanding talent residence'
    },
    'f2-r-change': {
        id: 'f2-r-change',
        name: 'F-2-R Regional Residence Visa',
        nameKo: '지역특화 F-2-R 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 100000,
        description: 'Depopulated area residence'
    },
    'e7-st-change': {
        id: 'e7-st-change',
        name: 'E-7-S/T Elite Professional',
        nameKo: '최우수인재 E-7-S/T 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 100000,
        description: 'High-tech/high-income talent'
    },
    'e1-e6-change': {
        id: 'e1-e6-change',
        name: 'E-1~E-6 Professional Change',
        nameKo: '전문직 E-1~E-6 비자 변경',
        category: '취업·워크',
        price: { general: 550000, partner: 550000 },
        govFee: 100000,
        description: 'Professor, researcher, specialist'
    },
    'e7-extension': {
        id: 'e7-extension',
        name: 'E-7 Visa Extension',
        nameKo: '전문인력 E-7 비자 연장',
        category: '취업·워크',
        price: { general: 110000, partner: 110000 },
        govFee: 60000,
        description: 'Professional visa renewal'
    },
    'e9-workplace-change': {
        id: 'e9-workplace-change',
        name: 'E-9 Workplace Change',
        nameKo: 'E-9 근무처변경 허가',
        category: '취업·워크',
        price: { general: 220000, partner: 220000 },
        govFee: 99000,
        description: 'E-9 employer change'
    },
    'workplace-change-permit': {
        id: 'workplace-change-permit',
        name: 'Workplace Change Permit',
        nameKo: '근무처 변경·추가 허가',
        category: '취업·워크',
        price: { general: 220000, partner: 220000 },
        govFee: 120000,
        description: 'Job transfer pre-approval'
    },
    'outside-activity': {
        id: 'outside-activity',
        name: 'Additional Activity Permit',
        nameKo: '체류자격 외 활동 허가',
        category: '취업·워크',
        price: { general: 220000, partner: 220000 },
        govFee: 120000,
        description: 'Activities beyond visa scope'
    },
    'h2-work-start': {
        id: 'h2-work-start',
        name: 'H-2 Employment Start Report',
        nameKo: '방문취업 H-2 취업개시 신고',
        category: '취업·워크',
        price: { general: 55000, partner: 55000 },
        govFee: 0,
        description: 'Working visit job notification'
    },
    'workplace-change-report': {
        id: 'workplace-change-report',
        name: 'Workplace Change Report',
        nameKo: '근무처 변경·추가 신고',
        category: '취업·워크',
        price: { general: 110000, partner: 110000 },
        govFee: 0,
        description: 'Job transfer post-notification'
    },
    'employment-info-change': {
        id: 'employment-info-change',
        name: 'Employment Info Update',
        nameKo: '취업정보 변경신고',
        category: '취업·워크',
        price: { general: 55000, partner: 55000 },
        govFee: 0,
        description: 'Workplace/salary change report'
    },
    'dispatch-report': {
        id: 'dispatch-report',
        name: 'Dispatch Work Report',
        nameKo: '파견근무 신고',
        category: '취업·워크',
        price: { general: 110000, partner: 110000 },
        govFee: 0,
        description: 'Subsidiary assignment report'
    },
    'income-report': {
        id: 'income-report',
        name: 'Annual Income Report',
        nameKo: '직업 및 연간소득금액 신고',
        category: '취업·워크',
        price: { general: 55000, partner: 55000 },
        govFee: 0,
        description: 'Job and income notification'
    },
    'foreign-worker-change': {
        id: 'foreign-worker-change',
        name: 'Foreign Worker Status Report',
        nameKo: '고용·연수외국인 변동신고',
        category: '취업·워크',
        price: { general: 55000, partner: 55000 },
        govFee: 0,
        description: 'Resignation/departure report'
    },

    // ── 사업·투자 ──
    'd8-1-change': {
        id: 'd8-1-change',
        name: 'D-8-1 Corporate Investment',
        nameKo: 'D-8-1 법인투자 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Corporate establishment visa'
    },
    'd8-2-change': {
        id: 'd8-2-change',
        name: 'D-8-2 Venture Investment',
        nameKo: 'D-8-2 벤처투자 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Venture company investment'
    },
    'd8-3-change': {
        id: 'd8-3-change',
        name: 'D-8-3 Individual Investment',
        nameKo: 'D-8-3 개인투자 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Sole proprietor investment'
    },
    'd8-4-change': {
        id: 'd8-4-change',
        name: 'D-8-4 Tech Startup Visa',
        nameKo: 'D-8-4 기술창업 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Student entrepreneur visa'
    },
    'd9-1-change': {
        id: 'd9-1-change',
        name: 'D-9-1 Trade Business',
        nameKo: 'D-9-1 무역경영 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Trading business visa'
    },
    'd9-2-change': {
        id: 'd9-2-change',
        name: 'D-9-2 Export Equipment',
        nameKo: 'D-9-2 수출설비 설치·운영·보수 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Export facility management'
    },
    'd9-3-change': {
        id: 'd9-3-change',
        name: 'D-9-3 Shipbuilding Supervisor',
        nameKo: 'D-9-3 선박건조·설비제작 감독 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Ship/equipment supervision'
    },
    'd9-4-change': {
        id: 'd9-4-change',
        name: 'D-9-4 Commercial Business',
        nameKo: 'D-9-4 영리 개인사업자 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Individual commercial visa'
    },
    'd9-5-change': {
        id: 'd9-5-change',
        name: 'D-9-5 Graduate Entrepreneur',
        nameKo: 'D-9-5 유학생 출신 개인사업자 비자 변경',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 100000,
        description: 'Former student business'
    },
    'business-extension': {
        id: 'business-extension',
        name: 'D-8, D-9 Business Extension',
        nameKo: '사업/투자 D-8, D-9 비자 연장',
        category: '사업·투자',
        price: { general: 1100000, partner: 1100000 },
        govFee: 60000,
        description: 'Investment visa renewal'
    },
    'fic-registration': {
        id: 'fic-registration',
        name: 'Foreign Investment Registration',
        nameKo: '외국인투자기업 등록',
        category: '사업·투자',
        price: { general: 330000, partner: 330000 },
        govFee: 0,
        description: 'FIC certificate issuance'
    },
    'fi-report': {
        id: 'fi-report',
        name: 'Foreign Investment Report',
        nameKo: '외국인투자 신고',
        category: '사업·투자',
        price: { general: 220000, partner: 220000 },
        govFee: 0,
        description: 'Investment pre-notification'
    },

    // ── 동포·가족·결혼 ──
    'h2-to-f4-change': {
        id: 'h2-to-f4-change',
        name: 'H-2→F-4 Overseas Korean',
        nameKo: 'H-2→F-4 재외동포 비자 변경',
        category: '동포·가족·결혼',
        price: { general: 550000, partner: 550000 },
        govFee: 119000,
        description: 'Working visit to overseas Korean'
    },
    'f4-change': {
        id: 'f4-change',
        name: 'F-4 Overseas Korean Visa',
        nameKo: '재외동포 F-4 비자 변경',
        category: '동포·가족·결혼',
        price: { general: 220000, partner: 220000 },
        govFee: 100000,
        description: 'Overseas Korean status'
    },
    'f4-registration': {
        id: 'f4-registration',
        name: 'F-4 Residence Registration',
        nameKo: '재외동포 F-4 거소신고',
        category: '동포·가족·결혼',
        price: { general: 110000, partner: 110000 },
        govFee: 35000,
        description: 'F-4 residence card issuance'
    },
    'f4-extension': {
        id: 'f4-extension',
        name: 'F-4 Visa Extension',
        nameKo: '재외동포 F-4 비자 연장',
        category: '동포·가족·결혼',
        price: { general: 110000, partner: 110000 },
        govFee: 50000,
        description: 'F-4 residence renewal'
    },
    'h2-extension': {
        id: 'h2-extension',
        name: 'H-2 Visa Extension',
        nameKo: 'H-2 비자 연장',
        category: '동포·가족·결혼',
        price: { general: 110000, partner: 110000 },
        govFee: 50000,
        description: 'Working visit renewal'
    },
    'f6-change': {
        id: 'f6-change',
        name: 'F-6 Marriage Immigration',
        nameKo: '결혼이민 F-6 비자 변경',
        category: '동포·가족·결혼',
        price: { general: 550000, partner: 550000 },
        govFee: 100000,
        description: 'Spouse visa acquisition'
    },
    'f6-extension': {
        id: 'f6-extension',
        name: 'F-6 Visa Extension',
        nameKo: '결혼이민 F-6 비자 연장',
        category: '동포·가족·결혼',
        price: { general: 110000, partner: 110000 },
        govFee: 30000,
        description: 'Marriage visa renewal'
    },
    'f3-change': {
        id: 'f3-change',
        name: 'F-3 Dependent Family Visa',
        nameKo: '동반가족 F-3 비자 변경',
        category: '동포·가족·결혼',
        price: { general: 330000, partner: 330000 },
        govFee: 100000,
        description: 'Spouse/child accompanying'
    },
    'f1-change': {
        id: 'f1-change',
        name: 'F-1 Family Visit Visa',
        nameKo: '방문동거 F-1 비자 변경',
        category: '동포·가족·결혼',
        price: { general: 330000, partner: 330000 },
        govFee: 100000,
        description: 'Relative long-term stay'
    },
    'visa-grant-child': {
        id: 'visa-grant-child',
        name: 'Child Birth Visa Grant',
        nameKo: '체류자격 부여 (자녀출생/일반)',
        category: '동포·가족·결혼',
        price: { general: 220000, partner: 220000 },
        govFee: 80000,
        description: 'Newborn child visa'
    },
    'visa-grant-f6-child': {
        id: 'visa-grant-f6-child',
        name: 'F-6 Child Visa Grant',
        nameKo: '체류자격 부여 (자녀출생/F-6)',
        category: '동포·가족·결혼',
        price: { general: 220000, partner: 220000 },
        govFee: 40000,
        description: 'Marriage immigrant child'
    },
    'family-invite': {
        id: 'family-invite',
        name: 'Family Invitation Visa',
        nameKo: '가족 초청 사증발급',
        category: '동포·가족·결혼',
        price: { general: 550000, partner: 550000 },
        govFee: 60000,
        description: 'Overseas family invitation'
    },
    'housework-report': {
        id: 'housework-report',
        name: 'Domestic Work Report',
        nameKo: '가사·육아 활동 개시 신고',
        category: '동포·가족·결혼',
        price: { general: 55000, partner: 55000 },
        govFee: 0,
        description: 'Household help notification'
    },

    // ── 거주·영주·국적 ──
    'f5-change': {
        id: 'f5-change',
        name: 'F-5 Permanent Residence',
        nameKo: '영주 F-5 비자 변경',
        category: '거주·영주·국적',
        price: { general: 1100000, partner: 1100000 },
        govFee: 200000,
        description: 'Korea permanent residency'
    },
    'f5-reissue': {
        id: 'f5-reissue',
        name: 'F-5 Card Renewal (10yr)',
        nameKo: '영주증 재발급 (10년)',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 35000,
        description: 'Permanent residence card'
    },
    'f2-extension': {
        id: 'f2-extension',
        name: 'F-2 Residence Extension',
        nameKo: '거주 F-2 비자 연장',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 60000,
        description: 'Residence visa renewal'
    },
    'naturalization': {
        id: 'naturalization',
        name: 'Naturalization Application',
        nameKo: '귀화허가 신청',
        category: '거주·영주·국적',
        price: { general: 1100000, partner: 1100000 },
        govFee: 300000,
        description: 'Korean citizenship'
    },
    'nationality-recovery': {
        id: 'nationality-recovery',
        name: 'Nationality Recovery',
        nameKo: '국적회복 허가 신청',
        category: '거주·영주·국적',
        price: { general: 550000, partner: 550000 },
        govFee: 200000,
        description: 'Former Korean citizenship'
    },
    'nationality-selection': {
        id: 'nationality-selection',
        name: 'Nationality Selection',
        nameKo: '국적선택 신고',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 20000,
        description: 'Dual citizen selection'
    },
    'nationality-renounce': {
        id: 'nationality-renounce',
        name: 'Nationality Renunciation',
        nameKo: '국적이탈 신고',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 20000,
        description: 'Korean citizenship waiver'
    },
    'nationality-loss': {
        id: 'nationality-loss',
        name: 'Nationality Loss Report',
        nameKo: '국적상실 신고',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 0,
        description: 'Foreign citizenship report'
    },
    'nationality-retention': {
        id: 'nationality-retention',
        name: 'Nationality Retention',
        nameKo: '국적보유 신고',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 20000,
        description: 'Citizenship retention intent'
    },
    'nationality-acquisition': {
        id: 'nationality-acquisition',
        name: 'Nationality Acquisition',
        nameKo: '국적취득 신고',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 20000,
        description: 'Recognition-based citizenship'
    },
    'nationality-judgment': {
        id: 'nationality-judgment',
        name: 'Nationality Determination',
        nameKo: '국적판정 신청',
        category: '거주·영주·국적',
        price: { general: 110000, partner: 110000 },
        govFee: 30000,
        description: 'Nationality status inquiry'
    },

    // ── 일반 신고·증명 ──
    'arc-registration': {
        id: 'arc-registration',
        name: 'Alien Registration',
        nameKo: '외국인등록 신청',
        category: '일반 신고·증명',
        price: { general: 110000, partner: 110000 },
        govFee: 35000,
        description: 'Required within 90 days'
    },
    'arc-reissue': {
        id: 'arc-reissue',
        name: 'ARC Reissue',
        nameKo: '외국인등록증 재발급',
        category: '일반 신고·증명',
        price: { general: 110000, partner: 110000 },
        govFee: 35000,
        description: 'Lost/damaged card replacement'
    },
    'address-change': {
        id: 'address-change',
        name: 'Address Change Report',
        nameKo: '체류지 변경신고',
        category: '일반 신고·증명',
        price: { general: 33000, partner: 33000 },
        govFee: 0,
        description: 'Moving address update'
    },
    'f4-address-change': {
        id: 'f4-address-change',
        name: 'F-4 Address Change',
        nameKo: '재외동포 거소이전신고',
        category: '일반 신고·증명',
        price: { general: 33000, partner: 33000 },
        govFee: 0,
        description: 'Overseas Korean address'
    },
    'passport-change': {
        id: 'passport-change',
        name: 'Passport/Info Change',
        nameKo: '여권/등록사항 변경신고',
        category: '일반 신고·증명',
        price: { general: 33000, partner: 33000 },
        govFee: 0,
        description: 'Passport/name update'
    },
    'reentry-permit-multiple': {
        id: 'reentry-permit-multiple',
        name: 'Multiple Re-entry Permit',
        nameKo: '재입국허가(복수)',
        category: '일반 신고·증명',
        price: { general: 55000, partner: 55000 },
        govFee: 41300,
        description: 'Multiple border crossings'
    },
    'reentry-permit-single': {
        id: 'reentry-permit-single',
        name: 'Single Re-entry Permit',
        nameKo: '재입국허가(단수)',
        category: '일반 신고·증명',
        price: { general: 55000, partner: 55000 },
        govFee: 28300,
        description: 'One-time border crossing'
    },
    'cert-entry-exit': {
        id: 'cert-entry-exit',
        name: 'Entry/Exit Certificate',
        nameKo: '출입국사실 증명서',
        category: '일반 신고·증명',
        price: { general: 22000, partner: 22000 },
        govFee: 2000,
        description: 'Travel history record'
    },
    'cert-arc': {
        id: 'cert-arc',
        name: 'ARC Certificate',
        nameKo: '외국인등록사실 증명서',
        category: '일반 신고·증명',
        price: { general: 22000, partner: 22000 },
        govFee: 2000,
        description: 'Registration proof'
    },
    'cert-residence': {
        id: 'cert-residence',
        name: 'Residence Certificate',
        nameKo: '국내거소신고사실 증명서',
        category: '일반 신고·증명',
        price: { general: 22000, partner: 22000 },
        govFee: 2000,
        description: 'F-4 residence proof'
    },
    'cert-realestate': {
        id: 'cert-realestate',
        name: 'Real Estate Registration ID',
        nameKo: '부동산등기용 등록번호부여 증명서',
        category: '일반 신고·증명',
        price: { general: 22000, partner: 22000 },
        govFee: 2000,
        description: 'Property transaction'
    },
    'cert-arc-number-change': {
        id: 'cert-arc-number-change',
        name: 'ARC Number Change Cert',
        nameKo: '외국인등록번호변경 확인서',
        category: '일반 신고·증명',
        price: { general: 22000, partner: 22000 },
        govFee: 2000,
        description: 'Number change confirmation'
    },
    'cert-nationality': {
        id: 'cert-nationality',
        name: 'Nationality Certificate',
        nameKo: '국적 관련 증명서',
        category: '일반 신고·증명',
        price: { general: 22000, partner: 22000 },
        govFee: 2000,
        description: 'Nationality status proof'
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
        totalPrice: service.price[userType] + (service.govFee || 0),
        userType: userType,
        discount: userType === 'partner' ? Math.round((1 - service.price.partner / service.price.general) * 100) : 0
    };
}

// 사용자 타입 확인 (협약대학 여부)
function getUserType() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email || '';

    // 협약 대학 이메일 체크 (현재 해당 없음 - DHU는 특강코드 인증 방식)
    return 'general';
}

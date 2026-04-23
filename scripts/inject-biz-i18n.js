#!/usr/bin/env node
/**
 * scripts/inject-biz-i18n.js
 *
 * biz.* 키 + nonBizKeys를 js/translations.js의 7개 언어 객체에 일괄 주입.
 *
 * 규칙 (섹션 14-9):
 *   - ko: 본 스크립트 내부의 MASTER_KO 하드코딩 값 (명세 확정 카피)
 *   - en: 본 스크립트 내부의 MASTER_EN 하드코딩 값 (en 번역)
 *   - vi, zh, ja, mn, th: en 값 복제 + 바로 위에 TRANSLATION_PENDING 주석
 *
 * 재실행 안전: 이미 존재하는 키는 건너뜀(idempotent).
 *
 * 사용:
 *   node scripts/inject-biz-i18n.js           # 실제 주입
 *   node scripts/inject-biz-i18n.js --dry     # 변경 예정만 출력
 *
 * 주의:
 *   - translations.js의 각 언어 객체 끝(`}` 직전)에 키들을 추가합니다.
 *   - 기존 키 순서는 보존됩니다.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANSLATIONS_PATH = path.join(ROOT, 'js', 'translations.js');
const MANIFEST_PATH = path.join(__dirname, 'biz-i18n-manifest.json');
const TODAY = '2026-04-20';
const DRY_RUN = process.argv.includes('--dry');

// ----- 마스터 카피 (ko) -----
const MASTER_KO = {
    'biz.hero.headline': '한국에서 사업을 시작하고 이주하기 위한 통합 법률서비스',
    'biz.hero.subhead': '해외에서 한국 이주를 검토하는 외국인을 대상으로, 프로젝트 탐색·규제 자문·비자 취득을 순차 수행합니다.',
    'biz.hero.cta': '사업이민 사전 상담 신청',
    'biz.badge.description': '법무법인 로연 출입국이민지원센터는 외국인의 한국 사업이민 법률서비스를 제공합니다.',
    'biz.step1.title': '사전 상담',
    'biz.step1.body': '쓰레드를 통해 귀하의 국적, 자금 조달 방식, 이주 시점, 가족 구성을 확인하고 한국 사업이민 경로 개요를 안내합니다.',
    'biz.step2.title': '본 상담',
    'biz.step2.body': '이민 경로 상세 자문, 사업 개시 절차 및 예산 배정 구조화, 주요 리스크 안내, 비자 발급 등 출입국 행정 안내를 제공합니다.',
    'biz.step3.title': '착수',
    'biz.step3.body': '프로젝트 설계, 오퍼레이션 설계, 실사 방문 코디네이션, 최종 점검 회의를 수행합니다.',
    'biz.step4.title': '정착',
    'biz.step4.body': '계약 체결 지원, 외국인 투자 절차, 행정 등록 감독, 비자 취득, 동반 가족 비자 발급.',
    'biz.step5.title': '사후관리',
    'biz.step5.body': '주거 임대차 검토, 가맹본부-점주 분쟁 조정, 근로계약 자문, 체류기간 연장, 영주권 전환 자문을 별도 계약으로 제공합니다.',
    'biz.news.heading': '뉴스 & 인사이트',
    'biz.dashboard.heading': '나의 프로젝트 진행 현황',
    'biz.dashboard.guest': '로그인하시면 나의 프로젝트 진행 현황, 상담 내역, 쓰레드를 확인하실 수 있습니다.',
    'biz.dashboard.progress.stage1': '사전 상담',
    'biz.dashboard.progress.stage2': '본 상담',
    'biz.dashboard.progress.stage3': '착수',
    'biz.dashboard.progress.stage4': '정착',
    'biz.dashboard.progress.stage5': '사후관리',
    'biz.form.title': '사업이민 사전 상담 신청',
    'biz.form.nationality': '국적',
    'biz.form.residence_country': '현재 거주국',
    'biz.form.visa_type': '관심 비자 유형',
    'biz.form.family': '가족 구성 — 본인 외',
    'biz.form.children_count': '자녀 수',
    'biz.form.timeline': '예상 이주 시점',
    'biz.form.message': '자유 메시지',
    'biz.form.contact_method': '연락 가능 수단',
    'biz.form.submit': '상담 신청하기',
    'biz.form.auto_reply': '상담 신청이 접수되었습니다. 담당자가 쓰레드로 회신드립니다.',
    'biz.banner.title': '프로필 작성이 필요합니다',
    'biz.banner.description': '원활한 상담을 위해 기본 정보를 입력해 주세요.',
    'biz.banner.cta': '프로필 작성하기',
    'biz.welcome.greeting': '사업이민 사전 상담을 신청해 주셔서 감사합니다.',
    'biz.welcome.step1': '먼저 프로필 정보를 입력해 주시면 담당자가 맞춤 경로를 안내해 드립니다.',
    'biz.welcome.step2': '담당자가 본 상담 일정을 이 쓰레드에서 제안드립니다.',
    'biz.welcome.step3': '추가 문서가 필요한 경우 업로드 요청을 드립니다.',
    'biz.welcome.closing': '궁금한 점이 있으시면 이 쓰레드에 자유롭게 적어 주세요.',
    'biz.error.thread_creation': '쓰레드 생성에 실패했습니다. 다시 시도해 주세요. 문제가 계속되면 지원팀에 문의해 주세요.',
    'biz.error.thread_creation_after_payment': '결제는 정상 승인되었습니다. 담당자가 직접 확인하여 쓰레드를 개설해 드립니다. 불편을 드려 죄송합니다.',
    'biz.form.last_name_en': '성 (영문)',
    'biz.form.first_name_en': '이름 (영문)',
    'biz.form.full_name_native': '본국어 성명',
    'biz.form.passport_number': '여권 번호',
    'biz.form.passport_expiry': '여권 유효기간',
    'biz.form.birth_date': '생년월일',
    'biz.form.gender': '성별',
    'biz.form.home_address': '본국 주소',
    'biz.form.home_phone': '본국 연락처',
    'biz.form.email': '이메일',
    'biz.form.native_language': '모국어',
    'biz.form.preferred_contact_method': '선호 연락 수단',
    'biz.form.preferred_industry': '희망 업종',
    'biz.form.preferred_location': '희망 지역',
    'biz.form.funding_source': '자금 조달 방식',
    'biz.form.education_background': '학력',
    'biz.form.work_experience': '경력',
    'biz.form.korea_visit_history': '한국 방문 이력',
    'biz.form.korean_language_proficiency': '한국어 수준',
    'biz.form.criminal_record': '범죄 경력 여부',
    'common.retry': '다시 시도',
    'admin.nav.system_errors': '시스템 오류',
    // 사업이민 신청 페이지 (Q3 강화 기획)
    'biz.request.hero.headline': '한국에서 사업을 시작하고 이주하기 위한 통합 법률서비스',
    'biz.request.hero.subhead': '한국으로의 사업 이민을 검토하는 이민자 고객을 위한 전담 상담 경로입니다.',
    'biz.request.overview.para1': '저희 법무법인 로연 출입국이민지원센터는 해외에 거주하시는 외국인이 한국에서 사업을 시작하고 정착하시기까지 필요한 법률서비스를 통합 제공합니다.',
    'biz.request.overview.para2': '프로젝트 탐색부터 규제 자문, 비자 취득, 한국 정착, 동반가족 지원까지 모든 단계가 하나의 법률자문 계약 안에서 진행됩니다.',
    'biz.request.overview.para3': '사전 상담은 무상이며, 본 페이지에서 신청하실 수 있습니다.',
    'biz.request.steps.heading': '프로젝트 5단계',
    'biz.request.prepare.heading': '고객이 준비해야 할 것',
    'biz.request.prepare.intro': '신청 전에 다음 사항을 정리해 두시면 사전 상담이 원활하게 진행됩니다.',
    'biz.request.prepare.item1': '한국 이주 검토 시점 (단기 / 중기 / 미정)',
    'biz.request.prepare.item2': '가족 동반 계획 (배우자·자녀·부모)',
    'biz.request.prepare.item3': '본국 사업 또는 근로 경력',
    'biz.request.prepare.item4': '한국 거주·방문 경험',
    'biz.request.prepare.item5': '한국어 사용 수준',
    'biz.request.prepare.disclaimer': '자금 규모 및 투자 구조에 관한 상세는 본 상담 단계에서 확인합니다.',
    // 풀폭 긴급 법률 구제 배너 (placeholder 카피, PM 교체 예정)
    'home.urgent.headline': '긴급 법률 구제가 필요하십니까?',
    'home.urgent.subhead': '출국 명령·체류 거부·형사 사건 등 시간 민감 사안을 전담합니다.',
    'home.urgent.cta': '긴급 상담 요청',
    // 대문 히어로 사업이민 카드 요약 3항목
    'biz.card.summary1': '이민 프로젝트 설계',
    'biz.card.summary2': '계약 및 규제 관리',
    'biz.card.summary3': '정착 및 사후 지원',
    // 신청 페이지 우측 "사업이민 쓰레드" 프리뷰
    'biz.request.threadPreview.title': '사업이민 쓰레드',
    'biz.request.threadPreview.subtitle': '담당자와 실시간 커뮤니케이션',
    'biz.request.threadPreview.caption': '쓰레드에서 상담 진행, 서류 요청, 단계 전환이 이루어집니다.',
    // 쓰레드 페이지 우측 사이드바 제목
    'biz.sidebar.heading': '프로젝트 진행 단계',
    // 사업이민 쓰레드 상단 제목 (service_name 대신 표시)
    'biz.thread.title': '사업이민 사전 상담'
};

// ----- 영어 번역 (en) -----
const MASTER_EN = {
    'biz.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
    'biz.hero.subhead': 'For foreigners considering relocation to Korea from abroad, we sequentially perform project exploration, regulatory advice, and visa acquisition.',
    'biz.hero.cta': 'Request Business Immigration Pre-Consultation',
    'biz.badge.description': 'Law Firm Lawyeon Immigration Support Center provides business immigration legal services for foreigners relocating to Korea.',
    'biz.step1.title': 'Pre-Consultation',
    'biz.step1.body': 'Through a thread we confirm your nationality, funding method, target relocation date, and family composition, then outline the Korean business immigration paths.',
    'biz.step2.title': 'Detailed Consultation',
    'biz.step2.body': 'We provide detailed advice on immigration paths, structure the business launch procedure and budget allocation, outline key risks, and guide immigration administration including visa issuance.',
    'biz.step3.title': 'Stage 1 Engagement',
    'biz.step3.body': 'We conduct project design, operations design, site visit coordination, and the final review meeting.',
    'biz.step4.title': 'Settlement',
    'biz.step4.body': 'Contract execution support, foreign investment procedures, administrative registration oversight, visa acquisition, and accompanying family visa issuance.',
    'biz.step5.title': 'Aftercare',
    'biz.step5.body': 'Residential lease review, franchise dispute mediation, employment contract advice, stay extension, and permanent residency transition advice are provided under separate agreements.',
    'biz.news.heading': 'News & Insights',
    'biz.dashboard.heading': 'My Project Progress',
    'biz.dashboard.guest': 'Sign in to view your project progress, consultation history, and threads.',
    'biz.dashboard.progress.stage1': 'Pre-Consultation',
    'biz.dashboard.progress.stage2': 'Detailed Consultation',
    'biz.dashboard.progress.stage3': 'Stage 1 Engagement',
    'biz.dashboard.progress.stage4': 'Settlement',
    'biz.dashboard.progress.stage5': 'Aftercare',
    'biz.form.title': 'Business Immigration Pre-Consultation Request',
    'biz.form.nationality': 'Nationality',
    'biz.form.residence_country': 'Current Country of Residence',
    'biz.form.visa_type': 'Visa Type of Interest',
    'biz.form.family': 'Family Members (besides yourself)',
    'biz.form.children_count': 'Number of Children',
    'biz.form.timeline': 'Expected Relocation Timeline',
    'biz.form.message': 'Free Message',
    'biz.form.contact_method': 'Preferred Contact Method',
    'biz.form.submit': 'Submit Consultation Request',
    'biz.form.auto_reply': 'Your consultation request has been received. Our representative will reply via the thread.',
    'biz.banner.title': 'Profile Required',
    'biz.banner.description': 'Please provide your basic information to enable a smooth consultation.',
    'biz.banner.cta': 'Complete Profile',
    'biz.welcome.greeting': 'Thank you for requesting a business immigration pre-consultation.',
    'biz.welcome.step1': 'Please provide your profile information first so that our representative can guide you on a tailored path.',
    'biz.welcome.step2': 'Our representative will propose a detailed consultation schedule in this thread.',
    'biz.welcome.step3': 'If additional documents are required, we will request uploads.',
    'biz.welcome.closing': 'If you have any questions, feel free to post in this thread.',
    'biz.error.thread_creation': 'Failed to create the thread. Please try again. If the problem persists, contact support.',
    'biz.error.thread_creation_after_payment': 'Your payment was successfully approved. Our representative will open the thread manually. We apologize for the inconvenience.',
    'biz.form.last_name_en': 'Last Name (English)',
    'biz.form.first_name_en': 'First Name (English)',
    'biz.form.full_name_native': 'Full Name (Native Script)',
    'biz.form.passport_number': 'Passport Number',
    'biz.form.passport_expiry': 'Passport Expiry Date',
    'biz.form.birth_date': 'Date of Birth',
    'biz.form.gender': 'Gender',
    'biz.form.home_address': 'Home Address',
    'biz.form.home_phone': 'Home Phone',
    'biz.form.email': 'Email',
    'biz.form.native_language': 'Native Language',
    'biz.form.preferred_contact_method': 'Preferred Contact Method',
    'biz.form.preferred_industry': 'Preferred Industry',
    'biz.form.preferred_location': 'Preferred Location',
    'biz.form.funding_source': 'Funding Source',
    'biz.form.education_background': 'Education Background',
    'biz.form.work_experience': 'Work Experience',
    'biz.form.korea_visit_history': 'Korea Visit History',
    'biz.form.korean_language_proficiency': 'Korean Language Proficiency',
    'biz.form.criminal_record': 'Criminal Record',
    'common.retry': 'Retry',
    'admin.nav.system_errors': 'System Errors',
    'biz.request.hero.headline': 'Integrated legal services for launching a business and emigrating to Korea',
    'biz.request.hero.subhead': 'A dedicated consultation path for immigration clients considering business relocation to Korea.',
    'biz.request.overview.para1': 'Law Firm Lawyeon Immigration Support Center provides integrated legal services for foreigners residing abroad who wish to start a business and settle in Korea.',
    'biz.request.overview.para2': 'Project exploration, regulatory advice, visa acquisition, settlement in Korea, and accompanying family support are all handled within a single legal retainer.',
    'biz.request.overview.para3': 'The pre-consultation is free of charge and can be requested on this page.',
    'biz.request.steps.heading': 'Five-Stage Project Structure',
    'biz.request.prepare.heading': 'What to Prepare',
    'biz.request.prepare.intro': 'Organizing the following points before submitting will help the pre-consultation proceed smoothly.',
    'biz.request.prepare.item1': 'Target relocation timeline (short-term / mid-term / undecided)',
    'biz.request.prepare.item2': 'Accompanying family plan (spouse / children / parents)',
    'biz.request.prepare.item3': 'Business or employment history in your home country',
    'biz.request.prepare.item4': 'Previous residence or visit history in Korea',
    'biz.request.prepare.item5': 'Korean language proficiency',
    'biz.request.prepare.disclaimer': 'Details on funding scale and investment structure will be reviewed in the detailed consultation stage.',
    'home.urgent.headline': 'Facing an urgent legal matter?',
    'home.urgent.subhead': 'We handle time-sensitive immigration and criminal cases such as deportation orders, visa denials, and related proceedings.',
    'home.urgent.cta': 'Request Urgent Consultation',
    'biz.card.summary1': 'Immigration Project Design',
    'biz.card.summary2': 'Contracts & Regulatory Management',
    'biz.card.summary3': 'Settlement & Ongoing Support',
    'biz.request.threadPreview.title': 'Business Immigration Thread',
    'biz.request.threadPreview.subtitle': 'Real-time communication with our specialist',
    'biz.request.threadPreview.caption': 'Consultation progress, document requests, and stage transitions are handled within the thread.',
    'biz.sidebar.heading': 'Project Progress',
    'biz.thread.title': 'Business Immigration Consultation'
};

// 단일 문자열 이스케이프(작은따옴표·역슬래시)
function escapeJsString(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// 언어별 삽입 라인 생성
function buildInsertBlock(lang, manifestKeys, existingKeys) {
    const lines = [];
    const useMaster = (lang === 'ko') ? MASTER_KO : MASTER_EN;
    const isCloned = !(lang === 'ko' || lang === 'en');

    lines.push('');
    lines.push('    // === biz.* (사업이민 섹션 14) ===');
    for (const key of manifestKeys) {
        if (existingKeys.has(key)) continue;  // 이미 있으면 skip
        const value = useMaster[key] !== undefined
            ? useMaster[key]
            : MASTER_EN[key] || '';  // safeguard
        if (isCloned) {
            lines.push(`    // [TRANSLATION_PENDING: ${key}, ${lang}, cloned from en at ${TODAY}]`);
        }
        lines.push(`    '${escapeJsString(key)}': '${escapeJsString(value)}',`);
    }
    return lines.join('\n');
}

// ----- 메인 -----

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const manifestKeys = [...manifest.keys, ...(manifest.nonBizKeys || [])];
const requiredLangs = manifest.requiredLanguages;

let src = fs.readFileSync(TRANSLATIONS_PATH, 'utf8');

// 기존 키 파싱 (각 언어별)
const evalSrc = src.replace(/^\s*const\s+translations\s*=/m, 'translations =');
let translations;
// eslint-disable-next-line no-eval
eval(evalSrc);

const stats = {};

// 각 언어 블록의 마지막 키 다음, 닫는 `}` 직전에 새 키들 삽입
// translations.js의 각 언어 블록은 다음 형태로 끝남:
//   '...': '...',\n    },\n    <다음언어>: {\n
// 또는 마지막 언어의 경우:
//   '...': '...'\n    }\n};
//
// 각 언어별로 "    }," 패턴을 찾되, 직전 라인이 해당 언어의 마지막 키여야 하므로
// 언어 블록 시작 지점부터 스캔해 매칭되는 닫는 괄호 찾기.

for (const lang of requiredLangs) {
    const existing = new Set(Object.keys(translations[lang] || {}));
    const missing = manifestKeys.filter(k => !existing.has(k));
    stats[lang] = { existing: existing.size, adding: missing.length };
    if (missing.length === 0) continue;

    // 언어 블록 시작 지점 찾기: "\n    <lang>: {"
    const openRe = new RegExp(`\\n\\s{4}${lang}\\s*:\\s*{`, 'm');
    const openMatch = openRe.exec(src);
    if (!openMatch) {
        console.error(`[inject-biz-i18n] 언어 블록 시작 미발견: ${lang}`);
        process.exit(1);
    }
    const blockStart = openMatch.index + openMatch[0].length;

    // blockStart 이후 중첩 중괄호 카운트로 해당 언어 블록의 닫는 `}` 위치 찾기
    let depth = 1;
    let i = blockStart;
    while (i < src.length && depth > 0) {
        const c = src[i];
        if (c === '{') depth++;
        else if (c === '}') depth--;
        if (depth === 0) break;
        i++;
    }
    if (depth !== 0) {
        console.error(`[inject-biz-i18n] 언어 블록 종료 미발견: ${lang}`);
        process.exit(1);
    }
    const closeBracePos = i;  // '}' 위치

    // '}' 직전까지 역추적해 공백·줄바꿈 건너뛰고 마지막 키 줄 찾기
    // 가장 간단한 방법: '}' 직전에 콤마와 새 줄을 붙여 삽입
    // 1) 기존 마지막 키가 콤마로 끝나는지 확인 후, 필요 시 콤마 추가
    let preClose = src.slice(0, closeBracePos);
    let postClose = src.slice(closeBracePos);

    // preClose 끝의 공백·줄바꿈 제거
    const trimmedPre = preClose.replace(/\s+$/, '');
    const lastChar = trimmedPre[trimmedPre.length - 1];
    let separator = '';
    if (lastChar !== ',' && lastChar !== '{') {
        // 마지막 키가 콤마 없이 끝난 경우 (예: `'key': 'val'\n    }`) — 콤마 추가 필요
        separator = ',';
    }

    const insertBlock = buildInsertBlock(lang, manifestKeys, existing);
    // trimmedPre 뒤에 separator + insertBlock + '\n    '(닫는 괄호 들여쓰기) 붙이고 closeBrace
    src = trimmedPre + separator + insertBlock + '\n    ' + postClose;
}

// ----- 결과 출력 -----
if (DRY_RUN) {
    console.log('[inject-biz-i18n] --dry 모드: 파일 변경 없음');
    for (const lang of requiredLangs) {
        console.log(`  ${lang}: 기존 ${stats[lang].existing}, 추가 ${stats[lang].adding}`);
    }
    process.exit(0);
}

fs.writeFileSync(TRANSLATIONS_PATH, src, 'utf8');
console.log('[inject-biz-i18n] ✅ 주입 완료');
for (const lang of requiredLangs) {
    console.log(`  ${lang}: 기존 ${stats[lang].existing}, 추가 ${stats[lang].adding}`);
}
console.log(`\n다음 단계: node scripts/validate-biz-i18n.js`);

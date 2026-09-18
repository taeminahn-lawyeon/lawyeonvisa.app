#!/usr/bin/env node
/* ============================================================
   build-site.js — assembles per-language static pages from
   shared partials (head/header/footer) + per-language content.

   Output: English at repo root (e.g. main.html), Korean under /ko
   (e.g. ko/main.html). Run:  node scripts/build-site.js
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.lawyeon-immigration.com';
// 기사 하단 고지문에 도메인이 글자로 적혀 있다. 도메인을 바꿀 때 그 45곳을
// 따로 찾아 고치면 반드시 빠뜨리는 곳이 생기므로, 본문에는 __DOMAIN__ 토큰만
// 두고 여기서 만들어 넣는다. 바꿀 곳은 위의 SITE 한 줄뿐이다.
const DOMAIN = SITE.replace(/^https?:\/\//, '').replace(/^www\./, '');
const LANGS = ['en', 'ko'];
// 검색엔진 소유 확인 태그. 홈(/, /ko/)에만 넣는다. 네이버 서치어드바이저는 등록한
// 홈페이지 주소의 <head> 에서 이 태그를 찾는다. 값은 공개되어도 무방하다.
const SITE_VERIFICATION_TAGS = [
  '<meta name="naver-site-verification" content="e17e3ba4eede3bf088de6727cb2dfeac1fb53b39">',
];

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const replaceAll = (s, find, val) => s.split(find).join(val == null ? '' : val);
// All languages and static policy pages share one stylesheet URL. Derive the
// cache version from its contents so a footer/style edit cannot miss a version bump.
const stylesheetUrl = (file) => '/' + file + '?v=' + crypto.createHash('sha256')
  .update(read(file)).digest('hex').slice(0, 12);
const SITE_CSS_URL = stylesheetUrl('css/site.css');

// ---- shared partials ----
const HEAD = read('partials/head.html');
const HEADER = read('partials/header.html');
const FOOTER = { en: read('partials/footer.en.html'), ko: read('partials/footer.ko.html'), vi: read('partials/footer.vi.html') };
// Scripts every built page gets. site.js is presentation-only (site navigation,
// article CTAs, share button) — it no longer touches auth.
const SCRIPTS = '<script src="__BASE__js/site.js?v=16"></script>';

// Supabase is loaded only by the pages that actually submit a form
// (pre-consultation, visit booking, corporate advisory). Article and index
// pages used to pull it in just for the header login button; that button is
// gone, so ~40 pages no longer download 60+ KB of client they never used.
// Opt in per page with `supabase: true` in PAGES.
const SUPABASE_SCRIPTS = [
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
  '<script src="__BASE__js/supabase-client.js?v=20260911"></script>',
].join('\n');

// 사이트 이름은 언어와 무관하게 하나로 고정한다.
// Google 은 도메인 단위로 사이트 이름을 하나만 고르며, 페이지마다 다른 이름을
// 선언하면(이전에는 언어별로 4가지였다) 판단을 포기하고 도메인(lawyeon-immigration.com)을
// 그대로 표시한다. og:site_name·WebSite.name·index.html 이 모두 같아야 한다.
const SITE_NAME = 'Law Firm Lawyeon Immigration Law Center';
// 대체 이름. Google 은 대표 이름을 채택하지 못하면 여기서 고르고, 그것도 없으면
// 도메인을 표시한다. 하위 페이지 제목은 '— Law Firm Lawyeon'·'— 법무법인 로연'
// 으로 끝나므로 그 짧은 이름도 후보에 넣어 사이트 전체의 표기가 후보 안에 들게 한다.
const SITE_NAME_ALT = ['법무법인 로연 출입국이민법센터', 'Law Firm Lawyeon', '법무법인 로연'];

// ---- per-language UI strings (header chrome) ----
const STRINGS = {
  en: { brandName: 'Law Firm Lawyeon', brandSub: 'Immigration Law Center',
        siteName: SITE_NAME, siteNameAlt: SITE_NAME_ALT,
        navExpertise: 'Expertise', navInsights: 'Insights', navCaseStudies: 'Recent Case', navCases: 'Newsletters & News', navConsult: 'Contact',
        navLabel: 'Main navigation' },
  ko: { brandName: '법무법인 로연', brandSub: '출입국이민법센터',
        siteName: SITE_NAME, siteNameAlt: SITE_NAME_ALT,
        navExpertise: '업무분야', navInsights: '인사이트', navCaseStudies: '최근 업무사례', navCases: '뉴스레터·소식', navConsult: '문의',
        navLabel: '주요 메뉴' },
  vi: { brandName: 'Law Firm Lawyeon', brandSub: 'Trung tâm Xuất nhập cảnh & Di trú',
        siteName: SITE_NAME, siteNameAlt: SITE_NAME_ALT,
        navExpertise: 'Lĩnh vực hoạt động', navInsights: 'Thông tin pháp lý', navCaseStudies: 'Vụ việc', navCases: 'Bản tin & Tin tức', navConsult: 'Liên hệ',
        navLabel: 'Điều hướng chính' },
};

// Directory prefix each language's built pages live under (en at root).
const LANG_DIR = { en: '', ko: 'ko/', vi: 'vi/' };
// Root-absolute nav home per language, so shared header links resolve correctly
// from any depth (vi pages reuse the English top-level pages).
const NAV_HOME = { en: '', ko: '/ko/', vi: '/' };
// 각 언어의 홈 URL. 홈은 /main 이 아니라 도메인 루트다 — Google 은 사이트 이름을
// 루트에서만 읽고, /main 과 / 가 함께 있으면 홈페이지가 둘로 갈린다.
const HOME_URL = { en: '/', ko: '/ko/', vi: '/' };
// 페이지의 사이트 경로. 홈이면 '' (루트), 그 외에는 id.
const pagePath = (page, lang) => (page.home ? '' : page.id);
const pageUrl = (page, lang) => `${SITE}/${LANG_DIR[lang]}${pagePath(page, lang)}`;

// 빌드 시스템 밖에 있으나 색인 대상인 정적 문서.
const STATIC_PAGES = ['terms-of-service', 'privacy-policy', 'refund-policy'];

// ---- page registry (add pages here as they are migrated) ----
const PAGES = [
  {
    "id": "g1-visa-refusal-after-departure-order-cancellation-korea",
    "content": "g1-visa-refusal-after-departure-order-cancellation-korea",
    "langs": [
      "ko",
      "en"
    ],
    "section": "newsletters",
    "modified": "2026-09-18",
    "title": {
      "ko": "출국명령 취소 후 G-1 체류불허의 위법성",
      "en": "G-1 visa refusal after cancellation of a departure order"
    },
    "desc": {
      "ko": "불법취업 이력을 이유로 한 G-1 체류불허를 취소한 판결입니다. 종전 출국명령 취소판결의 기속력과 취업허가 심사로 제도 남용을 막을 수 있다는 비례원칙 판단을 분석합니다.",
      "en": "A court set aside a G-1 refusal based on unauthorized employment. The judgment examines the earlier departure-order ruling and work-permit scrutiny as an alternative to refusing stay."
    }
  },
  {
    "id": "foreigner-drug-use-allegation-non-prosecution-korea",
    "content": "foreigner-drug-use-allegation-non-prosecution-korea",
    "langs": [
      "ko",
      "en"
    ],
    "section": "cases",
    "modified": "2026-09-18",
    "title": {
      "ko": "외국인 마약 전달 사건의 투약 혐의 불기소",
      "en": "Non-prosecution of a drug-use allegation in a foreign national’s drug delivery case"
    },
    "desc": {
      "ko": "로연은 마약 전달 사건에 연루된 외국인을 변호하여 투약 혐의의 불기소 처분을 이끌어냈습니다. 간이시약 음성 결과와 자백 외 객관적 증거의 부재를 제시한 사례입니다.",
      "en": "Lawyeon secured non-prosecution of a drug-use allegation by presenting a negative preliminary test and the lack of objective evidence beyond the client’s admission."
    }
  },
  {
    "id": "f4-visa-dui-departure-order-humanitarian-korea",
    "content": "f4-visa-dui-departure-order-humanitarian-korea",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "F-4 재외동포의 음주운전 출국명령과 인도적 사유",
      "en": "DUI departure orders and humanitarian grounds for F-4 visa holders"
    },
    "desc": {
      "ko": "F-4 재외동포의 음주운전 출국명령에서 국내 가족생활을 심사에 반영하지 않았다면 이를 다툴 수 있습니다. 생활기반을 인정한 사례와 출국명령을 유지한 사례를 비교합니다.",
      "en": "Family life in Korea can support a challenge to a DUI departure order. Contrasting decisions show how settlement and humanitarian grounds are assessed, including for F-4 holders."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "newsletters",
    "content": "newsletters",
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-18",
    "title": {
      "ko": "뉴스레터 — 판결·법령·정책의 시사점 — 법무법인 로연",
      "en": "Newsletters — Judgments, Law & Policy — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "주요 판결과 법령·매뉴얼·정책 변화가 출입국·국적 사건의 판단과 대응에 미치는 영향을 분석합니다.",
      "en": "Legal analysis of significant judgments and changes in immigration law, policy and guidance, with implications for individual matters."
    }
  },
  {
    "id": "news",
    "content": "news",
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-18",
    "title": {
      "ko": "로연 소식 — 법무법인 로연",
      "en": "Lawyeon News — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "법무법인 로연의 업무 협약과 대외 활동 소식을 전합니다.",
      "en": "Partnerships, professional activities and news from Law Firm Lawyeon."
    }
  },
  {
    "id": "f6-visa-extension-separation-before-divorce-judgment",
    "content": "f6-visa-extension-separation-before-divorce-judgment",
    "langs": [
      "ko",
      "en"
    ],
    "section": "newsletters",
    "modified": "2026-09-18",
    "title": {
      "ko": "이혼 확정 전 혼인단절과 F-6 비자 연장",
      "en": "F-6 visa extension for marital breakdown before divorce"
    },
    "desc": {
      "ko": "장기간 별거 중인 외국인에게 이혼 확정 전 F-6-3 체류요건을 인정한 판결입니다. 혼인파탄의 주된 책임과 체류연장 불허 취소소송에서 이를 입증하는 방법을 분석합니다.",
      "en": "A court recognized F-6-3 eligibility before divorce. The decision examines primary responsibility for marital breakdown and the evidence supporting a challenge to an extension refusal."
    }
  },
  {
    "id": "e74-e74r-combined-employment-quota-2026",
    "content": "e74-e74r-combined-employment-quota-2026",
    "langs": [
      "ko",
      "en"
    ],
    "section": "newsletters",
    "modified": "2026-09-18",
    "title": {
      "ko": "E-7-4·E-7-4R 고용한도 예외와 추가 추천",
      "en": "Exceptions to E-7-4 and E-7-4R employment limits"
    },
    "desc": {
      "ko": "E-7-4와 E-7-4R을 함께 고용하는 기업도 일반 기준이 더 유리하면 지역특화형 상한을 넘는 추천이 가능합니다. 국민 고용인원과 기존 근로자의 자격 변경에 따른 한도 계산을 설명합니다.",
      "en": "Employers with both E-7-4 and E-7-4R workers may use the more favorable general limit. The analysis shows when this permits additional recommendations and how status changes affect capacity."
    }
  },
  {
    "id": "f6-marriage-visa-requirements-status-change-korea",
    "content": "f6-marriage-visa-requirements-status-change-korea",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "결혼이민 비자(F-6) 신청 요건과 체류자격 변경",
      "en": "F-6 marriage visa requirements and changes of status in Korea"
    },
    "desc": {
      "ko": "자녀 출생에 따른 F-6 요건 면제를 받아야 하는 부부의 출산 전 체류 방안을 다룹니다. 실제 활동에 맞는 순차적 비자 변경과 통상적인 증빙이 부족한 경우의 소명 방법을 설명합니다.",
      "en": "For couples relying on F-6 exemptions after childbirth, the article examines lawful stay before birth, successive visa changes and submissions where standard evidence is insufficient."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-pension-refund-overseas-case-2026",
    "section": "cases",
    "content": "foreigner-pension-refund-overseas-case-2026",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "소멸시효를 앞둔 해외 거주 외국인의 국민연금 반환일시금 지급",
      "en": "Overseas Korean pension refund claim completed before the limitation period expired"
    },
    "desc": {
      "ko": "소멸시효가 임박한 해외 거주 외국인의 국민연금 반환일시금 청구를 대리한 사례입니다. 해외 공증·아포스티유와 국내 청구를 조율하여 추가 보완 없이 해외송금으로 지급받았습니다.",
      "en": "Lawyeon coordinated overseas notarization, apostille and filing before the pension-refund claim expired. Payment was made by overseas remittance without additional document requests."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "f6-immigration-review-no-departure-order-case-2026",
    "section": "cases",
    "content": "f6-immigration-review-no-departure-order-case-2026",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "벌금 400만 원을 받은 결혼이민자의 출국명령 없는 사범심사 종결",
      "en": "Continued F-6 residence without a departure order after a KRW 4 million fine"
    },
    "desc": {
      "ko": "공무집행방해로 벌금 400만 원을 받은 결혼이민자의 사범심사 사례입니다. 자녀 양육의 필요성과 별도 사건의 종결을 소명하여 출국명령 없이 계속 체류할 수 있었습니다.",
      "en": "After a KRW 4 million fine, an F-6 holder remained in Korea without a departure order. Lawyeon presented childcare needs and proof that a separate investigation had closed."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "expertise",
    "content": "expertise",
    "expertise": true,
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-17",
    "title": {
      "ko": "업무분야 — 법무법인 로연",
      "en": "Expertise — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "형사·사범심사, 비자·이민, 거주·국적, 행정 분야의 주요 업무를 소개합니다. 법무법인 로연 출입국이민법센터.",
      "en": "Explore Lawyeon’s immigration practice: criminal defense and enforcement, visas, residence and nationality, administrative disputes and claims."
    }
  },
  {
    "id": "expertise-criminal",
    "content": "expertise-criminal",
    "expertise": true,
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-17",
    "title": {
      "ko": "형사·사범심사 — 법무법인 로연",
      "en": "Criminal Defense & Immigration Enforcement — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "형사변호와 판결 후 사범심사, 입국규제 확인·해제, 체류·취업 위반 및 출국조치·보호 대응을 다룹니다.",
      "en": "Criminal defense and post-judgment immigration review, entry-ban checks and lifting, immigration violations, removal measures and detention."
    }
  },
  {
    id: 'expertise-corporate', content: 'expertise-corporate', expertise: true,
    title: { ko: '기업 자문 — 법무법인 로연', en: 'Corporate Advisory — Law Firm Lawyeon' },
    desc: { ko: '외국인 채용 전 검토, 고용·체류 관리, 임직원·가족 이주와 국내 사업 진출에 관한 기업 자문을 제공합니다.', en: 'Corporate advice on foreign workforce planning, employment and immigration management, employee relocation and market entry in Korea.' },
  },
  {
    "id": "expertise-visa",
    "content": "expertise-visa",
    "expertise": true,
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-17",
    "title": {
      "ko": "비자·이민 — 법무법인 로연",
      "en": "Visas & Immigration — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "취업·구직·전문인력, 사업·창업·외국인투자, 가족 초청과 동반 입국을 위한 사증·체류자격을 검토합니다.",
      "en": "Visas and immigration advice for employment, professional activities, business, start-ups, foreign investment and family entry."
    }
  },
  {
    "id": "expertise-residence",
    "content": "expertise-residence",
    "expertise": true,
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-17",
    "title": {
      "ko": "거주·국적 — 법무법인 로연",
      "en": "Residence & Nationality — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "거주·영주와 체류자격 유지, 한국 국적·재외동포, 외국인등록·체류기록 정리에 관한 법률 업무를 다룹니다.",
      "en": "Residence and permanent residence, maintaining status, Korean nationality and overseas Koreans, foreign resident registration and immigration records."
    }
  },
  {
    "id": "expertise-admin",
    "content": "expertise-admin",
    "expertise": true,
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-17",
    "title": {
      "ko": "행정 — 법무법인 로연",
      "en": "Administrative Disputes & Claims — Law Firm Lawyeon"
    },
    "desc": {
      "ko": "출입국 처분에 대한 행정심판·행정소송과 국민연금·투자예치금 등 반환 청구를 대리합니다.",
      "en": "Administrative appeals and immigration litigation, National Pension lump-sum refunds and investment deposit repayment claims."
    }
  },
  {
    id: 'main', content: 'home', jsonld: true, home: true,
    // 홈페이지 title 은 사이트 이름과 정확히 같아야 한다. Google 은 사이트 이름을
    // 고를 때 WebSite.name·og:site_name 과 함께 홈의 <title> 도 후보로 읽는데,
    // 서로 다르면 판단이 흔들린다.
    title: { en: SITE_NAME,
             ko: '법무법인 로연 출입국이민법센터' },
    desc:  { en: 'Law Firm Lawyeon Immigration Law Center. Legal representation for criminal cases, contracts and immigration office affairs for expats and migrants in Korea.',
             ko: '법무법인 로연 출입국이민법센터. 외국인·이주민을 위한 형사사건, 계약, 출입국 민원 등 법률 대리 서비스.' },
  },
  {
    id: 'consultation', content: 'consultation', supabase: true,
    title: { en: 'Online Inquiry — Law Firm Lawyeon', ko: '온라인 문의 — 법무법인 로연' },
    desc:  { en: 'Contact Law Firm Lawyeon. Send us your visa, immigration or criminal matter and we will review it and reply by email.',
             ko: '법무법인 로연 온라인 문의. 비자·출입국·형사 사안을 남겨 주시면 검토 후 이메일로 회신드립니다.' },
  },
  {
    id: 'booking', content: 'booking', supabase: true,
    title: { en: 'Book a Visit Consultation — Law Firm Lawyeon', ko: '방문 상담 예약 — 법무법인 로연' },
    desc:  { en: 'Book an in-person consultation at the Seoul or Gwangju office of Law Firm Lawyeon. Weekdays 10:00–17:00, 1-hour slots.',
             ko: '법무법인 로연 서울·광주 사무소 방문 상담 예약. 평일 10:00–17:00, 1시간 단위(점심 12:00–13:00 제외).' },
  },
  {
    id: 'price-list', content: 'price-list',
    title: { en: 'Fees — Law Firm Lawyeon', ko: '보수 기준 — 법무법인 로연' },
    desc:  { en: 'Reference fees for immigration matters handled by Law Firm Lawyeon. The fee for every matter is proposed after a pre-consultation and a review of the procedure involved.',
             ko: '법무법인 로연 출입국 업무 보수 기준. 모든 업무에 관한 비용은 사전 상담 후 업무 절차를 검토하여 제안을 드립니다.' },
  },
  {
    id: 'corporate-advisory', content: 'corporate-advisory', supabase: true,
    title: { en: 'Corporate Advisory Inquiry — Law Firm Lawyeon', ko: '기업 자문 문의 — 법무법인 로연' },
    desc:  { en: 'Corporate advisory for foreign-employee visas, immigration compliance and employment matters. Send an inquiry — no sign-up required.',
             ko: '외국인 임직원 비자·출입국 규정 준수·고용 사안에 대한 기업 자문. 회원가입 없이 문의를 남겨 주세요.' },
  },
  {
    id: 'cases', content: 'cases',
    title: { en: 'Recent Cases — Law Firm Lawyeon', ko: '최근 업무사례 — 법무법인 로연' },
    desc: { en: 'Recent immigration and administrative matters handled by Law Firm Lawyeon.', ko: '법무법인 로연이 수행한 출입국·이민 및 행정 분야의 최근 업무사례입니다.' },
  },
  {
    id: 'insights', content: 'insights',
    title: { en: 'Insights — Law Firm Lawyeon', ko: '인사이트 — 법무법인 로연' },
    desc:  { en: 'Practical notes on visa, immigration and business-immigration practice in Korea by Law Firm Lawyeon attorneys.',
             ko: '비자·출입국·사업이민 실무에 관한 법무법인 로연 변호사의 인사이트.' },
  },
  {
    "id": "korea-business-immigration-visa-guide-d9-4-d9-5-2026",
    "content": "article",
    "title": {
      "ko": "외국인 개인사업자의 D-9-4·D-9-5 비자",
      "en": "D-9-4 and D-9-5 visas for foreign business owners in Korea"
    },
    "desc": {
      "ko": "외국인이 본인 명의의 개인사업자로 한국에서 매장을 운영할 때 적용되는 D-9-4·D-9-5 요건을 설명합니다. 법인 창업과 개인사업의 차이, 학력에 따른 투자금 기준을 다룹니다.",
      "en": "D-9-4 and D-9-5 requirements for foreign nationals operating a sole proprietorship in Korea, including how business form and education affect the visa and investment requirements."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-franchise-business-korea-2026",
    "content": "foreigner-franchise-business-korea-2026",
    "title": {
      "ko": "D-9-4·D-9-5 비자의 투자금 인정 요건",
      "en": "Investment fund requirements for D-9-4 and D-9-5 visas"
    },
    "desc": {
      "ko": "D-9-4·D-9-5 비자는 투자금의 액수뿐 아니라 출처와 송금 경로, 실제 사업비 지출을 심사합니다. 부모의 송금과 국내 저축을 합산한 자금을 투자금으로 입증하는 문제를 다룹니다.",
      "en": "D-9-4 and D-9-5 applications require evidence of investment sources, remittance and business spending. The article examines funds combining parental transfers and savings earned in Korea."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "how-to-open-a-business-in-korea-as-a-foreigner-2026",
    "content": "how-to-open-a-business-in-korea-as-a-foreigner-2026",
    "title": {
      "ko": "외국인의 한국 창업과 D-9 비자 신청 절차",
      "en": "Starting a business in Korea and applying for a D-9 visa"
    },
    "desc": {
      "ko": "D-9 비자는 국내 계약과 사업 준비에 비용을 지출한 뒤 심사를 받습니다. 가맹 심사 전 임대차계약을 체결하는 위험과 인허가·해외 서류가 신청 일정에 미치는 영향을 설명합니다.",
      "en": "A D-9 application involves contracts and spending before visa approval. The article examines early lease commitments and how licensing and overseas documents affect the application timetable."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "korea-permanent-residency-foreign-business-owner-2026",
    "content": "korea-permanent-residency-foreign-business-owner-2026",
    "title": {
      "ko": "D-9 사업자의 체류기간 연장과 F-2-99 변경",
      "en": "D-9 extensions and changes to F-2-99 residence status"
    },
    "desc": {
      "ko": "D-9 사업자의 체류 연장은 실제 영업 실적을 심사하며, F-2-99 변경에는 체류기간 외에도 소득·품행 등의 요건이 적용됩니다. 요건을 갖추는 시점과 가족의 체류 문제를 설명합니다.",
      "en": "D-9 extensions depend on actual business operations. F-2-99 applications also require income and conduct qualifications, which affect application timing and accompanying family members."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "chosun-university-student-legal-mou-2026",
    "content": "chosun-university-student-legal-mou-2026",
    "section": "news",
    "title": {
      "ko": "조선대학교와 외국인 유학생 법률지원 협약 체결",
      "en": "Legal support agreement with Chosun University for international students"
    },
    "desc": {
      "ko": "법무법인 로연이 조선대학교 대외협력처와 외국인 유학생 법률지원 업무협약을 체결했습니다. 협약 당일에는 출입국관리법과 졸업 후 비자를 주제로 한국 법령 특강을 진행했습니다.",
      "en": "Lawyeon signed an agreement with Chosun University to support international students and delivered a lecture on Korean immigration law and visa options after graduation."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "d10-job-seeker-visa-korea-2026",
    "content": "d10-job-seeker-visa-korea-2026",
    "title": {
      "ko": "D-10 구직 비자 신청 요건과 활동 범위",
      "en": "D-10 job seeker visa requirements and permitted activities"
    },
    "desc": {
      "ko": "D-10 구직 비자의 점수제 면제와 체류기간, 인턴·시간제 취업 요건을 설명합니다. 국내 대학 신규 졸업자와 E-1~E-7 근무 경력자에게 적용되는 활동 제한을 함께 다룹니다.",
      "en": "D-10 points exemptions, stay periods and work permissions, with particular attention to the different rules for new Korean graduates and former E-1 to E-7 professionals."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "d10-visa-points-system-deduction-korea-2026",
    "content": "d10-visa-points-system-deduction-korea-2026",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "D-10-1 구직 비자 점수제와 감점 기준",
      "en": "D-10-1 job seeker visa points and deductions"
    },
    "desc": {
      "ko": "D-10-1 점수제에서 벌금·범칙금은 감점이나 결격사유가 될 수 있습니다. 처벌 이력의 적용기간과 한국어 성적 등 증빙의 유효기간이 신청일의 점수에 미치는 영향을 설명합니다.",
      "en": "Criminal fines and immigration penalties can reduce a D-10-1 score or bar an application. Deduction periods and evidence expiry dates affect the score available when applying."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "d10-2-startup-preparation-visa-korea-2026",
    "content": "d10-2-startup-preparation-visa-korea-2026",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "D-10-2 기술창업준비 비자와 D-8-4 변경 요건",
      "en": "D-10-2 start-up preparation and D-8-4 visa requirements"
    },
    "desc": {
      "ko": "D-10-2는 특허 출원·등록과 OASIS 이수 등 신청 근거에 따라 준비할 수 있는 체류기간이 달라집니다. 그 기간에 D-8-4 변경의 필수항목과 점수를 갖추는 계획을 설명합니다.",
      "en": "D-10-2 stay periods depend on qualifying grounds such as patent registration or OASIS training. Preparation must also allow time to meet the mandatory items and points for D-8-4."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-criminal-fine-deportation-reentry-ban-korea-2026",
    "content": "foreigner-criminal-fine-deportation-reentry-ban-korea-2026",
    "modified": "2026-09-18",
    "modifiedKo": "2026-09-17",
    "title": {
      "ko": "외국인 형사판결 확정 후 사범심사와 출국조치·입국규제 대응",
      "en": "Immigration review and removal after a final criminal judgment in Korea"
    },
    "desc": {
      "ko": "형사판결 확정 후 사범심사에서는 과거 처벌과 수사 중인 사건도 확인합니다. 벌금액·죄종별 출국조치 기준과 계속 체류를 위한 국익·인도적 사유의 소명을 설명합니다.",
      "en": "Immigration review after a conviction examines past penalties and pending cases. The article explains removal criteria and public-interest or humanitarian grounds for continued stay."
    }
  },
  {
    "id": "foreigner-immigration-penalty-fine-deportation-korea-2026",
    "content": "foreigner-immigration-penalty-fine-deportation-korea-2026",
    "modified": "2026-09-18",
    "title": {
      "ko": "외국인 출입국 범칙금 처분과 체류 제한 기준",
      "en": "Immigration penalty notices and residence restrictions in Korea"
    },
    "desc": {
      "ko": "출입국 범칙금을 납부해도 체류허가가 제한될 수 있습니다. 형사상 벌금과 다른 금액·합산 기준, 위반 사실에 대한 대응과 체류허가 예외 사유를 설명합니다.",
      "en": "Paying an immigration penalty does not resolve a stay restriction. The article explains the applicable thresholds, challenges to alleged violations and exceptions supporting continued stay."
    }
  },
  {
    "id": "foreigner-unlawful-stay-voluntary-departure-korea-2026",
    "content": "foreigner-unlawful-stay-voluntary-departure-korea-2026",
    "title": {
      "ko": "불법체류 자진출국과 단속 적발에 따른 처분",
      "en": "Voluntary departure and immigration enforcement after an overstay in Korea"
    },
    "desc": {
      "ko": "불법체류자의 자진출국 여부는 범칙금과 재입국 제한에 영향을 줍니다. 한시적 감면제도의 적용 조건과 출국 전 확인할 국내 체류허가 가능성을 설명합니다.",
      "en": "Voluntary departure can affect penalties and re-entry restrictions after an overstay. The article examines temporary relief conditions and possible grounds to regularize stay before leaving."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-immigration-detention-temporary-release-korea-2026",
    "content": "foreigner-immigration-detention-temporary-release-korea-2026",
    "title": {
      "ko": "외국인 보호조치와 보호일시해제 청구",
      "en": "Immigration detention and temporary release in Korea"
    },
    "desc": {
      "ko": "보호일시해제 심사에서는 치료·가족 부양 등 해제의 필요성과 도주 우려를 함께 판단합니다. 고정 거주지와 신원보증, 치료 자료로 각 요건을 소명하는 문제를 다룹니다.",
      "en": "Temporary release from immigration detention depends on the need for release and flight risk. Residence, guarantees and medical evidence support different aspects of that assessment."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "visa-extension-change-denial-reapply-appeal-korea-2026",
    "content": "visa-extension-change-denial-reapply-appeal-korea-2026",
    "title": {
      "ko": "체류기간 연장·자격 변경 불허 후 재신청과 불복",
      "en": "Reapplication and appeals after a stay extension or status change denial"
    },
    "desc": {
      "ko": "체류 연장·변경 불허 사유에 따라 부족한 요건을 보완하거나 처분의 위법성을 다툴 수 있습니다. 위반 이력을 이유로 한 불허의 비례성과 출국기한·불복기간을 설명합니다.",
      "en": "After a stay denial, applicants may remedy a missing requirement or challenge the decision. The article examines proportionality, departure deadlines and separate appeal periods."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-national-pension-lump-sum-refund-korea-2026",
    "content": "foreigner-national-pension-lump-sum-refund-korea-2026",
    "title": {
      "ko": "E-9·H-2 외국인 근로자의 국민연금 반환일시금 청구",
      "en": "Korean National Pension refunds for E-9 and H-2 workers"
    },
    "desc": {
      "ko": "외국인의 국민연금 반환일시금은 국적·체류자격과 가입 이력에 따라 지급 여부를 판단합니다. 해외에서의 대리 청구와 가입기간 확인, 소멸시효에 따른 청구기한을 설명합니다.",
      "en": "Eligibility for a Korean National Pension refund depends on nationality, immigration status and contribution history. The article covers overseas claims, qualifying periods and limitation deadlines."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "far-east-university-student-job-fair-mou-2026",
    "content": "far-east-university-student-job-fair-mou-2026",
    "section": "news",
    "title": {
      "ko": "극동대학교와 외국인 유학생 취업지원 협약 체결",
      "en": "Employment support agreement with Far East University for international students"
    },
    "desc": {
      "ko": "법무법인 로연이 극동대학교와 외국인 유학생 취업지원 업무협약을 체결했습니다. 취업 박람회에서는 졸업 후 취업 비자 특강과 무료 비자·법률 상담을 진행했습니다.",
      "en": "Lawyeon signed an international-student employment support agreement with Far East University and provided a work-visa lecture and free legal consultations at its student job fair."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-dui-deportation-korea-2026",
    "content": "foreigner-dui-deportation-korea-2026",
    "modified": "2026-09-18",
    "title": {
      "ko": "외국인 음주운전 벌금과 사범심사, 강제출국 기준",
      "en": "DUI fines and immigration removal criteria in Korea"
    },
    "desc": {
      "ko": "외국인의 음주운전은 벌금액과 반복 처벌 이력에 따라 출국조치 심사로 이어질 수 있습니다. 재범 위험과 국내 가족·사업상 체류 필요성이 심사에서 어떻게 평가되는지 설명합니다.",
      "en": "DUI fines and repeat convictions can trigger immigration review for removal. The article examines repeat-offence risk and family or business grounds for remaining in Korea."
    }
  },
  {
    "id": "foreigner-divorce-f6-visa-stay-korea-2026",
    "content": "foreigner-divorce-f6-visa-stay-korea-2026",
    "modified": "2026-09-18",
    "langs": [
      "ko",
      "en",
      "vi"
    ],
    "title": {
      "ko": "한국인 배우자와 이혼 후 F-6 체류 요건",
      "en": "F-6 residence requirements after divorce from a Korean spouse",
      "vi": "Điều kiện cư trú F-6 sau ly hôn với người Hàn Quốc"
    },
    "desc": {
      "ko": "이혼 후 체류는 미성년 자녀 양육과 혼인파탄의 책임 등에 따라 적용 자격이 달라집니다. F-6-2·F-6-3 요건과 협의이혼 후 귀책사유 입증, 이혼소송 중 체류를 설명합니다.",
      "en": "Stay after divorce can depend on child-rearing or responsibility for marital breakdown. The article examines F-6-2 and F-6-3 eligibility, proof after an agreed divorce, and stay during litigation.",
      "vi": "Tư cách cư trú sau ly hôn phụ thuộc vào việc nuôi con hoặc trách nhiệm khiến hôn nhân tan vỡ. Bài viết trình bày điều kiện F-6-2, F-6-3, chứng cứ sau thuận tình ly hôn và cư trú trong thời gian kiện ly hôn."
    }
  },
  {
    "id": "nationality-reinstatement-procedure-korea-2026",
    "content": "nationality-reinstatement-procedure-korea-2026",
    "langs": [
      "ko",
      "en"
    ],
    "title": {
      "ko": "외국 시민권 취득 후 한국 국적회복 절차",
      "en": "Reinstatement of Korean nationality after acquiring foreign citizenship"
    },
    "desc": {
      "ko": "외국 시민권 취득 후 한국 국적을 회복하려면 국적상실 기록과 체류자격을 정리해야 합니다. 외국 서류와 한국 가족관계등록부의 성명·생년월일 불일치가 신청에 미치는 영향을 설명합니다.",
      "en": "Restoring Korean nationality involves loss-of-nationality records and lawful stay. Differences in names or birth dates between foreign documents and Korean records can delay the process."
    },
    "modified": "2026-09-18"
  },
  {
    "id": "foreigner-entry-ban-check-lift-korea-2026",
    "content": "foreigner-entry-ban-check-lift-korea-2026",
    "langs": [
      "ko",
      "en"
    ],
    "modified": "2026-09-18",
    "title": {
      "ko": "출국명령·강제퇴거 후 입국규제 해제와 재입국",
      "en": "Entry-ban relief and re-entry after departure or deportation"
    },
    "desc": {
      "ko": "입국규제 기간 중에도 국익·인도적 사유로 특별해제를 신청할 수 있습니다. 양육·치료·사업상 사정이 현재 입국의 필요성을 입증하는지와 해제 후 재입국 요건을 설명합니다.",
      "en": "An entry ban may be lifted early on public-interest or humanitarian grounds. Childcare, treatment and business evidence must support the present need to enter Korea; re-entry also requires the appropriate status."
    }
  },
];

// Publication dates for blog articles (page id -> ISO date). A page is an
// "article" iff its id is a key here. Used for article JSON-LD, article:*
// meta and sitemap <lastmod>.
const ARTICLE_DATES = {
  'g1-visa-refusal-after-departure-order-cancellation-korea': '2026-09-18',
  'foreigner-drug-use-allegation-non-prosecution-korea': '2026-09-18',
  'f4-visa-dui-departure-order-humanitarian-korea':'2026-09-18',
  'f6-visa-extension-separation-before-divorce-judgment': '2026-09-18',
  'e74-e74r-combined-employment-quota-2026': '2026-09-18',

  'f6-marriage-visa-requirements-status-change-korea':'2026-09-18',
  'foreigner-pension-refund-overseas-case-2026':'2026-09-18',
  'f6-immigration-review-no-departure-order-case-2026':'2026-09-18',
  'korea-business-immigration-visa-guide-d9-4-d9-5-2026':'2026-05-14',
  'foreigner-franchise-business-korea-2026':'2026-05-07',
  'how-to-open-a-business-in-korea-as-a-foreigner-2026':'2026-04-30',
  'korea-permanent-residency-foreign-business-owner-2026':'2026-04-23',
  'chosun-university-student-legal-mou-2026':'2026-04-10',
  'd10-job-seeker-visa-korea-2026':'2026-01-16',
  'foreigner-criminal-fine-deportation-reentry-ban-korea-2026':'2026-06-01',
  'foreigner-immigration-penalty-fine-deportation-korea-2026':'2026-06-01',
  'foreigner-unlawful-stay-voluntary-departure-korea-2026':'2026-06-01',
  'foreigner-immigration-detention-temporary-release-korea-2026':'2026-06-01',
  'visa-extension-change-denial-reapply-appeal-korea-2026':'2026-06-01',
  'foreigner-national-pension-lump-sum-refund-korea-2026':'2026-06-01',
  'far-east-university-student-job-fair-mou-2026':'2026-05-26',
  'foreigner-dui-deportation-korea-2026':'2026-07-01',
  'foreigner-divorce-f6-visa-stay-korea-2026':'2026-07-01',
  'foreigner-entry-ban-check-lift-korea-2026':'2026-07-11',
  'd10-visa-points-system-deduction-korea-2026':'2026-07-18',
  'd10-2-startup-preparation-visa-korea-2026':'2026-07-18',
  'nationality-reinstatement-procedure-korea-2026':'2026-07-16',
};

// 사이트맵 lastmod. 하드코딩한 날짜를 전 페이지에 똑같이 박으면 Google 이
// 신호로 쓰지 않는다. 해당 페이지의 소스(content/<id>.<lang>.html)가 마지막으로
// 커밋된 날을 쓴다. 얕은 복제 등으로 조회에 실패하면 빌드일로 되돌린다.
const { execFileSync } = require('child_process');
const BUILD_DAY = new Date().toISOString().slice(0, 10);
const _lastmodCache = new Map();
function lastCommitDate(relPath) {
  if (_lastmodCache.has(relPath)) return _lastmodCache.get(relPath);
  let d = null;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', relPath],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) d = out;
  } catch (_) { /* git 없음 또는 이력 없음 */ }
  _lastmodCache.set(relPath, d);
  return d;
}

// 페이지의 사이트맵 lastmod: 기사면 발행일, 그 외에는 소스의 마지막 커밋일.
function pageLastmod(page) {
  if (page.modified) return page.modified;
  const langs = page.langs || LANGS;
  const dates = langs
    .map((l) => lastCommitDate(`content/${page.content}.${l}.html`))
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : (ARTICLE_DATES[page.id] || BUILD_DAY);
}

// Strip the brand suffix from a page title for use as a bare headline.
function stripBrand(title) {
  return title
    .replace(/ — Law Firm Lawyeon$/, '')
    .replace(/ — 법무법인 로연$/, '')
    .replace(/ — Lawyeon$/, '');
}

// Per-page og:image: first blog image in the body, else the default og image.
function pageOgImage(bodyHtml) {
  const m = bodyHtml.match(/__BASE__images\/blog\/([^"']+)/);
  return m ? SITE + '/images/blog/' + m[1] : SITE + '/images/og-image.png';
}

// Extract FAQ q/a pairs from an article body. FAQ blocks look like
// <div class="qa"><div class="q">Q</div><div class="a">A</div></div>.
function extractFaqs(bodyHtml) {
  const pairs = [];
  const re = /<div class="qa"><div class="q">([\s\S]*?)<\/div><div class="a">([\s\S]*?)<\/div><\/div>/g;
  let m;
  const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  while ((m = re.exec(bodyHtml)) !== null) {
    pairs.push({ q: clean(m[1]), a: clean(m[2]) });
  }
  return pairs;
}

// BlogPosting (+ FAQPage when FAQs exist) structured data for an article.
function articleJsonLd(page, lang, canonical, bodyHtml, ogImage) {
  const date = ARTICLE_DATES[page.id];
  const org = lang === 'ko' ? '법무법인 로연' : 'Law Firm Lawyeon';
  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: stripBrand(page.title[lang]),
    description: page.desc[lang],
    inLanguage: lang,
    datePublished: date,
    dateModified: (lang === 'ko' && page.modifiedKo) || page.modified || date,
    image: ogImage,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Organization', name: org },
    publisher: {
      '@type': 'Organization',
      name: org,
      logo: { '@type': 'ImageObject', url: SITE + '/images/og-image.png' },
    },
  };
  const faqs = extractFaqs(bodyHtml);
  let obj;
  if (faqs.length >= 1) {
    const faqPage = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
    obj = [blogPosting, faqPage];
  } else {
    obj = blogPosting;
  }
  return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</' + 'script>';
}

// BreadcrumbList structured data: Home > Insights > Article.
function breadcrumbJsonLd(page, lang, canonical) {
  const home = SITE + HOME_URL[lang];
  const insightsDir = lang === 'vi' ? '' : LANG_DIR[lang];
  const section = page.section || 'insights';
  const insights = SITE + '/' + insightsDir + section;
  const insightsName = section === 'newsletters' ? (lang === 'ko' ? '뉴스레터' : 'Newsletters')
    : section === 'cases' ? (lang === 'ko' ? '최근 업무사례' : 'Recent Cases')
    : section === 'news' ? (lang === 'ko' ? '로연 소식' : 'Lawyeon News')
    : (lang === 'ko' ? '인사이트' : (lang === 'vi' ? 'Thông tin pháp lý' : 'Insights'));
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: home },
      { '@type': 'ListItem', position: 2, name: insightsName, item: insights },
      { '@type': 'ListItem', position: 3, name: stripBrand(page.title[lang]), item: canonical },
    ],
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</' + 'script>';
}

// LegalService structured data (JSON-LD) for the homepage.
function legalServiceJsonLd(lang) {
  const S = STRINGS[lang];
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    // 조직 이름은 WebSite.name·og:site_name·<title> 과 글자 하나까지 같아야 한다.
    // 브랜드 표기(brandName + brandSub)를 이어 붙이면 'Visa &' 가 들어가 미세하게
    // 달라지고, Google 은 이름 후보가 둘이면 판단을 보류한다.
    name: SITE_NAME,
    alternateName: SITE_NAME_ALT,
    // 홈이 /main 에서 도메인 루트로 옮겨졌다.
    url: SITE + HOME_URL[lang],
    telephone: '+82-2-2039-0544',
    image: SITE + '/images/og-image.png',
    areaServed: { '@type': 'Country', name: lang === 'en' ? 'South Korea' : '대한민국' },
    address: [
      { '@type': 'PostalAddress', streetAddress: lang === 'en' ? '164 Gonghang-daero, Gangseo-gu, 5F #503' : '강서구 공항대로 164, 5층 503호',
        addressLocality: lang === 'en' ? 'Seoul' : '서울', addressCountry: 'KR' },
      { '@type': 'PostalAddress', streetAddress: lang === 'en' ? '1 Junbeop-ro, Dong-gu, 3F' : '동구 준법로 1, 3층',
        addressLocality: lang === 'en' ? 'Gwangju' : '광주', addressCountry: 'KR' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00', closes: '18:00',
    },
    priceRange: '₩₩',
    sameAs: ['https://lawyeon.com/'],
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</' + 'script>';
}

// WebSite structured data — the primary signal Google uses to show a site name
// (instead of the bare domain) in search results and AI overviews.
function websiteJsonLd(lang) {
  const S = STRINGS[lang];
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: S.siteName,
    alternateName: S.siteNameAlt,
    url: SITE + '/',
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</' + 'script>';
}

// Relative link from a page in `fromLang` to the same page id in `toLang`.
function relPath(fromLang, toLang, id) {
  const up = fromLang === 'en' ? '' : '../';
  return up + LANG_DIR[toLang] + id;
}

function langToggle(lang, id, langs, isHome) {
  langs = langs || LANGS;
  const labels = { en: 'EN', ko: 'KO', vi: 'VI' };
  const names = { en: 'English', ko: '한국어', vi: 'Tiếng Việt' };
  // Always offer EN/KO (muted when a page lacks one); show Vietnamese only
  // for pages that actually have a Vietnamese version.
  const display = ['ko', 'en'];
  if (langs.indexOf('vi') >= 0) display.push('vi');
  const muted = (t) => `<span style="color:var(--rule-d)">${t}</span>`;
  return display.map((l) => {
    if (langs.indexOf(l) < 0) return muted(labels[l]);
    const href = isHome ? HOME_URL[l] : (l === lang ? id : relPath(lang, l, id));
    return `<a href="${href}" lang="${l}" hreflang="${l}" aria-label="${names[l]}"${l === lang ? ' class="active" aria-current="true"' : ''}>${labels[l]}</a>`;
  }).join('<span class="sep" aria-hidden="true">|</span>');
}

// Articles are published in Korean and English together. Check before writing
// any output so a missing translation cannot silently produce a partial release.
function validateArticleLanguages() {
  const errors = [];
  for (const page of PAGES) {
    if (!Object.prototype.hasOwnProperty.call(ARTICLE_DATES, page.id)) continue;
    for (const lang of ['ko', 'en']) {
      const file = path.join(ROOT, 'content', `${page.content}.${lang}.html`);
      if (!(page.langs || LANGS).includes(lang)) errors.push(`${page.id}: missing ${lang} in langs`);
      if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').trim()) {
        errors.push(`${page.id}: missing or empty ${lang} article`);
      }
      if (!page.title?.[lang]?.trim()) errors.push(`${page.id}: missing ${lang} title`);
      if (!page.desc?.[lang]?.trim()) errors.push(`${page.id}: missing ${lang} description`);
    }
  }
  if (errors.length) throw new Error(`Articles require Korean and English versions:\n${errors.join('\n')}`);
}

function build() {
  validateArticleLanguages();
  let count = 0;
  for (const page of PAGES) {
    const langs = page.langs || LANGS;
    const hasEn = langs.indexOf('en') >= 0;
    const hasKo = langs.indexOf('ko') >= 0;
    const hasVi = langs.indexOf('vi') >= 0;
    const altEn = hasEn ? pageUrl(page, 'en') : pageUrl(page, 'ko');
    const altKo = hasKo ? pageUrl(page, 'ko') : pageUrl(page, 'en');
    const hreflangVi = hasVi ? `<link rel="alternate" hreflang="vi" href="${SITE}/vi/${page.id}">` : '';
    for (const lang of langs) {
      const base = lang === 'en' ? '' : '../';
      const out = `${LANG_DIR[lang]}${page.home ? 'index' : page.id}.html`;
      const canonical = pageUrl(page, lang);
      const S = STRINGS[lang];
      const bodyHtml = read(`content/${page.content}.${lang}.html`);

      const isArticle = Object.prototype.hasOwnProperty.call(ARTICLE_DATES, page.id);
      const date = ARTICLE_DATES[page.id];
      const ogImage = isArticle ? pageOgImage(bodyHtml) : SITE + '/images/og-image.png';

      const scripts = (page.supabase ? SUPABASE_SCRIPTS + '\n' : '') + SCRIPTS;
      let doc = HEAD + '\n' + HEADER + '\n' + bodyHtml + '\n' + FOOTER[lang] + '\n' + scripts + '\n</body>\n</html>\n';
      const subs = {
        '__SITE_CSS_URL__': SITE_CSS_URL,
        '__LANG__': lang,
        '__TITLE__': isArticle ? stripBrand(page.title[lang]) : page.title[lang],
        '__DESC__': page.desc[lang],
        '__CANONICAL__': canonical,
        '__ALT_EN__': altEn,
        '__ALT_KO__': altKo,
        '__HREFLANG_VI__': hreflangVi,
        '__NAV_HOME__': NAV_HOME[lang],
        '__HOME__': HOME_URL[lang],
        '__DOMAIN__': DOMAIN,
        '__BRAND_NAME__': S.brandName,
        '__BRAND_SUB__': S.brandSub,
        '__NAV_EXPERTISE__': S.navExpertise,
        '__EXPERTISE_CURRENT__': page.id === 'expertise' ? ' class="expertise-current" aria-current="page"' : (page.id.startsWith('expertise-') ? ' class="expertise-current"' : ''),
        '__PAGE_STYLES__': page.expertise ? `<link rel="stylesheet" href="${stylesheetUrl('css/expertise.css')}">` : '',
        '__NAV_INSIGHTS__': S.navInsights,
        '__INSIGHTS_CURRENT__': page.id === 'insights' ? ' aria-current="page"' : '',
        '__NAV_CASE_STUDIES__': S.navCaseStudies,
        '__CASE_CURRENT__': page.id === 'cases' ? ' aria-current="page"' : '',
        '__NAV_CASES__': S.navCases,
        '__NEWS_CURRENT__': ['newsletters', 'news'].includes(page.id) || ['newsletters', 'news'].includes(page.section) ? ' class="news-current"' : '',
        '__NAV_CONSULT__': S.navConsult,
        '__NAV_LABEL__': S.navLabel,
        '__LANG_LABEL__': lang === 'ko' ? '언어 선택' : 'Language selection',
        '__MENU_OPEN__': lang === 'ko' ? '전체 메뉴 열기' : 'Open navigation',
        '__MENU_CLOSE__': lang === 'ko' ? '전체 메뉴 닫기' : 'Close navigation',
        '__CONTACT_CURRENT__': ['consultation', 'booking', 'corporate-advisory'].includes(page.id) ? ' class="contact-current"' : '',
        '__LANGTOGGLE__': langToggle(lang, page.id, langs, !!page.home),
        '__OG_SITE_NAME__': S.siteName,
        '__JSONLD__': page.jsonld ? legalServiceJsonLd(lang) : '',
        // WebSite 구조화 데이터는 홈에만 넣는다. Google 은 사이트 이름을 홈페이지에서만
        // 읽고, 하위 페이지에 url 이 루트인 WebSite 를 함께 실으면 그 페이지의 canonical
        // 과 어긋나는 선언이 51개 생긴다.
        '__WEBSITE_JSONLD__': page.home ? websiteJsonLd(lang) : '',
        '__SITE_VERIFICATION__': page.home ? '\n' + SITE_VERIFICATION_TAGS.join('\n') : '',
        '__OG_TYPE__': isArticle ? 'article' : 'website',
        '__OG_IMAGE__': ogImage,
        '__ARTICLE_META__': isArticle
          ? '<meta property="article:published_time" content="' + date + '"><meta property="article:modified_time" content="' + ((lang === 'ko' && page.modifiedKo) || page.modified || date) + '">'
          : '',
        '__ARTICLE_JSONLD__': isArticle
          ? articleJsonLd(page, lang, canonical, bodyHtml, ogImage) + '\n' + breadcrumbJsonLd(page, lang, canonical)
          : '',
      };
      for (const [k, v] of Object.entries(subs)) doc = replaceAll(doc, k, v);
      doc = replaceAll(doc, '__BASE__', base); // last: appears in head/footer/body
      // Do not label a single-language article as an unavailable translation.
      if (!hasEn) doc = doc.replace(/<link rel="alternate" hreflang="en"[^>]*>\n?/g, '');
      if (!hasKo) doc = doc.replace(/<link rel="alternate" hreflang="ko"[^>]*>\n?/g, '');

      const dest = path.join(ROOT, out);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, doc, 'utf8');
      console.log('built', out);
      count++;
    }
  }
  // Policy content is authored separately; keep its shared navigation and assets current.
  const sharedPolicyHeader = read('ko/index.html').match(/<header class="header">[\s\S]*?<\/header>\s*<dialog id="site-navigation"[\s\S]*?<\/dialog>/)[0];
  const sharedFonts = HEAD.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^\"]+" rel="stylesheet">/)[0];
  for (const id of STATIC_PAGES) {
    const file = `${id}.html`;
    const doc = read(file);
    const cssLink = /href="\/css\/site\.css(?:\?[^"]*)?"/g;
    if (!cssLink.test(doc)) throw new Error(`Missing shared stylesheet in ${file}`);
    const updated = doc.replace(cssLink, `href="${SITE_CSS_URL}"`)
      .replace(/href="\/css\/legal\.css(?:\?[^"]*)?"/g, `href="${stylesheetUrl('css/legal.css')}"`)
      .replace(/<header class="header">[\s\S]*?<\/header>(?:\s*<dialog id="site-navigation"[\s\S]*?<\/dialog>)?/, sharedPolicyHeader)
      .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^\"]+" rel="stylesheet">/, sharedFonts)
      .replace(/<script src="\/js\/site\.js(?:\?[^\"]*)?"><\/script>/, replaceAll(SCRIPTS, '__BASE__', '/'));
    if (updated !== doc) fs.writeFileSync(path.join(ROOT, file), updated, 'utf8');
  }
  // ---- sitemap.xml + robots.txt ----
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    // 빌드 대상은 아니지만 상시 공개되고 푸터에서 링크되는 문서들.
    STATIC_PAGES.map((p) => `  <url>\n    <loc>${SITE}/${p}</loc>\n    <lastmod>${BUILD_DAY}</lastmod>\n  </url>`).join('\n') + '\n' +
    PAGES.map(p => {
      const langs = p.langs || LANGS;
      const lastmod = pageLastmod(p);
      const locs = [];
      if (langs.indexOf('en') >= 0) locs.push(pageUrl(p, 'en'));
      if (langs.indexOf('ko') >= 0) locs.push(pageUrl(p, 'ko'));
      if (langs.indexOf('vi') >= 0) locs.push(pageUrl(p, 'vi'));
      let alts = '';
      if (langs.indexOf('en') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="en" href="${pageUrl(p, 'en')}"/>\n`;
      if (langs.indexOf('ko') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="ko" href="${pageUrl(p, 'ko')}"/>\n`;
      if (langs.indexOf('vi') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="vi" href="${pageUrl(p, 'vi')}"/>\n`;
      const xdefault = langs.indexOf('en') >= 0 ? pageUrl(p, 'en') : pageUrl(p, 'ko');
      alts += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xdefault}"/>\n`;
      return locs.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n` + alts + `  </url>`).join('\n');
    }).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  // 폐지 페이지는 robots.txt 로 막지 않는다. Disallow 는 크롤링만 막을 뿐
  // 색인 제거 수단이 아니며, 오히려 Google 이 페이지에 들어가지 못해
  // <meta name="robots" content="noindex"> 를 읽지 못한다. 이미 색인된 URL 은
  // 그대로 남는다. 색인에서 빼려면 크롤을 허용하고 noindex 를 읽히게 해야 한다.
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n', 'utf8');
  console.log('built sitemap.xml, robots.txt');

  console.log(`\nDone. ${count} page(s) generated.`);
}

build();

#!/usr/bin/env node
/* ============================================================
   build-site.js — assembles per-language static pages from
   shared partials (head/header/footer) + per-language content.

   Output: English at repo root (e.g. main.html), Korean under /ko
   (e.g. ko/main.html). Run:  node scripts/build-site.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

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

// ---- shared partials ----
const HEAD = read('partials/head.html');
const HEADER = read('partials/header.html');
const FOOTER = { en: read('partials/footer.en.html'), ko: read('partials/footer.ko.html'), vi: read('partials/footer.vi.html') };
// Scripts every built page gets. site.js is presentation-only (mobile nav,
// article CTAs, share button) — it no longer touches auth.
const SCRIPTS = '<script src="__BASE__js/site.js?v=11"></script>';

// Supabase is loaded only by the pages that actually submit a form
// (pre-consultation, visit booking, corporate advisory). Article and index
// pages used to pull it in just for the header login button; that button is
// gone, so ~40 pages no longer download 60+ KB of client they never used.
// Opt in per page with `supabase: true` in PAGES.
const SUPABASE_SCRIPTS = [
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
  '<script src="__BASE__js/supabase-client.js?v=20260730"></script>',
].join('\n');

// 사이트 이름은 언어와 무관하게 하나로 고정한다.
// Google 은 도메인 단위로 사이트 이름을 하나만 고르며, 페이지마다 다른 이름을
// 선언하면(이전에는 언어별로 4가지였다) 판단을 포기하고 도메인(lawyeon-immigration.com)을
// 그대로 표시한다. og:site_name·WebSite.name·index.html 이 모두 같아야 한다.
const SITE_NAME = 'Law Firm Lawyeon Immigration Center';
// 대체 이름. Google 은 대표 이름을 채택하지 못하면 여기서 고르고, 그것도 없으면
// 도메인을 표시한다. 하위 페이지 제목은 '— Law Firm Lawyeon'·'— 법무법인 로연'
// 으로 끝나므로 그 짧은 이름도 후보에 넣어 사이트 전체의 표기가 후보 안에 들게 한다.
const SITE_NAME_ALT = ['법무법인 로연 출입국이민지원센터', 'Law Firm Lawyeon', '법무법인 로연'];

// ---- per-language UI strings (header chrome) ----
const STRINGS = {
  en: { brandName: 'Law Firm Lawyeon', brandSub: 'Immigration Center',
        siteName: SITE_NAME, siteNameAlt: SITE_NAME_ALT,
        navAbout: 'About Lawyeon', navInsights: 'Insights', navCases: 'Cases & News', navConsult: 'Consultation',
        headerCta: 'Apply for pre-consultation' },
  ko: { brandName: '법무법인 로연', brandSub: '출입국이민지원센터',
        siteName: SITE_NAME, siteNameAlt: SITE_NAME_ALT,
        navAbout: '로연 소개', navInsights: '인사이트', navCases: '사례·소식', navConsult: '상담',
        headerCta: '사전상담 신청' },
  vi: { brandName: 'Law Firm Lawyeon', brandSub: 'Trung tâm Xuất nhập cảnh & Di trú',
        siteName: SITE_NAME, siteNameAlt: SITE_NAME_ALT,
        navAbout: 'Giới thiệu', navInsights: 'Thông tin pháp lý', navCases: 'Tin tức', navConsult: 'Tư vấn',
        headerCta: 'Đăng ký tư vấn sơ bộ' },
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
    id: 'main', content: 'home', jsonld: true, home: true,
    // 홈페이지 title 은 사이트 이름과 정확히 같아야 한다. Google 은 사이트 이름을
    // 고를 때 WebSite.name·og:site_name 과 함께 홈의 <title> 도 후보로 읽는데,
    // 서로 다르면 판단이 흔들린다.
    title: { en: SITE_NAME,
             ko: '법무법인 로연 출입국이민지원센터' },
    desc:  { en: 'Law Firm Lawyeon Immigration Center. Legal representation for criminal cases, contracts and immigration office affairs for expats and migrants in Korea.',
             ko: '법무법인 로연 출입국이민지원센터. 외국인·이주민을 위한 형사사건, 계약, 출입국 민원 등 법률 대리 서비스.' },
  },
  {
    id: 'consultation', content: 'consultation', supabase: true,
    title: { en: 'Apply for a Pre-Consultation — Law Firm Lawyeon', ko: '사전상담 신청 — 법무법인 로연' },
    desc:  { en: 'Apply for a pre-consultation with Law Firm Lawyeon. Send us your visa, immigration or criminal matter and we will review it and reply by email.',
             ko: '법무법인 로연 사전상담 신청. 비자·출입국·형사 사안을 남겨 주시면 검토 후 이메일로 회신드립니다.' },
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
    id: 'insights', content: 'insights',
    title: { en: 'Insights — Law Firm Lawyeon', ko: '인사이트 — 법무법인 로연' },
    desc:  { en: 'Practical notes on visa, immigration and business-immigration practice in Korea by Law Firm Lawyeon attorneys.',
             ko: '비자·출입국·사업이민 실무에 관한 법무법인 로연 변호사의 인사이트.' },
  },
  {
    id: 'korea-business-immigration-visa-guide-d9-4-d9-5-2026', content: 'article',
    title: { en: "Korea Business-Immigration Visa Overview, D-9-4 and D-9-5 (2026) — Law Firm Lawyeon",
             ko: '한국 사업이민 비자 개요, D-9-4와 D-9-5 (2026) — 법무법인 로연' },
    desc:  { en: "For foreigners planning to immigrate to Korea as sole proprietors: how D-9-4 (KRW 300M) and D-9-5 (KRW 100M, for graduates of Korean universities) differ from the corporate D-8 visas, and why franchise businesses are commonly considered.",
             ko: '개인사업자 자영업으로 한국 이주를 검토하는 외국인을 위한 안내입니다. 법인 대상인 D-8 계열과 구분되는 D-9-4(3억 원)·D-9-5(유학생 출신, 1억 원)의 요건과, 프랜차이즈·정보공개서 제도가 검토되는 이유를 다룹니다.' },
  },
  {
    id: 'foreigner-franchise-business-korea-2026', content: 'foreigner-franchise-business-korea-2026',
    title: { en: 'D-9-4 and D-9-5 Investment Requirements and Stay Structure (2026) — Law Firm Lawyeon',
             ko: 'D-9-4·D-9-5 투자금 요건과 체류 구조 (2026) — 법무법인 로연' },
    desc:  { en: 'What makes funds count as investment for D-9-4 and D-9-5: remittance in your own name, stated purpose, lawful source, the KRW 50M domestic-funds allowance for D-9-5, recognized expenditures, extension review, status change and F-3 family stay.',
             ko: 'D-9-4·D-9-5 심사에서 자금이 투자금으로 인정되는 요건(본인 명의 송금, 목적, 출처), D-9-5의 국내 자금 5,000만 원 특례, 인정되는 집행의 범위, 연장 심사와 체류자격 변경, 동반(F-3) 가족의 체류 구조를 다룹니다.' },
  },
  {
    id: 'how-to-open-a-business-in-korea-as-a-foreigner-2026', content: 'how-to-open-a-business-in-korea-as-a-foreigner-2026',
    title: { en: 'How Foreigners Start a Business in Korea: Procedure and Preparation (2026) — Law Firm Lawyeon',
             ko: '한국에서 외국인이 사업을 시작하는 절차와 준비 (2026) — 법무법인 로연' },
    desc:  { en: 'The structure of business immigration to Korea: how residence experience shapes the choice of industry, why lease, business registration and licensing must be completed before the visa review, and the typical failure patterns at the preparation stage.',
             ko: '한국 거주 경험이 업종 선택을 좌우하는 이유, 임대차·사업자등록·인허가가 비자 심사에 선행하는 절차 구조, 준비 단계에서 자주 발생하는 실패 유형을 다룹니다.' },
  },
  {
    id: 'korea-permanent-residency-foreign-business-owner-2026', content: 'korea-permanent-residency-foreign-business-owner-2026',
    title: { en: 'Long-Term Stay After Business Immigration: F-2-99 Conversion and Family Settlement (2026) — Law Firm Lawyeon',
             ko: '사업이민 이후 장기 체류, F-2-99 전환과 가족 정착 (2026) — 법무법인 로연' },
    desc:  { en: 'After opening under D-9-4 or D-9-5: what the extension review checks, the F-2-99 conversion after five years (assets KRW 20M, business income KRW 40M, KIIP level 4 or a Korean degree, as of 2026), and how F-3 family stay is linked to yours.',
             ko: 'D-9 연장 심사에서 확인되는 사업 운영의 실질, 5년 체류 후 거주(F-2-99) 전환의 평가 영역(자산 2,000만 원·사업 소득 4,000만 원·KIIP 4단계 등, 2026년 기준), 동반(F-3) 가족의 체류 구조를 다룹니다.' },
  },
  {
    id: 'chosun-university-student-legal-mou-2026', content: 'chosun-university-student-legal-mou-2026',
    title: { en: 'MOU on Legal Support for International Students at Chosun University — Law Firm Lawyeon',
             ko: '조선대학교 외국인 유학생 법률 지원 업무 협약 및 한국 법령 특강 — 법무법인 로연' },
    desc:  { en: 'Law Firm Lawyeon signed an MOU with Chosun University on legal support for international students and delivered a special lecture on Korean law, including the Immigration Control Act and post-graduation visa pathways.',
             ko: '법무법인 로연이 조선대학교 대외협력처와 외국인 유학생 법률 지원 업무 협약을 체결하고, 출입국관리법과 졸업 후 비자 경로를 포함한 한국 법령 특강을 진행했습니다.' },
  },
  {
    id: 'd10-job-seeker-visa-korea-2026', content: 'd10-job-seeker-visa-korea-2026',
    title: { en: 'D-10 Job Seeker Visa: Subcategory Requirements and the Points Exemption (2026) — Law Firm Lawyeon',
             ko: 'D-10 구직 비자 세부유형별 요건과 점수제 면제 (2026) — 법무법인 로연' },
    desc:  { en: 'The four D-10 subcategories (D-10-1, D-10-2, D-10-3, D-10-T), the points-system exemptions including first-time changes by graduates of Korean universities, the internship and part-time work rules, and the stay ceilings and extension review (as of 2026).',
             ko: '구직(D-10)의 네 세부유형(D-10-1·D-10-2·D-10-3·D-10-T)과 국내 대학 졸업자의 최초 변경 등 점수제 면제 특례, 인턴·시간제 취업 규칙, 유형별 체류 상한과 연장 심사를 다룹니다(2026년 기준).' },
  },
  {
    id: 'd10-visa-points-system-deduction-korea-2026', content: 'd10-visa-points-system-deduction-korea-2026',
    langs: ['ko', 'en'],
    title: { ko: 'D-10-1 구직 비자 점수제 계산과 감점·결격 기준 (2026) — 법무법인 로연',
             en: 'The D-10-1 Points System: Calculation, Deductions and Disqualification (2026) — Law Firm Lawyeon' },
    desc:  { ko: '구직(D-10-1) 점수제는 총 190점 중 기본항목 20점 이상을 포함해 60점 이상을 요합니다. 기본·선택·가점의 배점 구조, 5년 이내 범칙금·벌금 이력의 감점과 결격 기준, 80점 이상과 미만의 체류 기간 차등을 다룹니다(2026년 기준).',
             en: 'The D-10-1 points system requires 60 of 190 points including 20 basic points. The structure of basic, optional and bonus items, the deductions and disqualification criteria for fine and penalty records within five years, and how stay periods differ above and below 80 points (as of 2026).' },
  },
  {
    id: 'd10-2-startup-preparation-visa-korea-2026', content: 'd10-2-startup-preparation-visa-korea-2026',
    langs: ['ko', 'en'],
    title: { ko: 'D-10-2 기술창업준비 체류자격 요건과 창업 경로 (2026) — 법무법인 로연',
             en: 'D-10-2 Start-Up Preparation Status: Requirements and the Path to Founding (2026) — Law Firm Lawyeon' },
    desc:  { ko: '학사 이상 학위와 특허 보유·출원, OASIS 교육 이수 등으로 신청하는 기술창업준비(D-10-2)의 요건, 인턴·시간제 취업이 제한되는 활동 범위와 요건별 체류 상한, 기술창업(D-8-4) 점수제로 이어지는 준비 구조를 다룹니다(2026년 기준).',
             en: 'Requirements for start-up preparation (D-10-2) status — a bachelor\'s degree with patents held or pending, OASIS training and similar grounds — its activity scope excluding internships and part-time work, stay ceilings by ground, and how preparation feeds the technology start-up (D-8-4) points review (as of 2026).' },
  },
  {
    id: 'foreigner-criminal-fine-deportation-reentry-ban-korea-2026', content: 'foreigner-criminal-fine-deportation-reentry-ban-korea-2026',
    title: { ko: '외국인 벌금형 강제출국·재입국 제한 기준 (2026) — 법무법인 로연',
             en: 'Criminal Fines and Deportation of Foreigners in Korea: Removal and Re-Entry Criteria (2026) — Law Firm Lawyeon' },
    desc:  { ko: '외국인이 벌금형을 받으면 형사처벌과 별개로 사범심사가 진행됩니다. 초범 300만 원·5년 합산 500만 원 등 강제출국 기준(2026년 기준), 중대범죄와 영구 입국금지, 출국명령과 강제퇴거의 구분, 이의신청 7일·취소소송 90일의 불복 기한을 다룹니다.',
             en: 'A criminal fine triggers a separate immigration review for foreigners in Korea. Removal thresholds (KRW 3M first offence, KRW 5M cumulative over five years, as of 2026), serious crimes carrying a permanent entry ban, departure order versus deportation, and the 7-day objection and 90-day litigation deadlines.' },
  },
  {
    id: 'foreigner-immigration-penalty-fine-deportation-korea-2026', content: 'foreigner-immigration-penalty-fine-deportation-korea-2026',
    title: { ko: '외국인 출입국 범칙금 처분과 체류 제한 기준 (2026) — 법무법인 로연',
             en: 'Immigration Penalty Notices and Stay Restrictions for Foreigners in Korea (2026) — Law Firm Lawyeon' },
    desc:  { ko: '출입국 범칙금은 벌금과 별개의 행정상 처분이나, 초범 500만 원·5년 합산 700만 원·3년 내 3회 등의 기준(2026년 기준)을 넘으면 체류 불허로 이어질 수 있습니다. 예외적으로 체류가 허가되는 경우(F-2·F-4·F-6의 국익·인도적 사유)와 통고서 이후의 절차를 다룹니다.',
             en: 'Immigration penalty notices (beomchikgeum) are separate from criminal fines, but exceeding the thresholds (KRW 5M first offence, KRW 7M cumulative, three times in three years, as of 2026) can bar further stay. The exceptions for F-2, F-4 and F-6 holders on national-interest or humanitarian grounds, and the procedure after a notice.' },
  },
  {
    id: 'foreigner-unlawful-stay-voluntary-departure-korea-2026', content: 'foreigner-unlawful-stay-voluntary-departure-korea-2026',
    title: { ko: '불법체류 자진출국 신고와 단속 적발의 차이 (2026) — 법무법인 로연',
             en: 'Voluntary Departure vs. Being Caught: Unlawful Stay in Korea (2026) — Law Firm Lawyeon' },
    desc:  { ko: '불법체류 상태에서 단속에 적발되는 것과 스스로 신고하고 출국하는 것은 범칙금과 입국금지의 처리가 다릅니다. 두 경로의 차이, 한시적으로 운영되는 자진출국 제도, 신고 전에 확인하여야 할 합법 체류의 여지를 다룹니다.',
             en: 'Being caught in a crackdown and self-reporting before departure lead to different penalty and entry-ban outcomes for unlawful stay in Korea. The differences between the two paths, the temporary voluntary-departure programs, and what to check before reporting — including whether lawful stay is still possible.' },
  },
  {
    id: 'foreigner-immigration-detention-temporary-release-korea-2026', content: 'foreigner-immigration-detention-temporary-release-korea-2026',
    title: { ko: '외국인 보호조치와 보호일시해제 청구 (2026) — 법무법인 로연',
             en: 'Immigration Detention and Temporary Release in Korea (2026) — Law Firm Lawyeon' },
    desc:  { ko: '강제퇴거 절차에서 외국인보호소에 보호(구금)된 경우, 절차 종료 전이라도 보호일시해제를 청구할 수 있습니다. 보호조치의 성격, 보증금(2천만 원 이하) 등 해제의 조건, 청구 주체와 심사에서 고려되는 요소를 다룹니다.',
             en: 'A foreigner detained during deportation proceedings in Korea may request temporary release before the process ends. The nature of detention, release conditions including a deposit of up to KRW 20M, who may apply, and the factors weighed in the review.' },
  },
  {
    id: 'visa-extension-change-denial-reapply-appeal-korea-2026', content: 'visa-extension-change-denial-reapply-appeal-korea-2026',
    title: { ko: '체류기간 연장·자격 변경 불허 후 재신청과 불복 (2026) — 법무법인 로연',
             en: 'After a Stay Extension or Status Change Denial: Reapplication and Appeal (2026) — Law Firm Lawyeon' },
    desc:  { ko: '체류기간 연장이나 자격 변경이 불허된 경우, 출국 기한 안에 재신청·불복·출국 중 하나를 선택하게 됩니다. 불허 사유의 확인 방법, 요건의 문제와 이력의 문제에 따른 경로의 구분, 국내 불허 처분에 대한 행정심판·취소소송(90일)을 다룹니다.',
             en: 'When a stay extension or status change is denied in Korea, you choose between reapplying, appealing and departing within the stated deadline. How to confirm the reason for denial, how requirement problems and record problems lead to different paths, and the 90-day window for litigating a domestic denial.' },
  },
  {
    id: 'foreigner-national-pension-lump-sum-refund-korea-2026', content: 'foreigner-national-pension-lump-sum-refund-korea-2026',
    title: { ko: 'E-9·H-2 근로자 국민연금 반환일시금 청구 (2026) — 법무법인 로연',
             en: 'National Pension Lump-Sum Refund for E-9 and H-2 Workers in Korea (2026) — Law Firm Lawyeon' },
    desc:  { ko: 'E-8·E-9·H-2 자격 근로자는 국적과 무관하게 본국 귀환 시 국민연금 반환일시금을 받을 수 있습니다. 지급액의 구조(보험료율 9%, 2026년 기준), 출국 후의 대리 청구와 본국 계좌 지급, 출국일부터 5년의 청구 기한을 다룹니다.',
             en: 'E-8, E-9 and H-2 workers can claim the Korean National Pension lump-sum refund on returning home, regardless of nationality. How the amount is calculated (9% contribution rate, as of 2026), claiming through a proxy after departure with payment to a home-country account, and the five-year deadline from departure.' },
  },
  {
    id: 'far-east-university-student-job-fair-mou-2026', content: 'far-east-university-student-job-fair-mou-2026',
    title: { en: 'MOU with Far East University — Visa-Roadmap Lecture & Legal Clinic at the International Student Job Fair — Law Firm Lawyeon',
             ko: '극동대학교 외국인 유학생 취업 박람회 업무 협약 및 비자 로드맵 특강·리걸 클리닉 — 법무법인 로연' },
    desc:  { en: 'Law Firm Lawyeon signed an MOU with Far East University and, at the international student job fair held at its SMART-K tech Center, delivered a lecture on the post-graduation visa roadmap and work-visa law and ran a free legal clinic booth.',
             ko: '법무법인 로연이 극동대학교와 업무 협약을 체결하고, SMART-K tech Center에서 열린 외국인 유학생 취업 박람회에서 졸업 후 비자 로드맵·워크 비자 법제도 특강과 무료 리걸 클리닉 부스를 운영했습니다.' },
  },
  {
    id: 'foreigner-dui-deportation-korea-2026', content: 'foreigner-dui-deportation-korea-2026',
    title: { en: 'Foreigner DUI Fines in Korea: Deportation Criteria and the Immigration Review (2026) — Law Firm Lawyeon',
             ko: '외국인 음주운전 벌금과 사범심사, 강제출국 기준 (2026) — 법무법인 로연' },
    desc:  { en: 'For foreigners, a DUI proceeds as a criminal case and a separate immigration review. Criminal penalties by blood alcohol level, the KRW 3M and 5M fine thresholds (as of 2026), the factors weighed in the review, and why responding starts at the investigation stage.',
             ko: '외국인의 음주운전은 형사사건과 별개로 사범심사가 진행됩니다. 혈중알코올농도별 형사처벌, 초범 300만 원·합산 500만 원 기준(2026년 기준), 사범심사에서 고려되는 요소, 수사 단계에서 대응이 시작되어야 하는 이유를 다룹니다.' },
  },
  {
    id: 'foreigner-divorce-f6-visa-stay-korea-2026', content: 'foreigner-divorce-f6-visa-stay-korea-2026',
    langs: ['ko', 'en', 'vi'],
    title: { ko: '한국인 배우자와 이혼 후 체류, F-6 세부유형별 요건 (2026) — 법무법인 로연',
             en: 'Staying in Korea After Divorce: F-6 Subcategory Requirements (2026) — Law Firm Lawyeon',
             vi: 'Cư trú tại Hàn Quốc sau ly hôn: điều kiện theo từng diện F-6 (2026) — Lawyeon' },
    desc:  { ko: '이혼으로 국민의 배우자(F-6-1)의 근거는 소멸하나, 자녀양육(F-6-2)·혼인단절(F-6-3)·가사정리(F-1-6)로 체류를 이어갈 수 있습니다. 각 경로의 요건과 귀책 소명의 구조, 별거·이혼소송 중의 체류를 다룹니다.',
             en: 'Divorce ends the basis of spouse status (F-6-1), but stay can continue through child-rearing (F-6-2), marriage dissolution (F-6-3) or family-affairs status (F-1-6). The requirements of each path, how fault is substantiated, and staying during separation or divorce litigation.',
             vi: 'Ly hôn làm mất căn cứ của diện vợ/chồng công dân (F-6-1), nhưng có thể tiếp tục cư trú theo diện nuôi con (F-6-2), hôn nhân tan vỡ (F-6-3) hoặc thu xếp gia sự (F-1-6). Điều kiện của từng diện, cách chứng minh lỗi, và cư trú khi ly thân hoặc đang kiện ly hôn.' },
  },
  {
    id: 'nationality-reinstatement-procedure-korea-2026', content: 'nationality-reinstatement-procedure-korea-2026',
    langs: ['ko', 'en'],
    title: { ko: '외국 시민권 취득 후 한국 국적회복 절차와 순서: 국적상실신고, F-4, 국적회복허가 (2026) — 법무법인 로연',
             en: 'Reinstating Korean Nationality After Acquiring Foreign Citizenship: Loss Report, F-4, Reinstatement Permission (2026) — Law Firm Lawyeon' },
    desc:  { ko: '외국 시민권 취득으로 한국 국적이 자동 상실된 재외동포가 국적상실의 정리와 동일인 확인, F-4 체류자격과 국내거소신고를 거쳐 국적회복허가에 이르는 순서와 요건을 다룹니다.',
             en: 'For overseas Koreans whose Korean nationality was automatically lost on acquiring foreign citizenship: the sequence and requirements running from settling the loss and confirming identity, through F-4 status and the domestic place-of-residence report, to permission for reinstatement of nationality.' },
  },
  {
    id: 'foreigner-entry-ban-check-lift-korea-2026', content: 'foreigner-entry-ban-check-lift-korea-2026',
    langs: ['ko', 'en'],
    title: { ko: '출국명령·강제퇴거 후 입국규제 해제와 불복 절차 (2026) — 법무법인 로연',
             en: 'Entry-Ban Relief and Appeals After a Departure Order or Deportation (2026) — Law Firm Lawyeon' },
    desc:  { ko: '출국명령·강제퇴거에는 입국규제가 함께 부과됩니다. 처분 전 사범심사 단계의 대응, 이의신청·취소소송의 구조, 국익·인도적 사유에 따른 입국규제 해제 신청과 그 심사에서 고려되는 요소를 다룹니다.',
             en: 'A departure order or deportation carries an entry ban. Responding at the pre-disposition review stage, the objection and revocation-suit framework, and applying to lift the entry ban on national-interest or humanitarian grounds — with the factors weighed in that review.' },
  },
];

// Publication dates for blog articles (page id -> ISO date). A page is an
// "article" iff its id is a key here. Used for article JSON-LD, article:*
// meta and sitemap <lastmod>.
const ARTICLE_DATES = {
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
    dateModified: date,
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
  const home = SITE + '/' + LANG_DIR[lang] + 'main';
  const insightsDir = lang === 'vi' ? '' : LANG_DIR[lang];
  const insights = SITE + '/' + insightsDir + 'insights';
  const insightsName = lang === 'ko' ? '인사이트' : (lang === 'vi' ? 'Thông tin pháp lý' : 'Insights');
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
  const labels = { en: 'EN', ko: '한국어', vi: 'Tiếng Việt' };
  // Always offer EN/KO (muted when a page lacks one); show Vietnamese only
  // for pages that actually have a Vietnamese version.
  const display = ['en', 'ko'];
  if (langs.indexOf('vi') >= 0) display.push('vi');
  const muted = (t) => `<span style="color:var(--rule-d)">${t}</span>`;
  return display.map((l) => {
    if (langs.indexOf(l) < 0) return muted(labels[l]);
    const href = isHome ? HOME_URL[l] : (l === lang ? id : relPath(lang, l, id));
    return `<a href="${href}"${l === lang ? ' class="active"' : ''}>${labels[l]}</a>`;
  }).join('<span class="sep">·</span>');
}

function build() {
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
        '__NAV_ABOUT__': S.navAbout,
        '__NAV_INSIGHTS__': S.navInsights,
        '__NAV_CASES__': S.navCases,
        '__NAV_CONSULT__': S.navConsult,
        '__HEADER_CTA__': S.headerCta,
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
          ? '<meta property="article:published_time" content="' + date + '"><meta property="article:modified_time" content="' + date + '">'
          : '',
        '__ARTICLE_JSONLD__': isArticle
          ? articleJsonLd(page, lang, canonical, bodyHtml, ogImage) + '\n' + breadcrumbJsonLd(page, lang, canonical)
          : '',
      };
      for (const [k, v] of Object.entries(subs)) doc = replaceAll(doc, k, v);
      doc = replaceAll(doc, '__BASE__', base); // last: appears in head/footer/body

      const dest = path.join(ROOT, out);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, doc, 'utf8');
      console.log('built', out);
      count++;
    }
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

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
const SITE = 'https://www.lawyeonvisa.app';
const LANGS = ['en', 'ko'];

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const replaceAll = (s, find, val) => s.split(find).join(val == null ? '' : val);

// ---- shared partials ----
const HEAD = read('partials/head.html');
const HEADER = read('partials/header.html');
const FOOTER = { en: read('partials/footer.en.html'), ko: read('partials/footer.ko.html'), vi: read('partials/footer.vi.html') };
const SCRIPTS = [
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
  '<script src="__BASE__js/supabase-client.js?v=20260715"></script>',
  '<script src="__BASE__js/notification-service.js?v=20260715"></script>',
  '<script src="__BASE__js/site.js?v=10"></script>',
].join('\n');

// ---- per-language UI strings (header chrome) ----
const STRINGS = {
  en: { brandName: 'Law Firm Lawyeon', brandSub: 'Visa & Immigration Center',
        siteName: 'Law Firm Lawyeon Immigration Center', siteNameAlt: 'Law Firm Lawyeon',
        navAbout: 'About Lawyeon', navInsights: 'Insights', navCases: 'Cases & News', navConsult: 'Consultation', navMypage: 'My Page', login: 'Login' },
  ko: { brandName: '법무법인 로연', brandSub: '출입국이민지원센터',
        siteName: '법무법인 로연', siteNameAlt: '법무법인 로연 출입국이민지원센터',
        navAbout: '로연 소개', navInsights: '인사이트', navCases: '사례·소식', navConsult: '상담', navMypage: '마이 페이지', login: '로그인' },
  vi: { brandName: 'Law Firm Lawyeon', brandSub: 'Trung tâm Xuất nhập cảnh & Di trú',
        siteName: 'Trung tâm Hỗ trợ Xuất nhập cảnh Lawyeon', siteNameAlt: 'Law Firm Lawyeon',
        navAbout: 'Giới thiệu', navInsights: 'Thông tin pháp lý', navCases: 'Tin tức', navConsult: 'Tư vấn', navMypage: 'Trang của tôi', login: 'Đăng nhập' },
};

// Directory prefix each language's built pages live under (en at root).
const LANG_DIR = { en: '', ko: 'ko/', vi: 'vi/' };
// Root-absolute nav home per language, so shared header links resolve correctly
// from any depth (vi pages reuse the English top-level pages).
const NAV_HOME = { en: '', ko: '/ko/', vi: '/' };

// ---- page registry (add pages here as they are migrated) ----
const PAGES = [
  {
    id: 'main', content: 'home', jsonld: true,
    title: { en: 'Law Firm Lawyeon — Visa & Immigration Center',
             ko: '법무법인 로연 — 출입국이민지원센터' },
    desc:  { en: 'Law Firm Lawyeon, Visa & Immigration Center. Legal representation for criminal cases, contracts and immigration office affairs for expats and migrants in Korea.',
             ko: '법무법인 로연 출입국이민지원센터. 외국인·이주민을 위한 형사사건, 계약, 출입국 민원 등 법률 대리 서비스.' },
  },
  {
    id: 'consultation', content: 'consultation',
    title: { en: 'Request Consultation — Law Firm Lawyeon', ko: '상담 신청 — 법무법인 로연' },
    desc:  { en: 'Consultation with Law Firm Lawyeon. Open a private thread for your visa, immigration, or criminal matter in Korea.',
             ko: '법무법인 로연 상담 신청. 비자·출입국·형사 사안에 대해 비공개 쓰레드로 상담을 시작하세요.' },
  },
  {
    id: 'booking', content: 'booking',
    title: { en: 'Book a Visit Consultation — Law Firm Lawyeon', ko: '방문 상담 예약 — 법무법인 로연' },
    desc:  { en: 'Book an in-person consultation at the Seoul or Gwangju office of Law Firm Lawyeon. Weekdays 09:00–17:00, 1-hour slots.',
             ko: '법무법인 로연 서울·광주 사무소 방문 상담 예약. 평일 09:00–17:00, 1시간 단위(점심 12:00–13:00 제외).' },
  },
  {
    id: 'mypage', content: 'mypage',
    title: { en: 'My Page — Law Firm Lawyeon', ko: '마이 페이지 — 법무법인 로연' },
    desc:  { en: 'Your cases, residence status and immigration service desk in one place.',
             ko: '내 사건, 체류 상태, 출입국 업무 데스크를 한 곳에서.' },
  },
  {
    id: 'visa-info', content: 'visa-info',
    title: { en: 'Submit Visa Information — Law Firm Lawyeon', ko: '비자 정보 제출 — 법무법인 로연' },
    desc:  { en: 'Submit your residence and visa information to view your status on My Page.',
             ko: '체류·비자 정보를 제출하고 마이 페이지에서 상태를 확인하세요.' },
  },
  {
    id: 'corporate-advisory', content: 'corporate-advisory',
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
    title: { en: 'D-10-1 Job Seeker Status After Graduation: Points-Exemption Requirements (2026) — Law Firm Lawyeon',
             ko: '졸업 후 D-10-1 구직 체류자격 변경, 점수제 면제 요건 (2026) — 법무법인 로연' },
    desc:  { en: 'Graduates of Korean universities applying for D-10-1 within one year of graduation are exempt from the 60-point review. The exemption requirements, internship and part-time work rules, stay periods by type, and the extension review (as of 2026).',
             ko: '한국 대학 졸업 후 1년 이내에 처음 신청하는 졸업자는 D-10-1 점수제(60점) 심사가 면제됩니다. 면제 요건과 인턴·시간제 취업 규칙, 유형별 체류 기간, 연장 심사 기준을 다룹니다(2026년 기준).' },
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
};

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
    name: S.brandName + ' ' + S.brandSub,
    url: SITE + (lang === 'en' ? '/main' : '/ko/main'),
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

function langToggle(lang, id, langs) {
  langs = langs || LANGS;
  const labels = { en: 'EN', ko: '한국어', vi: 'Tiếng Việt' };
  // Always offer EN/KO (muted when a page lacks one); show Vietnamese only
  // for pages that actually have a Vietnamese version.
  const display = ['en', 'ko'];
  if (langs.indexOf('vi') >= 0) display.push('vi');
  const muted = (t) => `<span style="color:var(--rule-d)">${t}</span>`;
  return display.map((l) => {
    if (langs.indexOf(l) < 0) return muted(labels[l]);
    const href = l === lang ? id : relPath(lang, l, id);
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
    const altEn = hasEn ? `${SITE}/${page.id}` : `${SITE}/ko/${page.id}`;
    const altKo = hasKo ? `${SITE}/ko/${page.id}` : `${SITE}/${page.id}`;
    const hreflangVi = hasVi ? `<link rel="alternate" hreflang="vi" href="${SITE}/vi/${page.id}">` : '';
    for (const lang of langs) {
      const base = lang === 'en' ? '' : '../';
      const out = lang === 'en' ? `${page.id}.html` : `${LANG_DIR[lang]}${page.id}.html`;
      const canonical = `${SITE}/${LANG_DIR[lang]}${page.id}`;
      const S = STRINGS[lang];
      const bodyHtml = read(`content/${page.content}.${lang}.html`);

      const isArticle = Object.prototype.hasOwnProperty.call(ARTICLE_DATES, page.id);
      const date = ARTICLE_DATES[page.id];
      const ogImage = isArticle ? pageOgImage(bodyHtml) : SITE + '/images/og-image.png';

      let doc = HEAD + '\n' + HEADER + '\n' + bodyHtml + '\n' + FOOTER[lang] + '\n' + SCRIPTS + '\n</body>\n</html>\n';
      const subs = {
        '__LANG__': lang,
        '__TITLE__': isArticle ? stripBrand(page.title[lang]) : page.title[lang],
        '__DESC__': page.desc[lang],
        '__CANONICAL__': canonical,
        '__ALT_EN__': altEn,
        '__ALT_KO__': altKo,
        '__HREFLANG_VI__': hreflangVi,
        '__NAV_HOME__': NAV_HOME[lang],
        '__BRAND_NAME__': S.brandName,
        '__BRAND_SUB__': S.brandSub,
        '__NAV_ABOUT__': S.navAbout,
        '__NAV_INSIGHTS__': S.navInsights,
        '__NAV_CASES__': S.navCases,
        '__NAV_CONSULT__': S.navConsult,
        '__NAV_MYPAGE__': S.navMypage,
        '__LOGIN__': S.login,
        '__LANGTOGGLE__': langToggle(lang, page.id, langs),
        '__OG_SITE_NAME__': S.siteName,
        '__JSONLD__': page.jsonld ? legalServiceJsonLd(lang) : '',
        '__WEBSITE_JSONLD__': websiteJsonLd(lang),
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
    PAGES.map(p => {
      const langs = p.langs || LANGS;
      const lastmod = ARTICLE_DATES[p.id] || '2026-07-01';
      const locs = [];
      if (langs.indexOf('en') >= 0) locs.push(`${SITE}/${p.id}`);
      if (langs.indexOf('ko') >= 0) locs.push(`${SITE}/ko/${p.id}`);
      if (langs.indexOf('vi') >= 0) locs.push(`${SITE}/vi/${p.id}`);
      let alts = '';
      if (langs.indexOf('en') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/${p.id}"/>\n`;
      if (langs.indexOf('ko') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="ko" href="${SITE}/ko/${p.id}"/>\n`;
      if (langs.indexOf('vi') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="vi" href="${SITE}/vi/${p.id}"/>\n`;
      return locs.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n` + alts + `  </url>`).join('\n');
    }).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n', 'utf8');
  console.log('built sitemap.xml, robots.txt');

  console.log(`\nDone. ${count} page(s) generated.`);
}

build();

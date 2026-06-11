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
const FOOTER = { en: read('partials/footer.en.html'), ko: read('partials/footer.ko.html') };
const SCRIPTS = [
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
  '<script src="__BASE__js/supabase-client.js?v=20260614"></script>',
  '<script src="__BASE__js/site.js?v=9"></script>',
].join('\n');

// ---- per-language UI strings (header chrome) ----
const STRINGS = {
  en: { brandName: 'Law Firm Lawyeon', brandSub: 'Visa & Immigration Center',
        siteName: 'Law Firm Lawyeon', siteNameAlt: 'Law Firm Lawyeon Immigration Center',
        navAbout: 'About Lawyeon', navInsights: 'Insights', navCases: 'Cases & News', navConsult: 'Consultation', navMypage: 'My Page', login: 'Login' },
  ko: { brandName: '법무법인 로연', brandSub: '출입국이민지원센터',
        siteName: '법무법인 로연', siteNameAlt: '법무법인 로연 출입국이민지원센터',
        navAbout: '로연 소개', navInsights: '인사이트', navCases: '사례·소식', navConsult: '상담', navMypage: '마이 페이지', login: '로그인' },
};

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
    desc:  { en: 'Free pre-consultation with Law Firm Lawyeon. Open a private thread for your visa, immigration, or criminal matter in Korea.',
             ko: '법무법인 로연 무료 사전 상담. 비자·출입국·형사 사안에 대해 비공개 쓰레드로 상담을 시작하세요.' },
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
    title: { en: "An Overview of Korea's Business-Immigration Visas (D-9-4·D-9-5) — Law Firm Lawyeon",
             ko: '한국 사업이민 비자 개괄 (D-9-4·D-9-5) — 법무법인 로연' },
    desc:  { en: "D-9-4, D-9-5 and franchising as a realistic route for foreign sole proprietors immigrating to Korea.",
             ko: '외국인 개인사업자의 한국 사업이민 — D-9-4·D-9-5와 프랜차이즈라는 현실적 경로.' },
  },
  {
    id: 'foreigner-franchise-business-korea-2026', content: 'foreigner-franchise-business-korea-2026',
    title: { en: 'What Franchise Business Should a Foreigner Open in Korea? — Law Firm Lawyeon',
             ko: '한국 사업이민 비자 제도의 구조 — 투자금·체류·연장·동반가족 — 법무법인 로연' },
    desc:  { en: 'Industries, brands and the legally mandated Franchise Disclosure Document — how foreign sole proprietors choose a business and headquarters in Korea.',
             ko: 'D-9-4·D-9-5 투자금 인정, 집행, 업종·인허가, 체류자격 변경, 연장 심사, 동반가족 초청까지 — 한국 사업이민 비자 제도의 실제 구조.' },
  },
  {
    id: 'how-to-open-a-business-in-korea-as-a-foreigner-2026', content: 'how-to-open-a-business-in-korea-as-a-foreigner-2026',
    title: { en: 'How to Open a Store in Korea as a Foreigner (2026) — Law Firm Lawyeon',
             ko: '한국에서 사업을 시작하기까지, 실제로 무엇이 진행되는가 — 법무법인 로연' },
    desc:  { en: 'The five-stage process from the first pre-consultation back home to opening day in Korea, with FAQs and common mistakes.',
             ko: '본국 사전 상담부터 한국 매장 개업까지 — 사업이민 5단계 프로젝트의 실제 진행, 자주 묻는 질문과 흔한 실수.' },
  },
  {
    id: 'korea-permanent-residency-foreign-business-owner-2026', content: 'korea-permanent-residency-foreign-business-owner-2026',
    title: { en: 'Permanent Residency in Korea for Foreign Business Owners — Law Firm Lawyeon',
             ko: '한국 사업이민 이후 — 장기 거주·가족·부동산·사회보험 — 법무법인 로연' },
    desc:  { en: 'Long-term residence, the F-2-99 to F-5 path, family settlement, real estate and social insurance after the visa is issued.',
             ko: '비자 취득 이후의 긴 시간 — 장기 거주, F-2-99에서 F-5로, 가족 정착, 부동산, 사회보험.' },
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
    title: { en: 'D-10 Job Seeker Visa Korea 2026 — New-Graduate Points Exemption Guide — Law Firm Lawyeon',
             ko: 'D-10 구직 비자 2026 — 신규 졸업자 점수제 면제 가이드 — 법무법인 로연' },
    desc:  { en: 'A complete guide to the D-10 Job Seeker Visa in Korea for new graduates: the points-system exemption, required documents, internship and part-time rules, stay periods, and extensions.',
             ko: '한국 D-10 구직 비자 신규 졸업자 완전 가이드 — 점수제 면제, 필요 서류, 인턴·아르바이트 규정, 체류 기간, 연장까지.' },
  },
  {
    id: 'foreigner-criminal-fine-deportation-reentry-ban-korea-2026', content: 'foreigner-criminal-fine-deportation-reentry-ban-korea-2026',
    title: { ko: '외국인 벌금형, 강제출국·재입국 금지 기준 (2026) — 법무법인 로연',
             en: 'Criminal Fines & Deportation of Foreigners in Korea — Removal & Re-Entry Ban Criteria (2026) — Law Firm Lawyeon' },
    desc:  { ko: '외국인이 형사처벌로 벌금형을 받으면 강제출국되나요? 초범 300만원·합산 500만원 등 출국 기준, 영구 입국금지 중대범죄, 출국명령과 강제퇴거의 차이, 처분서를 받았을 때 7일 안에 할 일, 재입국 금지 기간까지.',
             en: 'Can a foreigner be deported after a criminal fine in Korea? Removal thresholds (₩3M first offence, ₩5M cumulative), serious crimes carrying a permanent entry ban, departure order vs. compulsory deportation, the 7-day deadline after a disposition, and re-entry bans.' },
  },
  {
    id: 'foreigner-immigration-penalty-fine-deportation-korea-2026', content: 'foreigner-immigration-penalty-fine-deportation-korea-2026',
    title: { ko: '외국인 출입국 범칙금, 강제출국·체류 제한 기준 (2026) — 법무법인 로연',
             en: 'Immigration Penalties (Beomchikgeum) & Deportation of Foreigners in Korea — 2026 Criteria — Law Firm Lawyeon' },
    desc:  { ko: '외국인이 출입국 범칙금 처분을 받으면 강제출국되나요? 초범 500만원·합산 700만원·3년 3회 등 출국 기준, 체류허가가 유지되는 예외기준(F-2·F-4·F-6, 국익·인도적 사유), 통고서를 받으면 할 일, 재입국까지.',
             en: 'Can a foreigner be deported over immigration administrative penalties (beomchikgeum)? Removal thresholds (₩5M first, ₩7M cumulative, three-strikes), exceptions that preserve your stay (F-2/F-4/F-6, national-interest and humanitarian grounds), what to do on a penalty notice, and re-entry.' },
  },
  {
    id: 'foreigner-unlawful-stay-voluntary-departure-korea-2026', content: 'foreigner-unlawful-stay-voluntary-departure-korea-2026',
    title: { ko: '불법체류 사전 신고 후 자진출국 — 범칙금·입국금지는 어떻게 되나 (2026) — 법무법인 로연',
             en: 'Voluntary Departure After Self-Reporting Unlawful Stay in Korea (2026) — Law Firm Lawyeon' },
    desc:  { ko: '불법체류 상태에서 단속 전에 사전 신고하고 자진출국하면 어떻게 되나요? 단속 적발과의 차이, 범칙금·입국금지에서 받을 수 있는 차이, 신고 전에 확인할 것, 재입국 가능성까지.',
             en: 'What happens if you self-report unlawful stay and depart voluntarily before a crackdown in Korea? The difference from being caught, lighter penalty and entry-ban outcomes, what to check before reporting, and re-entry prospects.' },
  },
  {
    id: 'foreigner-immigration-detention-temporary-release-korea-2026', content: 'foreigner-immigration-detention-temporary-release-korea-2026',
    title: { ko: '외국인 보호조치와 보호일시해제 — 보호소에서 나오는 법 (2026) — 법무법인 로연',
             en: 'Immigration Detention &amp; Temporary Release in Korea — How to Get Out of the Center (2026) — Law Firm Lawyeon' },
    desc:  { ko: '외국인보호소에 보호(구금)되면 어떻게 되나요? 보호조치의 성격, 보호일시해제 청구 방법과 인용 요건, 누가 청구할 수 있는지, 조건부 허가와 보증금까지. 강제퇴거 절차 중 신체 자유를 되찾는 법.',
             en: 'What happens if you are held in an immigration detention center in Korea? The nature of detention, how to apply for temporary release and what is required, who may apply, conditional grants and the deposit — regaining liberty during the deportation process.' },
  },
  {
    id: 'visa-extension-change-denial-reapply-appeal-korea-2026', content: 'visa-extension-change-denial-reapply-appeal-korea-2026',
    title: { ko: '비자 연장·변경 불허 통지를 받았다면 — 재신청과 불복 (2026) — 법무법인 로연',
             en: 'If Your Visa Extension or Change Is Denied — Reapplying vs. Appealing (2026) — Law Firm Lawyeon' },
    desc:  { ko: '체류기간 연장·자격 변경이 불허되면 어떻게 해야 하나요? 남은 출국 기한 확인, 불허 사유 확인, 재신청과 불복(행정심판·취소소송)의 갈림, 국내 불허 처분은 소송으로 다툴 수 있다는 점까지.',
             en: 'What to do when a stay extension or status change is denied: checking your remaining deadline, confirming the reason, choosing between reapplying and appeal (administrative appeal / revocation suit), and the fact that a domestic denial can be litigated.' },
  },
  {
    id: 'foreigner-national-pension-lump-sum-refund-korea-2026', content: 'foreigner-national-pension-lump-sum-refund-korea-2026',
    title: { ko: 'E-9·H-2 근로자 국민연금 반환일시금 — 출국 후 본국에서 받는 방법 (2026) — 법무법인 로연',
             en: 'National Pension Lump-Sum Refund for E-9·H-2 Workers — How to Claim It After Leaving Korea (2026) — Law Firm Lawyeon' },
    desc:  { ko: 'E-9·H-2 외국인 근로자는 국적과 무관하게 한국에서 낸 국민연금을 반환일시금으로 돌려받을 수 있습니다. 월 급여 250만원·4년 10개월 근무 시 예상 환급액, 출국 후 대리 청구와 본국 계좌 송금, 5년 청구 기한까지.',
             en: 'E-9·H-2 workers can reclaim their Korean National Pension as a lump-sum refund regardless of nationality. Estimated refund for ₩2.5M/month over 4 years 10 months, proxy claims and overseas remittance after departure, and the five-year deadline.' },
  },
  {
    id: 'far-east-university-student-job-fair-mou-2026', content: 'far-east-university-student-job-fair-mou-2026',
    title: { en: 'MOU with Far East University — Visa-Roadmap Lecture & Legal Clinic at the International Student Job Fair — Law Firm Lawyeon',
             ko: '극동대학교 외국인 유학생 취업 박람회 업무 협약 및 비자 로드맵 특강·리걸 클리닉 — 법무법인 로연' },
    desc:  { en: 'Law Firm Lawyeon signed an MOU with Far East University and, at the international student job fair held at its SMART-K tech Center, delivered a lecture on the post-graduation visa roadmap and work-visa law and ran a free legal clinic booth.',
             ko: '법무법인 로연이 극동대학교와 업무 협약을 체결하고, SMART-K tech Center에서 열린 외국인 유학생 취업 박람회에서 졸업 후 비자 로드맵·워크 비자 법제도 특강과 무료 리걸 클리닉 부스를 운영했습니다.' },
  },
];

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

function langToggle(lang, id, langs) {
  langs = langs || LANGS;
  const hasEn = langs.indexOf('en') >= 0, hasKo = langs.indexOf('ko') >= 0;
  const muted = (t) => `<span style="color:var(--rule-d)">${t}</span>`;
  if (lang === 'en') {
    const en = `<a href="${id}" class="active">EN</a>`;
    const ko = hasKo ? `<a href="ko/${id}">한국어</a>` : muted('한국어');
    return `${en}<span class="sep">·</span>${ko}`;
  }
  const en = hasEn ? `<a href="../${id}">EN</a>` : muted('EN');
  const ko = `<a href="${id}" class="active">한국어</a>`;
  return `${en}<span class="sep">·</span>${ko}`;
}

function build() {
  let count = 0;
  for (const page of PAGES) {
    const langs = page.langs || LANGS;
    const hasEn = langs.indexOf('en') >= 0;
    const hasKo = langs.indexOf('ko') >= 0;
    const altEn = hasEn ? `${SITE}/${page.id}` : `${SITE}/ko/${page.id}`;
    const altKo = hasKo ? `${SITE}/ko/${page.id}` : `${SITE}/${page.id}`;
    for (const lang of langs) {
      const base = lang === 'en' ? '' : '../';
      const out = lang === 'en' ? `${page.id}.html` : `ko/${page.id}.html`;
      const canonical = `${SITE}/${lang === 'en' ? '' : 'ko/'}${page.id}`;
      const S = STRINGS[lang];
      const bodyHtml = read(`content/${page.content}.${lang}.html`);

      let doc = HEAD + '\n' + HEADER + '\n' + bodyHtml + '\n' + FOOTER[lang] + '\n' + SCRIPTS + '\n</body>\n</html>\n';
      const subs = {
        '__LANG__': lang,
        '__TITLE__': page.title[lang],
        '__DESC__': page.desc[lang],
        '__CANONICAL__': canonical,
        '__ALT_EN__': altEn,
        '__ALT_KO__': altKo,
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
      const locs = [];
      if (langs.indexOf('en') >= 0) locs.push([`${SITE}/${p.id}`]);
      if (langs.indexOf('ko') >= 0) locs.push([`${SITE}/ko/${p.id}`]);
      return locs.map(([loc]) => {
        let alts = '';
        if (langs.indexOf('en') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/${p.id}"/>\n`;
        if (langs.indexOf('ko') >= 0) alts += `    <xhtml:link rel="alternate" hreflang="ko" href="${SITE}/ko/${p.id}"/>\n`;
        return `  <url>\n    <loc>${loc}</loc>\n` + alts + `  </url>`;
      }).join('\n');
    }).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n', 'utf8');
  console.log('built sitemap.xml, robots.txt');

  console.log(`\nDone. ${count} page(s) generated.`);
}

build();

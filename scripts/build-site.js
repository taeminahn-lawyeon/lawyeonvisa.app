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
  '<script src="__BASE__js/supabase-client.js?v=20260608"></script>',
  '<script src="__BASE__js/site.js?v=1"></script>',
].join('\n');

// ---- per-language UI strings (header chrome) ----
const STRINGS = {
  en: { brandName: 'Law Firm Lawyeon', brandSub: 'Visa & Immigration Center',
        navInsights: 'Insights', navCases: 'Cases & News', navConsult: 'Consultation', login: 'Login' },
  ko: { brandName: '법무법인 로연', brandSub: '출입국이민지원센터',
        navInsights: '인사이트', navCases: '사례·소식', navConsult: '상담', login: '로그인' },
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

function langToggle(lang, id) {
  if (lang === 'en') return `<a href="${id}" class="active">EN</a><span class="sep">·</span><a href="ko/${id}">한국어</a>`;
  return `<a href="../${id}">EN</a><span class="sep">·</span><a href="${id}" class="active">한국어</a>`;
}

function build() {
  let count = 0;
  for (const page of PAGES) {
    for (const lang of LANGS) {
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
        '__ALT_EN__': `${SITE}/${page.id}`,
        '__ALT_KO__': `${SITE}/ko/${page.id}`,
        '__BRAND_NAME__': S.brandName,
        '__BRAND_SUB__': S.brandSub,
        '__NAV_INSIGHTS__': S.navInsights,
        '__NAV_CASES__': S.navCases,
        '__NAV_CONSULT__': S.navConsult,
        '__LOGIN__': S.login,
        '__LANGTOGGLE__': langToggle(lang, page.id),
        '__JSONLD__': page.jsonld ? legalServiceJsonLd(lang) : '',
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
  const urls = [];
  for (const page of PAGES) { urls.push(`${SITE}/${page.id}`); urls.push(`${SITE}/ko/${page.id}`); }
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    PAGES.map(p => (
      [['en', `${SITE}/${p.id}`], ['ko', `${SITE}/ko/${p.id}`]].map(([lang, loc]) =>
        `  <url>\n    <loc>${loc}</loc>\n` +
        `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/${p.id}"/>\n` +
        `    <xhtml:link rel="alternate" hreflang="ko" href="${SITE}/ko/${p.id}"/>\n` +
        `  </url>`
      ).join('\n')
    )).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n', 'utf8');
  console.log('built sitemap.xml, robots.txt');

  console.log(`\nDone. ${count} page(s) generated.`);
}

build();

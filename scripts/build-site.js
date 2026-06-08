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
    id: 'main', content: 'home',
    title: { en: 'Law Firm Lawyeon — Visa & Immigration Center',
             ko: '법무법인 로연 — 출입국이민지원센터' },
    desc:  { en: 'Law Firm Lawyeon, Visa & Immigration Center. Legal representation for criminal cases, contracts and immigration office affairs for expats and migrants in Korea.',
             ko: '법무법인 로연 출입국이민지원센터. 외국인·이주민을 위한 형사사건, 계약, 출입국 민원 등 법률 대리 서비스.' },
  },
];

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

      let doc = HEAD + '\n' + HEADER + '\n' + bodyHtml + '\n' + FOOTER[lang] + '\n</body>\n</html>\n';
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
  console.log(`\nDone. ${count} page(s) generated.`);
}

build();

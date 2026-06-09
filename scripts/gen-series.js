#!/usr/bin/env node
/* gen-series.js — one-off generator.
   Converts the Business-Immigration series POST objects
   (content_ep{2,3,4}.js [ko], blog/content_ep{2,3,4}_en.js [en])
   into the shared "insight article" design used by content/article.*.html.
   Output: content/<slug>.<lang>.html  */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const SLUG = { 1: 'korea-business-immigration-part-1-2026', 2: 'korea-business-immigration-part-2-2026',
               3: 'korea-business-immigration-part-3-2026', 4: 'korea-business-immigration-part-4-2026' };

const SRC = {
  ko: { 2: 'content_ep2.js', 3: 'content_ep3.js', 4: 'content_ep4.js' },
  en: { 2: 'blog/content_ep2_en.js', 3: 'blog/content_ep3_en.js', 4: 'blog/content_ep4_en.js' },
};

const L = {
  ko: { toc: '목차', pub: '발행', upd: '업데이트', readLabel: '읽는 시간', readVal: n => '약 ' + n + '분',
        related: '이어지는 글', ctaText: '상담 쓰레드로 상황을 남겨 주시면, 가능한 경로와 일정을 정리해 드립니다. 사전 상담은 무료입니다.',
        cta: '무료 사전 상담 시작하기 →' },
  en: { toc: 'Contents', pub: 'Published', upd: 'Updated', readLabel: 'Read', readVal: n => '~' + n + ' min',
        related: 'Related', ctaText: 'Share your situation through our consultation thread and we will outline the feasible pathway and timeline. The pre-consultation is free of charge.',
        cta: 'Start a free pre-consultation →' },
};

function loadPost(file) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const window = {};
  new Function('window', code)(window);
  return window.POST;
}

function renderBlocks(blocks) {
  let h = '';
  for (const b of (blocks || [])) {
    if (b.type === 'p') {
      h += `            <p>${b.text}</p>\n`;
    } else if (b.type === 'callout') {
      h += `            <div class="callout">${b.text}</div>\n`;
    } else if (b.type === 'numbered') {
      h += '            <div class="num">\n';
      for (const it of b.items) {
        h += `                <div class="num-item"><div class="num-n">${it.n}</div><div><div class="ni-title">${it.title}</div><div class="ni-text">${it.text}</div></div></div>\n`;
      }
      h += '            </div>\n';
    } else if (b.type === 'table') {
      if (b.title) h += `            <div class="tbl-cap">${b.title}</div>\n`;
      h += '            <div class="tbl">\n                <table>\n                    <thead><tr>'
         + b.headers.map(x => `<th>${x}</th>`).join('') + '</tr></thead>\n                    <tbody>\n';
      for (const r of b.rows) h += '                        <tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>\n';
      h += '                    </tbody>\n                </table>\n';
      if (b.note) h += `                <div class="tbl-note">${b.note}</div>\n`;
      h += '            </div>\n';
    } else if (b.type === 'faq') {
      for (const it of b.items) {
        h += `            <div class="qa"><div class="q">${it.q}</div><div class="a">${it.a}</div></div>\n`;
      }
    } else if (b.type === 'mistakes') {
      for (const it of b.items) {
        h += `            <div class="qa"><div class="q">${it.title}</div><div class="a">${it.text}</div></div>\n`;
      }
    }
  }
  return h;
}

function render(post, lang) {
  const t = L[lang];
  const toc = post.sections.filter(s => s.heading).map(s => `            <a href="#${s.id}">${s.heading}</a>`).join('\n');

  let body = '';
  for (const s of post.sections) {
    if (s.type === 'midCta') {
      body += `            <div class="callout">${t.ctaText} <a href="consultation" style="color:var(--btn);font-weight:700">${t.cta}</a></div>\n`;
      continue;
    }
    if (!s.heading) continue;
    body += `            <h2 id="${s.id}">${s.heading}</h2>\n`;
    body += renderBlocks(s.blocks);
  }

  let rel = '';
  if (post.related && post.related.length) {
    rel += `            <div class="related">\n                <h4>${t.related}</h4>\n`;
    for (const r of post.related) {
      const m = String(r.tag || '').match(/(\d+)/);
      const ep = m ? parseInt(m[1], 10) : 0;
      const href = SLUG[ep] || 'insights';
      rel += `                <a href="${href}"><span class="rt">${r.title}</span><span class="rtag">${r.tag}</span></a>\n`;
    }
    rel += '            </div>\n';
  }

  const kicker = `<span class="cat">${post.categoryLabel}</span><span class="dot">·</span><span>${post.series}</span>`;
  const meta = `<span><b>${t.pub}</b> ${post.publishedAt}</span><span><b>${t.upd}</b> ${post.updatedAt}</span><span><b>${t.readLabel}</b> ${t.readVal(post.readingMin)}</span>`;

  return `<div class="wrap">
    <div class="art-head">
        <div class="art-kicker">${kicker}</div>
        <h1>${post.title}</h1>
        <div class="art-meta">${meta}</div>
        <p class="disclaimer">${post.disclaimer}</p>
    </div>
</div>

<div class="wrap">
    <div class="art-layout">
        <nav class="toc">
            <h4>${t.toc}</h4>
${toc}
        </nav>

        <article class="body">
${body}${rel}        </article>
    </div>
</div>
`;
}

let count = 0;
for (const lang of ['ko', 'en']) {
  for (const ep of [2, 3, 4]) {
    const post = loadPost(SRC[lang][ep]);
    const out = path.join(ROOT, 'content', `${SLUG[ep]}.${lang}.html`);
    fs.writeFileSync(out, render(post, lang), 'utf8');
    console.log('wrote', path.relative(ROOT, out), '←', SRC[lang][ep]);
    count++;
  }
}
console.log(`\nDone. ${count} file(s).`);

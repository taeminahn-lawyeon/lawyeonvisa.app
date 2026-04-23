/**
 * Generate static Navy v4 blog HTML from a content_ep*.js file.
 *
 * Usage: node scripts/build-navy-v4-post.js <content-file> <output-slug>
 * Example: node scripts/build-navy-v4-post.js blog/content_ep1_en.js d9-visa-korea-business-immigration-franchise-overview-2026
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { esc, renderBlock, navyV4Css } = require('./navy-v4-renderer');

const SITE = 'https://www.lawyeonvisa.app';

function loadPost(contentFile) {
  const src = fs.readFileSync(contentFile, 'utf-8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  if (!sandbox.window.POST) throw new Error(`window.POST not defined in ${contentFile}`);
  return sandbox.window.POST;
}

function renderTopbar(post) {
  const epLabel = post.episodeNo ? `EP${post.episodeNo}` : '';
  const rev = post.rev ? ` · REV.${post.rev}` : '';
  const ctaLabel = post.__lang === 'en' ? 'Consultation' : '상담 신청';
  return `<header class="C-topbar">
  <div class="C-topbar-left">
    <span class="C-mono">LAWYEON /</span>
    <span class="C-topbar-title">Law Firm Lawyeon</span>
  </div>
  <div class="C-topbar-right">
    <span class="C-mono">DOC-ID</span><span>${esc(epLabel)}${esc(rev)}</span>
    <span class="C-mono">STATUS</span><span class="C-badge-pub">PUBLISHED</span>
    <a class="C-topbar-cta" href="/business-immigration-request.html">${ctaLabel} [↗]</a>
  </div>
</header>`;
}

function renderHeader(post) {
  const pubLabel = post.__lang === 'en' ? 'PUBLISHED' : 'PUBLISHED';
  const readSuffix = post.__lang === 'en' ? ' MIN' : 'MIN';
  const disclaimerLabel = post.__lang === 'en' ? '[ DISCLAIMER ]' : '[ DISCLAIMER ]';
  const revTxt = post.updatedAt ? ` · REV ${esc(post.updatedAt)}` : '';
  return `<header class="C-header">
  <div class="C-header-grid">
    <div class="C-label">SERIES</div><div class="C-value">${esc(post.series || '')}</div>
    <div class="C-label">CATEGORY</div><div class="C-value"><span class="C-pill">[${esc(post.categoryLabel || '')}]</span></div>
    <div class="C-label">${pubLabel}</div><div class="C-value C-mono">${esc(post.publishedAt || '')}${revTxt} · ~${esc(post.readingMin || '')}${readSuffix}</div>
  </div>
  <div class="C-title-block">
    <div class="C-bigno">${esc(post.episodeNo || '01')}</div>
    <h1 class="C-title">${esc(post.title)}</h1>
  </div>
  <div class="C-disclaimer">
    <span class="C-mono">${disclaimerLabel}</span>
    <span>${esc(post.disclaimer || '')}</span>
  </div>
</header>`;
}

function renderRail(post) {
  const labels = post.__lang === 'en'
    ? { contents: 'CONTENTS', series: 'SERIES', action: 'ACTION', cta: '[ Free Pre-Consultation → ]' }
    : { contents: 'CONTENTS', series: 'SERIES', action: 'ACTION', cta: '[ 무상 사전 상담 → ]' };
  const toc = (post.sections || []).filter(s => s.heading).map((s, i) =>
    `<li data-id="${esc(s.id)}"${i === 0 ? ' class="C-active"' : ''}><a href="#${esc(s.id)}"><span class="C-mono">${String(i + 1).padStart(2, '0')}</span><span>${esc(s.heading)}</span></a></li>`
  ).join('');
  const series = (post.seriesNav || []).map(n =>
    `<li${n.active ? ' class="C-active"' : ''}><span class="C-mono">${esc(n.no)}</span><span>${esc(n.label)}${n.active ? ' ◀' : ''}</span></li>`
  ).join('');
  return `<aside class="C-rail">
  <div class="C-rail-block">
    <div class="C-rail-label">${labels.contents}</div>
    <ol class="C-rail-toc">${toc}</ol>
  </div>
  ${series ? `<div class="C-rail-block">
    <div class="C-rail-label">${labels.series}</div>
    <ul class="C-rail-series">${series}</ul>
  </div>` : ''}
  <div class="C-rail-block">
    <div class="C-rail-label">${labels.action}</div>
    <a class="C-rail-cta" href="/business-immigration-request.html">${labels.cta}</a>
  </div>
</aside>`;
}

function renderSection(sec, idx, total, lang) {
  if (sec.type === 'midCta') {
    const title = lang === 'en' ? 'Free Pre-Consultation' : '무상 사전 상담';
    const text = lang === 'en'
      ? 'Share your profile via our consultation thread,<br>and we will outline the feasible pathways and budget range for you.'
      : '다섯 가지 조건을 쓰레드로 알려주시면<br>가능한 경로와 예산 범위를 개략적으로 안내합니다.';
    const cta = lang === 'en' ? '[ Apply → ]' : '[ 신청 → ]';
    const bar = '═'.repeat(80);
    return `<div class="C-midcta">
  <div class="C-midcta-bar">${bar}</div>
  <div class="C-midcta-grid">
    <div class="C-midcta-label">ACTION · 01</div>
    <div class="C-midcta-body">
      <div class="C-midcta-title">${title}</div>
      <div class="C-midcta-text">${text}</div>
    </div>
    <a class="C-midcta-btn" href="/business-immigration-request.html">${cta}</a>
  </div>
  <div class="C-midcta-bar">${bar}</div>
</div>`;
  }
  const blocks = (sec.blocks || []).map(b => renderBlock(b)).join('\n  ');
  const hr = '─'.repeat(60);
  return `<section id="${esc(sec.id)}" class="C-section">
  <div class="C-section-head">
    <div class="C-section-idx">§ ${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
    <h2 class="C-h2">${esc(sec.heading)}</h2>
    <div class="C-hr">${hr}</div>
  </div>
  ${blocks}
</section>`;
}

// EP-no (e.g. "01", "EP 2", "편 3") → slug mapping for RELATED row links.
const SLUG_BY_EP = {
  en: {
    '01': 'd9-visa-korea-business-immigration-franchise-overview-2026',
    '02': 'd9-visa-korea-business-immigration-visa-system-structure-2026',
    '03': 'd9-visa-korea-business-immigration-relocation-launch-flow-2026',
    '04': 'd9-visa-korea-business-immigration-after-settlement-2026',
  },
  ko: {
    '01': 'd9-visa-korea-business-immigration-franchise-overview-2026',
    '02': 'd9-visa-korea-business-immigration-visa-system-structure-2026',
    '03': 'business-immigration-korea-startup-process-2026',
    '04': 'd9-visa-korea-business-immigration-after-settlement-2026',
  },
};

function slugFromTag(tag, lang) {
  const m = String(tag || '').match(/(\d{1,2})/);
  if (!m) return null;
  const key = m[1].padStart(2, '0');
  return (SLUG_BY_EP[lang] || {})[key] || null;
}

function renderClosing(post) {
  const lang = post.__lang;
  const labels = lang === 'en'
    ? { end: `END OF DOCUMENT · EP${post.episodeNo || '01'}`, next: 'NEXT ACTIONS', action1: 'Free Pre-Consultation', action2: 'Business Immigration Page', related: 'RELATED · Business Immigration Series', read: '[Read →]' }
    : { end: `END OF DOCUMENT · EP${post.episodeNo || '01'}`, next: 'NEXT ACTIONS', action1: '무상 사전 상담 신청', action2: '사업 이민 페이지', related: 'RELATED · 사업이민 시리즈', read: '[읽기 →]' };
  const relatedRows = (post.related || []).map(r => {
    const slug = slugFromTag(r.tag, lang);
    const hrefAttr = slug ? ` onclick="location.href='/blog/${slug}.html'"` : '';
    return `<tr${hrefAttr}><td class="C-related-tag">${esc(r.tag)}</td><td>${esc(r.title)}</td><td>${labels.read}</td></tr>`;
  }).join('');
  const headBar = '━'.repeat(60);
  return `<footer class="C-closing">
  <div class="C-closing-head">${headBar}</div>
  <div class="C-closing-title">${labels.end}</div>
  <div class="C-closing-cta">
    <div class="C-closing-cta-label">${labels.next}</div>
    <div class="C-closing-cta-list">
      <a href="/business-immigration-request.html"><span class="C-mono">→</span> ${labels.action1}</a>
      <a href="/"><span class="C-mono">→</span> ${labels.action2}</a>
    </div>
  </div>
  ${relatedRows ? `<div class="C-related">
    <div class="C-related-label">${labels.related}</div>
    <table class="C-related-table"><tbody>${relatedRows}</tbody></table>
  </div>` : ''}
</footer>`;
}

function buildHtml(post, slug) {
  const isEn = !/[ㄱ-힝]/.test(post.title);
  post.__lang = isEn ? 'en' : 'ko';
  const lang = isEn ? 'en' : 'ko';
  const url = `${SITE}/blog/${slug}.html`;
  const totalSections = post.sections.length;
  const sections = post.sections.map((s, i) => renderSection(s, i, totalSections, lang)).join('\n');
  const titleTag = `${esc(post.title)} | ${isEn ? 'Law Firm Lawyeon' : '법무법인 로연'}`;
  const description = esc(post.disclaimer || '').slice(0, 200);
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleTag}</title>
<meta name="description" content="${description}">
<meta name="author" content="${isEn ? 'Law Firm Lawyeon Immigration Center' : '법무법인 로연 출입국이민지원센터'}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${titleTag}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${isEn ? 'en_US' : 'ko_KR'}">
<meta property="og:image" content="${SITE}/images/og-default.png">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"${esc(post.title)}","description":"${description}","author":{"@type":"Organization","name":"${isEn ? 'Law Firm Lawyeon Immigration Center' : '법무법인 로연 출입국이민지원센터'}","url":"${SITE}"},"publisher":{"@type":"Organization","name":"${isEn ? 'Law Firm Lawyeon' : '법무법인 로연'}","logo":{"@type":"ImageObject","url":"${SITE}/images/logo.png"}},"datePublished":"${esc(post.publishedAt || '')}","dateModified":"${esc(post.updatedAt || post.publishedAt || '')}","mainEntityOfPage":{"@type":"WebPage","@id":"${url}"}}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="icon" href="/favicon.png?v=3" type="image/png">
<style>${navyV4Css()}</style>
</head>
<body>
<article class="designC">
${renderTopbar(post)}
${renderHeader(post)}
<div class="C-shell">
${renderRail(post)}
<div class="C-article">
${sections}
${renderClosing(post)}
</div>
</div>
</article>
<script>
(function(){
  var root=document.querySelector('article.designC');
  if(!root)return;
  ['contextmenu','copy','cut','dragstart','selectstart'].forEach(function(ev){
    root.addEventListener(ev,function(e){e.preventDefault();},{passive:false});
  });
})();
(function(){
  var links=document.querySelectorAll('.C-rail-toc li[data-id]');
  if(!links.length||!('IntersectionObserver' in window))return;
  var obs=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        var id=e.target.id;
        links.forEach(function(l){l.classList.toggle('C-active',l.getAttribute('data-id')===id);});
      }
    });
  },{rootMargin:'-80px 0px -70% 0px'});
  document.querySelectorAll('section.C-section[id]').forEach(function(s){obs.observe(s);});
})();
</script>
</body>
</html>`;
}

// CLI
const [,, contentFile, slug] = process.argv;
if (!contentFile || !slug) {
  console.error('Usage: node scripts/build-navy-v4-post.js <content-file> <slug>');
  process.exit(1);
}
const post = loadPost(path.resolve(contentFile));
const html = buildHtml(post, slug);
const outPath = path.resolve(__dirname, '..', 'blog', `${slug}.html`);
fs.writeFileSync(outPath, html, 'utf-8');
console.log(`✓ Generated ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);

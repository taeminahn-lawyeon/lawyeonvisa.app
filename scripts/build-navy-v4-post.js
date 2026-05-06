/**
 * Generate static Navy v4 blog HTML from a content_ep*.js file.
 *
 * Usage: node scripts/build-navy-v4-post.js <content-file> <output-slug>
 * Example: node scripts/build-navy-v4-post.js blog/content_ep1_en.js start-a-business-in-korea-as-a-foreigner-2026
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { esc, renderBlock, navyV4Css } = require('./navy-v4-renderer');

const SITE = 'https://www.lawyeonvisa.app';

// Display labels for each language in the switcher. Order here is the order
// rendered (English first, then localized languages).
const LANG_LABELS = {
  en: 'English',
  ko: '한국어',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  zh: '中文',
  ja: '日本語',
};
const LANG_ORDER = ['en', 'ko', 'vi', 'th', 'zh', 'ja'];

// Centralized UI strings used throughout the post template, keyed by language.
// PR-A includes en + ko (preserving existing behavior). VI/TH/ZH/JA strings are
// added in subsequent PRs alongside the actual content translations.
const UI = {
  en: {
    topbarCta: 'Consultation',
    topbarDocId: 'DOC-ID',
    topbarStatus: 'STATUS',
    topbarStatusBadge: 'PUBLISHED',
    headerSeries: 'SERIES',
    headerCategory: 'CATEGORY',
    publishedLabel: 'PUBLISHED',
    readSuffix: ' MIN',
    disclaimerLabel: '[ DISCLAIMER ]',
    railContents: 'CONTENTS',
    railSeries: 'SERIES',
    railAction: 'ACTION',
    railCta: '[ Free Pre-Consultation → ]',
    midCtaTitle: 'Free Pre-Consultation',
    midCtaText: 'Share your profile via our consultation thread,<br>and we will outline the feasible pathways and budget range for you.',
    midCtaBtn: '[ Apply → ]',
    midCtaActionLabel: 'ACTION · 01',
    tocCtaPrefix: 'ACTION ·',
    closingEnd: 'END OF DOCUMENT',
    closingNext: 'NEXT ACTIONS',
    closingAction1: 'Free Pre-Consultation',
    closingAction2: 'Business Immigration Page',
    closingRelated: 'RELATED · Business Immigration Series',
    closingRead: '[Read →]',
  },
  ko: {
    topbarCta: '상담 신청',
    topbarDocId: 'DOC-ID',
    topbarStatus: 'STATUS',
    topbarStatusBadge: 'PUBLISHED',
    headerSeries: 'SERIES',
    headerCategory: 'CATEGORY',
    publishedLabel: 'PUBLISHED',
    readSuffix: 'MIN',
    disclaimerLabel: '[ DISCLAIMER ]',
    railContents: 'CONTENTS',
    railSeries: 'SERIES',
    railAction: 'ACTION',
    railCta: '[ 무상 사전 상담 → ]',
    midCtaTitle: '무상 사전 상담',
    midCtaText: '다섯 가지 조건을 쓰레드로 알려주시면<br>가능한 경로와 예산 범위를 개략적으로 안내합니다.',
    midCtaBtn: '[ 신청 → ]',
    midCtaActionLabel: 'ACTION · 01',
    tocCtaPrefix: 'ACTION ·',
    closingEnd: 'END OF DOCUMENT',
    closingNext: 'NEXT ACTIONS',
    closingAction1: '무상 사전 상담 신청',
    closingAction2: '사업 이민 페이지',
    closingRelated: 'RELATED · 사업이민 시리즈',
    closingRead: '[읽기 →]',
  },
  zh: {
    topbarCta: '免费咨询',
    topbarDocId: '编号',
    topbarStatus: '状态',
    topbarStatusBadge: '已发布',
    headerSeries: '系列',
    headerCategory: '类别',
    publishedLabel: '发布',
    readSuffix: ' 分钟',
    disclaimerLabel: '[ 说明 ]',
    railContents: '目录',
    railSeries: '系列',
    railAction: '操作',
    railCta: '[ 免费预先咨询 → ]',
    midCtaTitle: '免费预先咨询',
    midCtaText: '通过咨询线程告知您的情况，<br>我们将为您梳理可行路径与预算范围。',
    midCtaBtn: '[ 申请 → ]',
    midCtaActionLabel: '操作 · 01',
    tocCtaPrefix: '操作 ·',
    closingEnd: '文档结束',
    closingNext: '下一步操作',
    closingAction1: '免费预先咨询',
    closingAction2: '商业移民页面',
    closingRelated: '相关 · 商业移民系列',
    closingRead: '[阅读 →]',
  },
  // vi, th, ja are populated in subsequent PRs alongside their content
  // translations. Until then, posts in those languages fall back to English
  // UI strings via `uiFor()` below.
};

function uiFor(lang) {
  return UI[lang] || UI.en;
}

// Append ?lang=<post.lang> to all consultation-page CTA URLs so the
// destination page (business-immigration-request.html) auto-switches its
// language to match the blog the user came from. The ?lang= handler is in
// js/i18n.js init().
function ctaHref(post) {
  const lang = post.__lang || post.lang || 'en';
  return `/business-immigration-request.html?lang=${encodeURIComponent(lang)}`;
}

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
  const ui = uiFor(post.__lang);
  return `<header class="C-topbar">
  <div class="C-topbar-left">
    <span class="C-mono">LAWYEON /</span>
    <span class="C-topbar-title">Law Firm Lawyeon</span>
  </div>
  <div class="C-topbar-right">
    <span class="C-mono">${ui.topbarDocId}</span><span>${esc(epLabel)}${esc(rev)}</span>
    <span class="C-mono">${ui.topbarStatus}</span><span class="C-badge-pub">${ui.topbarStatusBadge}</span>
    <a class="C-topbar-cta" href="${ctaHref(post)}">${ui.topbarCta} [↗]</a>
  </div>
</header>`;
}

// Renders the language switcher row directly above <header class="C-header">.
// Reads post.translations (a map of langCode -> slug). Only languages with
// a non-empty slug are rendered (so as new languages get added, they appear
// automatically; missing ones are simply absent).
function renderLanguageSwitcher(post) {
  const t = post.translations || {};
  const links = LANG_ORDER
    .filter((lang) => t[lang])
    .map((lang) => {
      const slug = t[lang];
      const label = LANG_LABELS[lang] || lang;
      const isCurrent = lang === post.__lang;
      const href = `/blog/${slug}.html`;
      const cls = isCurrent ? 'C-lang-link C-lang-current' : 'C-lang-link';
      const aria = isCurrent ? ' aria-current="page"' : '';
      return `<a class="${cls}" hreflang="${lang}" lang="${lang}" href="${href}"${aria}>${esc(label)}</a>`;
    })
    .join('');
  // Hide the switcher entirely when only one (or zero) language is available —
  // showing a single "English" pill on every EN post until other translations
  // ship would be confusing. Once VI/TH/ZH/JA arrive, this becomes visible.
  const availableCount = Object.values(t).filter(Boolean).length;
  if (availableCount < 2) return '';
  return `<nav class="C-langswitch" aria-label="Language">
  <span class="C-mono C-langswitch-label">LANG /</span>
  ${links}
</nav>`;
}

function renderHeader(post) {
  const ui = uiFor(post.__lang);
  const revTxt = post.updatedAt ? ` · REV ${esc(post.updatedAt)}` : '';
  return `<header class="C-header">
  <div class="C-header-grid">
    <div class="C-label">${ui.headerSeries}</div><div class="C-value">${esc(post.series || '')}</div>
    <div class="C-label">${ui.headerCategory}</div><div class="C-value"><span class="C-pill">[${esc(post.categoryLabel || '')}]</span></div>
    <div class="C-label">${ui.publishedLabel}</div><div class="C-value C-mono">${esc(post.publishedAt || '')}${revTxt} · ~${esc(post.readingMin || '')}${ui.readSuffix}</div>
  </div>
  <div class="C-title-block">
    <div class="C-bigno">${esc(post.episodeNo || '01')}</div>
    <h1 class="C-title">${esc(post.title)}</h1>
  </div>
  <div class="C-disclaimer">
    <span class="C-mono">${ui.disclaimerLabel}</span>
    <span>${esc(post.disclaimer || '')}</span>
  </div>
</header>`;
}

function renderRail(post) {
  const ui = uiFor(post.__lang);
  const labels = { contents: ui.railContents, series: ui.railSeries, action: ui.railAction, cta: ui.railCta };
  // TOC includes both headings and midCta entries. Numbers align with body §
  // positions (absolute index in the sections array), so the TOC's "05 ACTION"
  // matches the visual gap between body § 04 and § 06.
  const tocCtaLabel = `${ui.tocCtaPrefix} ${ui.midCtaTitle}`;
  let firstShown = true;
  const toc = (post.sections || []).map((s, i) => {
    const num = String(i + 1).padStart(2, '0');
    if (s.type === 'midCta') {
      const html = `<li class="C-rail-toc-cta" data-id="${esc(s.id)}"><a href="#${esc(s.id)}"><span class="C-mono">${num}</span><span>${esc(tocCtaLabel)}</span></a></li>`;
      return html;
    }
    if (s.heading) {
      const cls = firstShown ? ' class="C-active"' : '';
      firstShown = false;
      return `<li data-id="${esc(s.id)}"${cls}><a href="#${esc(s.id)}"><span class="C-mono">${num}</span><span>${esc(s.heading)}</span></a></li>`;
    }
    return null;
  }).filter(Boolean).join('');
  const series = (post.seriesNav || []).map(n => {
    const inner = `<span class="C-mono">${esc(n.no)}</span><span>${esc(n.label)}${n.active ? ' ◀' : ''}</span>`;
    if (n.active) {
      return `<li class="C-active">${inner}</li>`;
    }
    const slug = (SLUG_BY_EP[post.__lang] || {})[String(n.no).padStart(2, '0')];
    if (!slug) return `<li>${inner}</li>`;
    const href = `/blog/${slug}.html`;
    // onclick on <li> so the whole row (including padding) is clickable even
    // if the user hits the 5px padding area outside the <a>.
    return `<li onclick="location.href='${href}'"><a href="${href}">${inner}</a></li>`;
  }).join('');
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
    <a class="C-rail-cta" href="${ctaHref(post)}">${labels.cta}</a>
  </div>
</aside>`;
}

function renderSection(sec, idx, total, lang) {
  if (sec.type === 'midCta') {
    const ui = uiFor(lang);
    const bar = '═'.repeat(80);
    return `<div id="${esc(sec.id || 's-cta-mid')}" class="C-midcta">
  <div class="C-midcta-bar">${bar}</div>
  <div class="C-midcta-grid">
    <div class="C-midcta-label">${ui.midCtaActionLabel}</div>
    <div class="C-midcta-body">
      <div class="C-midcta-title">${ui.midCtaTitle}</div>
      <div class="C-midcta-text">${ui.midCtaText}</div>
    </div>
    <a class="C-midcta-btn" href="${ctaHref({ __lang: lang })}">${ui.midCtaBtn}</a>
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

// EP-no (e.g. "01", "EP 2", "편 3") → slug mapping for RELATED row + seriesNav links.
// EN slugs reflect the 2026.05 SEO rework: EP2/EP4 received new intent-based slugs.
const SLUG_BY_EP = {
  en: {
    '01': 'start-a-business-in-korea-as-a-foreigner-2026',
    '02': 'korea-franchise-business-foreign-entrepreneur-2026',
    '03': 'how-to-open-a-store-in-korea-as-a-foreigner-2026',
    '04': 'permanent-residency-korea-foreign-business-owner-2026',
  },
  ko: {
    '01': 'start-a-business-in-korea-as-a-foreigner-2026',
    '02': 'korea-business-visa-investment-and-family-guide-2026',
    '03': 'business-immigration-korea-startup-process-2026',
    '04': 'how-to-stay-in-korea-long-term-as-a-business-owner-2026',
  },
  zh: {
    '01': '外国人在韩国创业-D-9-4-D-9-5签证完全指南-2026',
    '02': '外国人在韩国开加盟店-行业品牌指南-2026',
    '03': '外国人在韩国开店流程-五阶段完整指南-2026',
    '04': '外国企业主韩国永久居留-F-2-99到F-5指南-2026',
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
  const ui = uiFor(lang);
  const labels = {
    end: `${ui.closingEnd} · EP${post.episodeNo || '01'}`,
    next: ui.closingNext,
    action1: ui.closingAction1,
    action2: ui.closingAction2,
    related: ui.closingRelated,
    read: ui.closingRead,
  };
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
      <a href="${ctaHref(post)}"><span class="C-mono">→</span> ${labels.action1}</a>
      <a href="/"><span class="C-mono">→</span> ${labels.action2}</a>
    </div>
  </div>
  ${relatedRows ? `<div class="C-related">
    <div class="C-related-label">${labels.related}</div>
    <table class="C-related-table"><tbody>${relatedRows}</tbody></table>
  </div>` : ''}
</footer>`;
}

// Map of post.lang ('vi' / 'th' / 'zh' / 'ja' / etc.) → BCP-47 locale tag
// used in <html lang> and og:locale.
const HTML_LANG_BY_POST_LANG = {
  en: { html: 'en', og: 'en_US' },
  ko: { html: 'ko', og: 'ko_KR' },
  vi: { html: 'vi', og: 'vi_VN' },
  th: { html: 'th', og: 'th_TH' },
  zh: { html: 'zh', og: 'zh_CN' },
  ja: { html: 'ja', og: 'ja_JP' },
};

function buildHtml(post, slug) {
  // Prefer explicit post.lang. Fall back to Korean-character heuristic for
  // legacy content files that don't yet set it.
  if (!post.lang) {
    post.lang = /[ㄱ-힝]/.test(post.title) ? 'ko' : 'en';
  }
  post.__lang = post.lang;
  const lang = post.lang;
  const isEn = lang === 'en';
  const localeMap = HTML_LANG_BY_POST_LANG[lang] || HTML_LANG_BY_POST_LANG.en;
  const url = `${SITE}/blog/${slug}.html`;
  const totalSections = post.sections.length;
  const sections = post.sections.map((s, i) => renderSection(s, i, totalSections, lang)).join('\n');
  const titleTag = `${esc(post.title)} | ${isEn ? 'Law Firm Lawyeon' : '법무법인 로연'}`;
  // Prefer explicit metaDescription; fall back to disclaimer for legacy posts.
  // ogTitle can be a shorter, click-optimized variant of the long SEO title.
  const description = esc(post.metaDescription || post.disclaimer || '').slice(0, 280);
  const ogTitleTag = `${esc(post.ogTitle || post.title)} | ${isEn ? 'Law Firm Lawyeon' : '법무법인 로연'}`;
  // hreflang alternates: every other-language version of the same article,
  // plus self as canonical. Helps Google show the right language to each user.
  const altLinks = (post.translations || {});
  const hreflangTags = Object.entries(altLinks)
    .filter(([, s]) => s)
    .map(([l, s]) => {
      const lm = HTML_LANG_BY_POST_LANG[l] || HTML_LANG_BY_POST_LANG.en;
      return `<link rel="alternate" hreflang="${lm.html}" href="${SITE}/blog/${s}.html">`;
    })
    .join('\n');
  // x-default points at the English version when present.
  const xDefault = altLinks.en ? `<link rel="alternate" hreflang="x-default" href="${SITE}/blog/${altLinks.en}.html">` : '';
  return `<!DOCTYPE html>
<html lang="${localeMap.html}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleTag}</title>
<meta name="description" content="${description}">
<meta name="author" content="${lang === 'ko' ? '법무법인 로연 출입국이민지원센터' : 'Law Firm Lawyeon Immigration Center'}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
${hreflangTags}
${xDefault}
<meta property="og:type" content="article">
<meta property="og:title" content="${ogTitleTag}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${localeMap.og}">
<meta property="og:image" content="${SITE}/images/og-default.png">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"${esc(post.title)}","description":"${description}","inLanguage":"${localeMap.html}","author":{"@type":"Organization","name":"${lang === 'ko' ? '법무법인 로연 출입국이민지원센터' : 'Law Firm Lawyeon Immigration Center'}","url":"${SITE}"},"publisher":{"@type":"Organization","name":"${lang === 'ko' ? '법무법인 로연' : 'Law Firm Lawyeon'}","logo":{"@type":"ImageObject","url":"${SITE}/images/logo.png"}},"datePublished":"${esc(post.publishedAt || '')}","dateModified":"${esc(post.updatedAt || post.publishedAt || '')}","mainEntityOfPage":{"@type":"WebPage","@id":"${url}"}}
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
${renderLanguageSwitcher(post)}
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

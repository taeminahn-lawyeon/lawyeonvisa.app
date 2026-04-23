/**
 * Navy v4 template renderer for blog_posts with template='navy_v4'.
 *
 * Expects post.content to be a JSON-stringified object:
 * {
 *   episode, series, categoryLabel, publishedAt, updatedAt,
 *   readingMin, disclaimer, seriesList, sections, related
 * }
 */

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escJson(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function renderBlock(b) {
  if (b.type === 'p') {
    return `<p class="C-p">${b.text}</p>`;
  }
  if (b.type === 'callout') {
    return `<div class="C-callout"><div class="C-callout-head">${esc(b.head || '▲ NOTE')}</div><div>${b.text}</div></div>`;
  }
  if (b.type === 'table') {
    const headerBar = esc(b.title || b.tableLabel || 'TABLE');
    const ths = (b.headers || b.columns || []).map((h, i) =>
      `<th${i === 0 ? '' : ' class="C-th-opt"'}>${esc(h)}</th>`).join('');
    const rows = (b.rows || []).map(r =>
      `<tr>${r.map((c, j) =>
        `<td${j === 0 ? ' class="C-td-label"' : ''}>${esc(c)}</td>`).join('')}</tr>`
    ).join('');
    const note = b.note ? `<div class="C-table-note">※ ${esc(b.note)}</div>` : '';
    return `<div class="C-tablewrap"><div class="C-table-head">${headerBar}</div><table class="C-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>${note}</div>`;
  }
  if (b.type === 'steps' || b.type === 'numbered') {
    const labelPrefix = b.label || 'PROCEDURE';
    const items = (b.items || []).map((it, i, arr) => {
      const line = i < arr.length - 1 ? '<div class="C-step-line"></div>' : '';
      const n = String(it.n || (i + 1)).padStart(2, '0');
      return `<div class="C-step"><div class="C-step-left"><div class="C-step-n">${n}</div>${line}</div><div class="C-step-body"><div class="C-step-label">${esc(labelPrefix)} ${n}</div><h3>${esc(it.title)}</h3><p>${it.text}</p></div></div>`;
    }).join('');
    return `<div class="C-steps">${items}</div>`;
  }
  if (b.type === 'faq') {
    const items = (b.items || []).map((it, i) => {
      const idx = `Q.${String(i + 1).padStart(2, '0')}`;
      return `<div class="C-faq-item"><div class="C-faq-idx">${idx}</div><div class="C-faq-body"><div class="C-faq-q">${esc(it.q)}</div><div class="C-faq-a">${it.a}</div></div></div>`;
    }).join('');
    return `<div class="C-faq">${items}</div>`;
  }
  if (b.type === 'mistakes') {
    const items = (b.items || []).map((it, i) => {
      const tag = `ERR.${String(i + 1).padStart(2, '0')}`;
      return `<div class="C-mistake"><div class="C-mistake-tag">${tag}</div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`;
    }).join('');
    return `<div class="C-mistakes">${items}</div>`;
  }
  if (b.type === 'midCta' || b.type === 'midcta') {
    const title = esc(b.title || '무상 사전 상담');
    const text = b.text || '다섯 가지 조건을 쓰레드로 알려주시면<br>가능한 경로와 예산 범위를 개략적으로 안내합니다.';
    const cta = esc(b.cta || '[ 신청 → ]');
    const bar = '═'.repeat(80);
    return `<div class="C-midcta"><div class="C-midcta-bar">${bar}</div><div class="C-midcta-grid"><div class="C-midcta-label">ACTION · 01</div><div class="C-midcta-body"><div class="C-midcta-title">${title}</div><div class="C-midcta-text">${text}</div></div><a class="C-midcta-btn" href="/consultation-request.html">${cta}</a></div><div class="C-midcta-bar">${bar}</div></div>`;
  }
  return '';
}

function navyV4Css() {
  return `
*{box-sizing:border-box;}html,body{margin:0;padding:0;}
body{font-family:"Noto Sans KR",-apple-system,sans-serif;background:#ededea;color:#0a0a0a;}
.designC{--c-bg:#ededea;--c-paper:#f5f5f2;--c-ink:#0a0a0a;--c-ink-2:#2b2b2b;--c-ink-3:#6b6b6b;--c-rule-2:#c9c9c5;--c-accent:#0f2552;--c-accent-soft:#e6eaf2;--c-yellow:#f5c518;font-family:"Noto Sans KR",-apple-system,sans-serif;background:var(--c-bg);color:var(--c-ink);font-size:15px;line-height:1.7;word-break:keep-all;overflow-wrap:break-word;}
.designC *,.designC *::before,.designC *::after{word-break:keep-all;overflow-wrap:break-word;}
.designC .C-mono{font-family:"IBM Plex Mono","Courier New",monospace;}
.designC a{color:inherit;text-decoration:none;}
.designC .C-topbar{display:flex;justify-content:space-between;align-items:center;padding:10px max(24px,calc(50vw - 660px));background:var(--c-ink);color:#fff;font-family:"IBM Plex Mono",monospace;font-size:12px;position:sticky;top:0;z-index:10;border-bottom:3px solid var(--c-accent);}
.designC .C-topbar-left{display:flex;gap:10px;align-items:baseline;}
.designC .C-topbar-title{font-family:"Noto Sans KR",sans-serif;font-weight:700;}
.designC .C-topbar-right{display:flex;gap:10px;align-items:center;}
.designC .C-topbar-right>span:nth-child(odd){color:#888;}
.designC .C-badge-pub{background:var(--c-yellow);color:#000;padding:2px 8px;font-weight:700;}
.designC .C-topbar-cta{background:var(--c-accent);color:#fff!important;padding:6px 12px;font-weight:700;cursor:pointer;}
.designC .C-header{padding:32px max(40px,calc(50vw - 660px)) 40px;background:var(--c-paper);border-bottom:3px solid var(--c-accent);}
.designC .C-header-grid{display:grid;grid-template-columns:120px 1fr;gap:4px 20px;font-size:12px;font-family:"IBM Plex Mono",monospace;border:1px solid var(--c-accent);padding:14px 18px;background:#fff;margin-bottom:32px;}
.designC .C-label{color:var(--c-ink-3);font-weight:700;letter-spacing:0.08em;}
.designC .C-value{color:var(--c-ink);}
.designC .C-pill{display:inline-block;background:var(--c-yellow);padding:1px 8px;font-weight:700;}
.designC .C-title-block{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:end;margin-bottom:28px;}
.designC .C-bigno{font-family:"Manrope","Noto Sans KR",sans-serif;font-size:108px;font-weight:800;line-height:0.82;color:var(--c-accent);letter-spacing:-0.055em;font-feature-settings:"tnum" 1,"lnum" 1;margin-bottom:-6px;}
.designC .C-title{font-family:"Noto Sans KR",sans-serif;font-weight:800;font-size:38px;line-height:1.3;margin:0;letter-spacing:-0.025em;color:var(--c-ink);text-wrap:balance;}
.designC .C-disclaimer{display:flex;gap:14px;padding:12px 16px;background:#fff;color:var(--c-ink-2);border-left:4px solid var(--c-accent);border-top:1px solid var(--c-rule-2);border-right:1px solid var(--c-rule-2);border-bottom:1px solid var(--c-rule-2);font-size:12.5px;font-family:"IBM Plex Mono",monospace;line-height:1.6;}
.designC .C-disclaimer>span:first-child{color:var(--c-accent);flex-shrink:0;font-weight:700;}
.designC .C-shell{display:grid;grid-template-columns:240px minmax(0,1fr);gap:0;max-width:1320px;margin:0 auto;padding:0 0 80px;}
.designC .C-rail{padding:32px 20px 32px 40px;border-right:1px solid var(--c-rule-2);position:sticky;top:60px;align-self:start;max-height:calc(100vh - 60px);overflow-y:auto;font-family:"IBM Plex Mono",monospace;font-size:12px;}
.designC .C-rail-block{padding-bottom:24px;margin-bottom:24px;border-bottom:1px solid var(--c-rule-2);}
.designC .C-rail-block:last-child{border-bottom:0;}
.designC .C-rail-label{background:var(--c-accent);color:#fff;display:inline-block;padding:3px 10px;font-size:10px;letter-spacing:0.12em;margin-bottom:14px;font-weight:700;}
.designC .C-rail-toc,.designC .C-rail-series{list-style:none;padding:0;margin:0;}
.designC .C-rail-toc li,.designC .C-rail-series li{display:flex;gap:10px;padding:5px 0;color:var(--c-ink-2);font-size:11.5px;line-height:1.5;cursor:pointer;}
.designC .C-rail-toc li.C-active,.designC .C-rail-series li.C-active{color:var(--c-accent);font-weight:700;}
.designC .C-rail-toc .C-mono{color:var(--c-ink-3);flex-shrink:0;}
.designC .C-rail-toc a{display:flex;gap:10px;color:inherit;width:100%;}
.designC .C-rail-cta{display:block;background:var(--c-accent);color:#fff!important;padding:12px;text-align:center;font-weight:700;cursor:pointer;font-size:12px;letter-spacing:0.02em;}
.designC .C-article{padding:32px 48px;min-width:0;background:var(--c-paper);}
.designC .C-section{margin-bottom:56px;}
.designC .C-section-head{margin-bottom:24px;}
.designC .C-section-idx{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--c-accent);font-weight:700;letter-spacing:0.1em;margin-bottom:6px;}
.designC .C-h2{font-family:"Noto Sans KR",sans-serif;font-weight:800;font-size:28px;margin:0 0 4px;letter-spacing:-0.02em;line-height:1.35;color:var(--c-ink);text-wrap:balance;}
.designC .C-hr{font-family:"IBM Plex Mono",monospace;color:var(--c-ink-3);font-size:10px;letter-spacing:0;overflow:hidden;white-space:nowrap;line-height:1;}
.designC .C-p{margin:0 0 18px;font-size:15px;line-height:1.8;color:var(--c-ink-2);text-wrap:pretty;}
.designC .C-p b{font-weight:700;color:var(--c-ink);background:var(--c-yellow);padding:0 4px;}
.designC .C-callout{padding:14px 18px;border:2px solid var(--c-accent);background:#fff;margin:20px 0;font-size:14px;line-height:1.7;}
.designC .C-callout-head{font-family:"IBM Plex Mono",monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;color:var(--c-accent);margin-bottom:6px;}
.designC .C-callout b{font-weight:700;color:var(--c-ink);background:var(--c-yellow);padding:0 4px;}
.designC .C-tablewrap{margin:24px 0;overflow-x:auto;border:2px solid var(--c-accent);background:#fff;}
.designC .C-table-head{background:var(--c-accent);color:#fff;padding:8px 14px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:0.1em;font-weight:700;}
.designC .C-table{width:100%;border-collapse:collapse;font-size:12.5px;}
.designC .C-table th{padding:10px 12px;background:var(--c-paper);color:var(--c-ink);font-weight:700;font-family:"IBM Plex Mono",monospace;text-align:left;border-bottom:2px solid var(--c-accent);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;}
.designC .C-th-opt{background:var(--c-yellow)!important;}
.designC .C-table td{padding:8px 12px;border-bottom:1px dashed var(--c-rule-2);color:var(--c-ink-2);vertical-align:top;}
.designC .C-td-label{font-weight:700;color:var(--c-ink);background:var(--c-paper);font-family:"IBM Plex Mono",monospace;font-size:11px;}
.designC .C-table-note{padding:8px 14px;font-size:11px;color:var(--c-ink-3);font-family:"IBM Plex Mono",monospace;border-top:1px solid var(--c-rule-2);}
.designC .C-steps{margin:24px 0;}
.designC .C-step{display:grid;grid-template-columns:72px 1fr;gap:24px;padding:20px 0;position:relative;}
.designC .C-step-left{display:flex;flex-direction:column;align-items:center;}
.designC .C-step-n{font-family:"Manrope","Noto Sans KR",sans-serif;font-size:26px;font-weight:700;color:#fff;background:var(--c-accent);width:56px;height:56px;display:grid;place-items:center;line-height:1;font-feature-settings:"tnum" 1,"lnum" 1;letter-spacing:-0.01em;}
.designC .C-step-line{width:2px;flex:1;background:var(--c-accent);margin-top:8px;min-height:24px;}
.designC .C-step-body{padding-top:2px;}
.designC .C-step-label{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:0.18em;color:var(--c-accent);font-weight:700;margin-bottom:4px;}
.designC .C-step-body h3{font-family:"Noto Sans KR",sans-serif;font-weight:700;font-size:18px;margin:0 0 10px;color:var(--c-ink);}
.designC .C-step-body p{margin:0;font-size:14.5px;color:var(--c-ink-2);line-height:1.75;}
.designC .C-step-body p b{font-weight:700;color:var(--c-ink);background:var(--c-yellow);padding:0 4px;}
.designC .C-faq{margin:24px 0;border-top:3px solid var(--c-accent);}
.designC .C-faq-item{display:grid;grid-template-columns:60px 1fr;gap:16px;padding:18px 0;border-bottom:1px solid var(--c-rule-2);}
.designC .C-faq-idx{font-size:12px;color:var(--c-accent);font-weight:700;font-family:"IBM Plex Mono",monospace;}
.designC .C-faq-q{font-family:"Noto Sans KR",sans-serif;font-weight:700;font-size:15.5px;margin-bottom:8px;color:var(--c-ink);}
.designC .C-faq-a{font-size:14px;color:var(--c-ink-2);line-height:1.75;}
.designC .C-faq-a b{font-weight:700;color:var(--c-ink);background:var(--c-yellow);padding:0 4px;}
.designC .C-mistakes{margin:24px 0;}
.designC .C-mistake{padding:18px 20px;border:2px solid var(--c-accent);margin-bottom:10px;background:#fff;position:relative;}
.designC .C-mistake-tag{position:absolute;top:-10px;left:14px;background:var(--c-accent);color:#fff;padding:2px 10px;font-size:10px;font-weight:700;letter-spacing:0.1em;font-family:"IBM Plex Mono",monospace;}
.designC .C-mistake h3{font-family:"Noto Sans KR",sans-serif;font-size:15.5px;font-weight:700;margin:4px 0 8px;color:var(--c-ink);}
.designC .C-mistake p{margin:0;font-size:14px;color:var(--c-ink-2);line-height:1.75;}
.designC .C-midcta{margin:48px 0;font-family:"IBM Plex Mono",monospace;}
.designC .C-midcta-bar{color:var(--c-accent);font-size:10px;overflow:hidden;white-space:nowrap;}
.designC .C-midcta-grid{display:grid;grid-template-columns:100px 1fr auto;gap:20px;align-items:center;background:var(--c-paper);border-top:1px solid var(--c-accent);border-bottom:1px solid var(--c-accent);margin:4px 0;padding:20px;}
.designC .C-midcta-label{font-size:10px;font-weight:700;letter-spacing:0.14em;color:var(--c-ink);}
.designC .C-midcta-title{font-family:"Noto Sans KR",sans-serif;font-weight:800;font-size:22px;color:var(--c-ink);margin-bottom:6px;}
.designC .C-midcta-text{font-family:"Noto Sans KR",sans-serif;font-size:13.5px;color:var(--c-ink-2);line-height:1.7;}
.designC .C-midcta-btn{background:var(--c-accent);color:#fff!important;padding:14px 22px;font-weight:700;letter-spacing:0.05em;cursor:pointer;}
.designC .C-closing{margin-top:64px;padding-top:32px;border-top:3px solid var(--c-accent);}
.designC .C-closing-head{font-family:"IBM Plex Mono",monospace;font-size:10px;color:var(--c-ink-3);overflow:hidden;white-space:nowrap;margin-bottom:12px;}
.designC .C-closing-title{font-family:"IBM Plex Mono",monospace;font-size:13px;font-weight:700;letter-spacing:0.15em;color:var(--c-accent);margin-bottom:32px;}
.designC .C-closing-cta{background:var(--c-ink);color:#fff;padding:28px 30px;margin-bottom:28px;}
.designC .C-closing-cta-label{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--c-yellow);letter-spacing:0.18em;margin-bottom:18px;font-weight:700;}
.designC .C-closing-cta-list{display:grid;gap:10px;}
.designC .C-closing-cta-list a{display:flex;gap:12px;align-items:center;font-size:15px;cursor:pointer;padding:6px 0;border-bottom:1px dashed #444;color:#fff!important;}
.designC .C-closing-cta-list a .C-mono{color:var(--c-yellow);font-weight:700;}
.designC .C-related{margin-bottom:28px;}
.designC .C-related-label{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:0.15em;color:var(--c-ink-3);font-weight:700;margin-bottom:12px;}
.designC .C-related-table{width:100%;border-collapse:collapse;border:2px solid var(--c-accent);background:#fff;font-size:13.5px;}
.designC .C-related-table td{padding:10px 12px;border-bottom:1px dashed var(--c-rule-2);}
.designC .C-related-table tr:last-child td{border-bottom:0;}
.designC .C-related-tag{background:var(--c-paper);color:var(--c-accent);font-weight:700;width:60px;font-size:11px;font-family:"IBM Plex Mono",monospace;}
.designC .C-related-table tr{cursor:pointer;}
.designC .C-related-table tr:hover td{background:var(--c-accent-soft);}
.designC .C-related-table td:last-child{width:80px;color:var(--c-ink-3);font-size:11px;text-align:right;font-family:"IBM Plex Mono",monospace;}
.designC .C-closing-foot{font-size:10px;color:var(--c-ink-3);text-align:center;padding-top:20px;border-top:1px dashed var(--c-rule-2);letter-spacing:0.05em;font-family:"IBM Plex Mono",monospace;}
@media (max-width:1023px){
.designC .C-topbar{padding:10px 14px;font-size:11px;}
.designC .C-header{padding:24px 16px 28px;}
.designC .C-header-grid{grid-template-columns:90px 1fr;padding:12px;}
.designC .C-title-block{grid-template-columns:1fr;gap:12px;}
.designC .C-bigno{font-size:64px;margin-bottom:-3px;}
.designC .C-title{font-size:24px;line-height:1.35;}
.designC .C-shell{grid-template-columns:1fr;padding:0 16px 48px;}
.designC .C-rail{display:none;}
.designC .C-article{padding:24px 0;}
.designC .C-h2{font-size:22px;}
.designC .C-step{grid-template-columns:50px 1fr;gap:14px;}
.designC .C-step-n{width:44px;height:44px;font-size:24px;}
.designC .C-faq-item{grid-template-columns:48px 1fr;gap:12px;}
.designC .C-midcta-grid{grid-template-columns:1fr;gap:10px;padding:16px;}
}`;
}

module.exports = { esc, escJson, renderBlock, navyV4Css };

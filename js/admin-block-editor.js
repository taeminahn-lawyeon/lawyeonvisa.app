/* ============================================================
   admin-block-editor.js
   블록 텍스트 편집기 코어 (브라우저 + Node 공용)
   - parseBlocks(src): 편집 가능한 텍스트 블록을 원본 문자열에서 추출
   - applyEdits(src, blocks): 각 블록의 새 inner를 원위치에 정확히 스플라이스
   설계 원칙: 편집 대상 요소의 "inner"만 문자열 치환한다. 그 외 바이트는
   원본 그대로 유지 → 최소 diff, 구조/공백/__BASE__ 보존.
   ============================================================ */
(function (root) {
  'use strict';

  // 편집 대상: [정규식, 라벨]. inner 캡처는 그룹 마지막.
  // 각 요소는 같은 종류로 중첩되지 않는 콘텐츠 구조를 전제(비탐욕 매칭).
  var RULES = [
    { re: /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g, label: '제목(H1)' },
    { re: /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g, label: '소제목(H2)' },
    { re: /<h3(?:\s[^>]*)?>([\s\S]*?)<\/h3>/g, label: '소제목(H3)' },
    { re: /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g, label: '문단' },
    { re: /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g, label: '목록 항목' },
    { re: /<div class="q">([\s\S]*?)<\/div>/g, label: 'FAQ 질문' },
    { re: /<div class="a">([\s\S]*?)<\/div>/g, label: 'FAQ 답변' },
    { re: /<div class="ni-title">([\s\S]*?)<\/div>/g, label: '항목 제목' },
    { re: /<div class="ni-text">([\s\S]*?)<\/div>/g, label: '항목 내용' },
    { re: /<div class="tbl-cap">([\s\S]*?)<\/div>/g, label: '표 제목' },
    { re: /<div class="sec-title">([\s\S]*?)<\/div>/g, label: '섹션 제목' },
    { re: /<div class="ins-hero-kicker">([\s\S]*?)<\/div>/g, label: '상단 라벨' }
  ];

  // inner에 이 패턴이 있으면 "복잡" 블록 → 읽기전용(링크/이미지/중첩구조 보호)
  var COMPLEX = /<a\b|<img\b|<span\b|<div\b|<table\b|<ul\b|<ol\b|<figure\b|<iframe\b|__BASE__/i;

  function parseBlocks(src) {
    var found = [];
    RULES.forEach(function (rule) {
      var re = new RegExp(rule.re.source, 'g');
      var m;
      while ((m = re.exec(src)) !== null) {
        var innerStart = m.index + m[0].indexOf(m[1], (m[0].length - m[1].length - 1) > 0 ? 0 : 0);
        // 안전하게 inner의 실제 위치 계산: 여는 태그 끝 다음부터
        var openEnd = m.index + m[0].indexOf('>') + 1;
        var inner = m[1];
        var start = openEnd;
        var end = openEnd + inner.length;
        found.push({ label: rule.label, start: start, end: end, inner: inner });
      }
    });
    // 시작 위치로 정렬 + 겹침 제거(먼저 온 것을 유지)
    found.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
    var out = [];
    var lastEnd = -1;
    found.forEach(function (b) {
      if (b.start < lastEnd) return; // 앞 블록과 겹치면 스킵
      var trimmed = b.inner.replace(/^\s+|\s+$/g, '');
      if (trimmed === '') return;            // 빈 블록 스킵
      b.editable = !COMPLEX.test(b.inner);
      b.id = out.length;
      out.push(b);
      lastEnd = b.end;
    });
    return out;
  }

  // edits: { [block.id]: newInnerString }. 지정 안 된 블록은 원본 유지.
  function applyEdits(src, blocks, edits) {
    var pieces = [];
    var cursor = 0;
    // blocks는 parseBlocks 순서(=start 오름차순)라고 가정
    var sorted = blocks.slice().sort(function (a, b) { return a.start - b.start; });
    sorted.forEach(function (b) {
      var newInner = edits && Object.prototype.hasOwnProperty.call(edits, b.id) ? edits[b.id] : b.inner;
      pieces.push(src.slice(cursor, b.start));
      pieces.push(newInner);
      cursor = b.end;
    });
    pieces.push(src.slice(cursor));
    return pieces.join('');
  }

  // contenteditable innerHTML을 안전한 부분집합(b/strong/i/em/br + 텍스트)으로 정리
  function sanitizeInner(html) {
    if (typeof document === 'undefined') return html; // Node 경로에서는 그대로
    var tpl = document.createElement('div');
    tpl.innerHTML = html;
    (function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (n) {
        if (n.nodeType === 3) return; // text
        if (n.nodeType === 1) {
          var tag = n.tagName.toLowerCase();
          if (tag === 'strong') tag = 'b';
          if (tag === 'em') tag = 'i';
          if (['b', 'i', 'br'].indexOf(tag) >= 0) {
            walk(n);
            // strong/em → b/i 정규화
            if (n.tagName.toLowerCase() !== tag && tag !== 'br') {
              var repl = document.createElement(tag);
              while (n.firstChild) repl.appendChild(n.firstChild);
              n.parentNode.replaceChild(repl, n);
            }
          } else {
            // 허용 안 되는 태그는 벗겨서 텍스트/자식만 남김
            walk(n);
            while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n);
            n.parentNode.removeChild(n);
          }
        }
      });
    })(tpl);
    return tpl.innerHTML
      .replace(/&nbsp;/g, ' ')
      .replace(/<br\s*\/?>/g, '<br>');
  }

  var api = { parseBlocks: parseBlocks, applyEdits: applyEdits, sanitizeInner: sanitizeInner, COMPLEX: COMPLEX };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AdminBlockEditor = api;
})(typeof self !== 'undefined' ? self : this);

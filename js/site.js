/* ============================================================
   site.js — shared front-end behavior for built pages.
   - Article extras: copy protection, consultation CTA bands,
     share button, related-attorney cards.
   - Mobile hamburger menu.
   Presentation only: no auth, no Supabase. Built pages that
   actually submit a form (pre-consultation, booking, corporate
   advisory) load supabase-client.js separately — see the
   `supabase` flag in scripts/build-site.js PAGES.
   ============================================================ */
(function () {
  var isKo = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('ko') === 0;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Build a consultation CTA band (online + in-person) for article pages.
  function ctaBand() {
    var w = document.createElement('div');
    w.className = 'cta-band';
    var t = document.createElement('div');
    t.className = 'cta-text';
    t.textContent = isKo ? '상담이 필요하신가요? 온라인 또는 방문으로 신청하세요.'
                         : 'Need advice? Request a consultation — online or in person.';
    var a1 = document.createElement('a');
    a1.className = 'btn btn-primary';
    a1.href = 'consultation';
    a1.textContent = isKo ? '사전상담 신청' : 'Apply for pre-consultation';
    var a2 = document.createElement('a');
    a2.className = 'btn btn-line';
    a2.href = 'booking';
    a2.textContent = isKo ? '방문 상담 예약' : 'Book a visit';
    w.appendChild(t); w.appendChild(a1); w.appendChild(a2);
    return w;
  }

  ready(function () {
    // 0.0) 기사(글) 페이지 무단 복사·드래그 방지 (SEO 영향 없음: 텍스트는 DOM에 그대로 존재).
    //      CSS user-select:none 와 함께 복사/잘라내기/우클릭/드래그를 차단. 입력 요소는 예외.
    (function protectArticle() {
      if (!document.querySelector('.art-layout, article.body')) return;
      ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach(function (ev) {
        document.addEventListener(ev, function (e) {
          var t = e.target;
          if (t && t.closest && t.closest('input, textarea, [contenteditable="true"]')) return;
          e.preventDefault();
        });
      });
    })();

    // 0) Insert consultation CTAs (top / middle / bottom) into article-design pages.
    (function injectCtas() {
      var body = document.querySelector('.art-layout article.body') || document.querySelector('article.body');
      if (!body || body.hasAttribute('data-no-cta')) return;
      body.appendChild(ctaBand()); // bottom
      var h2s = body.querySelectorAll(':scope > h2');
      if (h2s.length >= 3) {
        body.insertBefore(ctaBand(), h2s[Math.floor(h2s.length / 2)]); // middle
      }
      body.insertBefore(ctaBand(), body.firstChild); // top (just under the title)
    })();

    // 0.6) Article extras: a Share button (in the head) and a "Related
    //      Attorneys" card row (at the end of the body). Injected once so
    //      every article-design page gets them consistently.
    (function articleExtras() {
      var head = document.querySelector('.art-head');
      var body = document.querySelector('.art-layout article.body') || document.querySelector('article.body');
      if (!head && !body) return;

      // --- Share button ---
      if (head && !head.querySelector('.art-share')) {
        var canon = document.querySelector('link[rel="canonical"]');
        var shareUrl = (canon && canon.href) || location.href;
        var h1 = document.querySelector('.art-head h1');
        var shareTitle = (h1 && h1.textContent) || document.title;

        var bar = document.createElement('div');
        bar.className = 'art-share';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'art-share-btn';
        btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>' +
          '<span>' + (isKo ? '공유하기' : 'Share') + '</span>';
        bar.appendChild(btn);
        head.appendChild(bar);

        var toastEl = null;
        function toast(msg) {
          if (toastEl) { toastEl.remove(); toastEl = null; }
          var el = document.createElement('div');
          el.className = 'share-toast';
          el.textContent = msg;
          document.body.appendChild(el);
          toastEl = el;
          requestAnimationFrame(function () { el.classList.add('show'); });
          setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { if (el.parentNode) el.remove(); }, 250);
          }, 1800);
        }
        function copyLink() {
          var done = isKo ? '링크가 복사되었습니다' : 'Link copied';
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(function () { toast(done); }).catch(function () { toast(shareUrl); });
          } else {
            var ta = document.createElement('textarea');
            ta.value = shareUrl;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); toast(done); } catch (_) { toast(shareUrl); }
            ta.remove();
          }
        }
        btn.addEventListener('click', function () {
          if (navigator.share) {
            navigator.share({ title: shareTitle, url: shareUrl }).catch(function () {});
          } else {
            copyLink();
          }
        });
      }

      // --- Related attorneys (under the TOC on desktop, end of body on mobile) ---
      if (body && !document.querySelector('.art-members')) {
        var base = /\/ko\//.test(location.pathname) ? '../' : '';
        var members = [
          { name: isKo ? '민준우' : 'J.W. Min', title: isKo ? '대표변호사' : 'Managing Partner, Lawyer', email: 'jwmin@lawyeon.com', img: 'min.png' },
          { name: isKo ? '남도현' : 'D.H. Nam', title: isKo ? '파트너 변호사' : 'Partner, Lawyer', email: 'dhnam@lawyeon.com', img: 'nam.png' },
          { name: isKo ? '김승철' : 'S.C. Kim', title: isKo ? '파트너 변호사' : 'Partner, Lawyer', email: 'schkim@lawyeon.com', img: 'kim.png' }
        ];
        var sec = document.createElement('section');
        sec.className = 'art-members';
        var h = document.createElement('h4');
        h.textContent = isKo ? '관련 구성원' : 'Related Attorneys';
        sec.appendChild(h);
        var grid = document.createElement('div');
        grid.className = 'member-grid';
        members.forEach(function (m) {
          var card = document.createElement('div');
          card.className = 'member-card';
          var ph = document.createElement('img');
          ph.className = 'member-photo';
          ph.src = base + 'images/attorneys/' + m.img;
          ph.alt = m.name;
          ph.loading = 'lazy';
          var info = document.createElement('div');
          info.className = 'member-info';
          var nm = document.createElement('div');
          nm.className = 'member-name';
          nm.textContent = m.name;
          var tt = document.createElement('div');
          tt.className = 'member-title';
          tt.textContent = m.title;
          var mail = document.createElement('a');
          mail.className = 'member-mail';
          mail.href = 'mailto:' + m.email;
          mail.textContent = m.email;
          info.appendChild(nm);
          info.appendChild(tt);
          info.appendChild(mail);
          card.appendChild(ph);
          card.appendChild(info);
          grid.appendChild(card);
        });
        sec.appendChild(grid);

        // Desktop: place under the TOC in the sidebar. Mobile (TOC hidden): end of body.
        var toc = document.querySelector('.art-layout .toc');
        var mq = window.matchMedia('(max-width:900px)');
        function placeMembers() {
          var target = (mq.matches || !toc) ? body : toc;
          if (sec.parentNode !== target) target.appendChild(sec);
        }
        placeMembers();
        try { mq.addEventListener('change', placeMembers); }
        catch (_) { try { mq.addListener(placeMembers); } catch (__) {} }
      }
    })();

    // 0.5) Mobile hamburger menu — clones the desktop nav items.
    (function buildMobileNav() {
      var header = document.querySelector('.header');
      var content = header && header.querySelector('.header-content');
      var actions = content && content.querySelector('.header-actions');
      if (!header || !content || !actions || content.querySelector('.nav-toggle')) return;

      var toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', isKo ? '메뉴' : 'Menu');
      toggle.innerHTML = '<span></span>';
      content.appendChild(toggle);

      var menu = document.createElement('nav');
      menu.className = 'mobile-menu';
      var inner = document.createElement('div');
      inner.className = 'mm-inner';
      menu.appendChild(inner);

      actions.querySelectorAll('.nav-links a').forEach(function (a) {
        inner.appendChild(a.cloneNode(true));
      });
      // (EN/한국어 토글은 모바일에서도 상단 바에 상시 노출되므로 메뉴에 넣지 않음)
      var btn = actions.querySelector('.btn-primary');
      if (btn) inner.appendChild(btn.cloneNode(true));
      header.appendChild(menu);

      function setOpen(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      toggle.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
      inner.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    })();
  });
})();

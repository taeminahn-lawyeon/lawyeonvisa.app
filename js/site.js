/* ============================================================
   site.js — shared front-end behavior for built pages.
   - Login-first gating: links marked [data-login-go] require a
     Google sign-in before navigating to the target page.
   - Auth-aware header: swaps the "Login" button to the user's
     account + a logout action when a Supabase session exists.
   - Degrades gracefully if Supabase isn't available.
   Depends on (optional): supabase-client.js globals
     checkSession(), signInWithGoogle(), signOut(), getCurrentUser()
   ============================================================ */
(function () {
  var isKo = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('ko') === 0;
  var T = isKo
    ? { account: '내 계정', logout: '로그아웃' }
    : { account: 'My Account', logout: 'Log out' };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Normalize a path/href to a comparable page key (drop /, /ko/, .html, query/hash).
  function pageKey(p) {
    return String(p || '').replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/(ko\/)?/, '').replace(/^\//, '')
      .split(/[?#]/)[0].replace(/\.html$/, '');
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
    a1.setAttribute('data-login-go', 'consultation'); // online thread requires sign-in
    a1.textContent = isKo ? '온라인 상담 신청' : 'Online consultation';
    var a2 = document.createElement('a');
    a2.className = 'btn btn-line';
    a2.href = 'booking'; // visit booking — no sign-in required
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

      // --- Related attorneys ---
      if (body && !body.querySelector('.art-members')) {
        var base = /\/ko\//.test(location.pathname) ? '../' : '';
        var members = [
          { name: isKo ? '민준우' : 'J.W. Min', title: isKo ? '대표변호사' : 'Managing Attorney', email: 'jwmin@lawyeon.com', img: 'min.png' },
          { name: isKo ? '남도현' : 'D.H. Nam', title: isKo ? '변호사' : 'Attorney', email: 'dhnam@lawyeon.com', img: 'nam.png' },
          { name: isKo ? '김승철' : 'S.C. Kim', title: isKo ? '변호사' : 'Attorney', email: 'schkim@lawyeon.com', img: 'kim.png' }
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
          var b = document.createElement('b');
          b.textContent = m.name;
          var sp = document.createElement('span');
          sp.textContent = m.title;
          nm.appendChild(b);
          nm.appendChild(sp);
          var mail = document.createElement('a');
          mail.className = 'member-mail';
          mail.href = 'mailto:' + m.email;
          mail.textContent = m.email;
          info.appendChild(nm);
          info.appendChild(mail);
          card.appendChild(ph);
          card.appendChild(info);
          grid.appendChild(card);
        });
        sec.appendChild(grid);
        body.appendChild(sec);
      }
    })();

    // 0.5) Mobile hamburger menu. Cloned nav items keep their attributes
    //      (incl. data-login-go), so the gating loop below binds them too.
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
      var mp = actions.querySelector('.nav-mypage');
      if (mp) inner.appendChild(mp.cloneNode(true));
      // (EN/한국어 토글은 모바일에서도 상단 바에 상시 노출되므로 메뉴에 넣지 않음)
      var btn = actions.querySelector('.btn-primary');
      if (btn) {
        var bclone = btn.cloneNode(true);
        bclone.addEventListener('click', function (e) {
          if (typeof signInWithGoogle === 'function') {
            e.preventDefault();
            try { signInWithGoogle(); } catch (_) {}
          }
        });
        inner.appendChild(bclone);
      }
      header.appendChild(menu);

      function setOpen(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      toggle.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
      inner.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    })();

    var hasAuth = (typeof checkSession === 'function' && typeof signInWithGoogle === 'function');

    // 1) Login-first gating for consultation/booking entry buttons.
    //    Not signed in -> remember the target, start Google sign-in, then
    //    resume to the target once back. Signed in -> navigate normally.
    if (hasAuth) {
      document.querySelectorAll('[data-login-go]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          var target = el.getAttribute('data-login-go') || el.getAttribute('href');
          e.preventDefault();
          Promise.resolve(checkSession()).then(function (s) {
            var u = s && (s.user || s);
            if (u && u.id) { window.location.href = target; return; }
            // 로그인 후 목적지로 직행하도록 절대 URL을 redirectTo 로 전달(+ 폴백용 저장).
            var abs = target;
            try { abs = new URL(target, window.location.href).href; } catch (_) {}
            try { localStorage.setItem('postLoginRedirect', target); } catch (_) {}
            try { signInWithGoogle(abs); } catch (_) { window.location.href = target; }
          }).catch(function () { window.location.href = target; });
        });
      });
    }

    var loginBtn = document.querySelector('.header-actions .btn-primary');
    if (loginBtn) {
      // Not-logged-in default: clicking Login starts Google OAuth (if available).
      loginBtn.addEventListener('click', function (e) {
        if (typeof signInWithGoogle === 'function') {
          e.preventDefault();
          try { signInWithGoogle(); } catch (_) {}
        }
        // else: fall through to its href (consultation)
      });
    }

    if (typeof checkSession !== 'function') return;

    Promise.resolve()
      .then(function () { return checkSession(); })
      .then(function (session) {
        var user = session && (session.user || session);
        if (!user || !user.id) return; // stay as Login

        // Honor a pending post-login redirect set by a [data-login-go] button.
        try {
          var redir = localStorage.getItem('postLoginRedirect');
          if (redir) {
            localStorage.removeItem('postLoginRedirect');
            if (pageKey(location.pathname) !== pageKey(redir)) {
              location.href = redir;
              return;
            }
          }
        } catch (_) {}

        if (!loginBtn) return;
        var meta = user.user_metadata || {};
        var name = meta.name || meta.full_name || (user.email ? user.email.split('@')[0] : T.account);

        // Swap login button -> account
        var clone = loginBtn.cloneNode(false); // drop the OAuth click listener
        clone.textContent = name;
        clone.setAttribute('href', 'mypage'); // logged-in: name links to My Page
        loginBtn.parentNode.replaceChild(clone, loginBtn);

        // Add a logout action
        var lo = document.createElement('a');
        lo.className = 'btn btn-line';
        lo.style.marginLeft = '8px';
        lo.href = '#';
        lo.textContent = T.logout;
        lo.addEventListener('click', function (e) {
          e.preventDefault();
          if (typeof signOut === 'function') {
            Promise.resolve(signOut()).then(function () { location.reload(); });
          }
        });
        clone.parentNode.appendChild(lo);
      })
      .catch(function () { /* keep default Login */ });
  });
})();

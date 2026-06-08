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

  ready(function () {
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
            try { localStorage.setItem('postLoginRedirect', target); } catch (_) {}
            try { signInWithGoogle(); } catch (_) { window.location.href = target; }
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
        clone.setAttribute('href', 'consultation'); // TODO: dedicated account dashboard
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

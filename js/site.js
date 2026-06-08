/* ============================================================
   site.js — shared front-end behavior for built pages.
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

  ready(function () {
    var loginBtn = document.querySelector('.header-actions .btn-primary');
    if (!loginBtn) return;

    // Not-logged-in default: clicking Login starts Google OAuth (if available).
    loginBtn.addEventListener('click', function (e) {
      if (typeof signInWithGoogle === 'function') {
        e.preventDefault();
        try { signInWithGoogle(); } catch (_) {}
      }
      // else: fall through to its href (consultation-request)
    });

    if (typeof checkSession !== 'function') return;

    Promise.resolve()
      .then(function () { return checkSession(); })
      .then(function (session) {
        var user = session && (session.user || session);
        if (!user || !user.id) return; // stay as Login
        var meta = user.user_metadata || {};
        var name = meta.name || meta.full_name || (user.email ? user.email.split('@')[0] : T.account);

        // Swap login button -> account
        var clone = loginBtn.cloneNode(false); // drop the OAuth click listener
        clone.textContent = name;
        clone.setAttribute('href', 'consultation-request'); // TODO: account dashboard
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

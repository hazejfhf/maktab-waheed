try { if (localStorage.getItem('site_theme') === 'dark') (document.body || document.documentElement).classList.add('dark-mode'); } catch (e) {}
// nav.js — الناف الموحد (ستايل أمازون) لكل الصفحات: ديسكتوب + موبايل
(function () {
  'use strict';
  var page = (location.pathname.split('/').pop() || 'index.html');
  function on(f) { return page === f ? ' on' : ''; }
  var hasSearch = (page === 'index.html' || page === 'shop.html');
  var old = document.querySelector('header'); if (old) old.remove();
  var oldM = document.getElementById('m-nav'); if (oldM) oldM.remove();

  var top = document.createElement('header'); top.className = 'az-header';
  top.innerHTML =
    '<div class="az-top">' +
      '<a href="index.html" class="az-brand"><img src="logo.png" alt="" onerror="this.style.display=\'none\'"><span id="site-name-display">مكتب رحيم</span></a>' +
      (hasSearch ? '<form class="az-search" id="az-search-form" role="search" autocomplete="off">' +
        '<input id="az-search-input" type="search" maxlength="80" placeholder="ابحث في المتجر" aria-label="بحث">' +
        '<button type="submit" aria-label="بحث">🔍</button>' +
      '</form>' : '<span class="az-spacer"></span>') +
      '<a href="login.html" class="az-acc" id="nav-login-btn">تسجيل الدخول</a>' +
      '<a href="cart.html" class="az-cart" aria-label="السلة">🛒<span id="cart-count" class="cart-badge-nav">0</span></a>' +
    '</div>' +
    '<nav class="az-links" aria-label="التنقل">' +
      '<a href="index.html" class="' + on('index.html').trim() + '">الرئيسية</a>' +
      '<a href="shop.html" class="' + on('shop.html').trim() + '">المعرض</a>' +
      '<a href="gifts.html" class="' + on('gifts.html').trim() + '">الهدايا وعجلة الحظ</a>' +
      '<a href="track.html" class="' + on('track.html').trim() + '">تتبع الطلب</a>' +
      '<a href="profile.html" class="' + on('profile.html').trim() + '">حسابي</a>' +
      '<a href="admin.html" class="' + on('admin.html').trim() + '">الدعم</a>' +
      '<button type="button" class="az-more" data-more aria-haspopup="dialog">☰ المزيد</button>' +
    '</nav>';
  document.body.prepend(top);

  // شريط سفلي للموبايل زي تطبيق أمازون
  var bar = document.createElement('nav'); bar.className = 'az-tabbar'; bar.setAttribute('aria-label', 'التنقل السفلي');
  bar.innerHTML =
    '<a href="index.html" class="' + on('index.html').trim() + '"><i>🏠</i>الرئيسية</a>' +
    '<a href="profile.html" class="' + on('profile.html').trim() + '"><i id="m-av">👤</i>حسابك</a>' +
    '<a href="cart.html" class="' + on('cart.html').trim() + '"><i>🛒<b id="m-cart-bd" hidden>0</b></i>العربة</a>' +
    '<a href="shop.html" class="' + on('shop.html').trim() + '"><i>👕</i>المعرض</a>' +
    '<button type="button" data-more aria-haspopup="dialog"><i>☰</i>المزيد</button>';
  document.body.appendChild(bar);

  // قائمة "المزيد": كل صفحات الموقع في مكان واحد
  function curUser() { try { var u = JSON.parse(localStorage.getItem('current_user')); return (u && u.name) ? u : null; } catch (e) { return null; } }
  function pagesFor(loggedIn) {
    var p = [
      ['index.html', '🏠', 'الرئيسية'], ['shop.html', '👕', 'المعرض'], ['gifts.html', '🎁', 'الهدايا وعجلة الحظ'],
      ['track.html', '📦', 'تتبع الطلب'], ['cart.html', '🛒', 'السلة'], ['profile.html', '👤', 'حسابي']
    ];
    if (!loggedIn) { p.push(['login.html', '🔑', 'تسجيل الدخول'], ['login.html?mode=register', '✨', 'إنشاء حساب']); }
    p.push(['admin.html', '🛠️', 'الدعم']);
    return p;
  }
  function gridHtml(loggedIn) {
    return pagesFor(loggedIn).map(function (p) {
      return '<a href="' + p[0] + '" class="' + (p[0] === page ? 'on' : '') + '"><i>' + p[1] + '</i><span>' + p[2] + '</span></a>';
    }).join('') + (loggedIn ? '<a href="#" data-logout><i>🚪</i><span>تسجيل الخروج</span></a>' : '');
  }
  var sheet = document.createElement('div'); sheet.className = 'mz'; sheet.hidden = true;
  sheet.innerHTML = '<div class="mz-bg" data-x></div><div class="mz-box" role="dialog" aria-modal="true" aria-label="كل الصفحات">' +
    '<div class="mz-head"><b>كل الصفحات</b><button type="button" class="mz-close" data-x aria-label="إغلاق">×</button></div>' +
    '<div class="mz-grid" id="mz-grid"></div></div>';
  document.body.appendChild(sheet);
  function openMore() { sheet.hidden = false; document.documentElement.classList.add('mz-lock'); }
  function closeMore() { sheet.hidden = true; document.documentElement.classList.remove('mz-lock'); }
  document.addEventListener('click', function (e) {
    var lo = e.target.closest('[data-logout]');
    if (lo) {
      e.preventDefault();
      var go = function () { location.href = 'index.html'; };
      if (window.FBAuth && window.FBAuth.logout) window.FBAuth.logout().then(go, go);
      else { try { localStorage.removeItem('current_user'); } catch (x) {} go(); }
      return;
    }
    if (e.target.closest('[data-more]')) openMore(); else if (e.target.closest('[data-x]')) closeMore();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMore(); });

  // البحث: لو في صندوق بحث بالصفحة نستخدمه، وإلا نروح للمعرض
  var form = document.getElementById('az-search-form'), inp = document.getElementById('az-search-input');
  if (form && inp) {
    var q0 = new URLSearchParams(location.search).get('q'); if (q0) inp.value = q0.slice(0, 80);
    var doSearch = function (v) { return typeof window.runStoreSearch === 'function' && runStoreSearch(v); };
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var v = inp.value.trim().slice(0, 80);
      if (!doSearch(v)) location.href = 'shop.html?q=' + encodeURIComponent(v);
    });
    inp.addEventListener('input', function () { doSearch(inp.value.slice(0, 80)); });
    if (q0) window.addEventListener('load', function () { setTimeout(function () { doSearch(q0.slice(0, 80)); }, 400); });
  }

  function sync() {
    var c = document.getElementById('cart-count'), b = document.getElementById('m-cart-bd');
    var n = 0; try { n = (JSON.parse(localStorage.getItem('global_store_cart')) || []).reduce(function (s, i) { return s + (i.qty || 1); }, 0); } catch (e) {}
    if (c) c.textContent = n; if (b) { b.textContent = n; b.hidden = !n; }
    var u = null; try { u = JSON.parse(localStorage.getItem('current_user')); } catch (e) {}
    var lb = document.getElementById('nav-login-btn');
    if (lb) {
      if (u && u.name) { lb.textContent = 'أهلاً، ' + String(u.name).split(' ')[0]; lb.href = 'profile.html'; }
      else { lb.textContent = 'تسجيل الدخول'; lb.href = 'login.html'; }
    }
    var st = u && u.name ? '1' : '0', g = document.getElementById('mz-grid');
    if (g && g.getAttribute('data-st') !== st) { g.innerHTML = gridHtml(st === '1'); g.setAttribute('data-st', st); }
  }
  sync(); setInterval(sync, 1200);
})();

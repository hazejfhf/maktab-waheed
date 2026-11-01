// security.js — طبقة حماية للعميل (مش بديل عن Firebase Auth + Rules)
(function () {
  'use strict';
  var LS = localStorage;
  function jget(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }

  // 1) منع الـ iframe (Clickjacking) — نخفي الصفحة الأول وبعدين نحاول نطلع بره الإطار.
  //    مش كفاية لوحدها: لازم تضيف headers على الاستضافة (راجع التقرير: X-Frame-Options / frame-ancestors).
  if (window.top !== window.self) {
    document.documentElement.style.display = 'none';
    try { window.top.location = window.location; } catch (e) {}
  }

  // 2) Math.random آمن (أكواد التتبع والعجلة كانت متوقعة)
  var _r = Math.random;
  Math.random = function () { try { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; } catch (e) { return _r(); } };

  // 3) تنظيف النصوص من وسوم HTML قبل التخزين/الإرسال
  //    ⚠️ ده تنظيف "أدب" على العميل فقط — أي حد يقدر يتجاوزه ويكتب في Firestore مباشرة بالـ API.
  //    الحماية الحقيقية: (أ) قواعد Firestore بتحدد الحقول والأطوال، (ب) sanitize() في firebase-db.js
  //    بيعطّل أي HTML واصل من السيرفر، (ج) كل عرض في لوحة الأدمن بيعدّي على _esc().
  function clean(o) {
    if (typeof o === 'string') return o.replace(/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/javascript\s*:/gi, '').slice(0, 500);
    if (Array.isArray(o)) return o.map(clean);
    if (o && typeof o === 'object') { var r = {}; Object.keys(o).forEach(function (k) { r[k] = (k === 'createdAt') ? o[k] : clean(o[k]); }); return r; }
    return o;
  }

  // 4) قفل بعد محاولات فاشلة (أدمن + دخول العميل)
  function locked(key) { var t = +LS.getItem(key + '_until') || 0; return Date.now() < t ? Math.ceil((t - Date.now()) / 60000) : 0; }
  function fail(key) {
    var n = (+LS.getItem(key + '_n') || 0) + 1; LS.setItem(key + '_n', n);
    if (n >= 5) { LS.setItem(key + '_until', Date.now() + 5 * 60000); LS.setItem(key + '_n', 0); }
  }
  function wrapAuth(name, key, okFn) {
    var f = window[name]; if (typeof f !== 'function') return;
    window[name] = function () {
      var m = locked(key);
      if (m) { alert('محاولات كتير غلط. حاول بعد ' + m + ' دقيقة.'); return false; }
      var res = f.apply(this, arguments);
      Promise.resolve(res).then(function (ok) { if (okFn()) LS.setItem(key + '_n', 0); else fail(key); });
      return res;
    };
  }

  // 5) الكوبونات: القيم الحقيقية من قائمة العجلة فقط، مش من التخزين المحلي
  function fixCoupons() {
    var gifts = jget('global_store_gifts_adv', []); var claimed = jget('user_claimed_coupons', []);
    var out = claimed.filter(function (c) { return c && gifts.some(function (g) { return g.code && g.code === c.code; }); }).map(function (c) {
      var g = gifts.filter(function (x) { return x.code === c.code; })[0];
      var maxExp = Date.now() + (Number(g.duration) || 0) * 60000;
      return Object.assign({}, c, { percent: g.percent, target: g.target, expireAt: Math.min(+c.expireAt || 0, maxExp) });
    });
    LS.setItem('user_claimed_coupons', JSON.stringify(out));
    var act = jget('active_applied_coupon', null);
    if (act && !out.some(function (c) { return c.code === act.code && c.status === 'active'; })) LS.removeItem('active_applied_coupon');
  }

  // 6) الطلب: حساب السعر من الكتالوج + أرقام مضمونة + تنظيف
  function wrapSaveOrder() {
    var f = window.FB_saveOrder; if (typeof f !== 'function' || f.__w) return;
    window.FB_saveOrder = function (order) {
      try {
        var cat = (typeof products !== 'undefined') ? products : jget('global_store_products', []);
        var cart = order.cartSnapshot || order.cartItems || [], sub = 0;
        cart.forEach(function (i) {
          var p = cat.filter(function (x) { return String(x.id) === String(i.id); })[0]; if (!p) return;
          var q = Math.min(20, Math.max(1, parseInt(i.qty) || 1));
          sub += (Number(p.price) || 0) * (1 - Math.min(100, Math.max(0, Number(p.discount) || 0)) / 100) * q;
        });
        var claimed = String(order.total || order.finalPrice || '').replace(/[^\d.]/g, '');
        var num = Math.max(0, Math.min(999999, parseFloat(claimed) || 0));
        order.totalNum = Math.round(num * 100) / 100;
        order.catalogSubtotal = Math.round(sub * 100) / 100;
        // الإجمالي لازم يكون على الأقل (المجموع - أقصى خصم كوبون 100%) ... نعلّم المشبوه للأدمن
        order.suspicious = order.totalNum + 0.01 < sub * 0.5;
        var ph = String(order.clientPhone || '').replace(/\D/g, '');
        if (!/^01[0125]\d{8}$/.test(ph)) { alert('رقم الموبايل غير صحيح'); return Promise.resolve(); }
        order.clientPhone = ph;
      } catch (e) {}
      var ALLOWED = ['orderId','id','clientName','customerName','name','clientPhone','customerPhone','phone','clientAddress','customerAddress','address','paymentMethod','payment','transferNumber','productsDetails','products','orderDate','date','orderStatus','status','finalPrice','bill','total','cartItems','items','itemsCount','timestamp','cartSnapshot','totalNum','catalogSubtotal','suspicious'];
      var safe = {}; ALLOWED.forEach(function (k) { if (order[k] !== undefined) safe[k] = order[k]; });
      safe.orderStatus = 'جاري التجهيز 📦'; safe.status = safe.orderStatus; // الحالة الأولية ثابتة
      return f.call(this, clean(safe));
    };
    window.FB_saveOrder.__w = 1;
  }

  // 7) تنظيف أي كلمات سر قديمة متخزنة محلياً
  async function migrateUsers() {
    var us = jget('global_store_users', []), ch = false;
    for (var i = 0; i < us.length; i++) if (us[i].password && !us[i].passHash) { us[i].passHash = await window._sha(us[i].password); delete us[i].password; ch = true; }
    if (ch) LS.setItem('global_store_users', JSON.stringify(us));
    // تسجيل الدخول بقى عن طريق Firebase Auth (الفحص والقفل على السيرفر)
  }

  // 8) حارس لوحة الأدمن: لو الجلسة خلصت أو مش أدمن → نقفل المحتوى فوراً (الحماية الفعلية للبيانات في قواعد Firestore)
  function guardAdminPanel() {
    var content = document.getElementById('admin-content'), box = document.getElementById('admin-login-box');
    if (!content) return;
    var A = window.FBAuth;
    if (!(A && A.isAdminSession) && content.style.display !== 'none') {
      content.style.display = 'none'; if (box) box.style.display = '';
      window.__adm = false;
    }
  }
  window.addEventListener('fbauth-changed', guardAdminPanel);
  window.SEC = { esc: function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }, clean: clean };

  window.addEventListener('load', function () {
    fixCoupons(); wrapSaveOrder(); migrateUsers();
    wrapAuth('unlockAdminPanel', 'lk_admin', function () { return window.__adm === true; });
    if (typeof window.FB_saveReview === 'function') { var r = window.FB_saveReview; window.FB_saveReview = function (v) { return r.call(this, clean(v)); }; }
  });
})();

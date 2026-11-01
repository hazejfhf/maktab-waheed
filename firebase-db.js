// =========================================================================
// firebase-db.js — ربط المتجر بـ Firebase Firestore
// =========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore, collection, doc,
    addDoc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, onSnapshot,
    query, orderBy, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, signOut, updatePassword,
    EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ─── إعدادات Firebase ────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBuyZMu5JmdF7Bqo8QYT0d3reSdt_HUgz0",
    authDomain: "office-raheem.firebaseapp.com",
    projectId: "office-raheem",
    storageBucket: "office-raheem.firebasestorage.app",
    messagingSenderId: "150997369947",
    appId: "1:150997369947:web:9c3126926b6f92b6162b7e"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// ─── Collections ─────────────────────────────────────────────────
const ORDERS_COL   = "orders";
const PRODUCTS_COL = "products";
const USERS_COL    = "users";
const REVIEWS_COL  = "reviews";
const CONFIG_COL   = "config";
const ARCHIVE_COL  = "archive";

// ─── تنظيف البيانات القادمة من Firestore (حماية من Stored XSS) ───────────
// الطلبات/التقييمات/المستخدمين بيكتبها زوّار غير موثوقين، وبتتعرض في لوحة الأدمن عن طريق innerHTML.
// أي كود HTML محقون بيتحول لنص عادي قبل ما يدخل في الصفحة أو في localStorage.
const _ENT = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function sanitize(o, strict) {
    if (typeof o === 'string') return o.replace(strict ? /[<>"']/g : /[<>]/g, c => _ENT[c]);
    if (Array.isArray(o)) return o.map(x => sanitize(x, strict));
    if (o && typeof o === 'object' && Object.getPrototypeOf(o) === Object.prototype) {
        const r = {}; for (const k of Object.keys(o)) r[k] = sanitize(o[k], strict); return r;
    }
    return o; // أرقام / Timestamp / null
}
window.__sanitize = sanitize;

// =========================================================================
// ── الطلبات ──────────────────────────────────────────────────────────────
// =========================================================================

/** حفظ طلب جديد في Firestore */
window.FB_saveOrder = async function(order) {
    try {
        order.createdAt = serverTimestamp();
        await setDoc(doc(db, ORDERS_COL, order.orderId), order);
        console.log("✅ تم حفظ الطلب في Firebase:", order.orderId);
    } catch (e) {
        console.error("❌ خطأ في حفظ الطلب:", e);
    }
};

/** تحديث حالة طلب */
window.FB_updateOrderStatus = async function(orderId, newStatus) {
    try {
        const ref = doc(db, ORDERS_COL, orderId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            // قد يكون في archive
            const aref = doc(db, ARCHIVE_COL, orderId);
            await updateDoc(aref, { orderStatus: newStatus, status: newStatus });
        } else {
            await updateDoc(ref, { orderStatus: newStatus, status: newStatus });
        }
        console.log("✅ تم تحديث الحالة:", newStatus);
    } catch (e) {
        console.error("❌ خطأ في تحديث الحالة:", e);
    }
};

/** أرشفة طلب (نقله من orders إلى archive) */
window.FB_archiveOrder = async function(orderId) {
    try {
        const ref  = doc(db, ORDERS_COL, orderId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data();
        data.archivedAt        = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
        data.archivedTimestamp = Date.now();
        await setDoc(doc(db, ARCHIVE_COL, orderId), data);
        await deleteDoc(ref);
        console.log("✅ تمت أرشفة الطلب:", orderId);
    } catch (e) {
        console.error("❌ خطأ في الأرشفة:", e);
    }
};

/** تحميل كل الطلبات (مرة واحدة) */
window.FB_loadOrders = async function() {
    try {
        const q    = query(collection(db, ORDERS_COL), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => sanitize(d.data(), true));
    } catch (e) {
        console.error("❌ خطأ في تحميل الطلبات:", e);
        return [];
    }
};

/** مراقبة الطلبات في الريالتايم (للأدمن) */
window.FB_watchOrders = function(callback) {
    const q = query(collection(db, ORDERS_COL), orderBy("timestamp", "desc"));
    return onSnapshot(q, snap => {
        const list = snap.docs.map(d => sanitize(d.data(), true));
        callback(list);
    }, e => console.error("❌ خطأ في المراقبة:", e));
};

/** مراقبة الأرشيف في الريالتايم */
window.FB_watchArchive = function(callback) {
    const q = query(collection(db, ARCHIVE_COL), orderBy("archivedTimestamp", "desc"));
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => sanitize(d.data(), true)));
    });
};

// =========================================================================
// ── المنتجات ─────────────────────────────────────────────────────────────
// =========================================================================

/** حفظ أو تحديث منتج */
window.FB_saveProduct = async function(product) {
    try {
        await setDoc(doc(db, PRODUCTS_COL, String(product.id)), product);
        console.log("✅ تم حفظ المنتج:", product.id);
    } catch (e) {
        console.error("❌ خطأ في حفظ المنتج:", e);
    }
};

/** حذف منتج */
window.FB_deleteProduct = async function(productId) {
    try {
        await deleteDoc(doc(db, PRODUCTS_COL, String(productId)));
        console.log("✅ تم حذف المنتج:", productId);
    } catch (e) {
        console.error("❌ خطأ في حذف المنتج:", e);
    }
};

/** تحميل المنتجات */
window.FB_loadProducts = async function() {
    try {
        const snap = await getDocs(collection(db, PRODUCTS_COL));
        return snap.docs.map(d => d.data());
    } catch (e) {
        console.error("❌ خطأ في تحميل المنتجات:", e);
        return [];
    }
};

/** مراقبة المنتجات في الريالتايم */
window.FB_watchProducts = function(callback) {
    return onSnapshot(collection(db, PRODUCTS_COL), snap => {
        callback(snap.docs.map(d => d.data()));
    });
};

// =========================================================================
// ── المستخدمين ───────────────────────────────────────────────────────────
// =========================================================================

/** حفظ أو تحديث مستخدم */
window.FB_saveUser = async function(user) {
    try {
        const safeUser = { ...user };
        delete safeUser.password; delete safeUser.passHash; // لا نحفظ كلمة المرور في Firestore
        await setDoc(doc(db, USERS_COL, String(user.uid || user.userId)), safeUser);
    } catch (e) {
        console.error("❌ خطأ في حفظ المستخدم:", e);
    }
};

/** تحميل كل المستخدمين */
window.FB_loadUsers = async function() {
    try {
        const snap = await getDocs(collection(db, USERS_COL));
        return snap.docs.map(d => ({ ...sanitize(d.data(), false), uid: d.id }));
    } catch (e) {
        console.error("❌ خطأ في تحميل المستخدمين:", e);
        return [];
    }
};

// =========================================================================
// ── التقييمات ────────────────────────────────────────────────────────────
// =========================================================================

/** حفظ تقييم جديد */
window.FB_saveReview = async function(review) {
    try {
        review.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, REVIEWS_COL), review);
        review._fbId = ref.id;
        console.log("✅ تم حفظ التقييم");
    } catch (e) {
        console.error("❌ خطأ في حفظ التقييم:", e);
    }
};

/** حذف تقييم */
window.FB_deleteReview = async function(fbId) {
    try {
        await deleteDoc(doc(db, REVIEWS_COL, fbId));
        console.log("✅ تم حذف التقييم");
    } catch (e) {
        console.error("❌ خطأ في حذف التقييم:", e);
    }
};

/** تحميل التقييمات */
window.FB_loadReviews = async function() {
    try {
        const snap = await getDocs(collection(db, REVIEWS_COL));
        return snap.docs.map(d => ({ ...sanitize(d.data(), false), _fbId: d.id }));
    } catch (e) {
        console.error("❌ خطأ في تحميل التقييمات:", e);
        return [];
    }
};

// =========================================================================
// ── الإعدادات ────────────────────────────────────────────────────────────
// =========================================================================

/** حفظ إعدادات الموقع */
window.FB_saveConfig = async function(config) {
    try {
        const safeCfg = { ...config }; delete safeCfg.adminHash; delete safeCfg.adminPass;
        await setDoc(doc(db, CONFIG_COL, "main"), safeCfg);
        console.log("✅ تم حفظ الإعدادات");
    } catch (e) {
        console.error("❌ خطأ في حفظ الإعدادات:", e);
    }
};

/** تحميل إعدادات الموقع */
window.FB_loadConfig = async function() {
    try {
        const snap = await getDoc(doc(db, CONFIG_COL, "main"));
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.error("❌ خطأ في تحميل الإعدادات:", e);
        return null;
    }
};


// =========================================================================
// ── Firebase Auth (تسجيل الدخول الحقيقي) ─────────────────────────────────
// الحساب = رقم الحساب (ID) + كلمة السر. الإيميل داخلي فقط: u<ID>@users.officeraheem.app
// الأدمن = حساب Firebase عادي + مستند admins/<uid> يتعمل يدوياً من الكونسول.
// =========================================================================
const EMAIL_DOMAIN = "users.officeraheem.app";
// إيميل حساب الأدمن في Firebase Auth (اعمله من الكونسول ثم أضف مستند admins/<uid>) — غيّره لإيميلك
window.ADMIN_LOGIN_EMAIL = "admin@officeraheem.app";
const idToEmail = id => "u" + String(id).replace(/\D/g, "") + "@" + EMAIL_DOMAIN;
const LS = window.localStorage;
const jget = (k, d) => { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } };
const sha = async t => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('OR::' + t)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); };
const AUTH_ERR = {
    "auth/invalid-credential": "رقم الحساب أو كلمة السر غير صحيحة",
    "auth/wrong-password": "رقم الحساب أو كلمة السر غير صحيحة",
    "auth/user-not-found": "رقم الحساب أو كلمة السر غير صحيحة",
    "auth/invalid-email": "رقم الحساب غير صحيح",
    "auth/too-many-requests": "محاولات كتير غلط. حاول بعد شوية.",
    "auth/network-request-failed": "مشكلة في الاتصال بالإنترنت",
    "auth/weak-password": "كلمة السر لازم تكون 6 أحرف على الأقل",
    "auth/email-already-in-use": "الحساب موجود بالفعل",
    "auth/configuration-not-found": "خدمة إنشاء الحسابات غير مفعّلة حالياً على الخادم. تواصل مع الإدارة.",
    "auth/operation-not-allowed": "خدمة إنشاء الحسابات غير مفعّلة حالياً على الخادم. تواصل مع الإدارة.",
    "auth/admin-restricted-operation": "خدمة إنشاء الحسابات غير مفعّلة حالياً على الخادم. تواصل مع الإدارة.",
    "auth/api-key-not-valid": "إعدادات الموقع غير صحيحة. تواصل مع الإدارة.",
    "auth/invalid-api-key": "إعدادات الموقع غير صحيحة. تواصل مع الإدارة.",
    "auth/requires-recent-login": "سجّل الدخول من جديد ثم حاول مرة أخرى",
    "permission-denied": "غير مسموح بتنفيذ العملية حالياً. تواصل مع الإدارة.",
    "unavailable": "الخادم غير متاح الآن، جرّب بعد قليل",
    "failed-precondition": "قاعدة البيانات غير جاهزة حالياً. تواصل مع الإدارة.",
    "not-found": "قاعدة البيانات غير جاهزة حالياً. تواصل مع الإدارة."
};
const SERVER_DOWN_MSG = "الخدمة غير جاهزة على الخادم حالياً. تواصل مع الإدارة وجرّب لاحقاً.";
// نعرض للعميل رسالة عربية دايماً، والتفاصيل التقنية تفضل في الكونسول للمطوّر
const fail = e => {
    if (e && e.code !== "auth/email-already-in-use") console.error("Firebase error:", e);
    let msg = AUTH_ERR[e && e.code];
    if (!msg) {
        const raw = String((e && e.message) || "");
        if (/[\u0600-\u06FF]/.test(raw) && !/firebase|firestore|https?:/i.test(raw)) msg = raw;          // رسالة عربية من الكود عندنا
        else if (/Cloud Firestore API|firestore\.googleapis|has not been used|is disabled|configuration/i.test(raw)) msg = SERVER_DOWN_MSG;
        else if (/network|offline/i.test(raw)) msg = "مشكلة في الاتصال بالإنترنت";
        else msg = "حدث خطأ غير متوقع، حاول مرة أخرى";
    }
    const err = new Error(msg); err.code = e && e.code; return err;
};
const strongPass = p => typeof p === "string" && p.length >= 8 && p.length <= 64 && /[A-Za-z]/.test(p) && /\d/.test(p) && !/[^\x21-\x7E]/.test(p);

let _readyRes; 
window.FB_ready = new Promise(r => { _readyRes = r; });

function cacheProfile(p) {
    const clean = { ...p }; delete clean.password; delete clean.passHash;
    const old = jget('current_user', null);
    if (old && String(old.userId) === String(clean.userId) && old.avatar && !clean.avatar) clean.avatar = old.avatar;
    LS.setItem('current_user', JSON.stringify(clean));
    const all = jget('global_store_users', []);
    const i = all.findIndex(u => String(u.userId) === String(clean.userId));
    if (i >= 0) { all[i] = { ...all[i], ...clean }; delete all[i].password; delete all[i].passHash; } else all.push(clean);
    LS.setItem('global_store_users', JSON.stringify(all));
    return clean;
}

const PROFILE_KEYS = ['userId', 'uid', 'name', 'phone', 'role', 'isBanned', 'createdAt', 'lastLogin', 'theme'];
const pickProfile = o => { const r = {}; PROFILE_KEYS.forEach(k => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };

async function nextUserId() {
    const ref = doc(db, "counters", "users");
    return runTransaction(db, async tx => {
        const s = await tx.get(ref);
        const n = s.exists() ? Number(s.data().n) + 1 : 2000000;
        tx.set(ref, { n });
        return n;
    });
}

window.FBAuth = {
    ready: window.FB_ready,
    isAdminSession: false,
    adminLevel: null,
    get user() { return auth.currentUser; },

    async register({ name, phone, password }) {
        if (!strongPass(password)) throw new Error("كلمة السر ضعيفة: لازم 8 خانات على الأقل، حروف إنجليزي وأرقام (من غير عربي)");
        let cred = null, id = null;
        for (let i = 0; i < 5 && !cred; i++) {
            try { id = await nextUserId(); } catch (e) { throw fail(e); }
            try { cred = await createUserWithEmailAndPassword(auth, idToEmail(id), password); }
            catch (e) { if (e.code !== "auth/email-already-in-use") throw fail(e); }
        }
        if (!cred) throw new Error("تعذر إنشاء رقم حساب، حاول مرة أخرى");
        const now = new Date().toLocaleString('ar-EG');
        const profile = { userId: id, uid: cred.user.uid, name: String(name).slice(0, 80), phone: phone || "", role: "customer", isBanned: false, createdAt: now, lastLogin: now, theme: "light" };
        try { await setDoc(doc(db, USERS_COL, cred.user.uid), pickProfile(profile)); }
        catch (e) { throw fail(e); }
        return cacheProfile(profile);
    },

    async login(idVal, password) {
        const id = String(idVal).replace(/\D/g, "");
        if (!id) throw new Error("رقم الحساب غير صحيح");
        let cred;
        try { cred = await signInWithEmailAndPassword(auth, idToEmail(id), password); }
        catch (e) {
            // حساب قديم (قبل Firebase Auth) موجود على الجهاز ده: ننقله لـ Firebase بنفس الرقم
            const legacy = Number(id) < 2000000 && jget('global_store_users', []).find(u => String(u.userId) === id);
            if (legacy && (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found")) {
                const h = await sha(password);
                if ((legacy.passHash && legacy.passHash === h) || (!legacy.passHash && legacy.password === password)) {
                    try { cred = await createUserWithEmailAndPassword(auth, idToEmail(id), password); }
                    catch (e2) { throw fail(e2); }
                    const p = { ...pickProfile(legacy), uid: cred.user.uid, userId: Number(id), role: "customer", isBanned: false, lastLogin: new Date().toLocaleString('ar-EG') };
                    if (!p.name) p.name = "عميل";
                    await setDoc(doc(db, USERS_COL, cred.user.uid), p);
                    return cacheProfile(p);
                }
            }
            throw fail(e);
        }
        const ref = doc(db, USERS_COL, cred.user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) { await signOut(auth); throw new Error("الحساب غير مكتمل، أنشئ حساب جديد"); }
        const prof = snap.data();
        if (prof.isBanned) { await signOut(auth); throw Object.assign(new Error("هذا الحساب محظور. تواصل مع الإدارة."), { code: "banned" }); }
        const lastLogin = new Date().toLocaleString('ar-EG');
        try { await updateDoc(ref, { lastLogin }); } catch (e) {}
        return cacheProfile({ ...prof, uid: cred.user.uid, lastLogin });
    },

    async changePassword(oldPass, newPass) {
        const u = auth.currentUser; if (!u) throw new Error("سجّل الدخول أولاً");
        try {
            await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPass));
            await updatePassword(u, newPass);
        } catch (e) { throw fail(e); }
    },

    async updateProfile(fields) {
        const u = auth.currentUser; if (!u) return false;
        const f = {}; if (fields.name) f.name = String(fields.name).slice(0, 80); if (fields.phone !== undefined) f.phone = String(fields.phone).slice(0, 20);
        try { await updateDoc(doc(db, USERS_COL, u.uid), f); return true; } catch (e) { return false; }
    },

    async logout() { try { await signOut(auth); } catch (e) {} LS.removeItem('current_user'); },

    async adminLogin(email, password) {
        window.__adminLoginErr = '';
        try { await signInWithEmailAndPassword(auth, String(email).trim(), password); } catch (e) { window.__adminLoginErr = (e && e.code) || String(e); return false; }
        const uid = auth.currentUser && auth.currentUser.uid;
        const ok = await window.FBAuth._checkAdmin();
        if (!ok) { window.__adminLoginErr = 'not-in-admins | UID=' + uid; await signOut(auth); return false; }
        window.FB_startAdminWatchers();
        return true;
    },


    // ── بيانات دخول الأدمن (تتطلب كلمة السر الحالية، زي المواقع الكبيرة) ──
    _adminErr(e) {
        const m = {
            "auth/invalid-credential": "كلمة السر الحالية غير صحيحة",
            "auth/wrong-password": "كلمة السر الحالية غير صحيحة",
            "auth/invalid-email": "اكتب جيميل صحيح",
            "auth/email-already-in-use": "الجيميل ده مستخدم في حساب تاني",
            "auth/weak-password": "كلمة السر الجديدة ضعيفة",
            "auth/too-many-requests": "محاولات كتير، استنى شوية وحاول تاني",
            "auth/requires-recent-login": "سجّل خروج وادخل من جديد ثم حاول تاني",
            "auth/operation-not-allowed": "تغيير الإيميل مش مفعّل في Firebase (راجع إعدادات Authentication)",
            "auth/network-request-failed": "مشكلة في الاتصال بالإنترنت"
        };
        return new Error(m[e && e.code] || "حدث خطأ، حاول مرة أخرى");
    },
    async _adminReauth(oldPass) {
        const u = auth.currentUser;
        if (!u || !window.FBAuth.isAdminSession) throw new Error("سجّل الدخول كأدمن أولاً");
        if (!oldPass) throw new Error("اكتب كلمة السر الحالية");
        try { await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPass)); }
        catch (e) { throw window.FBAuth._adminErr(e); }
        return u;
    },
    async changeAdminPassword(oldPass, newPass) {
        const u = await window.FBAuth._adminReauth(oldPass);
        if (!strongPass(newPass)) throw new Error("كلمة السر الجديدة: 8 خانات على الأقل، حروف إنجليزي وأرقام");
        try { await updatePassword(u, newPass); } catch (e) { throw window.FBAuth._adminErr(e); }
    },
    async changeAdminEmail(oldPass, newEmail) {
        const u = await window.FBAuth._adminReauth(oldPass);
        newEmail = String(newEmail || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) throw new Error("اكتب جيميل صحيح");
        if (newEmail === String(u.email).toLowerCase()) throw new Error("ده نفس الجيميل الحالي");
        try { await verifyBeforeUpdateEmail(u, newEmail); } catch (e) { throw window.FBAuth._adminErr(e); }
    },

    async _checkAdmin() {
        const u = auth.currentUser;
        window.FBAuth.isAdminSession = false;
        if (!u) return false;
        window.FBAuth.adminLevel = null;
        try {
            const s = await getDoc(doc(db, "admins", u.uid));
            window.FBAuth.isAdminSession = s.exists();
            // level: 'full' (الافتراضي) أو 'sub' (أدمن مساعد: طلبات وتقييمات فقط). القواعد على السيرفر هي اللي بتفرض ده.
            if (s.exists()) window.FBAuth.adminLevel = (s.data() && s.data().level === 'sub') ? 'sub' : 'full';
        } catch (e) {}
        return window.FBAuth.isAdminSession;
    }
};

onAuthStateChanged(auth, async user => {
    if (user && user.email && user.email.endsWith("@" + EMAIL_DOMAIN)) {
        try {
            const snap = await getDoc(doc(db, USERS_COL, user.uid));
            if (snap.exists()) {
                const p = snap.data();
                if (p.isBanned) { await signOut(auth); LS.removeItem('current_user'); }
                else cacheProfile({ ...p, uid: user.uid });
            }
        } catch (e) {}
    } else if (user) {
        await window.FBAuth._checkAdmin();
    } else {
        // مفيش جلسة Firebase => مفيش حساب مسجّل دخول
        LS.removeItem('current_user');
    }
    _readyRes(window.FBAuth);
    if (typeof updateNavUserDisplay === 'function') try { updateNavUserDisplay(); } catch (e) {}
    if (typeof renderUserLoginBox === 'function') try { renderUserLoginBox(); } catch (e) {}
    window.dispatchEvent(new Event('fbauth-changed'));
});
window.dispatchEvent(new Event('fbauth-init'));

// ── مراقبة بيانات الأدمن (بعد التحقق من صلاحية الأدمن) ──
let _adminWatching = false;
window.FB_startAdminWatchers = async function () {
    if (_adminWatching || !window.FBAuth.isAdminSession) return;
    _adminWatching = true;
    const remoteOrders = await window.FB_loadOrders();
    if (remoteOrders.length > 0) { orders = remoteOrders; LS.setItem('global_store_orders', JSON.stringify(orders)); }
    window.FB_watchOrders(function (liveOrders) {
        orders = liveOrders;
        LS.setItem('global_store_orders', JSON.stringify(orders));
        if (typeof renderAdminOrdersTable === 'function') renderAdminOrdersTable();
        if (typeof refreshAdminStats === 'function') refreshAdminStats();
    });
    window.FB_watchArchive(function (liveArchive) {
        const _loc = jget('global_store_archive', []);
        const _ids = new Set(liveArchive.map(a => String(a.id || a.orderId)));
        const _merged = liveArchive.concat(_loc.filter(a => !_ids.has(String(a.id || a.orderId))));
        LS.setItem('global_store_archive', JSON.stringify(_merged));
        if (typeof renderAdminArchiveTable === 'function') renderAdminArchiveTable();
    });
    // المستخدمين: نضم الحسابات من Firebase مع المحلية
    const remoteUsers = await window.FB_loadUsers();
    if (remoteUsers.length) {
        const local = jget('global_store_users', []);
        remoteUsers.forEach(r => {
            const i = local.findIndex(u => String(u.userId) === String(r.userId));
            if (i >= 0) local[i] = { ...local[i], ...r }; else local.push(r);
        });
        LS.setItem('global_store_users', JSON.stringify(local));
        if (typeof renderEnhancedAdminUsersTable === 'function') renderEnhancedAdminUsersTable();
    }
};

/** الأدمن فقط: تعديل صلاحيات مستخدم (حظر / عجلة الحظ) على السيرفر */
window.FB_adminSetUser = async function (uid, fields) {
    if (!uid) return false;
    try { await updateDoc(doc(db, USERS_COL, uid), fields); return true; }
    catch (e) { console.error("❌ FB_adminSetUser:", e); return false; }
};

// =========================================================================
// ── عجلة الحظ: الفحص والوقت على السيرفر ────────────────────────────────
// السحب = كتابة spins/<uid>.t = وقت السيرفر. قواعد Firestore بترفض أي سحب قبل
// انتهاء الفترة (config/wheel.hours) أو لو المستخدم محظور من العجلة، فمسح
// بيانات المتصفح أو تعديل الوقت مالوش أي تأثير. الجائزة بتتحسب من وقت السيرفر.
// =========================================================================
window.FB_saveWheel = async function (gifts, hours) {
    try { await setDoc(doc(db, CONFIG_COL, "wheel"), { gifts: gifts, hours: Math.max(1, parseInt(hours) || 24) }); return true; }
    catch (e) { console.error("❌ حفظ العجلة:", e); return false; }
};
window.FB_loadWheel = async function () {
    try { const s = await getDoc(doc(db, CONFIG_COL, "wheel")); return s.exists() ? s.data() : null; } catch (e) { return null; }
};
window.FB_getSpin = async function () {
    const u = auth.currentUser; if (!u) return null;
    try { const s = await getDoc(doc(db, "spins", u.uid)); return s.exists() ? s.data().t.toMillis() : null; } catch (e) { return null; }
};
window.FB_getMyProfile = async function () {
    const u = auth.currentUser; if (!u) return null;
    try { const s = await getDoc(doc(db, USERS_COL, u.uid)); return s.exists() ? s.data() : null; } catch (e) { return null; }
};
window.FB_spin = async function () {
    const u = auth.currentUser; if (!u) throw Object.assign(new Error("login"), { code: "login" });
    const ref = doc(db, "spins", u.uid);
    await setDoc(ref, { t: serverTimestamp() });     // القواعد ترفض لو الفترة ما خلصتش
    const s = await getDoc(ref);
    return s.data().t.toMillis();
};

// =========================================================================
// ── التهيئة التلقائية عند بدء الصفحة ──────────────────────────────────
// =========================================================================
window.FB_initialized = false;

window.FB_init = async function() {
    if (window.FB_initialized) return;
    window.FB_initialized = true;
    console.log("🔥 Firebase: جاري تحميل البيانات...");

    // تحميل الإعدادات
    const remoteConfig = await window.FB_loadConfig();
    if (remoteConfig) {
        const _keepHash = siteConfig && siteConfig.adminHash;
        delete remoteConfig.adminHash; delete remoteConfig.adminPass;
        if (!remoteConfig.siteName || /الأناقة|الاناقة/.test(remoteConfig.siteName)) remoteConfig.siteName = 'مكتب رحيم';
        siteConfig = remoteConfig; if (_keepHash) siteConfig.adminHash = _keepHash;
        localStorage.setItem('global_store_config', JSON.stringify(siteConfig));
        if (typeof applyGlobalSiteSettings === 'function') applyGlobalSiteSettings();
    }

    // تحميل المنتجات
    const remoteProducts = await window.FB_loadProducts();
    if (remoteProducts.length > 0) {
        products = remoteProducts;
        localStorage.setItem('global_store_products', JSON.stringify(products));
        if (typeof renderMainProductsGrid === 'function') renderMainProductsGrid(products);
        if (typeof renderShopProductsGrid === 'function') renderShopProductsGrid(products);
        if (typeof startAdvancedSlider === 'function') startAdvancedSlider();
        window.dispatchEvent(new Event('products-updated'));
    }

    // تحميل التقييمات
    const remoteReviews = await window.FB_loadReviews();
    if (remoteReviews.length > 0) {
        globalReviews = remoteReviews;
        localStorage.setItem('global_store_reviews', JSON.stringify(globalReviews));
    }

    // الطلبات والمستخدمين (للأدمن فقط) — تبدأ بعد تسجيل دخول الأدمن عبر Firebase Auth
    if (document.getElementById('admin-orders-table-body')) {
        window.FB_ready.then(function () { if (window.FBAuth.isAdminSession) window.FB_startAdminWatchers(); });
    }

    console.log("✅ Firebase: اكتمل تحميل البيانات");
};

// تشغيل التهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.FB_init);
} else {
    window.FB_init();
}


// ── أمان: تجزئة SHA-256 + تنظيف HTML ──
async function _sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('OR::'+t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
function _esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
window._sha=_sha;window._esc=_esc;
// =========================================================================
// 1. قاعدة البيانات الأساسية والتحميل التلقائي للإعدادات وهيكل البيانات الفاخر
// =========================================================================

const defaultProducts = [
    { id: 101, title: "فستان سهرة ملكي فاخر", desc: "مصنوع من قماش الساتان والتل المطرز والناعم، تصميم فرنسي خلاب ومناسب للحفلات السعيدة.", price: 1200, discount: 15, category: "حريمي", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500" },
    { id: 102, title: "طقم كاجوال صيفي متكامل", desc: "يتكون من قطعتين قميص قطن وبنطلون جينز مريح جداً ضد الحساسية ومناسب للأجواء الحارة.", price: 650, discount: 10, category: "رجالي", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
    { id: 103, title: "بدلة أطفال كلاسيك ولادي", desc: "طقم رسمي أنيق جداً لسن 4 إلى 8 سنوات خامات تركية ممتازة وتتحمل الغسيل المتكرر.", price: 450, discount: 0, category: "أطفال", img: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500" },
    { id: 104, title: "معطف شتوي صوف ثقيل", desc: "مقاوم كلياً للرياح والأمطار، مبطن بالفرو الصناعي الدافئ ليعطيك حماية فائقة وأناقة لا مثيل لها.", price: 1400, discount: 25, category: "رجالي", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" }
];

let products = JSON.parse(localStorage.getItem('global_store_products')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('global_store_cart')) || [];
let orders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
let siteConfig = JSON.parse(localStorage.getItem('global_store_config')) || { siteName: "مكتب رحيم", adminPass: "", transferPhone: "01204022242" };
if (!siteConfig.siteName || /الأناقة|الاناقة/.test(siteConfig.siteName)) siteConfig.siteName = "مكتب رحيم";
let globalReviews = JSON.parse(localStorage.getItem('global_store_reviews')) || [];
let wishlist = (function () { try { return (JSON.parse(localStorage.getItem('global_store_wishlist')) || []).map(Number).filter(Number.isFinite); } catch (e) { return []; } })();
let selectedTempSizes = {};
let selectedTempColors = {};
// دالة حماية من XSS - تهريب HTML للنصوص المُدخلة من المستخدمين
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


let activeReviewProductId = null;
let currentSelectedAddressMode = "gps";

function applyGlobalSiteSettings() {
    const titleTag = document.getElementById('site-title-tag');
    const logoName = document.getElementById('site-logo-name');
    const siteNameDisplay = document.getElementById('site-name-display');
    const settingInput = document.getElementById('setting-site-name');
    const transferInput = document.getElementById('setting-transfer-phone');
    if (titleTag) titleTag.innerText = siteConfig.siteName + " - منصتك الفاخرة";
    if (logoName) logoName.innerText = siteConfig.siteName;
    if (siteNameDisplay) siteNameDisplay.innerText = siteConfig.siteName;
    document.querySelectorAll('#site-name-display').forEach(el => el.innerText = siteConfig.siteName);
    if (settingInput) settingInput.value = siteConfig.siteName;
    if (transferInput) transferInput.value = siteConfig.transferPhone || '01204022242';
    // تطبيق الوضع الداكن العالمي
    applyGlobalDarkMode();
    if (typeof updateNavUserDisplay === 'function') updateNavUserDisplay();
}

function applyGlobalDarkMode() {
    var user = getCurrentUser();
    var saved = null; try { saved = localStorage.getItem('site_theme'); } catch (e) {}
    var isDark = saved ? saved === 'dark' : !!(user && user.theme === 'dark');
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.innerText = message;
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function updateCartCountBadge() {
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cart.reduce((t, i) => t + (i.qty || 1), 0);
}

function goToCartPage() {
    window.location.href = 'cart.html';
}

window.addEventListener('DOMContentLoaded', () => {
    applyGlobalSiteSettings();
    updateCartCountBadge();
    checkPersistentTrackingCode();
    renderProductPageReviews();

    // تطبيق النظام الصارم على حقول الهاتف
    enforcePhoneInput(document.getElementById('order-phone'));
    enforcePhoneInput(document.getElementById('settingsPhone'));

    if (document.getElementById('slider-img')) {
        startAdvancedSlider();
        renderMainProductsGrid(products);
    }
    if (document.getElementById('products-container')) {
        renderShopProductsGrid(products);
    }
    if (document.getElementById('cart-items-table-body')) {
        renderCartDashboard();
        renderCartItemsGrid();
    }
    if (document.querySelector('.star-rating-input')) {
        initStarsSystem();
    }
    if (document.getElementById('admin-reviews-table-body')) {
        renderAdminReviewsTable();
    }
    if (document.getElementById('admin-orders-table-body')) {
        renderAdminOrdersTable();
    }
    if (document.getElementById('admin-gifts-list-table')) {
        renderAdminAdvancedGiftsTable();
    }
    if (document.getElementById('user-active-coupons-wallet')) {
        renderUserCouponsWallet();
    }
});


// =========================================================================
// 2. السلايدر المتطور
// =========================================================================
let sliderIndex = 0;
function startAdvancedSlider() {
    const imgEl = document.getElementById('slider-img');
    const titleEl = document.getElementById('slider-title');
    const descEl = document.getElementById('slider-desc');
    const badgeEl = document.getElementById('slider-discount-badge');
    if (!imgEl || !titleEl || !descEl) return;

    function refreshSliderItem() {
        if (products.length === 0) return;
        const item = products[sliderIndex];
        imgEl.style.opacity = 0.3;
        setTimeout(() => {
            imgEl.src = item.img;
            imgEl.style.opacity = 1;
        }, 200);
        descEl.innerText = item.desc || "هذا الموديل لا يحتوي على تفاصيل أو وصف مكتوب حالياً.";
        if (item.discount > 0) {
            let currentPrice = item.price - (item.price * (item.discount / 100));
            titleEl.innerHTML = `${item.title} - <span style="color:var(--accent-color); font-weight:bold;">${currentPrice} ج.م</span>`;
            if (badgeEl) { badgeEl.innerText = `خصم عاجل ${item.discount}%`; badgeEl.style.display = "block"; }
        } else {
            titleEl.innerHTML = `${item.title} - <span>${item.price} ج.م</span>`;
            if (badgeEl) badgeEl.style.display = "none";
        }
    }

    refreshSliderItem();
    setInterval(() => {
        if (products.length === 0) return;
        sliderIndex = (sliderIndex + 1) % products.length;
        refreshSliderItem();
    }, 6000);
}

function addCurrentSliderToCart() {
    if (products.length === 0) return;
    addProductToCart(products[sliderIndex].id);
}

function renderMainProductsGrid(list) {
    const container = document.getElementById('main-products-container');
    if (!container) return;
    buildUniversalHTMLCards(container, list);
}

function runStoreSearch(q) {
    q = String(q || '').toLowerCase().trim().slice(0, 80);
    const filtered = q ? products.filter(p =>
        String(p.title || '').toLowerCase().includes(q) || String(p.desc || '').toLowerCase().includes(q)
    ) : products;
    const c = document.getElementById('main-products-container') || document.getElementById('products-container');
    if (c) buildUniversalHTMLCards(c, filtered);
    return !!c;
}
function searchMainProducts() {
    const el = document.getElementById('main-search-input');
    runStoreSearch(el ? el.value : '');
}


// =========================================================================
// 3. معرض المنتجات (shop.html)
// =========================================================================
function renderShopProductsGrid(list) {
    const container = document.getElementById('products-container');
    if (!container) return;
    buildUniversalHTMLCards(container, list);
}

function getProductRatingHTML(productId) {
    const productReviews = globalReviews.filter(r => r.productId == productId);
    if (productReviews.length === 0) return `<span style="color: #ccc; font-size: 0.85rem;">لا يوجد تقييم (0)</span>`;
    const avg = (productReviews.reduce((t, r) => t + r.rating, 0) / productReviews.length).toFixed(1);
    const roundedAvg = Math.round(avg);
    let stars = "";
    for (let i = 1; i <= 5; i++) stars += i <= roundedAvg ? "★" : "☆";
    return `<span style="color: #ffcc00; font-size: 0.9rem;" title="تقييم ${avg} من 5">${stars} <span style="color:#666; font-size:0.8rem;">(${productReviews.length} تقييم)</span></span>`;
}

function getProductCommentsListHTML(productId) {
    const productReviews = globalReviews.filter(r => r.productId == productId);
    if (productReviews.length === 0) return "";
    let html = `<div class="product-comments-box" style="margin-top:8px; max-height:90px; overflow-y:auto; font-size:0.75rem; color:#555; background:#f5f2eb; padding:5px; border-radius:4px;">`;
    html += `<strong style="font-size: 0.8rem; color: var(--main-color); display:block; margin-bottom:4px;">💬 آراء المشترين:</strong>`;
    productReviews.slice(-3).forEach(r => {
        const name = r.clientName || r.name || 'عميل';
        const text = r.reviewText || r.comment || '';
        const stars = r.rating ? Array.from({length:5},(_,i)=>`<span style="color:${i<r.rating?'#d9962b':'#ccc'}">★</span>`).join('') : '';
        html += `<div style="border-bottom:1px dashed #eee; padding:3px 0;">${stars} <strong>${escapeHTML(name)}:</strong> ${escapeHTML(text)}</div>`;
    });
    html += `</div>`;
    return html;
}

// الدالة الموحدة والنهائية لبناء الكروت
function buildUniversalHTMLCards(container, list) {
    container.innerHTML = "";
    { const _s = document.getElementById('admin-price-sort'); if (_s && _s.value === 'favorites') list = list.filter(p => wishlist.includes(Number(p.id))); }
    if (list.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:#999;">عذراً، لا توجد قطع مطابقة حالياً (لو اخترت المفضلة: اضغط ❤️ على أي منتج الأول).</p>`;
        return;
    }

    const sortSelect = document.getElementById('admin-price-sort');
    const sortValue = sortSelect ? sortSelect.value : 'default';

    function getProductAvgRating(productId) {
        const reviews = globalReviews.filter(r => r.productId == productId);
        if (reviews.length === 0) return 0;
        return reviews.reduce((t, r) => t + r.rating, 0) / reviews.length;
    }

    const sortedList = [...list].sort((a, b) => {
        let priceA = a.discount > 0 ? a.price - (a.price * (a.discount / 100)) : a.price;
        let priceB = b.discount > 0 ? b.price - (b.price * (b.discount / 100)) : b.price;
        if (sortValue === 'low-to-high') return priceA - priceB;
        if (sortValue === 'high-to-low') return priceB - priceA;
        if (sortValue === 'rating-high') return getProductAvgRating(b.id) - getProductAvgRating(a.id);
        if (sortValue === 'rating-low') return getProductAvgRating(a.id) - getProductAvgRating(b.id);
        if (sortValue === 'newest') return (b.id || 0) - (a.id || 0);
        if (sortValue === 'oldest') return (a.id || 0) - (b.id || 0);
        // الافتراضي: المفضلة أولاً
        const ia = window.__interestScore ? window.__interestScore(a) : 0, ib = window.__interestScore ? window.__interestScore(b) : 0;
        if (ib !== ia) return ib - ia;
        let aFav = wishlist.includes(Number(a.id)) ? 1 : 0;
        let bFav = wishlist.includes(Number(b.id)) ? 1 : 0;
        return bFav - aFav;
    });

    const html = [];
    sortedList.forEach(prod => {
        const pr = _priceParts(prod);
        const isFav = wishlist.includes(Number(prod.id)) ? "in-wishlist" : "";
        const revs = globalReviews.filter(r => r.productId == prod.id);
        const avg = revs.length ? (revs.reduce((t, r) => t + r.rating, 0) / revs.length) : 0;
        const stars = avg ? "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg)) : "";
        const rateHtml = avg ? `<div class="pc-rate"><span>${avg.toFixed(1)}</span><span>${stars}</span><small>(${revs.length})</small></div>` : "";
        const nColors = (prod.availableColors || []).length;
        const priceHtml = `<div class="pc-price"><span class="cur">جنيه</span><b>${pr.whole}<sup>${pr.frac}</sup></b>${prod.discount > 0 ? `<span class="pc-off">-${Number(prod.discount)}%</span>` : ''}</div>` +
            (prod.discount > 0 ? `<div class="pc-was">${Number(prod.price).toFixed(2)} جنيه</div><div class="pc-deal">عرض لمدة محدودة</div>` : '');
        html.push(`
            <div class="pc" onclick="openProductDetailsModal(${Number(prod.id)})">
                <div class="pc-img">
                    <button type="button" class="pc-fav ${isFav}" aria-label="حفظ في المفضلة" aria-pressed="${isFav ? 'true' : 'false'}" onclick="event.stopPropagation();toggleWishlistSystem(${Number(prod.id)}, this)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
                    ${prod.bestSeller ? '<span class="pc-tag">الأكثر مبيعاً</span>' : ''}
                    <img src="${escapeHTML(prod.img)}" alt="${escapeHTML(prod.title)}" loading="lazy">
                    <button type="button" class="pc-add" aria-label="إضافة للسلة" onclick="event.stopPropagation();quickAddToCart(${Number(prod.id)}, this)">+</button>
                </div>
                <div class="pc-body">
                    ${nColors > 1 ? `<span class="pc-colors">+${nColors} ألوان متاحة</span>` : ''}
                    <h3 class="pc-title">${escapeHTML(prod.title)}</h3>
                    ${rateHtml}
                    ${priceHtml}
                    ${prod.sold ? `<div class="pc-sold">تم شراء +${Number(prod.sold)} سلعة في الشهر الماضي</div>` : ''}
                    <div class="pc-ship">توصيل مجاني <b>لجميع المحافظات</b></div>
                </div>
            </div>`);
    });
    container.innerHTML = html.join("");
}

// ── أدوات الأسعار والألوان ──
function _priceParts(p) {
    const f = p.discount > 0 ? p.price - (p.price * (p.discount / 100)) : p.price;
    const fixed = Number(f).toFixed(2).split('.');
    return { final: Number(f), whole: fixed[0], frac: fixed[1] };
}
const _COLOR_NAMES = {'#2c3e50':'كحلي','#e74c3c':'أحمر','#95a5a6':'رمادي','#27ae60':'أخضر','#000000':'أسود','#ffffff':'أبيض','#f1c40f':'أصفر','#3498db':'أزرق','#e67e22':'برتقالي','#9b59b6':'بنفسجي','#8b4513':'بني','#ff69b4':'وردي'};
function _colorName(c) { return _COLOR_NAMES[String(c).toLowerCase()] || 'لون'; }
function _safeColor(c) { return /^#[0-9a-fA-F]{3,8}$/.test(String(c)) ? c : '#cccccc'; }

// ── نافذة المنتج: اختيار اللون والمقاس ثم الإضافة للسلة ──
let _pmQty = 1;
function openProductDetailsModal(id) {
    const prod = products.find(p => p.id === id);
    const box = document.getElementById('product-details-modal');
    const ov = document.getElementById('details-modal-overlay');
    if (!prod || !box || !ov) return;
    _pmQty = 1;
    const sizes = prod.availableSizes || [], colors = prod.availableColors || [];
    selectedTempSizes[id] = sizes[0] || undefined;
    selectedTempColors[id] = colors[0] || undefined;
    const pr = _priceParts(prod);
    box.innerHTML = `
        <button class="pm-x" aria-label="إغلاق" onclick="closeProductDetailsModal()">×</button>
        <div class="pm-img"><img src="${escapeHTML(prod.img)}" alt="${escapeHTML(prod.title)}"></div>
        <div class="pm-in">
            <h3>${escapeHTML(prod.title)}</h3>
            ${prod.desc ? `<p class="pm-note">${escapeHTML(prod.desc)}</p>` : ''}
            ${sizes.length ? `<div class="pm-lbl">الحجم : <b id="pm-size-lbl">${escapeHTML(sizes[0])}</b></div>
            <div class="pm-sizes">${sizes.map((s, i) => `<button type="button" class="pm-size ${i === 0 ? 'sel' : ''}" data-v="${escapeHTML(s)}">${escapeHTML(s)}</button>`).join('')}</div>` : ''}
            ${colors.length ? `<div class="pm-lbl">اللون : <b id="pm-color-lbl">${_colorName(colors[0])}</b></div>
            <div class="pm-colors">${colors.map((c, i) => `<button type="button" class="pm-dot ${i === 0 ? 'sel' : ''}" data-v="${escapeHTML(c)}" aria-label="${_colorName(c)}" style="background:${_safeColor(c)}"></button>`).join('')}</div>` : ''}
            <div class="pm-price"><span class="cur">جنيه</span><b>${pr.whole}<sup style="font-size:.9rem">${pr.frac}</sup></b>${prod.discount > 0 ? `<span class="pc-off">-${Number(prod.discount)}%</span><span class="pc-was">${Number(prod.price).toFixed(2)} جنيه</span>` : ''}</div>
            <p class="pm-note">الأسعار تشمل ضريبة القيمة المضافة.</p>
            <p class="pm-note">توصيل مجاني لجميع المحافظات</p>
            <div class="pm-qty"><button type="button" id="pm-minus">−</button><span id="pm-q">1</span><button type="button" id="pm-plus">+</button></div>
            <div class="pm-actions"><button type="button" class="pm-buy" id="pm-add">إضافة إلى عربة التسوق</button></div>
            <div class="pm-err" id="pm-err"></div>
        </div>`;
    box.querySelectorAll('.pm-size').forEach(b => b.onclick = () => {
        box.querySelectorAll('.pm-size').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        selectedTempSizes[id] = b.dataset.v; document.getElementById('pm-size-lbl').textContent = b.dataset.v;
    });
    box.querySelectorAll('.pm-dot').forEach(b => b.onclick = () => {
        box.querySelectorAll('.pm-dot').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        selectedTempColors[id] = b.dataset.v; document.getElementById('pm-color-lbl').textContent = _colorName(b.dataset.v);
    });
    document.getElementById('pm-minus').onclick = () => { _pmQty = Math.max(1, _pmQty - 1); document.getElementById('pm-q').textContent = _pmQty; };
    document.getElementById('pm-plus').onclick = () => { _pmQty = Math.min(20, _pmQty + 1); document.getElementById('pm-q').textContent = _pmQty; };
    document.getElementById('pm-add').onclick = () => {
        if (sizes.length && !selectedTempSizes[id]) { document.getElementById('pm-err').textContent = 'اختر الحجم'; return; }
        if (colors.length && !selectedTempColors[id]) { document.getElementById('pm-err').textContent = 'اختر اللون'; return; }
        addProductToCartAdvanced(id, _pmQty); closeProductDetailsModal();
    };
    box.style.display = 'block'; ov.style.display = 'block'; document.body.style.overflow = 'hidden';
}
// زر + على الكارت: يضيف المنتج للسلة مباشرة (أول مقاس/لون متاح). لتغيير المقاس أو اللون اضغط على الكارت نفسه.
function quickAddToCart(id, btn) {
    id = Number(id);
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const sizes = prod.availableSizes || [], colors = prod.availableColors || [];
    selectedTempSizes[id] = sizes[0] || undefined;
    selectedTempColors[id] = colors[0] || undefined;
    addProductToCartAdvanced(id, 1);
    if (btn) {
        btn.classList.add('added'); btn.textContent = '✓';
        setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 1200);
    }
}
function closeProductDetailsModal() {
    const box = document.getElementById('product-details-modal'), ov = document.getElementById('details-modal-overlay');
    if (box) box.style.display = 'none'; if (ov) ov.style.display = 'none'; document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProductDetailsModal(); });

function filterShopCategory(category, event) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    if (category === 'all') {
        renderShopProductsGrid(products);
    } else {
        renderShopProductsGrid(products.filter(p => p.category === category));
    }
}

function triggerPriceSortAction() {
    if (document.getElementById('products-container')) renderShopProductsGrid(products);
    if (document.getElementById('main-products-container')) renderMainProductsGrid(products);
}

function addProductToCart(id) {
    const found = products.find(p => p.id === id);
    if (!found) return;
    let finalPrice = found.discount > 0 ? found.price - (found.price * (found.discount / 100)) : found.price;
    cart.push({ ...found, calculatedPrice: finalPrice });
    localStorage.setItem('global_store_cart', JSON.stringify(cart));
    updateCartCountBadge();
    showToast(`تم إيداع "${found.title}" في سلة المشتريات!`);
}

function addProductToCartAdvanced(id, qty) {
    const found = products.find(p => p.id === id);
    if (!found) return;
    qty = Math.min(20, Math.max(1, parseInt(qty) || 1));
    let finalPrice = found.discount > 0 ? found.price - (found.price * (found.discount / 100)) : found.price;
    const size = selectedTempSizes[id] || "", color = selectedTempColors[id] || "";
    const same = cart.find(i => i.id === id && (i.chosenSize || "") === size && (i.chosenColor || "") === color);
    if (same) { same.qty = Math.min(20, (same.qty || 1) + qty); }
    else { cart.push({ ...found, calculatedPrice: finalPrice, chosenSize: size, chosenColor: color, qty: qty }); }
    localStorage.setItem('global_store_cart', JSON.stringify(cart));
    updateCartCountBadge();
    showToast(`تمت الإضافة إلى العربة${size ? ' (' + size + ')' : ''}`);
}

function selectProductSizeChip(element, prodId, sizeValue) {
    document.querySelectorAll(`.size-chip-box[data-prod="${prodId}"]`).forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedTempSizes[prodId] = sizeValue;
}

function selectProductColorDot(element, prodId, colorValue) {
    document.querySelectorAll(`.color-dot-box[data-prod="${prodId}"]`).forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedTempColors[prodId] = colorValue;
}

function orderDirectlyToWhatsApp(id) {
    const found = products.find(p => p.id === id);
    if (!found) return;
    let finalPrice = found.discount > 0 ? found.price - (found.price * (found.discount / 100)) : found.price;
    const message = `مرحباً ${siteConfig.siteName}، أود طلب هذه القطعة:\n- المنتج: ${found.title}\n- السعر: ${finalPrice} ج.م\n- المقاس: ${selectedTempSizes[id] || 'افتراضي'}`;
    window.open(`https://wa.me/201000000000?text=${encodeURIComponent(message)}`, '_blank');
}

function toggleWishlistSystem(id, element) {
    id = Number(id);
    const idx = wishlist.indexOf(id), on = idx === -1;
    if (on) wishlist.push(id); else wishlist.splice(idx, 1);
    try { localStorage.setItem('global_store_wishlist', JSON.stringify(wishlist)); } catch (e) {}
    if (element) {
        element.classList.toggle('in-wishlist', on);
        element.setAttribute('aria-pressed', on ? 'true' : 'false');
        element.classList.remove('pop'); void element.offsetWidth; element.classList.add('pop');
    }
    showToast(on ? "تم حفظ المنتج في المفضلة ❤️" : "تمت إزالته من المفضلة");
}


// =========================================================================
// 4. سلة التسوق (cart.html)
// =========================================================================
function renderCartDashboard() {
    updateCartCountBadge();
    const tableBody = document.getElementById('cart-items-table-body');
    const totalEl = document.getElementById('cart-total');
    const checkoutSec = document.getElementById('checkout-section');
    if (!tableBody) return;

    tableBody.innerHTML = "";
    let costCounter = 0;

    if (cart.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#aaa; font-weight:bold;">سلة التسوق الخاصة بك فارغة، انتقل للمتجر واشترِ أرقى الملابس!</td></tr>`;
        if (totalEl) totalEl.innerText = "0 ج.م";
        if (checkoutSec) checkoutSec.style.display = 'none';
        return;
    }

    cart.forEach((item, idx) => {
        let price = item.calculatedPrice || item.price;
        costCounter += price;
        let optionsSummary = "";
        if (item.chosenSize || item.chosenColor) {
            optionsSummary = `<div style="font-size:0.75rem; color:#c7254e; margin-top:2px;">المقاس: ${item.chosenSize || 'افتراضي'} | اللون: <span style="display:inline-block; width:8px; height:8px; background:${item.chosenColor || '#333'}; border-radius:50%;"></span></div>`;
        }
        tableBody.innerHTML += `
            <tr style="border-bottom:1px solid #eee;">
                <td><img src="${_esc(item.img)}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;"></td>
                <td>
                    <div style="font-weight:bold; color:var(--main-color);">${_esc(item.title)}</div>
                    <div style="font-size:0.8rem; color:#777; max-width:400px;">${item.desc || ''}</div>
                    ${optionsSummary}
                </td>
                <td style="color:var(--accent-color); font-weight:bold;">${price} ج.م</td>
                <td style="text-align:center;"><button onclick="removeSingleCartItem(${idx})" style="background:var(--accent-color); color:white; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;">حذف 🗑</button></td>
            </tr>
        `;
    });

    if (totalEl) totalEl.innerText = costCounter + " ج.م";
    if (checkoutSec) checkoutSec.style.display = 'block';
}

function removeSingleCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('global_store_cart', JSON.stringify(cart));
    renderCartDashboard();
    renderCartItemsGrid();
    showToast("تم إقصاء القطعة من السلة.");
}

function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    localStorage.setItem('global_store_cart', JSON.stringify(cart));
    localStorage.removeItem('active_applied_coupon');
    activeAppliedCoupon = null;
    renderCartDashboard();
    renderCartItemsGrid();
    showToast("تم إفراغ السلة كلياً.");
}


// =========================================================================
// 5. تتبع الطلبات (track.html)
// =========================================================================
function trackUserOrder() {
    const inputId = document.getElementById('track-id-input').value.trim().toUpperCase();
    const resultBox = document.getElementById('track-result-box');
    const resStatus = document.getElementById('track-res-status');
    const resDetails = document.getElementById('track-res-details');
    const productsContainer = document.getElementById('track-order-products-container');

    if (!resultBox) return;
    if (inputId === "") { showToast("الرجاء إدخل كود الطلب أولاً!"); return; }

    const foundOrder = orders.find(o => o.id === inputId || o.orderId === inputId);
    resultBox.style.display = 'block';

    if (foundOrder) {
        const currentStatus = foundOrder.status || foundOrder.orderStatus || "جاري المعالجة";
        resStatus.innerHTML = `📦 وضعية الشحن الحالية: <span style="color:var(--accent-color); font-weight:bold;">${_esc(currentStatus)}</span>`;
        const clientName = foundOrder.customerName || foundOrder.clientName || foundOrder.name || "عميل";
        const orderDate = foundOrder.date || foundOrder.orderDate || "";
        const payment = foundOrder.paymentMethod || foundOrder.payment || "";
        const items = foundOrder.items || foundOrder.cartItems || [];
        const bill = foundOrder.bill || foundOrder.finalPrice || foundOrder.total || "";
        let itemsNames = items.length > 0 ? items.map(i => i.title).join(' ، ') : (foundOrder.productsDetails || foundOrder.products || "");
        resDetails.innerHTML = `
            <strong>اسم العميل:</strong> ${_esc(clientName)}<br>
            <strong>تاريخ الطلب:</strong> ${_esc(orderDate)}<br>
            <strong>طريقة السداد:</strong> ${_esc(payment)}<br>
            <strong>القطع المطلوبة:</strong> ${_esc(itemsNames)}<br>
            <strong>الفاتورة الكلية:</strong> ${_esc(bill)}
        `;

        if (productsContainer && items.length > 0) {
            productsContainer.innerHTML = "";
            let html = `<h4 style="margin-top:15px; color:var(--main-color); font-size:0.95rem;">🛍 المنتجات المتضمنة في طلبك:</h4><div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">`;
            items.forEach(item => {
                const isDelivered = currentStatus.includes("تم التسليم");
                let reviews = JSON.parse(localStorage.getItem('global_store_reviews')) || [];
                let alreadyRated = reviews.find(r => r.orderId === foundOrder.orderId && r.productId == item.id);
                let actionButton = !isDelivered
                    ? `<button disabled style="background:#ddd; color:#888; border:none; padding:6px 14px; border-radius:6px; cursor:not-allowed; font-size:0.8rem;">⏳ متاح بعد التسليم</button>`
                    : alreadyRated
                    ? `<button disabled style="background:#d5f5e3; color:#1a7f4b; border:none; padding:6px 14px; border-radius:6px; font-size:0.8rem;">✅ قيّمت هذا المنتج</button>`
                    : `<button onclick="openReviewModal(${item.id}, '${item.title}', '${foundOrder.orderId || foundOrder.id}')" style="background:linear-gradient(135deg,#1a7f4b,#1a7f4b); color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:bold;">⭐ قيّم الآن</button>`;
                html += `
                    <div style="display:flex; align-items:center; justify-content:space-between; background:#fff; padding:10px; border-radius:8px; border:1px solid #ddd; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${_esc(item.img)}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                            <div>
                                <span style="font-weight:bold; font-size:0.9rem; display:block;">${item.title}</span>
                                <span style="font-size:0.8rem; color:var(--accent-color);">${item.calculatedPrice || item.price} ج.م</span>
                            </div>
                        </div>
                        ${actionButton}
                    </div>
                `;
            });
            html += `</div>`;
            productsContainer.innerHTML = html;
        }
    } else {
        resStatus.innerHTML = `❌ كود غير مسجل!`;
        resDetails.innerHTML = `عذراً، لم نجد أي طلبات تحت هذا الكود <strong>(${inputId})</strong>، تأكد من صحة الحروف والأرقام وأعد المحاولة.`;
        if (productsContainer) productsContainer.innerHTML = "";
    }
}


// =========================================================================
// 6. لوحة تحكم الأدمن (admin.html)
// =========================================================================
async function unlockAdminPanel() {
    // دخول الأدمن بحساب Firebase حقيقي (إيميل + كلمة سر) والصلاحية بتتفحص على السيرفر (admins/<uid>)
    const entered = (document.getElementById('admin-pass-input') || {value:''}).value.trim();
    const emailEl = document.getElementById('admin-email-input');
    const loginBox = document.getElementById('admin-login-box');
    const adminContent = document.getElementById('admin-content');
    window.__adm = false;
    try {
        const A = window.FBAuth;
        if (A) {
            await A.ready;
            if (A.isAdminSession) { window.__adm = true; }
            else if (entered) { window.__adm = await A.adminLogin((emailEl && emailEl.value.trim()), entered); }
        }
    } catch (e) { window.__adm = false; }
    if (window.__adm) {
        loginBox.style.display = 'none';
        adminContent.style.display = 'block';
        refreshAdminStats();
        renderAdminProductsTable(products);
        renderAdminOrdersTable();
        renderAdminReviewsTable();
        renderAdminAdvancedGiftsTable();
        showToast("تم منحك كامل صلاحيات الإدارة العليا للمتجر.");
        // تحميل البيانات الإضافية
        if (typeof renderAdminGovernoratesTable === 'function') renderAdminGovernoratesTable();
        if (typeof loadWheelAdminSettings === 'function') loadWheelAdminSettings();
        if (typeof renderEnhancedAdminUsersTable === 'function') renderEnhancedAdminUsersTable();
        if (typeof renderUserStats === 'function') renderUserStats();
        if (typeof renderAdminArchiveTable === 'function') renderAdminArchiveTable();
        searchAdminProducts();
    } else {
        const passInput = document.getElementById('admin-pass-input');
        if (passInput) {
            passInput.value = '';
            passInput.style.border = '2px solid red';
            passInput.placeholder = 'بيانات الدخول خاطئة أو الحساب ليس أدمن';
            setTimeout(() => {
                passInput.style.border = '';
                passInput.placeholder = 'أدخل رسالتك ';
            }, 2000);
            passInput.focus();
        }
    }
    return !!window.__adm;
}

function switchAdminTab(tabName) {
    // هذه الدالة يتم تجاوزها من admin.html - متروكة للتوافق مع الصفحات القديمة
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active-tab');
    });
    const panelId = 'tab-' + tabName.replace('-tab','') + '-content';
    const panel = document.getElementById(panelId);
    if (panel) { panel.style.display = 'block'; panel.classList.add('active-tab'); }
    if (event && event.target) event.target.classList.add('active');
    if (tabName === 'orders-tab') renderAdminOrdersTable && renderAdminOrdersTable();
    if (tabName === 'reviews-tab') renderAdminReviewsTable && renderAdminReviewsTable();
    if (tabName === 'analytics-tab') { renderAdminArchiveTable && renderAdminArchiveTable(); refreshAdminStats && refreshAdminStats(); }
    if (tabName === 'products-tab') { refreshAdminStats && refreshAdminStats(); searchAdminProducts && searchAdminProducts(); }
    if (tabName === 'shipping-tab') renderAdminGovernoratesTable && renderAdminGovernoratesTable();
    if (tabName === 'wheel-tab') loadWheelAdminSettings && loadWheelAdminSettings();
    if (tabName === 'users-tab') { renderEnhancedAdminUsersTable && renderEnhancedAdminUsersTable(); renderUserStats && renderUserStats(); }
}

function refreshAdminStats() {
    const countEl = document.getElementById('stat-total-count');
    const priceEl = document.getElementById('stat-total-price');
    if (!countEl || !priceEl) return;
    countEl.innerText = products.length;
    priceEl.innerText = products.reduce((t, p) => t + p.price, 0) + " ج.م";
}

function renderAdminProductsTable(list) {
    const body = document.getElementById('admin-products-table');
    if (!body) return;
    body.innerHTML = "";
    if (list.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">لا توجد نتائج في خزانة المتجر الحالية.</td></tr>`;
        return;
    }
    list.forEach(p => {
        let dcHtml = p.discount > 0 ? `<br><span style="font-size:0.75rem; background:var(--accent-color); color:white; padding:2px 6px; border-radius:4px;">تنزيل ${p.discount}%</span>` : "";
        body.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td><img src="${p.img}" style="width:45px; height:45px; object-fit:cover; border-radius:4px;"></td>
                <td>
                    <div style="font-weight:bold; color:var(--main-color);">${p.title}</div>
                    <div style="font-size:0.8rem; color:#666; max-width:260px;">${p.desc || ''}</div>
                </td>
                <td style="font-weight:bold;">${p.price} ج.م ${dcHtml}</td>
                <td>${p.category}</td>
                <td style="text-align:center;">
                    <button onclick="prepareProductEdit(${p.id})" style="background:#1b2a4a; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; margin-bottom:3px;">تعديل</button>
                    <button onclick="deleteProductFromAdmin(${p.id})" style="background:var(--accent-color); color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button>
                </td>
            </tr>
        `;
    });
}

function searchAdminProducts() {
    const query = document.getElementById('admin-search-input').value.toLowerCase();
    const filtered = products.filter(p =>
        p.title.toLowerCase().includes(query) || (p.desc && p.desc.toLowerCase().includes(query))
    );
    renderAdminProductsTable(filtered);
}

function deleteProductFromAdmin(id) {
    showConfirm('🗑️','حذف المنتج','هل أنت متأكد تماماً من رغبتك في حذف هذا الموديل نهائياً؟','نعم احذفه','إلغاء','danger').then(function(ok){
        if (!ok) return;
        products = products.filter(p => p.id !== id);
        localStorage.setItem('global_store_products', JSON.stringify(products));
        // ── Firebase: حذف المنتج ──
        if (typeof window.FB_deleteProduct === 'function') window.FB_deleteProduct(id);
        refreshAdminStats();
        searchAdminProducts();
        showToast("تم سحب الموديل وإزالته بنجاح.");
    });
}

function _compressImage(file, cb) {
    // يصغّر الصورة (حد أقصى 900px) عشان تتحفظ بأمان في المتصفح وFirebase
    const reader = new FileReader();
    reader.onerror = function () { cb(null); };
    reader.onload = function (e) {
        const img = new Image();
        img.onerror = function () { cb(e.target.result); };
        img.onload = function () {
            try {
                const MAX = 900;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) { const r = Math.min(MAX / w, MAX / h); w = Math.round(w * r); h = Math.round(h * r); }
                const c = document.createElement('canvas'); c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                cb(c.toDataURL('image/jpeg', 0.82));
            } catch (err) { cb(e.target.result); }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveProductAction() {
    try {
        const g = id => document.getElementById(id);
        const editId = g('edit-prod-id').value;
        const title = g('prod-title').value.trim();
        const desc = g('prod-desc').value.trim();
        const price = g('prod-price').value;
        const discount = g('prod-discount').value || 0;
        const category = g('prod-category') ? g('prod-category').value : '';
        const fileInput = g('prod-img-file');

        if (title === "") { showToast("⚠️ اكتب اسم المنتج الأول"); g('prod-title').focus(); return; }
        if (price === "" || isNaN(parseFloat(price)) || parseFloat(price) <= 0) { showToast("⚠️ اكتب سعر صحيح للمنتج"); g('prod-price').focus(); return; }
        const d = parseInt(discount);
        if (isNaN(d) || d < 0 || d > 100) { showToast("⚠️ نسبة الخصم لازم تكون بين 0 و 100"); g('prod-discount').focus(); return; }

        if (fileInput && fileInput.files && fileInput.files[0]) {
            showToast("⏳ جاري رفع الصورة...");
            _compressImage(fileInput.files[0], function (dataUrl) {
                if (!dataUrl) { showToast("❌ تعذّر قراءة الصورة، جرّب صورة تانية"); return; }
                commitProductToStorage(editId, title, desc, price, discount, category, dataUrl);
            });
        } else {
            let currentImg = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500";
            if (editId) {
                const currentObj = products.find(p => p.id == editId);
                if (currentObj) currentImg = currentObj.img;
            }
            commitProductToStorage(editId, title, desc, price, discount, category, currentImg);
        }
    } catch (err) {
        console.error('saveProductAction', err);
        showToast("❌ حصل خطأ أثناء الحفظ: " + (err && err.message ? err.message : err));
    }
}

function commitProductToStorage(editId, title, desc, price, discount, category, imgSource) {
    const selectedSizes = [];
    document.querySelectorAll('#admin-sizes-checkboxes input:checked').forEach(cb => selectedSizes.push(cb.value));
    const selectedColors = [];
    document.querySelectorAll('#admin-colors-checkboxes input:checked').forEach(cb => selectedColors.push(cb.value));

    const soldEl = document.getElementById('prod-sold'), bestEl = document.getElementById('prod-bestseller');
    const sold = Math.max(0, Math.min(1000000, parseInt(soldEl && soldEl.value) || 0));
    const bestSeller = !!(bestEl && bestEl.checked);

    let savedProd = null;
    if (editId) {
        products = products.map(p => {
            if (p.id != editId) return p;
            savedProd = { ...p, title, desc, price: parseFloat(price), discount: parseInt(discount) || 0, img: imgSource, availableSizes: selectedSizes, availableColors: selectedColors, sold, bestSeller };
            return savedProd;
        });
        showToast("✅ تم تحديث وحفظ بيانات الموديل.");
    } else {
        savedProd = {
            id: Date.now(), title, desc,
            price: parseFloat(price), discount: parseInt(discount) || 0,
            img: imgSource,
            availableSizes: selectedSizes, availableColors: selectedColors,
            sold, bestSeller,
            timestamp: Date.now()
        };
        products.unshift(savedProd);
        showToast("✅ تم إضافة المنتج بنجاح للمتجر.");
    }

    try {
        localStorage.setItem('global_store_products', JSON.stringify(products));
    } catch (err) {
        console.error('storage full', err);
        showToast("⚠️ مساحة المتصفح ممتلئة، الصورة كبيرة — استخدم صورة أصغر");
        if (!editId) products = products.filter(p => p !== savedProd);
        return;
    }
    // ── Firebase: حفظ المنتج ──
    if (savedProd && typeof window.FB_saveProduct === 'function') window.FB_saveProduct(savedProd);
    cancelEditMode();
    refreshAdminStats();
    searchAdminProducts();
}

function cancelEditMode() {
    document.getElementById('edit-prod-id').value = "";
    document.getElementById('prod-title').value = "";
    document.getElementById('prod-desc').value = "";
    document.getElementById('prod-price').value = "";
    document.getElementById('prod-discount').value = "0";
    if (document.getElementById('prod-sold')) document.getElementById('prod-sold').value = "0";
    if (document.getElementById('prod-bestseller')) document.getElementById('prod-bestseller').checked = false;
    document.getElementById('prod-img-file').value = "";
    document.querySelectorAll('#admin-sizes-checkboxes input').forEach(cb => cb.checked = false);
    document.querySelectorAll('#admin-colors-checkboxes input').forEach(cb => cb.checked = false);
    const previewBox = document.getElementById('img-preview-box');
    if (previewBox) previewBox.style.display = 'none';
    document.getElementById('form-action-title').innerText = "➕ إضافة منتج جديد";
    document.getElementById('btn-save-prod').innerText = "إضافة المنتج 🚀";
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

function prepareProductEdit(id) {
    const item = products.find(p => p.id === id);
    if (!item) return;
    document.getElementById('edit-prod-id').value = item.id;
    document.getElementById('prod-title').value = item.title;
    document.getElementById('prod-desc').value = item.desc || "";
    document.getElementById('prod-price').value = item.price;
    document.getElementById('prod-discount').value = item.discount || 0;
    if (document.getElementById('prod-sold')) document.getElementById('prod-sold').value = item.sold || 0;
    if (document.getElementById('prod-bestseller')) document.getElementById('prod-bestseller').checked = !!item.bestSeller;
    document.querySelectorAll('#admin-sizes-checkboxes input').forEach(cb => {
        cb.checked = item.availableSizes ? item.availableSizes.includes(cb.value) : false;
    });
    document.querySelectorAll('#admin-colors-checkboxes input').forEach(cb => {
        cb.checked = item.availableColors ? item.availableColors.includes(cb.value) : false;
    });
    const previewBox = document.getElementById('img-preview-box');
    const previewImg = document.getElementById('img-preview');
    if (previewImg && previewBox) { previewImg.src = item.img; previewBox.style.display = 'block'; }
    document.getElementById('form-action-title').innerText = "تعديل مواصفات الموديل الحالي";
    document.getElementById('btn-save-prod').innerText = "تطبيق وحفظ التعديلات الجديدة 💾";
    document.getElementById('btn-cancel-edit').style.display = 'inline-block';
    window.scrollTo({ top: 150, behavior: 'smooth' });
}


// =========================================================================
// 7. جدول طلبات الأدمن
// =========================================================================
function renderAdminOrdersTable() {
    const tableBody = document.getElementById('admin-orders-table-body');
    if (!tableBody) return;
    let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    tableBody.innerHTML = "";
    if (allOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#999;">لا توجد طلبات شراء حالياً.</td></tr>`;
        return;
    }
    allOrders.forEach((ord, index) => {
        let id = ord.orderId || ord.id || "بدون كود";
        let date = ord.orderDate || ord.date || "";
        let clientName = ord.clientName || ord.customerName || ord.name || "عميل مجهول";
        let phone = ord.clientPhone || ord.customerPhone || ord.phone || "";
        let address = ord.clientAddress || ord.customerAddress || ord.address || "";
        let productsList = ord.productsDetails || ord.products || (ord.items ? ord.items.map(i => i.title).join(' ، ') : "") || "لم تحدد";
        let price = ord.finalPrice || ord.bill || ord.total || "0 ج.م";
        let payment = ord.paymentMethod || ord.payment || "COD";
        let currentStatus = ord.orderStatus || ord.status || "جاري التجهيز 📦";

        tableBody.innerHTML += `
            <tr style="border-bottom: 1px solid #ddd; height: 60px;">
                <td style="white-space:nowrap;"><strong>${_esc(id)}</strong> <button onclick="_adminCopy(this.dataset.c)" data-c="${_esc(id)}" style="background:#1b2a4a;color:#fff;border:none;border-radius:4px;padding:2px 5px;cursor:pointer;font-size:0.7rem;">📋</button><br><small style="color:#777;">${_esc(date)}</small></td>
                <td>👤 <strong>${_esc(clientName)}</strong><br>📞 ${_esc(phone)}<br>📍 <small style="color:#555;">${_esc(address)}</small></td>
                <td><div style="max-width:250px; font-size:0.9rem; color:#333;">${_esc(productsList)}</div></td>
                <td style="color:#1a7f4b; font-weight:bold;">${_esc(price)}<br><small style="color:#666; font-weight:normal;">(${_esc(payment)})</small></td>
                <td>
                    <select onchange="changeOrderStatusFromAdmin(${index}, this.value)" style="padding:5px; border-radius:4px; border:1px solid #ccc; font-weight:bold; background:#fff;">
                        <option value="جاري التجهيز 📦" ${currentStatus.includes('التجهيز') ? 'selected' : ''}>جاري التجهيز 📦</option>
                        <option value="تم الإرسال للشركة 🚚" ${currentStatus.includes('الإرسال') ? 'selected' : ''}>تم الإرسال للشركة 🚚</option>
                        <option value="جاري التوصيل 🛵" ${currentStatus.includes('التوصيل') ? 'selected' : ''}>جاري التوصيل 🛵</option>
                        <option value="تم التسليم ✅" ${currentStatus.includes('التسليم') ? 'selected' : ''}>تم التسليم ✅</option>
                    </select>
                    <br><button onclick="deleteSingleOrderFromAdmin(${index})" style="background:#c7254e; color:white; border:none; padding:4px 8px; border-radius:4px; margin-top:5px; cursor:pointer; font-size:0.8rem;">حذف الطلب 🗑</button>
                </td>
            </tr>
        `;
    });
}

function changeOrderStatusFromAdmin(index, newStatus) {
    let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    if (allOrders[index]) {
        allOrders[index].orderStatus = newStatus;
        allOrders[index].status = newStatus;
        if (newStatus.includes('التسليم')) {
            allOrders[index].deliveredAt = Date.now();
        }
        localStorage.setItem('global_store_orders', JSON.stringify(allOrders));
        orders = allOrders;
        // ── Firebase: تحديث حالة الطلب ──
        const _updOrd = allOrders[index];
        if (_updOrd && typeof window.FB_updateOrderStatus === 'function')
            window.FB_updateOrderStatus(_updOrd.orderId || _updOrd.id, newStatus);
        showToast(`تم تحديث حالة الطلب إلى: ${newStatus}`);
        renderAdminOrdersTable();
        // أرشفة بعد 60 ثانية
        if (newStatus.includes('التسليم')) {
            setTimeout(function() { typeof archiveSweep === 'function' && archiveSweep(); }, 61000);
        }
    }
}

function archiveDeliveredOrder(orderId) {
    let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    let archive = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    let idx = allOrders.findIndex(o => (o.id === orderId || o.orderId === orderId));
    if (idx === -1) return;
    let order = allOrders[idx];
    if (!order.status.includes('التسليم')) return; // إذا تغيرت الحالة لا تأرشف
    order.archivedAt = new Date().toLocaleString('ar-EG', {timeZone:'Africa/Cairo'});
    order.archivedTimestamp = Date.now();
    archive.push(order);
    allOrders.splice(idx, 1);
    localStorage.setItem('global_store_orders', JSON.stringify(allOrders));
    localStorage.setItem('global_store_archive', JSON.stringify(archive));
    orders = allOrders;
    renderAdminOrdersTable();
    renderAdminArchiveTable();
}

function renderAdminArchiveTable() {
    const tbody = document.getElementById('admin-archive-table-body');
    if (!tbody) return;
    let archive = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    tbody.innerHTML = '';
    if (archive.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">لا يوجد طلبات مؤرشفة بعد.</td></tr>';
        return;
    }
    archive.forEach(function(ord, i) {
        tbody.innerHTML += `<tr>
            <td style="font-family:monospace;font-size:0.85rem;white-space:nowrap;">${_esc(ord.id || ord.orderId)} <button onclick="_adminCopy(this.dataset.c)" data-c="${_esc(ord.id||ord.orderId)}" style="background:#1b2a4a;color:#fff;border:none;border-radius:4px;padding:2px 5px;cursor:pointer;font-size:0.7rem;">📋</button></td>
            <td>${_esc(ord.clientName || ord.name)}</td>
            <td>${_esc(ord.clientPhone || ord.phone)}</td>
            <td>${_esc(ord.finalPrice || ord.total)}</td>
            <td><span style="color:#1a7f4b;font-weight:bold;">تم التسليم ✅</span></td>
            <td>${_esc(ord.archivedAt || '')}</td>
        </tr>`;
    });
}

function updateOrderStatusFromAdmin(orderId, newStatus) {
    orders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem('global_store_orders', JSON.stringify(orders));
    showToast(`تم تغيير وضعية الطلب ${orderId} بنجاح.`);
}

function deleteSingleOrderFromAdmin(index) {
    showConfirm('🗑️','حذف الطلب','هل تريد حذف هذا الطلب نهائياً؟','نعم احذفه','إلغاء','danger').then(function(ok){
        if (!ok) return;
        let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
        allOrders.splice(index, 1);
        localStorage.setItem('global_store_orders', JSON.stringify(allOrders));
        orders = allOrders;
        renderAdminOrdersTable();
        showToast("تم حذف الطلب.");
    });
}

function clearAllOrders() {
    showConfirm('⚠️','تحذير!','سيتم مسح كافة الطلبات نهائياً، هل أنت متأكد؟','نعم، امسح الكل','إلغاء','danger').then(function(ok){
        if (!ok) return;
        localStorage.removeItem('global_store_orders');
        orders = [];
        renderAdminOrdersTable();
        showToast("تم تصفير جدول الطلبات بالكامل.");
    });
}


// =========================================================================
// 8. الإعدادات
// =========================================================================
function saveGlobalSettings() {
    const inputName = document.getElementById('setting-site-name').value.trim();
    if (inputName === "") { showToast("لا يمكن ترك اسم الموقع فارغاً!"); return; }
    siteConfig.siteName = inputName;
    localStorage.setItem('global_store_config', JSON.stringify(siteConfig));
    applyGlobalSiteSettings();
    showToast("تم حفظ وتعميم اسم المتجر الجديد بجميع الصفحات ✅");
}

function saveTransferPhone() {
    const input = document.getElementById('setting-transfer-phone');
    if (!input) return;
    const val = input.value.trim();
    if (!validateEgyptianPhone(val)) {
        showAlert("📵","رقم غير صحيح","يجب أن يكون رقم التحويل 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015");
        return;
    }
    siteConfig.transferPhone = val;
    localStorage.setItem('global_store_config', JSON.stringify(siteConfig));
    showToast("✅ تم حفظ رقم التحويل الجديد: " + val);
}

async function updateAdminPassword() {
    const oldPass = (document.getElementById('setting-old-pass') || {}).value || '';
    const newPass = (document.getElementById('setting-new-pass') || {}).value || '';
    if (!oldPass) { showToast('اكتب كلمة السر الحالية'); return; }
    if (!newPass) { showToast('اكتب كلمة السر الجديدة'); return; }
    try {
        await window.FBAuth.changeAdminPassword(oldPass, newPass);
        document.getElementById('setting-new-pass').value = '';
        document.getElementById('setting-old-pass').value = '';
        showToast('🔒 تم تغيير كلمة سر الأدمن');
    } catch (e) { showToast('❌ ' + ((e && e.message) || 'تعذر التغيير')); }
}

async function updateAdminEmail() {
    const oldPass = (document.getElementById('setting-old-pass') || {}).value || '';
    const newEmail = (document.getElementById('setting-new-email') || {}).value || '';
    if (!newEmail.trim()) { showToast('اكتب الجيميل الجديد'); return; }
    try {
        await window.FBAuth.changeAdminEmail(oldPass, newEmail);
        document.getElementById('setting-new-email').value = '';
        document.getElementById('setting-old-pass').value = '';
        showToast('📧 اتبعت رابط تأكيد على الجيميل الجديد. افتحه وبعدها ادخل بيه.');
    } catch (e) { showToast('❌ ' + ((e && e.message) || 'تعذر التغيير')); }
}


// =========================================================================
// 9. نظام المراجعات والتقييمات
// =========================================================================
function openReviewModal(productId, productTitle, orderId) {
    activeReviewProductId = productId;
    const modalTitle = document.getElementById('modal-product-title');
    const reviewModal = document.getElementById('review-modal');
    const overlay = document.getElementById('modal-overlay');
    if (modalTitle) modalTitle.innerText = productTitle;
    // حفظ الـ orderId في المودال
    if (reviewModal) {
        reviewModal.setAttribute('data-order-id', orderId || '');
        reviewModal.setAttribute('data-product-id', productId || '');
    }
    if (reviewModal) reviewModal.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
}

function closeReviewModal() {
    activeReviewProductId = null;
    const reviewModal = document.getElementById('review-modal');
    const overlay = document.getElementById('modal-overlay');
    if (reviewModal) reviewModal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    const nameEl = document.getElementById('modal-reviewer-name');
    const commentEl = document.getElementById('modal-reviewer-comment');
    const ratingEl = document.getElementById('selected-rating-value');
    if (nameEl) nameEl.value = "";
    if (commentEl) commentEl.value = "";
    if (ratingEl) ratingEl.value = "0";
    resetStarsInputStyle();
}

function initStarsSystem() {
    const stars = document.querySelectorAll('.star-rating-input .star');
    const ratingInput = document.getElementById('selected-rating-value');
    stars.forEach(star => {
        star.addEventListener('mouseover', function () { resetStarsInputStyle(); highlightStarsInput(this.dataset.value); });
        star.addEventListener('mouseleave', function () { resetStarsInputStyle(); if (ratingInput) highlightStarsInput(ratingInput.value); });
        star.addEventListener('click', function () { if (ratingInput) { ratingInput.value = this.dataset.value; highlightStarsInput(this.dataset.value); } });
    });
}

function highlightStarsInput(value) {
    document.querySelectorAll('.star-rating-input .star').forEach((star, idx) => {
        star.style.color = idx < value ? "#ffcc00" : "#ccc";
    });
}

function resetStarsInputStyle() {
    document.querySelectorAll('.star-rating-input .star').forEach(star => star.style.color = "#ccc");
}

function generateStarsHTML(rating) {
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<span style="color: ${i <= rating ? '#d9962b' : '#ccc'}; font-size: 1.2rem;">★</span>`;
    }
    return starsHTML;
}

function renderAdminReviewsTable() {
    const body = document.getElementById('admin-reviews-table-body');
    if (!body) return;
    let reviews = JSON.parse(localStorage.getItem('global_store_reviews')) || [];
    body.innerHTML = "";
    if (reviews.length === 0) {
        body.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#aaa;">لا توجد أي تقييمات أو تعليقات منشورة حالياً.</td></tr>`;
        return;
    }
    reviews.forEach((rev, index) => {
        const productTitle = rev.productDetails || (products.find(p => p.id == rev.productId) ? products.find(p => p.id == rev.productId).title : `منتج (ID: ${rev.productId})`);
        const clientName = rev.clientName || rev.name || "مجهول";
        const reviewText = rev.reviewText || rev.comment || "";
        const rating = rev.rating || 5;
        const reviewDate = rev.reviewDate || rev.date || "";
        body.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td><strong style="color:var(--main-color); max-width:180px;">${_esc(rev.orderId || "")}</strong><br><small>${_esc(reviewDate)}</small></td>
                <td>👤 <strong>${_esc(clientName)}</strong><br><small>📞 ${_esc(rev.clientPhone || "")}</small></td>
                <td>${generateStarsHTML(rating)}</td>
                <td style="max-width:300px; font-size:0.85rem; color:#555;">"${_esc(reviewText)}"</td>
                <td><small style="color:#555;">${_esc(productTitle)}</small></td>
                <td style="text-align:center;">
                    <button onclick="deleteSingleReviewFromAdmin(${index})" style="background:var(--accent-color); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.85rem;">حذف 🗑</button>
                </td>
            </tr>
        `;
    });
}

function deleteSingleReviewFromAdmin(index) {
    showConfirm('🗑️','حذف التعليق','هل أنت متأكد من حذف هذا التعليق نهائياً؟','نعم احذفه','إلغاء','danger').then(function(ok){
        if (!ok) return;
        let reviews = JSON.parse(localStorage.getItem('global_store_reviews')) || [];
        reviews.splice(index, 1);
        localStorage.setItem('global_store_reviews', JSON.stringify(reviews));
        globalReviews = reviews;
        renderAdminReviewsTable();
        renderProductPageReviews();
        showToast("تم حذف التعليق بنجاح.");
    });
}

function deleteReviewFromAdmin(reviewId) {
    globalReviews = globalReviews.filter(r => r.id !== reviewId);
    localStorage.setItem('global_store_reviews', JSON.stringify(globalReviews));
    renderAdminReviewsTable();
    showToast("تم حذف وإقصاء التعليق بنجاح.");
}

function renderProductPageReviews() {
    const reviewsContainer = document.getElementById('product-reviews-display-box');
    if (!reviewsContainer) return;
    let reviews = JSON.parse(localStorage.getItem('global_store_reviews')) || [];
    reviewsContainer.innerHTML = "";
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `<p style="text-align:center; color:#888; font-size:0.9rem; padding:10px;">لا توجد تقييمات سابقة. كن أول من يقيم!</p>`;
        return;
    }
    // تجميع التعليقات حسب productId
    const grouped = {};
    reviews.forEach(rev => {
        const pid = rev.productId != null ? String(rev.productId) : 'general';
        if (!grouped[pid]) grouped[pid] = [];
        grouped[pid].push(rev);
    });
    Object.keys(grouped).forEach(pid => {
        const group = grouped[pid];
        // اسم المنتج
        const prod = products ? products.find(p => String(p.id) == pid) : null;
        const prodTitle = group[0].productDetails || (prod ? prod.title : (pid === 'general' ? 'تقييم عام' : `منتج #${pid}`));
        reviewsContainer.innerHTML += `<div style="margin-bottom:18px;"><div style="font-size:0.85rem; font-weight:bold; color:var(--main-color); margin-bottom:6px; border-bottom:1px solid #eee; padding-bottom:4px;">📦 ${_esc(prodTitle)}</div>`;
        group.forEach(rev => {
            const clientName = rev.clientName || rev.name || "عميل";
            const reviewText = rev.reviewText || rev.comment || "";
            const reviewDate = rev.reviewDate || rev.date || "";
            reviewsContainer.innerHTML += `
                <div style="background:#f5f2eb; padding:12px; border-radius:8px; margin-bottom:8px; border-right:4px solid #1a7f4b; text-align:right;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <strong>👤 ${_esc(clientName)}</strong>
                        <small style="color:#999;">${_esc(reviewDate)}</small>
                    </div>
                    <div style="margin-bottom:5px;">${generateStarsHTML(rev.rating || 5)}</div>
                    <p style="margin:0; color:#444; font-size:0.95rem;">"${_esc(reviewText)}"</p>
                </div>
            `;
        });
        reviewsContainer.innerHTML += `</div>`;
    });
}

function submitUserReviewAndClearTracking() {
    const reviewInput = document.getElementById('review-comment-input');
    if (!reviewInput || !reviewInput.value.trim()) { showAlert("✍️","تنبيه","يرجى كتابة تعليق أو تقييم أولاً!"); return; }
    const reviewText = reviewInput.value.trim();

    // نأخذ أول كود تتبع في القائمة
    let savedCodes = JSON.parse(localStorage.getItem('user_tracking_codes')) || [];
    if (savedCodes.length === 0) {
        showAlert("⚠️","لا يوجد طلب","لا يوجد كود تتبع مرتبط بهذا التقييم!");
        return;
    }
    var trackingCode = savedCodes[0];

    // التحقق من الطلب وأن حالته تم التسليم
    let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    let archived = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    let foundOrder = allOrders.find(o => o.orderId === trackingCode || o.id === trackingCode)
                   || archived.find(o => o.orderId === trackingCode || o.id === trackingCode);

    if (!foundOrder) {
        showAlert("❌","كود غير موجود","لم يتم العثور على الطلب المرتبط بهذا الكود!");
        return;
    }
    let status = foundOrder.status || foundOrder.orderStatus || "";
    if (!status.includes('التسليم')) {
        showAlert("⏳","لم يتم التسليم بعد","لا يمكنك التقييم إلا بعد أن يؤكد الأدمن استلامك للطلب.");
        return;
    }

    // التحقق أنه لم يقيّم هذا الطلب من قبل
    let reviews = JSON.parse(localStorage.getItem('global_store_reviews')) || [];
    let alreadyReviewed = reviews.find(r => r.orderId === trackingCode);
    if (alreadyReviewed) {
        showAlert("⚠️","قيّمت من قبل","لا يمكنك التقييم أكثر من مرة واحدة لنفس الطلب.");
        return;
    }

    reviews.push({
        reviewId: "REV-" + Math.floor(10000 + Math.random() * 90000),
        orderId: trackingCode,
        clientName: foundOrder ? (foundOrder.clientName || foundOrder.name) : "عميل المتجر",
        clientPhone: foundOrder ? (foundOrder.clientPhone || foundOrder.phone) : "",
        reviewText,
        rating: 5,
        reviewDate: new Date().toLocaleDateString('ar-EG'),
        productDetails: foundOrder ? (foundOrder.productsDetails || foundOrder.products) : ""
    });
    localStorage.setItem('global_store_reviews', JSON.stringify(reviews));
    globalReviews = reviews;

    // حذف كود التتبع بعد التقييم
    savedCodes.shift();
    localStorage.setItem('user_tracking_codes', JSON.stringify(savedCodes));
    updateTrackingCodesBox();

    showAlert("⭐","شكراً لتقييمك!","تم نشر مراجعتك بنجاح وستظهر على صفحة المنتجات.","رائع 🎉","primary");
    renderProductPageReviews();
    renderAdminReviewsTable();
    reviewInput.value = "";
}


// =========================================================================
// 10. التحقق من أرقام الهواتف والعناوين
// =========================================================================
function fixPhoneInputLive(inputElement) {
    let value = inputElement.value;
    if (!value.startsWith("01")) value = "01";
    let cleanValue = "01";
    for (let i = 2; i < value.length; i++) {
        let char = value[i];
        if (char >= '0' && char <= '9') {
            if (cleanValue.length === 2) {
                if (char === '0' || char === '1' || char === '2' || char === '5') cleanValue += char;
            } else {
                cleanValue += char;
            }
        }
    }
    if (cleanValue.length > 11) cleanValue = cleanValue.substring(0, 11);
    inputElement.value = cleanValue;
}

function setAddressMode(mode) {
    currentSelectedAddressMode = mode;
    const btnGps = document.getElementById('btn-loc-gps');
    const btnManual = document.getElementById('btn-loc-manual');
    const containerGps = document.getElementById('gps-location-container');
    const containerManual = document.getElementById('manual-location-container');
    if (!btnGps || !btnManual || !containerGps || !containerManual) return;
    if (mode === 'gps') {
        btnGps.classList.add('active'); btnManual.classList.remove('active');
        containerGps.style.display = 'block'; containerManual.style.display = 'none';
    } else {
        btnGps.classList.remove('active'); btnManual.classList.add('active');
        containerGps.style.display = 'none'; containerManual.style.display = 'block';
    }
}

function getUserCurrentGPSLocation() {
    const statusText = document.getElementById('gps-status-text');
    const coordsInput = document.getElementById('order-gps-coords');
    if (!statusText || !coordsInput) return;
    if (!navigator.geolocation) { statusText.innerHTML = "❌ جهازك لا يدعم تقنية GPS."; return; }
    statusText.innerHTML = "📡 جاري الاتصال بالأقمار الصناعية...";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
            coordsInput.value = mapsLink;
            statusText.innerHTML = `✅ تم تحديد موقعك! <a href="${mapsLink}" target="_blank" style="color:#1a7f4b;font-weight:bold;">📍 عرض على الخريطة</a>`;
            const addressField = document.getElementById('order-address');
            if (addressField) addressField.value = mapsLink;
            showToast("📍 تمت مزامنة موقعك بنجاح.");
        },
        (error) => { statusText.innerHTML = "❌ فشل جلب الموقع، يرجى تفعيل صلاحية الوصول أو الإدخال اليدوي."; },
        { enableHighAccuracy: false, timeout: 10000 }
    );
}

// ⚠️ المحافظات والمدن الآن تُدار من script-extra.js بشكل ديناميكي
// الكائن القديم محتفظ به كـ fallback فقط
const dynamicEgyptianCities = {
    "القاهرة": ["وسط البلد","مصر الجديدة","مدينة نصر","شبرا","شبرا الخيمة","المعادي","المقطم","حلوان","التجمع الأول","التجمع الخامس","القاهرة الجديدة","الرحاب","مدينة بدر","المطرية","عين شمس","الزيتون","عباسية","الأميرية","السلام","النزهة","الوايلي","البساتين","دار السلام","المنيل","روض الفرج","الشرابية","السيدة زينب","الخليفة","بولاق","إمبابة","الهرم","المريوطية","فيصل"],
    "الجيزة": ["الدقي","المهندسين","الهرم","فيصل","عين الصيرة","أوسيم","الجيزة","6 أكتوبر","الشيخ زايد","حدائق الأهرام","الحوامدية","العياط","الصف","أطفيح","البدرشين","كرداسة","أبو النمرس","الواحات البحرية"],
    "الإسكندرية": ["المنتزه","سموحة","ميامي","سيدي بشر","سيدي جابر","محرم بك","العجمي","المنشية","باب شرق","الرمل","ستانلي","لوران","أبو قير","برج العرب","الدخيلة","العامرية","بكوس","الجمرك","المفروضة"],
    "القليوبية": ["بنها","قليوب","شبرا الخيمة","الخانكة","طوخ","القناطر الخيرية","كفر شكر","الخصوص","قها","منشأة القناطر","أبو زعبل"],
    "الشرقية": ["الزقازيق","العاشر من رمضان","بلبيس","منيا القمح","فاقوس","أبو حماد","ههيا","كفر صقر","الإبراهيمية","الحسينية","ديرب نجم","مشتول السوق","أبو كبير","القنايات","الصالحية الجديدة"],
    "المنوفية": ["شبين الكوم","منوف","أشمون","مرشماشة","السادات","بركة السبع","الشهداء","تلا","قويسنا","الباجور"],
    "الغربية": ["طنطا","المحلة الكبرى","كفر الزيات","زفتى","السنطة","قطور","بسيون","سمنود"],
    "الدقهلية": ["المنصورة","دمياط","طلخا","ميت غمر","الزرقا","شربين","أجا","المنزلة","تمي الأمديد","بلقاس","السنبلاوين","ميت سلسيل"],
    "كفر الشيخ": ["كفر الشيخ","دسوق","فوه","قلين","بيلا","مطوبس","الرياض","برلس","الحامول"],
    "البحيرة": ["دمنهور","كفر الدوار","الرحمانية","شبراخيت","أبو حمص","المحمودية","حوش عيسى","إيتاي البارود","رشيد","إدكو","أبو المطامير","الدلنجات","وادي النطرون"],
    "الإسماعيلية": ["الإسماعيلية","القنطرة","أبو صوير","فايد","القصاصين"],
    "بورسعيد": ["بورسعيد","بور فؤاد","الزهور","الشرق","الغرب","المناخ","العرب"],
    "السويس": ["السويس","عتاقة","فيصل","الجناين"],
    "دمياط": ["دمياط","رأس البر","فارسكور","الزرقا","كفر سعد","عزبة البرج"],
    "الفيوم": ["الفيوم","سنورس","إطسا","طامية","يوسف الصديق","إبشواي"],
    "بني سويف": ["بني سويف","الواسطى","ناصر","إهناسيا","ببا","الفشن","سمسطا","نزلة"],
    "المنيا": ["المنيا","ملوي","دير مواس","مطاي","سمالوط","بني مزار","مغاغة","أبو قرقاص","العدوة"],
    "أسيوط": ["أسيوط","ديروط","القوصية","منفلوط","أبنوب","ساحل سليم","البداري","صدفا","الغنايم"],
    "سوهاج": ["سوهاج","أخميم","طما","طهطا","جرجا","البلينا","المراغة","دار السلام","ساقلته"],
    "قنا": ["قنا","نجع حمادي","دشنا","قوص","نقادة","فرشوط","أبو تشت","الوقف"],
    "الأقصر": ["الأقصر","إسنا","الأرمنت","القرنة","البياضية","الزينية"],
    "أسوان": ["أسوان","كوم أمبو","إدفو","أبو سمبل","دراو","نصر النوبة","كلابشة"],
    "البحر الأحمر": ["الغردقة","رأس غارب","سفاجا","القصير","مرسى علم","شرم الشيخ"],
    "الوادي الجديد": ["الخارجة","الداخلة","الفرافرة","بلاط","موط"],
    "مطروح": ["مرسى مطروح","سيوة","الضبعة","العلمين","الحمام","سيدي براني","النجيلة"],
    "شمال سيناء": ["العريش","بئر العبد","الشيخ زويد","رفح","حسنة","نخل"],
    "جنوب سيناء": ["طور سيناء","شرم الشيخ","دهب","نويبع","أبو رديس","سانت كاترين"]
};

function populateCitiesAndDistricts() {
    const provinceSelect = document.getElementById('order-province');
    const citySelect = document.getElementById('order-city');
    if (!provinceSelect || !citySelect) return;
    const selectedProvince = provinceSelect.value;
    citySelect.innerHTML = "";
    if (!selectedProvince || !dynamicEgyptianCities[selectedProvince]) {
        citySelect.innerHTML = `<option value="">-- اختر المحافظة أولاً --</option>`;
        return;
    }
    citySelect.innerHTML = `<option value="">-- اختر المدينة / المركز --</option>`;
    dynamicEgyptianCities[selectedProvince].forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });
    updateManualAddressString();
}

function updateManualAddressString() {
    const province = document.getElementById('order-province') ? document.getElementById('order-province').value : "";
    const city = document.getElementById('order-city') ? document.getElementById('order-city').value : "";
    const street = document.getElementById('order-street-details') ? document.getElementById('order-street-details').value.trim() : (document.getElementById('order-street-detail') ? document.getElementById('order-street-detail').value.trim() : "");
    const addressInput = document.getElementById('order-address');
    if (addressInput && province && city) {
        addressInput.value = `محافظة: ${province} | مدينة/مركز: ${city} | تفاصيل: ${street}`;
    }
}

function checkPaymentMethodFields() {
    const paymentSelect = document.getElementById('order-payment');
    const vashContainer = document.getElementById('vodafone-cash-container');
    if (!paymentSelect || !vashContainer) return;
    vashContainer.style.display = paymentSelect.value === 'فودافون كاش' ? 'block' : 'none';
}


// =========================================================================
// 11. إرسال الطلب النهائي (مع التحقق الصارم من الهاتف المصري + نافذة كاش جميلة)
// =========================================================================
function submitFinalOrder() {
    const nameInput  = document.getElementById('order-name');
    const phoneInput = document.getElementById('order-phone');
    const paymentInput = document.getElementById('order-payment');

    if (!nameInput || !phoneInput) {
        showAlert("❌","خطأ","عناصر الإدخال غير موجودة بالصفحة!");
        return;
    }

    const name    = nameInput.value.trim();
    const phone   = phoneInput.value.trim();
    const payment = paymentInput ? paymentInput.value : "الدفع عند الاستلام";
    let currentCart = JSON.parse(localStorage.getItem('global_store_cart')) || [];

    // التحقق من الاسم وعدد المنتجات
    if (!name) {
        showAlert("⚠️","بيانات ناقصة","برجاء كتابة اسمك الكريم أولاً!");
        return;
    }
    if (currentCart.length === 0) {
        showAlert("🛒","السلة فارغة","لا يوجد منتجات في السلة! أضف منتجات ثم أكمل.");
        return;
    }
    // التحقق الصارم من الهاتف المصري
    if (!validateEgyptianPhone(phone)) {
        showAlert("📵","رقم هاتف غير صحيح",
            "يجب أن يكون رقم الهاتف <strong>11 رقم</strong> ويبدأ بـ <strong>010</strong> أو <strong>011</strong> أو <strong>012</strong> أو <strong>015</strong> فقط.");
        phoneInput.focus();
        return;
    }

    // ✅ التحقق من العنوان قبل إتمام الطلب
    const manualBoxCheck = document.getElementById('manual-location-container');
    const gpsBoxCheck    = document.getElementById('gps-location-container');
    const isManualMode   = manualBoxCheck && manualBoxCheck.style.display !== 'none';
    const isGpsMode      = !isManualMode;

    if (isGpsMode) {
        const gpsCoords = document.getElementById('order-gps-coords');
        if (!gpsCoords || !gpsCoords.value || gpsCoords.value.trim() === '') {
            showAlert("📍", "العنوان مطلوب", "يجب تحديد موقعك أولاً! اضغط على زر <strong>تحديد موقعك الحالي</strong> أو اختر <strong>إدخال يدوي</strong> وأدخل عنوانك.");
            return;
        }
    } else {
        const provVal   = document.getElementById('order-province')     ? document.getElementById('order-province').value.trim()     : "";
        const cityVal   = document.getElementById('order-city')         ? document.getElementById('order-city').value.trim()         : "";
        const streetVal = document.getElementById('order-street-detail') ? document.getElementById('order-street-detail').value.trim() :
                          (document.getElementById('order-street-details') ? document.getElementById('order-street-details').value.trim() : "");
        if (!provVal || provVal === '') {
            showAlert("📍", "العنوان مطلوب", "برجاء اختيار <strong>المحافظة</strong> أولاً!");
            return;
        }
        if (!cityVal || cityVal === '') {
            showAlert("📍", "العنوان مطلوب", "برجاء اختيار <strong>المدينة / المركز</strong>!");
            return;
        }
        if (!streetVal) {
            showAlert("📍", "العنوان مطلوب", "برجاء كتابة <strong>اسم الشارع أو الحي</strong> لإتمام الطلب!");
            return;
        }
    }

    const _pol = document.getElementById('order-policy');
    if (_pol && !_pol.checked) { showAlert("📜", "سياسة الموقع", "لازم توافق على <strong>سياسة الموقع</strong> الأول عشان تكمّل الطلب."); return; }

    // دالة داخلية لإتمام الطلب
    function _finalizeOrder(transferNumber) {
        let addressDetail = "تحديد تلقائي (GPS)";
        const manualBox = document.getElementById('manual-location-container');
        const gpsCoords = document.getElementById('order-gps-coords');
        if (manualBox && manualBox.style.display !== 'none') {
            const prov   = document.getElementById('order-province')     ? document.getElementById('order-province').value     : "";
            const city   = document.getElementById('order-city')         ? document.getElementById('order-city').value         : "";
            const street = document.getElementById('order-street-detail') ? document.getElementById('order-street-detail').value :
                           (document.getElementById('order-street-details') ? document.getElementById('order-street-details').value : "");
            const _place = (document.getElementById('order-place-name') || {value:''}).value.trim();
            addressDetail = `${_place ? _place + ' - ' : ''}${prov} - ${city} - ${street}`;
            try { localStorage.setItem('saved_delivery_address', JSON.stringify({ place: _place, prov: prov, city: city, street: street, name: name, phone: phone })); } catch (e) {}
        } else if (gpsCoords && gpsCoords.value) {
            addressDetail = gpsCoords.value;
        }

        const trackingCode = "MAKTAB-" + Math.floor(100000 + Math.random() * 900000);
        localStorage.setItem('persistent_user_tracking_code', trackingCode);

        let totalPriceText = "0 ج.م";
        const totalEl = document.getElementById('cart-total');
        if (totalEl) {
            totalPriceText = totalEl.innerText;
        } else {
            let sum = currentCart.reduce((acc, item) => acc + (Number(item.calculatedPrice || item.price) || 0), 0);
            totalPriceText = (sum + 50) + " ج.م";
        }

        let itemsSummary = currentCart.map(i => `${i.title || 'منتج'} (${i.chosenSize || 'L'} - ${i.chosenColor || 'ملون'})`).join(' ، ');
        let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];

        const newOrder = {
            orderId: trackingCode, id: trackingCode,
            clientName: name, customerName: name, name: name,
            clientPhone: phone, customerPhone: phone, phone: phone,
            clientAddress: addressDetail, customerAddress: addressDetail, address: addressDetail,
            paymentMethod: payment, payment: payment,
            transferNumber: transferNumber || "",
            productsDetails: itemsSummary, products: itemsSummary,
            orderDate: new Date().toLocaleString('ar-EG', {timeZone:'Africa/Cairo'}), date: new Date().toLocaleString('ar-EG', {timeZone:'Africa/Cairo'}),
            orderStatus: "جاري التجهيز 📦", status: "جاري التجهيز 📦",
            finalPrice: totalPriceText, bill: totalPriceText, total: totalPriceText,
            cartItems: currentCart, items: currentCart,
            itemsCount: currentCart.length,
            timestamp: Date.now(),
            cartSnapshot: JSON.parse(JSON.stringify(currentCart))
        };

        if (activeAppliedCoupon) {
            userClaimedCoupons = userClaimedCoupons.map(c =>
                c.code === activeAppliedCoupon.code ? { ...c, status: "used" } : c
            );
            localStorage.setItem('user_claimed_coupons', JSON.stringify(userClaimedCoupons));
            localStorage.removeItem('active_applied_coupon');
            activeAppliedCoupon = null;
        }

        allOrders.push(newOrder);
        localStorage.setItem('global_store_orders', JSON.stringify(allOrders));
        orders = allOrders;
        // ── Firebase: حفظ الطلب ──
        if (typeof window.FB_saveOrder === 'function') window.FB_saveOrder(newOrder);
        localStorage.removeItem('global_store_cart');
        cart = [];

        // حفظ الكود في قائمة الأكواد
        var savedCodes = JSON.parse(localStorage.getItem('user_tracking_codes')) || [];
        if (!savedCodes.includes(trackingCode)) {
            savedCodes.push(trackingCode);
            localStorage.setItem('user_tracking_codes', JSON.stringify(savedCodes));
        }

        showTrackingModal(trackingCode).then(function() {
            updateCartCountBadge();
            updateTrackingCodesBox();
            window.location.href = "track.html";
        });
    }

    // إذا كان الدفع كاش → نافذة التحويل
    const isCash = payment.includes('فودافون');
    if (isCash) {
        showCashPaymentModal().then(function(result) {
            if (!result.confirmed) return;
            _finalizeOrder(result.transferNumber);
        });
    } else {
        _finalizeOrder(null);
    }
}

function checkPersistentTrackingCode() {
    const trackingBox = document.getElementById('sticky-tracking-box');
    const savedCode = localStorage.getItem('persistent_user_tracking_code');
    if (savedCode && trackingBox) {
        // أضف الكود لقائمة الأكواد المحفوظة
        let savedCodes = JSON.parse(localStorage.getItem('user_tracking_codes')) || [];
        if (!savedCodes.includes(savedCode)) {
            savedCodes.push(savedCode);
            localStorage.setItem('user_tracking_codes', JSON.stringify(savedCodes));
        }
        localStorage.removeItem('persistent_user_tracking_code');
    }
    updateTrackingCodesBox();
}

function updateTrackingCodesBox() {
    const trackingBox = document.getElementById('sticky-tracking-box');
    if (!trackingBox) return;
    let savedCodes = JSON.parse(localStorage.getItem('user_tracking_codes')) || [];
    if (savedCodes.length === 0) {
        trackingBox.style.display = "none";
        return;
    }
    trackingBox.style.display = "block";
    trackingBox.innerHTML = `
        <h3 style="color:#14203a; margin:0 0 12px 0; font-size:1rem;">📦 أكواد التتبع الخاصة بك</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
            ${savedCodes.map(code => {
                let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
                let archived = JSON.parse(localStorage.getItem('global_store_archive')) || [];
                let order = allOrders.find(o => o.id === code || o.orderId === code)
                          || archived.find(o => o.id === code || o.orderId === code);
                let status = order ? (order.status || order.orderStatus || 'جاري التجهيز 📦') : 'غير موجود';
                let statusColor = status.includes('التسليم') ? '#27ae60' : status.includes('شحن') ? '#3498db' : '#e67e22';
                return `<div style="display:flex;align-items:center;justify-content:space-between;background:#fff;padding:10px;border-radius:8px;border:1px solid #dde4ef;flex-wrap:wrap;gap:8px;">
                    <span style="font-weight:700;color:#1b2a4a;font-size:0.95rem;direction:ltr;">${code}</span>
                    <span style="color:${statusColor};font-size:0.85rem;font-weight:600;">${status}</span>
                </div>`;
            }).join('')}
        </div>
        <p style="font-size:0.8rem;color:#888;margin-top:10px;">أكواد التتبع تُحذف تلقائياً بعد التقييم ✅</p>
    `;
}


// =========================================================================
// 12. السلة المتقدمة مع الكوبونات
// =========================================================================
let activeAppliedCoupon = JSON.parse(localStorage.getItem('active_applied_coupon')) || null;
let userClaimedCoupons = JSON.parse(localStorage.getItem('user_claimed_coupons')) || [];

function renderCartItemsGrid() {
    const tableBody = document.getElementById('cart-items-table-body');
    if (!tableBody) return;
    let currentCart = JSON.parse(localStorage.getItem('global_store_cart')) || [];
    const checkoutSec = document.getElementById('checkout-section');

    tableBody.innerHTML = "";

    if (currentCart.length === 0) {
        tableBody.innerHTML = `<div class="ct-empty"><b>سلتك فاضية</b><p>أضف قطع من المعرض وتعالى كمّل طلبك.</p><a class="ac-btn" href="shop.html">تصفح المعرض</a></div>`;
        if (checkoutSec) checkoutSec.style.display = "none";
        updateCartSummaryLabels(0, 0, 0);
        updateTrackingCodesBox();
        return;
    }

    if (checkoutSec) checkoutSec.style.display = "block";
    let subtotal = 0, totalDiscount = 0;

    currentCart.forEach((item, index) => {
        const _cat = (typeof products!=='undefined'&&products.find(p=>String(p.id)===String(item.id)))||null;
        if(_cat){item.price=Number(_cat.price)||0;item.discount=Math.min(100,Math.max(0,Number(_cat.discount)||0));item.category=_cat.category;}
        item.qty=Math.min(20,Math.max(1,parseInt(item.qty)||1));
        let basePrice = Math.max(0,Number(item.price)||0);
        if (item.discount > 0) basePrice = basePrice - (basePrice * (item.discount / 100));
        let qty = item.qty || 1;
        let itemTotal = basePrice * qty;
        item.calculatedPrice = basePrice;
        subtotal += itemTotal;

        if (activeAppliedCoupon) {
            if (activeAppliedCoupon.target === "كل الفئات" || item.category === activeAppliedCoupon.target) {
                totalDiscount += itemTotal * (activeAppliedCoupon.percent / 100);
            }
        }

        const _sz = item.chosenSize || item.size || 'افتراضي', _cl = /^#[0-9a-fA-F]{3,8}$/.test(String(item.chosenColor || item.color)) ? (item.chosenColor || item.color) : '#ccc';
        tableBody.insertAdjacentHTML('beforeend', `
            <article class="ct-item">
                <img class="ct-img" src="${_esc(item.img)}" alt="">
                <div class="ct-info">
                    <h3 class="ct-title">${_esc(item.title)}</h3>
                    <div class="ct-meta">المقاس: ${_esc(_sz)}<i class="ct-dot" style="background:${_cl}"></i></div>
                    <div class="ct-unit">${basePrice.toFixed(2)} ج.م للقطعة</div>
                    <div class="ct-row">
                        <div class="ct-qty">
                            <button type="button" aria-label="زيادة" onclick="cartChangeQty(${index}, 1)">+</button>
                            <span>${qty}</span>
                            <button type="button" aria-label="نقصان" onclick="cartChangeQty(${index}, -1)">−</button>
                        </div>
                        <button type="button" class="ct-del" onclick="removeCartItemByIndex(${index})">حذف</button>
                    </div>
                </div>
                <div class="ct-total">${itemTotal.toFixed(2)}<small>ج.م</small></div>
            </article>`);
    });

    // حفظ التحديث مع الكميات
    localStorage.setItem('global_store_cart', JSON.stringify(currentCart));
    cart = currentCart;

    let shipping = 50;
    const _provSel = document.getElementById('order-province');
    if (_provSel && _provSel.value && typeof getShippingPriceForProvince === 'function') {
        shipping = getShippingPriceForProvince(_provSel.value);
    }
    updateCartSummaryLabels(subtotal, totalDiscount, shipping);
    updateTrackingCodesBox();
}

function cartChangeQty(index, delta) {
    let currentCart = JSON.parse(localStorage.getItem('global_store_cart')) || [];
    if (!currentCart[index]) return;
    let newQty = Math.min(20,(currentCart[index].qty || 1) + delta);
    if (newQty < 1) {
        showConfirm('🗑️','حذف المنتج','هل تريد حذف هذا المنتج من السلة؟','نعم احذفه','لا','danger').then(function(ok){
            if (!ok) return;
            currentCart.splice(index, 1);
            localStorage.setItem('global_store_cart', JSON.stringify(currentCart));
            cart = currentCart;
            updateCartCountBadge();
            renderCartItemsGrid();
        });
        return;
    }
    currentCart[index].qty = newQty;
    localStorage.setItem('global_store_cart', JSON.stringify(currentCart));
    cart = currentCart;
    renderCartItemsGrid();
}

function updateCartSummaryLabels(subtotal, discount, shipping) {
    if (!document.getElementById('cart-subtotal')) return;
    document.getElementById('cart-subtotal').innerText = subtotal.toFixed(2) + " ج.م";
    if (document.getElementById('cart-discount-val')) document.getElementById('cart-discount-val').innerText = discount.toFixed(2) + " ج.م";
    if (document.getElementById('cart-shipping-val')) document.getElementById('cart-shipping-val').innerText = shipping.toFixed(2) + " ج.م";
    document.getElementById('cart-total').innerText = ((subtotal - discount) + shipping).toFixed(2) + " ج.م";
}

function removeCartItemByIndex(index) {
    let currentCart = JSON.parse(localStorage.getItem('global_store_cart')) || [];
    currentCart.splice(index, 1);
    localStorage.setItem('global_store_cart', JSON.stringify(currentCart));
    cart = currentCart;
    updateCartCountBadge();
    renderCartItemsGrid();
}

function applyStoreCoupon() {
    const inputVal = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (!inputVal) return;

    // ✅ فقط الكوبونات الموجودة في محفظة المستخدم (من عجلة الحظ)
    const userCoupons = JSON.parse(localStorage.getItem('user_claimed_coupons')) || [];
    let foundCoupon = userCoupons.find(c => c.code === inputVal && c.status === 'active');

    if (!foundCoupon) {
        showAlert("❌","كود غير صحيح","هذا الكود غير موجود في محفظتك! العب عجلة الحظ للحصول على كوبون خصم 🎡");
        return;
    }
    if (foundCoupon.expireAt && Date.now() > foundCoupon.expireAt) {
        showAlert("⏰","انتهت صلاحية الكود","هذا الكود منتهي الصلاحية، العب مجدداً للحصول على كوبون جديد!");
        return;
    }
    if (foundCoupon.status === 'used') {
        showAlert("🚫","كود مستخدم","هذا الكود تم استخدامه بالفعل في طلب سابق!");
        return;
    }

    activeAppliedCoupon = foundCoupon;
    localStorage.setItem('active_applied_coupon', JSON.stringify(activeAppliedCoupon));
    showAlert("✅","تم تطبيق الخصم!",`خصم <strong>${foundCoupon.percent}%</strong> على منتجات <strong>${foundCoupon.target}</strong>`,"رائع 🎉","primary");
    renderCartItemsGrid();
}


// =========================================================================
// 13. عجلة الحظ والجوائز
// =========================================================================
let wheelGiftsList = JSON.parse(localStorage.getItem('global_store_gifts')) || [
    { text: "خصم 10% لكل المتجر", code: "LOVE10" },
    { text: "خصم 15% على الرجالي", code: "MEN15" },
    { text: "خصم 20% للقطع الحريمي", code: "WOW20" },
    { text: "شحن مجاني بالكامل", code: "FREEFORYOU" },
    { text: "خصم 50 ج.م كاش", code: "CASH50" },
    { text: "هدية قطعتين بسعر قطعة", code: "DOUBLE" }
];

let advancedGiftsList = JSON.parse(localStorage.getItem('global_store_gifts_adv')) || [
    { type: "discount", text: "خصم 10% على كل الفئات", percent: 10, target: "كل الفئات", code: "HAZEM10", duration: 30 },
    { type: "discount", text: "خصم 20% على الملابس الرجالي", percent: 20, target: "رجالي", code: "MEN20", duration: 60 },
    { type: "discount", text: "خصم 15% على الملابس الحريمي", percent: 15, target: "حريمي", code: "WOMEN15", duration: 45 },
    { type: "no-luck", text: "حظ أوفر المرة القادمة! 😅", percent: 0, target: "لا يوجد", code: "NOLUCK", duration: 0 }
];

function addNewGiftToWheelStorage() {
    const textInput = document.getElementById('admin-gift-name');
    const codeInput = document.getElementById('admin-gift-code');
    if (!textInput || !codeInput || !textInput.value.trim() || !codeInput.value.trim()) {
        showAlert("⚠️","بيانات ناقصة","من فضلك اكتب اسم الجائزة وكود الخصم أولاً!"); return;
    }
    wheelGiftsList.push({ text: textInput.value.trim(), code: codeInput.value.trim().toUpperCase() });
    localStorage.setItem('global_store_gifts', JSON.stringify(wheelGiftsList));
    textInput.value = ""; codeInput.value = "";
    showToast("تم إدراج الجائزة الجديدة لعجلة الحظ بنجاح! 🎁");
    renderAdminGiftsTableGrid();
}

function renderAdminGiftsTableGrid() {
    const tableBody = document.getElementById('admin-gifts-list-table');
    if (!tableBody) return;
    tableBody.innerHTML = "";
    wheelGiftsList.forEach((gift, idx) => {
        tableBody.innerHTML += `
            <tr>
                <td style="font-weight:bold; color:#14203a;">🎁 ${gift.text}</td>
                <td><span style="background:#d9962b; padding:3px 8px; border-radius:4px; font-weight:bold;">${gift.code}</span></td>
                <td style="text-align:center;"><button onclick="deleteGiftFromWheel(${idx})" style="background:#c7254e; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف 🗑</button></td>
            </tr>
        `;
    });
}

function deleteGiftFromWheel(index) {
    wheelGiftsList.splice(index, 1);
    localStorage.setItem('global_store_gifts', JSON.stringify(wheelGiftsList));
    renderAdminGiftsTableGrid();
}

function addNewAdvancedGiftToWheel() {
    const type = document.getElementById('admin-gift-type').value;
    if (type === 'no-luck') {
        advancedGiftsList.push({ type: "no-luck", text: "حظ أوفر المرة القادمة! 😅", percent: 0, target: "لا يوجد", code: "NOLUCK", duration: 0 });
    } else {
        const percent = parseInt(document.getElementById('admin-gift-percent').value);
        const target = document.getElementById('admin-gift-target').value;
        const duration = parseInt(document.getElementById('admin-gift-duration').value);
        if (!percent || !duration) { showAlert("⚠️","بيانات ناقصة","برجاء إدخال نسبة الخصم والمدة!"); return; }
        const generatedCode = "GIFT" + Math.floor(1000 + Math.random() * 9000);
        advancedGiftsList.push({ type: "discount", text: `خصم ${percent}% على المنتجات (${target})`, percent, target, code: generatedCode, duration });
    }
    localStorage.setItem('global_store_gifts_adv', JSON.stringify(advancedGiftsList));
    showToast("تم حفظ الجائزة في إعدادات العجلة!");
    renderAdminAdvancedGiftsTable();
}

function renderAdminAdvancedGiftsTable() {
    const tbody = document.getElementById('admin-gifts-list-table');
    if (!tbody) return;
    tbody.innerHTML = "";
    advancedGiftsList.forEach((g, idx) => {
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #eee; height: 40px;">
                <td>${g.text}</td>
                <td>${g.target}</td>
                <td><span style="background:#d9962b; padding:2px 6px; border-radius:4px; font-weight:bold;">${g.code}</span></td>
                <td>${g.duration > 0 ? g.duration + ' دقيقة' : 'فوري'}</td>
                <td style="text-align:center;"><button onclick="deleteAdvancedGift(${idx})" style="background:#c7254e; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer;">حذف</button></td>
            </tr>
        `;
    });
}

function deleteAdvancedGift(idx) {
    advancedGiftsList.splice(idx, 1);
    localStorage.setItem('global_store_gifts_adv', JSON.stringify(advancedGiftsList));
    renderAdminAdvancedGiftsTable();
}

let isWheelSpinningNow = false;

function startLuckyWheelSpin() {
    const wheelElement = document.getElementById('lucky-wheel-element');
    const spinButton = document.getElementById('spin-action-btn');
    if (!wheelElement || isWheelSpinningNow) return;

    isWheelSpinningNow = true;
    spinButton.disabled = true;
    spinButton.innerText = "جاري تدوير العجلة... 🎡";

    const randomDegrees = Math.floor(Math.random() * 360) + 2880;
    wheelElement.style.transform = `rotate(${randomDegrees}deg)`;

    setTimeout(() => {
        const actualDegrees = randomDegrees % 360;
        const total = advancedGiftsList.length;
        let winningIndex = Math.floor((360 - actualDegrees) / (360 / total));
        if (winningIndex >= total || winningIndex < 0) winningIndex = 0;
        const prize = advancedGiftsList[winningIndex];

        document.getElementById('prize-result-box').style.display = 'block';
        document.getElementById('prize-text').innerText = prize.text;

        if (prize.type === 'no-luck') {
            document.getElementById('prize-coupon-element').innerText = "حظ سعيد المرة القادمة";
            document.getElementById('prize-coupon-element').style.background = "#95a5a6";
        } else {
            document.getElementById('prize-coupon-element').innerText = prize.code;
            document.getElementById('prize-coupon-element').style.background = "#f1c40f";
            const expireTime = Date.now() + (prize.duration * 60 * 1000);
            userClaimedCoupons.push({ ...prize, expireAt: expireTime, status: "active" });
            localStorage.setItem('user_claimed_coupons', JSON.stringify(userClaimedCoupons));
            renderUserCouponsWallet();
        }

        spinButton.innerText = "تم السحب بنجاح 🎉";
        localStorage.setItem('user_has_spun_wheel', 'true');
        isWheelSpinningNow = false;
    }, 4000);
}

function initGiftsPageSystem() {
    renderAdminGiftsTableGrid();
}

function renderUserCouponsWallet() {
    const walletContainer = document.getElementById('user-active-coupons-wallet');
    if (!walletContainer) return;
    if (userClaimedCoupons.length === 0) {
        walletContainer.innerHTML = "<p style='color:#aaa; text-align:center;'>المحفظة فارغة، لم تفز بأي أكواد بعد.</p>";
        return;
    }
    walletContainer.innerHTML = "";
    userClaimedCoupons.forEach((coupon, idx) => {
        let statusText = "";
        let timeLeft = Math.max(0, Math.floor((coupon.expireAt - Date.now()) / 1000));
        if (coupon.status === 'used') {
            statusText = "<span style='color:#2ecc71; font-weight:bold;'>تم الاستخدام ✅</span>";
        } else if (timeLeft <= 0) {
            coupon.status = 'expired';
            statusText = "<span style='color:#e74c3c; font-weight:bold;'>منتهي الصلاحية ❌</span>";
        } else {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            statusText = `<span style='color:#e67e22; font-weight:bold;'>متبقي: ${minutes} د و ${seconds} ث ⏱</span>`;
        }
        walletContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:12px; border-radius:8px; border:1px solid #edf2f7; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
                <div>
                    <strong style="color:#14203a;">${coupon.text}</strong>
                    <div style="font-size:0.8rem; color:#777; margin-top:4px;">كود الخصم: <span style="background:#d9962b; padding:2px 5px; font-weight:bold; border-radius:3px; color:#000;">${_esc(coupon.code)}</span> <button onclick="_adminCopy(this.dataset.c)" data-c="${_esc(coupon.code)}" style="background:linear-gradient(135deg,#1b2a4a,#1b2a4a);color:#fff;border:none;border-radius:5px;padding:3px 8px;cursor:pointer;font-size:0.72rem;font-weight:700;vertical-align:middle;">📋 نسخ</button></div>
                </div>
                <div>${statusText}</div>
            </div>
        `;
    });
}

setInterval(() => {
    if (document.getElementById('user-active-coupons-wallet')) renderUserCouponsWallet();
}, 1000);

// =========================================================================
// MODAL SYSTEM - بديل جميل لكل alert و confirm
// =========================================================================
function createModalStyles() {
    if (document.getElementById('store-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'store-modal-styles';
    style.textContent = `
        .store-modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.55);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; animation: fadeInOverlay 0.2s ease;
            backdrop-filter: blur(3px);
        }
        @keyframes fadeInOverlay { from { opacity:0; } to { opacity:1; } }
        .store-modal-box {
            background: #fff; border-radius: 18px; padding: 35px 30px 28px;
            max-width: 420px; width: 90%; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
            animation: slideUpModal 0.25s cubic-bezier(.4,1.4,.6,1);
            direction: rtl;
        }
        @keyframes slideUpModal { from { transform: translateY(40px) scale(0.95); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }
        .store-modal-icon { font-size: 3rem; margin-bottom: 12px; display: block; }
        .store-modal-title { font-size: 1.3rem; font-weight: 700; color: #2c3e50; margin-bottom: 10px; }
        .store-modal-body { font-size: 1rem; color: #555; line-height: 1.7; margin-bottom: 22px; }
        .store-modal-body strong { color: #2c3e50; font-size:1.1rem; }
        .store-modal-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .store-modal-btn {
            padding: 11px 28px; border-radius: 10px; border: none; font-size: 1rem;
            font-weight: 700; cursor: pointer; transition: all 0.18s;
            min-width: 100px; font-family: inherit;
        }
        .store-modal-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.15); }
        .store-modal-btn.primary { background: linear-gradient(135deg, #2ecc71, #27ae60); color: #fff; }
        .store-modal-btn.danger  { background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; }
        .store-modal-btn.secondary { background: #f0f3f8; color: #2c3e50; border: 1px solid #dde4ef; }
        .store-modal-btn.info { background: linear-gradient(135deg, #3498db, #2980b9); color: #fff; }
        .store-modal-cash-box {
            background: linear-gradient(135deg, #fff8e1, #fff3cd);
            border: 2px dashed #f39c12; border-radius: 12px; padding: 18px;
            margin: 15px 0; text-align: center;
        }
        .store-modal-phone-num {
            font-size: 1.8rem; font-weight: 900; color: #e67e22;
            letter-spacing: 2px; direction: ltr; display: block; margin: 8px 0;
        }
        .store-modal-transfer-input {
            width: 100%; padding: 11px; border: 2px solid #dde4ef; border-radius: 9px;
            font-size: 1rem; text-align: center; margin-top: 10px; direction: ltr;
            font-family: monospace; letter-spacing: 1px; transition: border 0.2s;
            box-sizing: border-box;
        }
        .store-modal-transfer-input:focus { outline: none; border-color: #3498db; }
        .store-modal-transfer-input.error { border-color: #e74c3c; animation: shake 0.3s; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
    `;
    document.head.appendChild(style);
}

function showAlert(icon, title, body, btnText, btnClass) {
    btnText = btnText || 'حسناً';
    btnClass = btnClass || 'primary';
    createModalStyles();
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'store-modal-overlay';
        overlay.innerHTML = '<div class="store-modal-box">' +
            '<span class="store-modal-icon">' + icon + '</span>' +
            '<div class="store-modal-title">' + title + '</div>' +
            '<div class="store-modal-body">' + body + '</div>' +
            '<div class="store-modal-btns"><button class="store-modal-btn ' + btnClass + '" id="sm-ok-btn">' + btnText + '</button></div>' +
            '</div>';
        document.body.appendChild(overlay);
        overlay.querySelector('#sm-ok-btn').onclick = function() { overlay.remove(); resolve(true); };
    });
}

function showConfirm(icon, title, body, confirmText, cancelText, confirmClass) {
    confirmText = confirmText || 'تأكيد';
    cancelText = cancelText || 'إلغاء';
    confirmClass = confirmClass || 'danger';
    createModalStyles();
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'store-modal-overlay';
        overlay.innerHTML = '<div class="store-modal-box">' +
            '<span class="store-modal-icon">' + icon + '</span>' +
            '<div class="store-modal-title">' + title + '</div>' +
            '<div class="store-modal-body">' + body + '</div>' +
            '<div class="store-modal-btns">' +
            '<button class="store-modal-btn ' + confirmClass + '" id="sm-confirm-btn">' + confirmText + '</button>' +
            '<button class="store-modal-btn secondary" id="sm-cancel-btn">' + cancelText + '</button>' +
            '</div></div>';
        document.body.appendChild(overlay);
        overlay.querySelector('#sm-confirm-btn').onclick = function() { overlay.remove(); resolve(true); };
        overlay.querySelector('#sm-cancel-btn').onclick  = function() { overlay.remove(); resolve(false); };
    });
}

function showCashPaymentModal() {
    createModalStyles();
    return new Promise(function(resolve) {
        var transferNum = (siteConfig && siteConfig.transferPhone) ? siteConfig.transferPhone : '01204022242';
        var overlay = document.createElement('div');
        overlay.className = 'store-modal-overlay';
        overlay.innerHTML = '<div class="store-modal-box">' +
            '<span class="store-modal-icon">💵</span>' +
            '<div class="store-modal-title">تأكيد الدفع والتحويل</div>' +
            '<div class="store-modal-body">' +
            '<div class="store-modal-cash-box">' +
            '<div style="font-size:0.95rem;color:#7f8c8d;margin-bottom:4px;">📲 يرجى التحويل على الرقم التالي:</div>' +
            '<span class="store-modal-phone-num">' + transferNum + '</span>' +
            '<div style="font-size:0.82rem;color:#888;">بعد التحويل أدخل رقم العملية أدناه لتأكيد طلبك</div>' +
            '</div>' +
            '<label style="font-size:0.9rem;color:#555;display:block;margin-bottom:6px;text-align:right;">📝 أدخل رقم التحويل (11 رقم يبدأ بـ 010/011/012/015):</label>' +
            '<input type="tel" id="sm-transfer-input" class="store-modal-transfer-input" placeholder="01xxxxxxxxx" maxlength="11" inputmode="numeric">' +
            '<div id="sm-transfer-error" style="color:#c7254e;font-size:0.82rem;margin-top:6px;display:none;"></div>' +
            '</div>' +
            '<div class="store-modal-btns">' +
            '<button class="store-modal-btn primary" id="sm-cash-ok">✅ تأكيد وإرسال الطلب</button>' +
            '<button class="store-modal-btn secondary" id="sm-cash-cancel">إلغاء</button>' +
            '</div></div>';
        document.body.appendChild(overlay);

        var input = overlay.querySelector('#sm-transfer-input');
        var errDiv = overlay.querySelector('#sm-transfer-error');

        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g,'').slice(0,11);
        });

        overlay.querySelector('#sm-cash-ok').onclick = function() {
            var val = input.value.trim();
            var valid = /^(010|011|012|015)\d{8}$/.test(val);
            if (!valid) {
                input.classList.add('error');
                errDiv.style.display = 'block';
                errDiv.textContent = 'رقم التحويل غير صحيح! يجب 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015';
                setTimeout(function(){ input.classList.remove('error'); }, 400);
                return;
            }
            overlay.remove();
            resolve({ confirmed: true, transferNumber: val });
        };
        overlay.querySelector('#sm-cash-cancel').onclick = function() { overlay.remove(); resolve({ confirmed: false }); };
    });
}

function validateEgyptianPhone(phone) {
    return /^(010|011|012|015)\d{8}$/.test(phone.trim());
}

function enforcePhoneInput(inputEl) {
    if (!inputEl) return;
    inputEl.setAttribute('maxlength', '11');
    inputEl.setAttribute('inputmode', 'numeric');
    inputEl.addEventListener('input', function() {
        var val = this.value.replace(/\D/g, '');
        if (val.length > 11) val = val.slice(0, 11);
        this.value = val;
    });
    inputEl.addEventListener('keydown', function(e) {
        var allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
    });
}


// =========================================================================
// PERFORMANCE & SCALABILITY IMPROVEMENTS
// =========================================================================

// Debounce - منع الضغط المتكرر على الأزرار
function debounce(fn, delay) {
    var timer;
    return function() {
        var ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){ fn.apply(ctx, args); }, delay);
    };
}

// Throttle - تحديد معدل تنفيذ الدوال المتكررة
function throttle(fn, limit) {
    var lastCall = 0;
    return function() {
        var now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return fn.apply(this, arguments);
        }
    };
}

// Queue للطلبات المتزامنة - منع تعارض الحفظ في localStorage
var _storageQueue = [];
var _storageRunning = false;
function queueStorageWrite(key, data) {
    _storageQueue.push({ key: key, data: data });
    if (!_storageRunning) _processStorageQueue();
}
function _processStorageQueue() {
    if (_storageQueue.length === 0) { _storageRunning = false; return; }
    _storageRunning = true;
    var task = _storageQueue.shift();
    try {
        localStorage.setItem(task.key, typeof task.data === 'string' ? task.data : JSON.stringify(task.data));
    } catch(e) {
        console.warn('Storage write failed:', e);
    }
    setTimeout(_processStorageQueue, 10);
}

// Virtual scroll للجداول الكبيرة - عرض 50 عنصر فقط في المرة
function renderTableVirtualized(data, renderRowFn, tbodyId, pageSize) {
    pageSize = pageSize || 50;
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    var slice = data.slice(0, pageSize);
    slice.forEach(function(item, idx) {
        tbody.innerHTML += renderRowFn(item, idx);
    });
    if (data.length > pageSize) {
        var remaining = data.length - pageSize;
        tbody.innerHTML += '<tr><td colspan="10" style="text-align:center; padding:12px; background:#f5f2eb;">' +
            '<button onclick="this.parentElement.parentElement.innerHTML+=\'\'" ' +
            'style="background:#1b2a4a; color:#fff; border:none; padding:8px 20px; border-radius:6px; cursor:pointer;">' +
            'عرض ' + remaining + ' عنصر إضافي...</button></td></tr>';
    }
}

// Cache للبيانات المحسوبة
var _cache = {};
function cacheGet(key) { return _cache[key] || null; }
function cacheSet(key, val, ttlMs) {
    _cache[key] = val;
    if (ttlMs) setTimeout(function(){ delete _cache[key]; }, ttlMs);
}
function cacheClear(prefix) {
    Object.keys(_cache).forEach(function(k){ if (!prefix || k.indexOf(prefix) === 0) delete _cache[k]; });
}

// Image lazy loading
function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    var imgs = document.querySelectorAll('img[data-src]');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });
    imgs.forEach(function(img) { observer.observe(img); });
}

// تطبيق debounce على البحث
var debouncedSearch = debounce(function(query) {
    var input = document.getElementById('admin-search-input');
    if (input) searchAdminProducts();
}, 300);

// منع الضغط المزدوج على زر إرسال الطلب
(function() {
    var _submitting = false;
    var _origSubmit = window.submitFinalOrder;
    if (typeof _origSubmit === 'function') {
        window.submitFinalOrder = function() {
            if (_submitting) return;
            _submitting = true;
            var btn = document.querySelector('.btn-submit');
            if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
            setTimeout(function(){ _submitting = false; if(btn){btn.disabled=false;btn.style.opacity='1';} }, 3000);
            _origSubmit.apply(this, arguments);
        };
    }
})();

// تحسين أداء localStorage - دمج عمليات الكتابة
var _lsBatchTimer = null;
var _lsBatch = {};
function lsSetBatch(key, val) {
    _lsBatch[key] = val;
    clearTimeout(_lsBatchTimer);
    _lsBatchTimer = setTimeout(function() {
        Object.keys(_lsBatch).forEach(function(k) {
            try { localStorage.setItem(k, JSON.stringify(_lsBatch[k])); } catch(e) {}
        });
        _lsBatch = {};
    }, 50);
}

window.addEventListener('DOMContentLoaded', function() {
    initLazyImages();
});

// =========================================================================
// USER SYSTEM - نظام المستخدمين والدخول السريع
// =========================================================================
// ── المستخدم الحالي (الدخول والتسجيل في login.html و profile.html عبر auth.js) ──
function setCurrentUser(user) { localStorage.setItem('current_user', JSON.stringify(user)); }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem('current_user')) || null; } catch (e) { return null; } }
function renderUserLoginBox() {}
function updateNavUserDisplay() {
    var cart = JSON.parse(localStorage.getItem('global_store_cart')) || [];
    var total = cart.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
    document.querySelectorAll('#cart-count, .cart-badge-nav').forEach(function (el) { el.innerText = total; });
}
function generatePassword(len) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', out = '', n = len || 10, arr = new Uint32Array(n);
    crypto.getRandomValues(arr); for (var i = 0; i < n; i++) out += chars[arr[i] % chars.length]; return out;
}

// Admin users management
function renderAdminUsersTable() {
    var tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;
    var users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    tbody.innerHTML = '';
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#aaa;">لا يوجد مستخدمون بعد.</td></tr>';
        return;
    }
    users.forEach(function(u, i) {
        tbody.innerHTML += '<tr style="' + (u.isBanned ? 'background:#fbeff2;' : '') + '">' +
            '<td style="font-weight:bold;color:#1b2a4a;white-space:nowrap;">' + u.userId +
            ' <button onclick="_adminCopy(\'' + u.userId + '\')" title="نسخ ID" style="background:#1b2a4a;color:#fff;border:none;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:0.72rem;">📋</button></td>' +
            '<td>' + _esc(u.name) + '<br><small style="color:#999;font-size:0.75rem;">🔑 <span id="upass-' + i + '" style="filter:blur(3px);">' + '••••••' + '</span>' +
            ' <button onclick="document.getElementById(\'upass-' + i + '\').style.filter=\'\';" style="background:none;border:none;cursor:pointer;font-size:0.8rem;">👁️</button>' +
            '</small></td>' +
            '<td>' + _esc(u.phone || '-') + '</td>' +
            '<td><span style="background:' + (u.role==='admin'?'#d9962b':'#1b2a4a') + ';color:#fff;padding:3px 8px;border-radius:4px;font-size:0.8rem;">' + (u.role==='admin'?'أدمن مساعد':'عميل') + '</span></td>' +
            '<td>' + u.createdAt + '</td>' +
            '<td><span style="color:' + (u.isBanned?'#c7254e':'#1a7f4b') + ';font-weight:bold;">' + (u.isBanned?'محظور':'نشط') + '</span></td>' +
            '<td style="white-space:nowrap;">' +
            '<button onclick="toggleUserBan(' + i + ')" style="background:' + (u.isBanned?'#1a7f4b':'#c7254e') + ';color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:4px;font-size:0.8rem;">' + (u.isBanned?'رفع الحظر':'حظر') + '</button>' +
            '<button onclick="promoteUserToAdmin(' + i + ')" style="background:#d9962b;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:4px;font-size:0.8rem;">' + (u.role==='admin'?'إلغاء أدمن':'أدمن مساعد') + '</button>' +
            '<button onclick="deleteUser(' + i + ')" style="background:#2a3d66;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.8rem;">حذف</button>' +
            '</td></tr>';
    });
}

function toggleUserBan(index) {
    var users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    if (!users[index]) return;
    users[index].isBanned = !users[index].isBanned;
    localStorage.setItem('global_store_users', JSON.stringify(users));
    if (users[index].uid && window.FB_adminSetUser) window.FB_adminSetUser(users[index].uid, { isBanned: users[index].isBanned });
    renderAdminUsersTable();
    showToast(users[index].isBanned ? '🚫 تم حظر المستخدم' : '✅ تم رفع الحظر');
}

function promoteUserToAdmin(index) {
    var users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    if (!users[index]) return;
    users[index].role = users[index].role === 'admin' ? 'customer' : 'admin';
    localStorage.setItem('global_store_users', JSON.stringify(users));
    renderAdminUsersTable();
    showToast(users[index].role === 'admin' ? '🔑 أصبح أدمن مساعداً' : '✅ تم إلغاء الأدمن');
}

function deleteUser(index) {
    showConfirm('🗑️','حذف مستخدم','هل أنت متأكد من حذف هذا المستخدم؟','نعم','إلغاء','danger').then(function(ok){
        if (!ok) return;
        var users = JSON.parse(localStorage.getItem('global_store_users')) || [];
        users.splice(index, 1);
        localStorage.setItem('global_store_users', JSON.stringify(users));
        renderAdminUsersTable();
        showToast('تم الحذف');
    });
}

// =========================================================================
// GPS FALLBACK - لو رفض GPS يُظهر الإدخال اليدوي
// =========================================================================
var _origGPS = window.getUserCurrentGPSLocation;
window.getUserCurrentGPSLocation = function() {
    var statusText = document.getElementById('gps-status-text');
    var coordsInput = document.getElementById('order-gps-coords');
    if (!statusText || !coordsInput) return;
    if (!navigator.geolocation) {
        statusText.innerHTML = '❌ جهازك لا يدعم GPS. يرجى الإدخال اليدوي.';
        setAddressMode('manual'); return;
    }
    statusText.innerHTML = '📡 جاري الاتصال بالأقمار الصناعية...';
    navigator.geolocation.getCurrentPosition(
        function(position) {
            var lat = position.coords.latitude.toFixed(6);
            var lng = position.coords.longitude.toFixed(6);
            coordsInput.value = 'https://maps.google.com/?q=' + lat + ',' + lng;
            statusText.innerHTML = '✅ تم تحديد موقعك! (<span style="color:#1a7f4b;font-weight:bold;">' + coordsInput.value + '</span>)';
            showToast('📍 تمت مزامنة موقعك بنجاح.');
        },
        function(error) {
            statusText.innerHTML = '❌ رُفض الوصول للموقع. يرجى الإدخال اليدوي.';
            setAddressMode('manual');
            showToast('تعذّر تحديد الموقع، يرجى الإدخال اليدوي');
        },
        { enableHighAccuracy: false, timeout: 10000 }
    );
};

window.addEventListener('DOMContentLoaded', function() {
    renderUserLoginBox();
    if (document.getElementById('admin-users-table-body')) renderAdminUsersTable();
    if (document.getElementById('admin-archive-table-body')) renderAdminArchiveTable();
    updateTrackingCodesBox();
});

function _adminCopy(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(String(text)).then(function(){ typeof showToast !== 'undefined' && showToast('✅ تم النسخ!'); });
    } else {
        var ta = document.createElement('textarea');
        ta.value = String(text); document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        typeof showToast !== 'undefined' && showToast('✅ تم النسخ!');
    }
}


// =========================================================================
// إضافات: نافذة كود التتبع + سياسة الموقع + مراجعة/حفظ العنوان
// =========================================================================
function showTrackingModal(code) {
    return new Promise(function (resolve) {
        var ov = document.createElement('div'); ov.className = 'trk-ov';
        ov.innerHTML = '<div class="trk-box" role="dialog" aria-modal="true"><div class="trk-ic">🎉</div><h3>تم إرسال طلبك!</h3><p>كود التتبع الخاص بك</p>' +
            '<div class="trk-code"><b id="trk-c">' + code + '</b><button type="button" id="trk-copy">نسخ</button></div>' +
            '<small>احفظ الكود لمتابعة حالة شحنتك</small><button type="button" class="trk-go" id="trk-go">متابعة التتبع 📦</button></div>';
        document.body.appendChild(ov);
        ov.querySelector('#trk-copy').onclick = function () {
            var b = this, done = function () { b.textContent = 'تم النسخ ✓'; };
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done);
            else { var t = document.createElement('textarea'); t.value = code; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
        };
        ov.querySelector('#trk-go').onclick = function () { ov.remove(); resolve(); };
    });
}

function showPolicyModal() {
    var ov = document.createElement('div'); ov.className = 'trk-ov';
    ov.innerHTML = '<div class="trk-box pol" role="dialog" aria-modal="true"><h3>📜 سياسة الموقع</h3><ul>' +
        '<li>لو عاوز <b>ترجّع أي منتج</b> (إرجاع أو استبدال)، <b>بتدفع أنت تكلفة التوصيل</b>.</li>' +
        '<li>بموافقتك على السياسة دي وضغطك على "أوافق" بتكون وافقت على الشرط ده.</li></ul>' +
        '<button type="button" class="trk-go" id="pol-x">تمام</button></div>';
    document.body.appendChild(ov);
    ov.querySelector('#pol-x').onclick = function () { ov.remove(); };
}

function renderAddrReview() {
    var box = document.getElementById('addr-review'); if (!box) return;
    var g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
    var place = g('order-place-name'), prov = g('order-province'), city = g('order-city'), st = g('order-street-detail');
    if (!prov && !city && !st && !place) { box.style.display = 'none'; return; }
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
    box.style.display = 'block';
    box.innerHTML = '<b>📍 مراجعة العنوان</b><div>المكان: ' + esc(place || '—') + '</div><div>المحافظة: ' + esc(prov || '—') + '</div><div>المدينة: ' + esc(city || '—') + '</div><div>الشارع: ' + esc(st || '—') + '</div>';
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('checkout-section')) return;
    ['order-place-name', 'order-province', 'order-city', 'order-street-detail'].forEach(function (id) {
        var e = document.getElementById(id); if (!e) return;
        e.addEventListener('input', renderAddrReview); e.addEventListener('change', renderAddrReview);
    });
    var pl = document.getElementById('policy-link'); if (pl) pl.onclick = function (ev) { ev.preventDefault(); showPolicyModal(); };
    // العنوان المحفوظ: نسأل العميل يوصّل لنفس العنوان ولا لا
    setTimeout(function () {
        var sv; try { sv = JSON.parse(localStorage.getItem('saved_delivery_address')); } catch (e) {}
        var seg = document.querySelector('.ct-seg');
        if (!sv || !sv.prov || !seg || document.getElementById('saved-addr-box')) return;
        var esc = function (t) { return String(t || '').replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
        var d = document.createElement('div'); d.id = 'saved-addr-box'; d.className = 'saved-addr';
        d.innerHTML = '<b>عنوانك المحفوظ</b><div>' + esc((sv.place ? sv.place + ' - ' : '') + sv.prov + ' - ' + sv.city + ' - ' + sv.street) + '</div>' +
            '<div class="sa-row"><button type="button" id="sa-yes">توصيل لنفس العنوان ✓</button><button type="button" id="sa-no">عنوان جديد</button></div>';
        seg.parentNode.insertBefore(d, seg);
        document.getElementById('sa-no').onclick = function () { d.remove(); };
        document.getElementById('sa-yes').onclick = function () {
            setAddressMode('manual');
            var set = function (id, v) { var e = document.getElementById(id); if (e) { e.value = v || ''; e.dispatchEvent(new Event('change')); } };
            set('order-province', sv.prov); set('order-city', sv.city); set('order-street-detail', sv.street); set('order-place-name', sv.place);
            var n = document.getElementById('order-name'), p = document.getElementById('order-phone');
            if (n && !n.value.trim() && sv.name) n.value = sv.name; if (p && p.value.trim().length <= 2 && sv.phone) p.value = sv.phone;
            renderAddrReview(); d.remove();
        };
    }, 700);
});


// =========================================================================
// ذكاء الاهتمامات: بنتعلم من بحث العميل وتصفحه وإضافاته للسلة ونرتب "الافتراضي" على أساسها
// =========================================================================
(function () {
    var KEY = 'interest_prof_v1';
    var STOP = ['من','في','على','عن','مع','ذو','هذا','هذه','الى','إلى','او','أو','جدا','جداً','قطعة','للرجال','للسيدات'];
    function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
    function toks(t) {
        return String(t || '').toLowerCase().replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ').split(/\s+/)
            .map(function (w) { return w.replace(/^ال/, ''); })
            .filter(function (w) { return w.length >= 3 && STOP.indexOf(w) < 0; });
    }
    function bump(text, w) {
        var p = load(), t = toks(text); if (!t.length) return;
        Object.keys(p).forEach(function (k) { p[k] *= 0.97; if (p[k] < 0.2) delete p[k]; });
        t.forEach(function (k) { p[k] = Math.min(30, (p[k] || 0) + w); });
        try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    }
    function prodText(id) { var p = (window.products || products || []).find(function (x) { return Number(x.id) === Number(id); }); return p ? (p.title + ' ' + (p.category || '') + ' ' + (p.desc || '')) : ''; }
    window.__interestScore = function (p) {
        var pr = load(), s = 0;
        toks((p.title || '') + ' ' + (p.category || '') + ' ' + (p.desc || '')).forEach(function (k) { s += pr[k] || 0; });
        return s;
    };
    var _open = window.openProductDetailsModal;
    if (typeof _open === 'function') window.openProductDetailsModal = function (id) { bump(prodText(id), 2); return _open.apply(this, arguments); };
    var _add = window.addProductToCart;
    if (typeof _add === 'function') window.addProductToCart = function (id) { bump(prodText(id), 3); return _add.apply(this, arguments); };
    var _qa = window.quickAddToCart;
    if (typeof _qa === 'function') window.quickAddToCart = function (id) { bump(prodText(id), 3); return _qa.apply(this, arguments); };
    var _w = window.toggleWishlistSystem;
    if (typeof _w === 'function') window.toggleWishlistSystem = function (id) { bump(prodText(id), 2.5); return _w.apply(this, arguments); };
    var _s = window.runStoreSearch, tm;
    if (typeof _s === 'function') window.runStoreSearch = function (q) {
        clearTimeout(tm); var v = String(q || ''); if (v.trim().length >= 3) tm = setTimeout(function () { bump(v, 1.5); }, 1200);
        return _s.apply(this, arguments);
    };
})();

// استرجاع آخر ترتيب اختاره العميل (الافتراضي لو مفيش) — بيفضل بعد التحديث
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        var sel = document.getElementById('admin-price-sort'); if (!sel) return;
        var v = 'default'; try { v = localStorage.getItem('shop_sort_pref') || 'default'; } catch (e) {}
        if (![].some.call(sel.options, function (o) { return o.value === v; })) v = 'default';
        sel.value = v;
        document.querySelectorAll('.filter-chip').forEach(function (b) {
            var m = (b.getAttribute('onclick') || '').match(/'([^']+)'\)/);
            b.classList.toggle('active', !!m && m[1] === v);
        });
        if (typeof triggerPriceSortAction === 'function') triggerPriceSortAction();
    }, 50);
});

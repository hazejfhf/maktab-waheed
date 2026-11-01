// =========================================================================
// SCRIPT-EXTRA.JS - الإضافات الجديدة الشاملة
// =========================================================================

// =========================================================================
// 1. نظام المحافظات والمدن الديناميكي مع أسعار التوصيل
// =========================================================================

// تحميل المحافظات من localStorage أو الافتراضية
function getGovernoratesDB() {
    const stored = localStorage.getItem('store_governorates_db');
    if (stored) return JSON.parse(stored);
    // الافتراضي: المحافظات المصرية مع أسعار التوصيل
    return {
        "القاهرة":   { price: 35, cities: ["وسط البلد","مصر الجديدة","مدينة نصر","شبرا","شبرا الخيمة","المعادي","المقطم","حلوان","التجمع الأول","التجمع الخامس","القاهرة الجديدة","الرحاب","مدينة بدر","المطرية","عين شمس","الزيتون","عباسية","الأميرية","السلام","النزهة","الوايلي","البساتين","دار السلام","المنيل","روض الفرج","الشرابية","السيدة زينب","الخليفة","بولاق","إمبابة","الهرم","المريوطية","فيصل"] },
        "الجيزة":    { price: 40, cities: ["الدقي","المهندسين","الهرم","فيصل","عين الصيرة","أوسيم","الجيزة","6 أكتوبر","الشيخ زايد","حدائق الأهرام","الحوامدية","العياط","الصف","أطفيح","البدرشين","كرداسة","أبو النمرس","الواحات البحرية"] },
        "الإسكندرية":{ price: 45, cities: ["المنتزه","سموحة","ميامي","سيدي بشر","سيدي جابر","محرم بك","العجمي","المنشية","باب شرق","الرمل","ستانلي","لوران","أبو قير","برج العرب","الدخيلة","العامرية","بكوس","الجمرك","المفروضة"] },
        "القليوبية":  { price: 45, cities: ["بنها","قليوب","شبرا الخيمة","الخانكة","طوخ","القناطر الخيرية","كفر شكر","الخصوص","قها","منشأة القناطر","أبو زعبل"] },
        "الشرقية":   { price: 50, cities: ["الزقازيق","العاشر من رمضان","بلبيس","منيا القمح","فاقوس","أبو حماد","ههيا","كفر صقر","الإبراهيمية","الحسينية","ديرب نجم","مشتول السوق","أبو كبير","القنايات","الصالحية الجديدة"] },
        "المنوفية":   { price: 50, cities: ["شبين الكوم","منوف","أشمون","مرشماشة","السادات","بركة السبع","الشهداء","تلا","قويسنا","الباجور"] },
        "الغربية":   { price: 50, cities: ["طنطا","المحلة الكبرى","كفر الزيات","زفتى","السنطة","قطور","بسيون","سمنود"] },
        "الدقهلية":  { price: 55, cities: ["المنصورة","دمياط","طلخا","ميت غمر","الزرقا","شربين","أجا","المنزلة","تمي الأمديد","بلقاس","السنبلاوين","ميت سلسيل"] },
        "كفر الشيخ": { price: 55, cities: ["كفر الشيخ","دسوق","فوه","قلين","بيلا","مطوبس","الرياض","برلس","الحامول"] },
        "البحيرة":   { price: 55, cities: ["دمنهور","كفر الدوار","الرحمانية","شبراخيت","أبو حمص","المحمودية","حوش عيسى","إيتاي البارود","رشيد","إدكو","أبو المطامير","الدلنجات","وادي النطرون"] },
        "الإسماعيلية":{ price: 55, cities: ["الإسماعيلية","القنطرة","أبو صوير","فايد","القصاصين"] },
        "بورسعيد":   { price: 60, cities: ["بورسعيد","بور فؤاد","الزهور","الشرق","الغرب","المناخ","العرب"] },
        "السويس":    { price: 60, cities: ["السويس","عتاقة","فيصل","الجناين"] },
        "دمياط":     { price: 55, cities: ["دمياط","رأس البر","فارسكور","الزرقا","كفر سعد","عزبة البرج"] },
        "الفيوم":    { price: 55, cities: ["الفيوم","سنورس","إطسا","طامية","يوسف الصديق","إبشواي"] },
        "بني سويف":  { price: 60, cities: ["بني سويف","الواسطى","ناصر","إهناسيا","ببا","الفشن","سمسطا","نزلة"] },
        "المنيا":    { price: 65, cities: ["المنيا","ملوي","دير مواس","مطاي","سمالوط","بني مزار","مغاغة","أبو قرقاص","العدوة"] },
        "أسيوط":     { price: 65, cities: ["أسيوط","ديروط","القوصية","منفلوط","أبنوب","ساحل سليم","البداري","صدفا","الغنايم"] },
        "سوهاج":     { price: 70, cities: ["سوهاج","أخميم","طما","طهطا","جرجا","البلينا","المراغة","دار السلام","ساقلته"] },
        "قنا":       { price: 70, cities: ["قنا","نجع حمادي","دشنا","قوص","نقادة","فرشوط","أبو تشت","الوقف"] },
        "الأقصر":    { price: 75, cities: ["الأقصر","إسنا","الأرمنت","القرنة","البياضية","الزينية"] },
        "أسوان":     { price: 80, cities: ["أسوان","كوم أمبو","إدفو","أبو سمبل","دراو","نصر النوبة","كلابشة"] },
        "البحر الأحمر":{ price: 85, cities: ["الغردقة","رأس غارب","سفاجا","القصير","مرسى علم","شرم الشيخ"] },
        "الوادي الجديد":{ price: 90, cities: ["الخارجة","الداخلة","الفرافرة","بلاط","موط"] },
        "مطروح":     { price: 85, cities: ["مرسى مطروح","سيوة","الضبعة","العلمين","الحمام","سيدي براني","النجيلة"] },
        "شمال سيناء":{ price: 80, cities: ["العريش","بئر العبد","الشيخ زويد","رفح","حسنة","نخل"] },
        "جنوب سيناء":{ price: 85, cities: ["طور سيناء","شرم الشيخ","دهب","نويبع","أبو رديس","سانت كاترين"] }
    };
}

function saveGovernoratesDB(db) {
    localStorage.setItem('store_governorates_db', JSON.stringify(db));
}

// تحميل محافظات في dropdown الطلب مع سعر التوصيل الديناميكي
function populateCitiesAndDistricts() {
    const provinceSelect = document.getElementById('order-province');
    const citySelect = document.getElementById('order-city');
    if (!provinceSelect || !citySelect) return;

    const selectedProvince = provinceSelect.value;
    citySelect.innerHTML = '';

    if (!selectedProvince) {
        citySelect.innerHTML = '<option value="">-- اختر المحافظة أولاً --</option>';
        updateShippingPriceDisplay(0);
        return;
    }

    const db = getGovernoratesDB();
    const govData = db[selectedProvince];
    if (!govData) {
        citySelect.innerHTML = '<option value="">-- لا توجد مدن --</option>';
        return;
    }

    citySelect.innerHTML = '<option value="">-- اختر المدينة / المركز --</option>';
    govData.cities.forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });

    updateShippingPriceDisplay(govData.price);
    updateManualAddressString();
}

function updateShippingPriceDisplay(price) {
    const shippingEl = document.getElementById('cart-shipping-val');
    const shippingLabelEl = document.getElementById('shipping-gov-label');
    if (shippingEl) shippingEl.innerText = (price || 50) + ' ج.م';
    if (shippingLabelEl) {
        const prov = document.getElementById('order-province');
        shippingLabelEl.innerText = prov && prov.value ? `(${prov.value})` : '';
    }

    // سعر التوصيل يظهر تحت القائمة بعد اختيار المحافظة فقط
    const provEl = document.getElementById('order-province');
    let hint = document.getElementById('ship-price-hint');
    if (provEl) {
        if (!hint) { hint = document.createElement('span'); hint.id = 'ship-price-hint'; hint.className = 'ship-hint'; provEl.insertAdjacentElement('afterend', hint); }
        hint.textContent = provEl.value ? ('سعر التوصيل إلى ' + provEl.value + ': ' + (price || 50) + ' ج.م') : '';
    }

    // تحديث الإجمالي
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount-val');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl && totalEl) {
        const subtotal = parseFloat(subtotalEl.innerText) || 0;
        const discount = discountEl ? (parseFloat(discountEl.innerText) || 0) : 0;
        const shipping = price || 50;
        totalEl.innerText = (subtotal - discount + shipping).toFixed(2) + ' ج.م';
    }
}

function getShippingPriceForProvince(provinceName) {
    const db = getGovernoratesDB();
    return (db[provinceName] && db[provinceName].price) ? db[provinceName].price : 50;
}

// ملء dropdown المحافظات
function fillProvinceDropdown(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const db = getGovernoratesDB();
    const current = sel.value;
    sel.innerHTML = '<option value="">-- اختر المحافظة --</option>';
    Object.keys(db).forEach(gov => {
        sel.innerHTML += `<option value="${gov}" ${current === gov ? 'selected' : ''}>${gov}</option>`;
    });
}

// =========================================================================
// 2. إدارة المحافظات من الأدمن
// =========================================================================
function renderAdminGovernoratesTable() {
    const tbody = document.getElementById('admin-gov-table-body');
    if (!tbody) return;
    const db = getGovernoratesDB();
    tbody.innerHTML = '';
    Object.keys(db).forEach((gov, idx) => {
        const data = db[gov];
        const citiesCount = data.cities ? data.cities.length : 0;
        tbody.innerHTML += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#14203a;">${gov}</td>
                <td style="color:#1a7f4b;font-weight:bold;">${data.price} ج.م</td>
                <td style="font-size:0.82rem;color:#555;">${citiesCount} مدينة</td>
                <td style="text-align:center;">
                    <button onclick="openEditGovModal('${gov}')" style="background:#1b2a4a;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;margin-left:4px;font-size:0.8rem;">تعديل ✏️</button>
                    <button onclick="deleteGovernorate('${gov}')" style="background:#c7254e;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:0.8rem;">حذف 🗑</button>
                </td>
            </tr>
        `;
    });
}

function deleteGovernorate(govName) {
    showConfirm('🗑️','حذف محافظة',`هل تريد حذف محافظة "${govName}" وجميع مدنها؟`,'نعم احذف','إلغاء','danger').then(ok => {
        if (!ok) return;
        const db = getGovernoratesDB();
        delete db[govName];
        saveGovernoratesDB(db);
        renderAdminGovernoratesTable();
        showToast('تم حذف المحافظة ✅');
    });
}

function openEditGovModal(govName) {
    const db = getGovernoratesDB();
    const data = db[govName] || { price: 50, cities: [] };
    document.getElementById('edit-gov-name-input').value = govName;
    document.getElementById('edit-gov-price-input').value = data.price;
    document.getElementById('edit-gov-cities-input').value = data.cities.join('\n');
    document.getElementById('edit-gov-original-name').value = govName;
    document.getElementById('gov-edit-modal').style.display = 'flex';
}

function closeGovModal() {
    document.getElementById('gov-edit-modal').style.display = 'none';
}

function saveGovEdit() {
    const originalName = document.getElementById('edit-gov-original-name').value;
    const newName = document.getElementById('edit-gov-name-input').value.trim();
    const price = parseInt(document.getElementById('edit-gov-price-input').value) || 50;
    const citiesRaw = document.getElementById('edit-gov-cities-input').value;
    const cities = citiesRaw.split('\n').map(c => c.trim()).filter(c => c.length > 0);

    if (!newName) { showToast('اكتب اسم المحافظة!'); return; }

    const db = getGovernoratesDB();
    if (originalName && originalName !== newName) delete db[originalName];
    db[newName] = { price, cities };
    saveGovernoratesDB(db);
    closeGovModal();
    renderAdminGovernoratesTable();
    showToast(`تم حفظ بيانات "${newName}" ✅`);
}

function addNewGovernorate() {
    document.getElementById('edit-gov-name-input').value = '';
    document.getElementById('edit-gov-price-input').value = '50';
    document.getElementById('edit-gov-cities-input').value = '';
    document.getElementById('edit-gov-original-name').value = '';
    document.getElementById('gov-edit-modal').style.display = 'flex';
}

// =========================================================================
// 3. إصلاح ترتيب العرض - المنتجات والطلبات الجديدة تظهر أولاً (فوق)
// =========================================================================

// (الإضافة في أول القائمة بقت جوه commitProductToStorage مباشرة)

// Override submitFinalOrder لجعل الطلبات الجديدة تظهر أولاً
const _origSubmitOrder = window.submitFinalOrder;
window.submitFinalOrder = function() {
    // سنعيد تعريف renderAdminOrdersTable لتعكس الترتيب
    if (_origSubmitOrder) _origSubmitOrder.apply(this, arguments);
};

// Override renderAdminOrdersTable لعرض الطلبات الجديدة أولاً
const _origRenderOrders = window.renderAdminOrdersTable;
window.renderAdminOrdersTable = function() {
    const tableBody = document.getElementById('admin-orders-table-body');
    if (!tableBody) return;
    let allOrders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    // عكس الترتيب - الأحدث أولاً
    allOrders = allOrders.slice().reverse();
    tableBody.innerHTML = '';
    if (allOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#999;">لا توجد طلبات شراء حالياً.</td></tr>';
        return;
    }
    allOrders.forEach((ord, index) => {
        const realIndex = (JSON.parse(localStorage.getItem('global_store_orders')) || []).length - 1 - index;
        let id = ord.orderId || ord.id || 'بدون كود';
        let date = ord.orderDate || ord.date || '';
        let clientName = ord.clientName || ord.customerName || ord.name || 'عميل مجهول';
        let phone = ord.clientPhone || ord.customerPhone || ord.phone || '';
        let address = ord.clientAddress || ord.customerAddress || ord.address || '';
        let productsList = ord.productsDetails || ord.products || (ord.items ? ord.items.map(i => i.title).join(' ، ') : '') || 'لم تحدد';
        let price = ord.finalPrice || ord.bill || ord.total || '0 ج.م';
        let payment = ord.paymentMethod || ord.payment || 'COD';
        let currentStatus = ord.orderStatus || ord.status || 'جاري التجهيز 📦';
        [id, date, clientName, phone, address, productsList, price, payment, currentStatus] = [id, date, clientName, phone, address, productsList, price, payment, currentStatus].map(function (v) { return window._esc(v); });
        let isNew = index === 0 ? 'background:linear-gradient(135deg,#fff9c4,#fff);border-right:4px solid #f1c40f;' : '';

        tableBody.innerHTML += `
            <tr style="border-bottom:1px solid #ddd;height:60px;${isNew}">
                <td><strong>${id}</strong>${index === 0 ? ' <span style="background:#d9962b;color:#000;font-size:0.7rem;padding:2px 6px;border-radius:4px;font-weight:bold;">جديد</span>' : ''}<br><small style="color:#777;">${date}</small></td>
                <td>👤 <strong>${clientName}</strong><br>📞 ${phone}<br>📍 <small style="color:#555;">${address}</small></td>
                <td><div style="max-width:250px;font-size:0.9rem;color:#333;">${productsList}</div></td>
                <td style="color:#1a7f4b;font-weight:bold;">${price}<br><small style="color:#666;font-weight:normal;">(${payment})</small></td>
                <td>
                    <select onchange="changeOrderStatusFromAdmin(${realIndex}, this.value)" style="padding:5px;border-radius:4px;border:1px solid #ccc;font-weight:bold;background:#fff;">
                        <option value="جاري التجهيز 📦" ${currentStatus.includes('التجهيز') ? 'selected' : ''}>جاري التجهيز 📦</option>
                        <option value="تم الإرسال للشركة 🚚" ${currentStatus.includes('الإرسال') ? 'selected' : ''}>تم الإرسال للشركة 🚚</option>
                        <option value="جاري التوصيل 🛵" ${currentStatus.includes('التوصيل') ? 'selected' : ''}>جاري التوصيل 🛵</option>
                        <option value="تم التسليم ✅" ${currentStatus.includes('التسليم') ? 'selected' : ''}>تم التسليم ✅</option>
                    </select>
                    <br><button onclick="deleteSingleOrderFromAdmin(${realIndex})" style="background:#c7254e;color:white;border:none;padding:4px 8px;border-radius:4px;margin-top:5px;cursor:pointer;font-size:0.8rem;">حذف الطلب 🗑</button>
                </td>
            </tr>
        `;
    });
};

// =========================================================================
// 4. نظام علامات المستخدمين (مميز / مشاغب) + تقليص الصلاحيات
// =========================================================================
const USER_BADGES = {
    vip:     { label: '⭐ مميز',    color: '#f1c40f', bg: '#fffde7' },
    trouble: { label: '⚠️ مشاغب',  color: '#e74c3c', bg: '#fde8e8' },
    none:    { label: '—',          color: '#999',     bg: 'transparent' }
};

function setUserBadge(index, badge) {
    let users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    if (!users[index]) return;
    users[index].badge = badge;
    localStorage.setItem('global_store_users', JSON.stringify(users));
    renderEnhancedAdminUsersTable();
    showToast('تم تعيين العلامة ✅');
}

function setUserWheelPermission(index, canSpin, winRatio) {
    let users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    if (!users[index]) return;
    users[index].wheelDisabled = !canSpin;
    users[index].wheelWinRatio = (isNaN(parseInt(winRatio)) ? 100 : Math.min(100, Math.max(0, parseInt(winRatio))));
    if (users[index].uid && window.FB_adminSetUser) window.FB_adminSetUser(users[index].uid, { wheelDisabled: users[index].wheelDisabled, wheelWinRatio: users[index].wheelWinRatio });
    localStorage.setItem('global_store_users', JSON.stringify(users));
    renderEnhancedAdminUsersTable();
    showToast('تم تحديث صلاحيات العجلة ✅');
}

function renderEnhancedAdminUsersTable() {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;
    let users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;">لا يوجد مستخدمون بعد.</td></tr>';
        return;
    }

    // ترتيب: النشطون أولاً
    const sortedUsers = [...users].sort((a, b) => {
        const aActive = isUserActive(a) ? 1 : 0;
        const bActive = isUserActive(b) ? 1 : 0;
        return bActive - aActive;
    });

    sortedUsers.forEach((u, displayIdx) => {
        const realIdx = users.findIndex(x => x.userId === u.userId);
        const badge = USER_BADGES[u.badge] || USER_BADGES.none;
        const ordersCount = getUserOrdersCount(u.userId, u.phone);
        const active = isUserActive(u);
        const wheelInfo = u.wheelDisabled ? '🚫 محظور' : `✅ (${u.wheelWinRatio || 100}% فوز)`;

        tbody.innerHTML += `
            <tr style="${u.isBanned ? 'background:#fbeff2;' : active ? 'background:#f0fff4;' : ''}border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#1b2a4a;">${u.userId}</td>
                <td>
                    ${_esc(u.name)}
                    ${u.badge && u.badge !== 'none' ? `<span style="background:${badge.bg};color:${badge.color};font-size:0.75rem;padding:2px 6px;border-radius:4px;margin-right:4px;">${badge.label}</span>` : ''}
                </td>
                <td>${_esc(u.phone || '-')}</td>
                <td><span style="background:${ordersCount > 0 ? '#e8f5e9' : '#fafafa'};color:${ordersCount > 3 ? '#1a7f4b' : '#555'};padding:3px 8px;border-radius:4px;font-weight:bold;">${ordersCount} طلب</span></td>
                <td><span style="color:${active ? '#1a7f4b' : '#999'};font-weight:bold;">${active ? '🟢 نشط' : '⚫ غير نشط'}</span></td>
                <td><small style="color:#777;">${wheelInfo}</small></td>
                <td>
                    <select onchange="setUserBadge(${realIdx}, this.value)" style="padding:4px;border-radius:4px;border:1px solid #ddd;font-size:0.8rem;">
                        <option value="none" ${!u.badge || u.badge==='none' ? 'selected' : ''}>بدون</option>
                        <option value="vip" ${u.badge==='vip' ? 'selected' : ''}>⭐ مميز</option>
                        <option value="trouble" ${u.badge==='trouble' ? 'selected' : ''}>⚠️ مشاغب</option>
                    </select>
                </td>
                <td>
                    <button onclick="openUserWheelModal(${realIdx})" style="background:#2a3d66;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;margin-bottom:3px;display:block;width:100%;">🎡 صلاحيات العجلة</button>
                    <button onclick="toggleUserBan(${realIdx})" style="background:${u.isBanned ? '#1a7f4b' : '#c7254e'};color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;display:block;width:100%;">${u.isBanned ? 'رفع الحظر' : 'حظر'}</button>
                </td>
                <td>
                    <button onclick="deleteUser(${realIdx})" style="background:#2a3d66;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;">حذف</button>
                </td>
            </tr>
        `;
    });
}

function isUserActive(user) {
    const orders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    const lastHour = Date.now() - (24 * 60 * 60 * 1000); // آخر 24 ساعة = نشط
    return orders.some(o => {
        const phone = o.clientPhone || o.customerPhone || o.phone || '';
        const ts = o.timestamp || o.createdAt || 0;
        return phone === user.phone && ts > lastHour;
    });
}

function getUserOrdersCount(userId, phone) {
    const orders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    const archive = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    const all = [...orders, ...archive];
    return all.filter(o => {
        const op = o.clientPhone || o.customerPhone || o.phone || '';
        return op === phone && phone;
    }).length;
}

function openUserWheelModal(index) {
    let users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    if (!users[index]) return;
    const u = users[index];

    createModalStyles();
    const overlay = document.createElement('div');
    overlay.className = 'store-modal-overlay';
    overlay.innerHTML = `
        <div class="store-modal-box" style="max-width:420px;text-align:right;direction:rtl;">
            <span class="store-modal-icon">🎡</span>
            <div class="store-modal-title">صلاحيات العجلة - ${_esc(u.name)}</div>
            <div class="store-modal-body">
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">حالة العجلة:</label>
                    <select id="wheel-perm-select" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;">
                        <option value="1" ${!u.wheelDisabled ? 'selected' : ''}>✅ مفعّلة</option>
                        <option value="0" ${u.wheelDisabled ? 'selected' : ''}>🚫 محظورة</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">نسبة الفوز (%):</label>
                    <input type="number" id="wheel-win-ratio" value="${u.wheelWinRatio || 100}" min="0" max="100" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;">
                    <small style="color:#888;">100% = يفوز دائماً، 0% = يخسر دائماً</small>
                </div>
            </div>
            <div class="store-modal-btns">
                <button class="store-modal-btn primary" onclick="saveWheelPermFromModal(${index})">حفظ ✅</button>
                <button class="store-modal-btn secondary" onclick="this.closest('.store-modal-overlay').remove()">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function saveWheelPermFromModal(index) {
    const canSpin = document.getElementById('wheel-perm-select').value === '1';
    const winRatio = parseInt(document.getElementById('wheel-win-ratio').value) || 100;
    document.querySelector('.store-modal-overlay').remove();
    setUserWheelPermission(index, canSpin, winRatio);
}

// إحصائيات المستخدمين
function renderUserStats() {
    const container = document.getElementById('user-stats-container');
    if (!container) return;

    const users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    const orders = JSON.parse(localStorage.getItem('global_store_orders')) || [];
    const archive = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    const allOrders = [...orders, ...archive];

    // المشترون الأكثر
    const userOrderMap = {};
    allOrders.forEach(o => {
        const ph = o.clientPhone || o.customerPhone || o.phone || '';
        if (ph) userOrderMap[ph] = (userOrderMap[ph] || 0) + 1;
    });

    const topBuyers = users
        .map(u => ({ ...u, ordersCount: userOrderMap[u.phone] || 0 }))
        .sort((a, b) => b.ordersCount - a.ordersCount)
        .slice(0, 5);

    const nonBuyers = users.filter(u => !(userOrderMap[u.phone] > 0));
    const activeUsers = users.filter(u => isUserActive(u));

    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
            <div style="background:linear-gradient(135deg,#1a7f4b,#1a7f4b);color:#fff;padding:20px;border-radius:12px;text-align:center;">
                <div style="font-size:2rem;font-weight:bold;">${users.length}</div>
                <div>إجمالي المستخدمين</div>
            </div>
            <div style="background:linear-gradient(135deg,#1b2a4a,#1b2a4a);color:#fff;padding:20px;border-radius:12px;text-align:center;">
                <div style="font-size:2rem;font-weight:bold;">${activeUsers.length}</div>
                <div>🟢 نشطون (24 ساعة)</div>
            </div>
            <div style="background:linear-gradient(135deg,#a8884f,#d35400);color:#fff;padding:20px;border-radius:12px;text-align:center;">
                <div style="font-size:2rem;font-weight:bold;">${nonBuyers.length}</div>
                <div>لم يشتروا بعد</div>
            </div>
            <div style="background:linear-gradient(135deg,#2a3d66,#2a3d66);color:#fff;padding:20px;border-radius:12px;text-align:center;">
                <div style="font-size:2rem;font-weight:bold;">${users.filter(u => u.badge === 'vip').length}</div>
                <div>⭐ مميزون</div>
            </div>
        </div>

        <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);margin-bottom:15px;">
            <h4 style="margin-bottom:15px;color:#14203a;">🏆 أكثر المشترين</h4>
            ${topBuyers.length === 0 ? '<p style="color:#aaa;text-align:center;">لا يوجد بيانات</p>' : topBuyers.map((u, i) => `
                <div style="display:flex;align-items:center;gap:12px;padding:10px;border-bottom:1px solid #ece7db;">
                    <span style="font-size:1.5rem;">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                    <div style="flex:1;">
                        <strong>${_esc(u.name)}</strong>
                        <div style="font-size:0.8rem;color:#777;">${_esc(u.phone)}</div>
                    </div>
                    <span style="background:#e8f5e9;color:#1a7f4b;padding:4px 12px;border-radius:20px;font-weight:bold;">${u.ordersCount} طلب</span>
                </div>
            `).join('')}
        </div>

        <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom:15px;color:#14203a;">😴 المستخدمون الذين لم يشتروا</h4>
            ${nonBuyers.length === 0 ? '<p style="color:#1a7f4b;text-align:center;">الجميع اشترى 🎉</p>' : nonBuyers.slice(0, 10).map(u => `
                <div style="display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid #ece7db;">
                    <span>👤</span>
                    <div style="flex:1;"><strong>${_esc(u.name)}</strong> <small style="color:#999;">${_esc(u.phone)}</small></div>
                    <span style="background:#e6d5ae;color:#d35400;padding:2px 8px;border-radius:10px;font-size:0.8rem;">0 طلبات</span>
                </div>
            `).join('')}
        </div>
    `;
}

// =========================================================================
// 5. عجلة الحظ المتطورة - تحكم الأدمن الكامل
// =========================================================================

function getWheelConfig() {
    return JSON.parse(localStorage.getItem('store_wheel_config')) || {
        hoursInterval: 24,
        enabled: true,
        slots: null // null = يستخدم advancedGiftsList
    };
}

function saveWheelConfig(config) {
    localStorage.setItem('store_wheel_config', JSON.stringify(config));
}

// التحقق إذا كان المستخدم الحالي يملك صلاحية اللف
function canCurrentUserSpin() {
    const currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
    if (!currentUser) return { can: true, reason: '' };

    const allUsers = JSON.parse(localStorage.getItem('global_store_users')) || [];
    const u = allUsers.find(x => x.userId === currentUser.userId);
    if (!u) return { can: true, reason: '' };

    if (u.wheelDisabled) return { can: false, reason: 'محظور من العجلة' };
    return { can: true, ratio: u.wheelWinRatio || 100 };
}

// Override startLuckyWheelSpin لتطبيق القيود
const _origSpinWheel = window.startLuckyWheelSpin;
window.startLuckyWheelSpin = function() {
    const config = getWheelConfig();

    // فحص الفترة الزمنية
    const lastSpin = localStorage.getItem('user_last_spin_time');
    if (lastSpin) {
        const elapsed = (Date.now() - parseInt(lastSpin)) / (1000 * 60 * 60);
        if (elapsed < config.hoursInterval) {
            const remaining = Math.ceil(config.hoursInterval - elapsed);
            showAlert('⏰', 'انتظر قليلاً', `يمكنك تدوير العجلة مرة أخرى بعد <strong>${remaining} ساعة</strong>`);
            return;
        }
    }

    // فحص صلاحية المستخدم
    const perm = canCurrentUserSpin();
    if (!perm.can) {
        showAlert('🚫', 'غير مسموح', 'لا يمكنك استخدام عجلة الحظ حالياً.');
        return;
    }

    // تسجيل وقت آخر لفة
    localStorage.setItem('user_last_spin_time', Date.now().toString());

    // تطبيق نسبة الفوز
    const winRatio = perm.ratio !== undefined ? perm.ratio : 100;
    const rand = Math.random() * 100;
    if (rand > winRatio) {
        // خسارة قسرية
        forceWheelNoLuck();
        return;
    }

    if (_origSpinWheel) _origSpinWheel.apply(this, arguments);
};

function forceWheelNoLuck() {
    const wheelElement = document.getElementById('lucky-wheel-element');
    const spinButton = document.getElementById('spin-action-btn');
    if (!wheelElement) return;

    isWheelSpinningNow = true;
    if (spinButton) { spinButton.disabled = true; spinButton.innerText = 'جاري تدوير العجلة... 🎡'; }

    const randomDegrees = Math.floor(Math.random() * 360) + 2880;
    wheelElement.style.transform = `rotate(${randomDegrees}deg)`;

    setTimeout(() => {
        const prizeBox = document.getElementById('prize-result-box');
        const prizeText = document.getElementById('prize-text');
        const prizeCoupon = document.getElementById('prize-coupon-element');
        if (prizeBox) prizeBox.style.display = 'block';
        if (prizeText) prizeText.innerText = 'حظ سعيد المرة القادمة! 😅';
        if (prizeCoupon) { prizeCoupon.innerText = 'حظ أوفر'; prizeCoupon.style.background = '#95a5a6'; }
        if (spinButton) spinButton.innerText = 'تم السحب 🎉';
        isWheelSpinningNow = false;
    }, 4000);
}

// إدارة خانات العجلة من الأدمن
function getWheelSlots() {
    const stored = localStorage.getItem('store_wheel_slots');
    if (stored) return JSON.parse(stored);
    // افتراضي من advancedGiftsList
    return [
        { text: 'خصم 10%', code: 'DISC10', type: 'discount', color: '#f1c40f' },
        { text: 'لفة مجانية', code: 'FREELOOP', type: 'free_spin', color: '#2ecc71' },
        { text: 'حظ سعيد', code: 'NOLUCK', type: 'no_luck', color: '#95a5a6' },
        { text: 'خصم 20%', code: 'DISC20', type: 'discount', color: '#e74c3c' },
        { text: 'شحن مجاني', code: 'FREESHIP', type: 'discount', color: '#3498db' },
        { text: 'خصم 15%', code: 'DISC15', type: 'discount', color: '#9b59b6' }
    ];
}

function saveWheelSlots(slots) {
    localStorage.setItem('store_wheel_slots', JSON.stringify(slots));
}

function renderWheelSlotsAdmin() {
    const container = document.getElementById('admin-wheel-slots-list');
    if (!container) return;
    const slots = getWheelSlots();
    const colors = ['#f1c40f','#2ecc71','#e74c3c','#3498db','#9b59b6','#e67e22','#1abc9c','#34495e'];

    container.innerHTML = '';
    slots.forEach((slot, idx) => {
        container.innerHTML += `
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#fff;border-radius:8px;border:1px solid #eee;margin-bottom:8px;">
                <div style="width:30px;height:30px;background:${slot.color || colors[idx % colors.length]};border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);flex-shrink:0;"></div>
                <div style="flex:1;">
                    <strong style="color:#14203a;">${slot.text}</strong>
                    <div style="font-size:0.8rem;color:#777;">كود: ${slot.code} | نوع: ${slot.type === 'no_luck' ? '❌ خسارة' : slot.type === 'free_spin' ? '🔄 لفة مجانية' : '🎁 خصم'}</div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="editWheelSlot(${idx})" style="background:#1b2a4a;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;">تعديل</button>
                    <button onclick="deleteWheelSlot(${idx})" style="background:#c7254e;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem;">حذف</button>
                </div>
            </div>
        `;
    });

    // تحديث العجلة المرئية
    updateWheelVisual(slots);
}

function updateWheelVisual(slots) {
    const wheel = document.getElementById('lucky-wheel-element');
    if (!wheel || !slots || slots.length === 0) return;

    const colors = ['#f1c40f','#2ecc71','#e74c3c','#3498db','#9b59b6','#e67e22','#1abc9c','#34495e'];
    const total = slots.length;
    const angle = 360 / total;
    let gradient = '';
    let textSVG = '';

    // رسم العجلة بـ CSS conic-gradient
    const colorStops = slots.map((s, i) => {
        const c = s.color || colors[i % colors.length];
        return `${c} ${i * angle}deg ${(i + 1) * angle}deg`;
    }).join(', ');

    wheel.style.background = `conic-gradient(${colorStops})`;
    wheel.style.borderRadius = '50%';
}

function addNewWheelSlot() {
    const text = document.getElementById('new-slot-text').value.trim();
    const code = document.getElementById('new-slot-code').value.trim().toUpperCase();
    const type = document.getElementById('new-slot-type').value;
    const color = document.getElementById('new-slot-color').value;

    if (!text) { showToast('اكتب اسم الخانة!'); return; }

    const slots = getWheelSlots();
    slots.push({ text, code: code || 'SLOT' + Date.now(), type, color });
    saveWheelSlots(slots);

    // مزامنة مع advancedGiftsList
    syncWheelSlotsToGifts();

    document.getElementById('new-slot-text').value = '';
    document.getElementById('new-slot-code').value = '';
    renderWheelSlotsAdmin();
    showToast('تمت إضافة الخانة ✅');
}

function deleteWheelSlot(idx) {
    const slots = getWheelSlots();
    slots.splice(idx, 1);
    saveWheelSlots(slots);
    syncWheelSlotsToGifts();
    renderWheelSlotsAdmin();
    showToast('تم حذف الخانة');
}

function editWheelSlot(idx) {
    const slots = getWheelSlots();
    const slot = slots[idx];

    createModalStyles();
    const overlay = document.createElement('div');
    overlay.className = 'store-modal-overlay';
    overlay.innerHTML = `
        <div class="store-modal-box" style="max-width:420px;text-align:right;direction:rtl;">
            <span class="store-modal-icon">✏️</span>
            <div class="store-modal-title">تعديل خانة العجلة</div>
            <div class="store-modal-body">
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">النص المعروض:</label>
                    <input type="text" id="edit-slot-text" value="${slot.text}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">الكود:</label>
                    <input type="text" id="edit-slot-code" value="${slot.code}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">النوع:</label>
                    <select id="edit-slot-type" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;">
                        <option value="discount" ${slot.type==='discount'?'selected':''}>🎁 خصم</option>
                        <option value="no_luck" ${slot.type==='no_luck'?'selected':''}>❌ حظ أوفر</option>
                        <option value="free_spin" ${slot.type==='free_spin'?'selected':''}>🔄 لفة مجانية</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="display:block;margin-bottom:5px;font-weight:bold;">اللون:</label>
                    <input type="color" id="edit-slot-color" value="${slot.color || '#f1c40f'}" style="width:100%;height:40px;border-radius:4px;border:1px solid #ddd;">
                </div>
            </div>
            <div class="store-modal-btns">
                <button class="store-modal-btn primary" onclick="saveEditedSlot(${idx})">حفظ ✅</button>
                <button class="store-modal-btn secondary" onclick="this.closest('.store-modal-overlay').remove()">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function saveEditedSlot(idx) {
    const slots = getWheelSlots();
    slots[idx] = {
        text: document.getElementById('edit-slot-text').value.trim(),
        code: document.getElementById('edit-slot-code').value.trim().toUpperCase(),
        type: document.getElementById('edit-slot-type').value,
        color: document.getElementById('edit-slot-color').value
    };
    saveWheelSlots(slots);
    syncWheelSlotsToGifts();
    document.querySelector('.store-modal-overlay').remove();
    renderWheelSlotsAdmin();
    showToast('تم الحفظ ✅');
}

function syncWheelSlotsToGifts() {
    const slots = getWheelSlots();
    const gifts = slots.map(s => ({
        type: s.type === 'no_luck' ? 'no-luck' : 'discount',
        text: s.text,
        percent: 10,
        target: 'كل الفئات',
        code: s.code,
        duration: 30
    }));
    localStorage.setItem('global_store_gifts_adv', JSON.stringify(gifts));
    if (window.pushWheelToServer) setTimeout(window.pushWheelToServer, 0);
    // تحديث المتغير العام
    if (typeof advancedGiftsList !== 'undefined') {
        advancedGiftsList.length = 0;
        gifts.forEach(g => advancedGiftsList.push(g));
    }
}

function saveWheelIntervalSetting() {
    const hours = parseInt(document.getElementById('wheel-interval-hours').value) || 24;
    const config = getWheelConfig();
    config.hoursInterval = hours;
    saveWheelConfig(config);
    if (window.pushWheelToServer) window.pushWheelToServer();
    showToast(`✅ العجلة تفتح كل ${hours} ساعة`);
}

// تحميل إعدادات العجلة في الأدمن
function loadWheelAdminSettings() {
    const config = getWheelConfig();
    const el = document.getElementById('wheel-interval-hours');
    if (el) el.value = config.hoursInterval || 24;
    renderWheelSlotsAdmin();
}

// =========================================================================
// 6. إعادة تحميل dropdown المحافظات في صفحة الطلب
// =========================================================================
window.addEventListener('DOMContentLoaded', function() {
    // ملء dropdown المحافظات في صفحة الطلب
    const provSel = document.getElementById('order-province');
    if (provSel) {
        const db = getGovernoratesDB();
        provSel.innerHTML = '<option value="">-- اختر المحافظة --</option>';
        Object.keys(db).forEach(gov => {
            provSel.innerHTML += `<option value="${gov}">${gov}</option>`;
        });
    }

    // تحميل إعدادات العجلة
    if (document.getElementById('admin-wheel-slots-list')) {
        loadWheelAdminSettings();
    }

    // تحميل جدول المحافظات في الأدمن
    if (document.getElementById('admin-gov-table-body')) {
        renderAdminGovernoratesTable();
    }

    // تحميل إحصائيات المستخدمين
    if (document.getElementById('user-stats-container')) {
        renderUserStats();
    }

    // Override جدول المستخدمين بالنسخة المحسّنة
    if (document.getElementById('admin-users-table-body')) {
        renderEnhancedAdminUsersTable();
    }
});

// =========================================================================
// 7. نظام إعدادات الموقع العامة المتقدم - الأدمن يعدل أي شيء
// =========================================================================
function openSiteTextEditor() {
    const config = JSON.parse(localStorage.getItem('global_store_config')) || {};
    const customTexts = JSON.parse(localStorage.getItem('store_custom_texts')) || {};

    createModalStyles();
    const overlay = document.createElement('div');
    overlay.className = 'store-modal-overlay';
    overlay.innerHTML = `
        <div class="store-modal-box" style="max-width:500px;text-align:right;direction:rtl;max-height:90vh;overflow-y:auto;">
            <span class="store-modal-icon">✍️</span>
            <div class="store-modal-title">تعديل نصوص الموقع</div>
            <div class="store-modal-body">
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-weight:bold;display:block;margin-bottom:5px;">شعار الموقع الرئيسي:</label>
                    <input type="text" id="ct-logo" value="${config.siteName || 'مكتب رحيم'}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-weight:bold;display:block;margin-bottom:5px;">نص الهيدر الترحيبي:</label>
                    <input type="text" id="ct-header" value="${customTexts.headerWelcome || 'أهلاً بك في متجرنا'}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-weight:bold;display:block;margin-bottom:5px;">رقم التواصل (واتساب):</label>
                    <input type="tel" id="ct-whatsapp" value="${customTexts.whatsappNum || ''}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;" placeholder="201xxxxxxxxx">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-weight:bold;display:block;margin-bottom:5px;">نص زر العجلة:</label>
                    <input type="text" id="ct-wheel-btn" value="${customTexts.wheelBtnText || 'دوّر العجلة 🎡'}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;">
                </div>
                <div class="form-group">
                    <label style="font-weight:bold;display:block;margin-bottom:5px;">نص الفوتر:</label>
                    <input type="text" id="ct-footer" value="${customTexts.footerText || '© 2025 جميع الحقوق محفوظة'}" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;box-sizing:border-box;">
                </div>
            </div>
            <div class="store-modal-btns">
                <button class="store-modal-btn primary" onclick="saveSiteTexts()">حفظ الكل ✅</button>
                <button class="store-modal-btn secondary" onclick="this.closest('.store-modal-overlay').remove()">إغلاق</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function saveSiteTexts() {
    const config = JSON.parse(localStorage.getItem('global_store_config')) || {};
    config.siteName = document.getElementById('ct-logo').value.trim() || config.siteName;
    localStorage.setItem('global_store_config', JSON.stringify(config));

    const customTexts = {
        headerWelcome: document.getElementById('ct-header').value.trim(),
        whatsappNum: document.getElementById('ct-whatsapp').value.trim(),
        wheelBtnText: document.getElementById('ct-wheel-btn').value.trim(),
        footerText: document.getElementById('ct-footer').value.trim()
    };
    localStorage.setItem('store_custom_texts', JSON.stringify(customTexts));

    document.querySelector('.store-modal-overlay').remove();
    applyGlobalSiteSettings();
    showToast('تم حفظ جميع النصوص ✅');
}

// =========================================================================
// 8. مراقبة لحظة الإرسال لتحديث سعر الشحن في الطلب النهائي
// =========================================================================
const _origSubmitFinalOrder = window.submitFinalOrder;
window.submitFinalOrder = function() {
    // احسب سعر الشحن الصحيح من المحافظة
    const province = document.getElementById('order-province');
    if (province && province.value) {
        const price = getShippingPriceForProvince(province.value);
        // inject في الطلب
        window._currentShippingPrice = price;
    }
    if (_origSubmitFinalOrder) _origSubmitFinalOrder.apply(this, arguments);
};

// =========================================================================
// التعديلات الجديدة - v4.1
// =========================================================================

// ═══ التاريخ والوقت بتوقيت مصر في كل مكان ═══
function getEgyptDateTime() {
    return new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
}
function getEgyptDateOnly() {
    return new Date().toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' });
}

// Override Date.toLocaleString للموقع كله ليستخدم توقيت مصر
const _origToLocaleString = Date.prototype.toLocaleString;
Date.prototype.toLocaleString = function(locale, opts) {
    if (!locale) return _origToLocaleString.call(this, 'ar-EG', { timeZone: 'Africa/Cairo' });
    if (!opts || !opts.timeZone) opts = Object.assign({}, opts || {}, { timeZone: 'Africa/Cairo' });
    return _origToLocaleString.call(this, locale, opts);
};

// ═══ جدول المستخدمين المحسّن مع الأرقام الحقيقية ═══
window.renderEnhancedAdminUsersTable = function() {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    const users    = JSON.parse(localStorage.getItem('global_store_users'))   || [];
    const orders   = JSON.parse(localStorage.getItem('global_store_orders'))  || [];
    const archive  = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    const allOrders = [...orders, ...archive];
    const cairoNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));

    tbody.innerHTML = '';
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#aaa;">لا يوجد مستخدمون بعد.</td></tr>';
        return;
    }

    // حساب بيانات كل مستخدم من الطلبات الحقيقية
    function getUserRealData(u) {
        const phone = u.phone || '';
        const userId = u.userId || '';
        const myOrders = allOrders.filter(o => {
            const p = o.clientPhone || o.customerPhone || o.phone || '';
            return p && p === phone;
        });
        const totalSpent = myOrders.reduce((sum, o) => {
            return sum + (parseFloat((o.finalPrice||o.total||'0').replace(/[^\d.]/g,'')) || 0);
        }, 0);
        const todayOrders = myOrders.filter(o => {
            const ts = o.timestamp || 0;
            if (!ts) return false;
            const d = new Date(ts);
            return d.toDateString() === cairoNow.toDateString();
        });
        const isActive = myOrders.some(o => {
            const ts = o.timestamp || 0;
            return ts && (Date.now() - ts) < 24 * 60 * 60 * 1000;
        });
        return { count: myOrders.length, spent: totalSpent, todayCount: todayOrders.length, isActive };
    }

    const sortedUsers = users.map((u, i) => ({ ...u, _realIdx: i }))
        .sort((a, b) => {
            const aData = getUserRealData(a);
            const bData = getUserRealData(b);
            return (bData.isActive ? 1 : 0) - (aData.isActive ? 1 : 0) || bData.count - aData.count;
        });

    sortedUsers.forEach(u => {
        const realIdx = u._realIdx;
        const data    = getUserRealData(u);
        const badge   = USER_BADGES[u.badge] || USER_BADGES.none;
        const wheelInfo = u.wheelDisabled
            ? '<span style="color:#c7254e;">🚫 محظور</span>'
            : `<span style="color:#1a7f4b;">✅ (${u.wheelWinRatio||100}%)</span>`;

        tbody.innerHTML += `
        <tr style="${u.isBanned ? 'background:#fbeff2;' : data.isActive ? 'background:#f0fff4;' : ''}border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#1b2a4a;font-size:0.82rem;">${u.userId||'—'}</td>
            <td>
                ${_esc(u.name)}
                ${u.badge && u.badge !== 'none'
                    ? `<span style="background:${badge.bg};color:${badge.color};font-size:0.72rem;padding:1px 6px;border-radius:4px;display:inline-block;margin-top:3px;">${badge.label}</span>`
                    : ''}
            </td>
            <td style="font-size:0.85rem;">${_esc(u.phone||'—')}</td>
            <td style="text-align:center;">
                <span style="background:${data.count>0?'#e8f5e9':'#fafafa'};color:${data.count>3?'#1a7f4b':'#555'};padding:3px 8px;border-radius:4px;font-weight:bold;">${data.count}</span>
                ${data.todayCount > 0 ? `<div style="font-size:0.7rem;color:#d9962b;font-weight:bold;">اليوم: ${data.todayCount}</div>` : ''}
            </td>
            <td style="color:#1a7f4b;font-weight:bold;font-size:0.9rem;">${data.spent > 0 ? data.spent.toFixed(0)+' ج.م' : '—'}</td>
            <td>
                <span style="color:${data.isActive?'#1a7f4b':'#bbb'};font-weight:bold;">
                    ${data.isActive ? '🟢 نشط' : '⚫ غير نشط'}
                </span>
            </td>
            <td style="font-size:0.82rem;">${wheelInfo}</td>
            <td>
                <div class="uact">
                <select onchange="setUserBadge(${realIdx}, this.value)" aria-label="العلامة">
                    <option value="none" ${!u.badge||u.badge==='none'?'selected':''}>بدون علامة</option>
                    <option value="vip"  ${u.badge==='vip'?'selected':''}>⭐ مميز</option>
                    <option value="trouble" ${u.badge==='trouble'?'selected':''}>⚠️ مشاغب</option>
                </select>
                <button class="a-wheel" title="صلاحيات العجلة" aria-label="صلاحيات العجلة" onclick="openUserWheelModal(${realIdx})">🎡</button>
                <button class="${u.isBanned?'a-unban':'a-ban'}" title="${u.isBanned?'رفع الحظر':'حظر'}" aria-label="${u.isBanned?'رفع الحظر':'حظر'}" onclick="toggleUserBan(${realIdx})">${u.isBanned?'✅':'🚫'}</button>
                <button class="a-sub" title="دخول كأدمن مساعد" aria-label="دخول كأدمن مساعد" onclick="enterSubAdminForUser(${realIdx})">🔑</button>
                ${u.isSubAdmin
                    ? `<button class="a-rem" title="إزالة كأدمن" aria-label="إزالة كأدمن" onclick="removeUserAdmin(${realIdx})">❌</button>`
                    : `<button class="a-add" title="إضافة كأدمن" aria-label="إضافة كأدمن" onclick="makeUserAdmin(${realIdx})">👑</button>`}
                <button class="a-del" title="حذف" aria-label="حذف" onclick="deleteUser(${realIdx})">🗑</button>
                </div>
            </td>
            <td></td>
        </tr>`;
    });
};

// زر دخول أدمن مساعد لمستخدم معيّن
function enterSubAdminForUser(index) {
    const users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    const u = users[index];
    if (!u) return;
    showToast('🔒 كلمة مرور الأدمن المساعد لا تُعرض. غيّرها من الإعدادات.');
}

// ═══ إضافة / إزالة مستخدم كأدمن مساعد ═══
window.makeUserAdmin = function(index) {
    const users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    const u = users[index];
    if (!u) return;
    users[index].isSubAdmin = true;
    localStorage.setItem('global_store_users', JSON.stringify(users));
    showToast(`✅ تم تعيين ${_esc(u.name)} كأدمن مساعد`);
    if (typeof window.renderEnhancedAdminUsersTable === 'function') window.renderEnhancedAdminUsersTable();
};

window.removeUserAdmin = function(index) {
    const users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    const u = users[index];
    if (!u) return;
    users[index].isSubAdmin = false;
    localStorage.setItem('global_store_users', JSON.stringify(users));
    showToast(`❌ تم إزالة ${_esc(u.name)} من الأدمن المساعد`);
    if (typeof window.renderEnhancedAdminUsersTable === 'function') window.renderEnhancedAdminUsersTable();
};

// ═══ إحصائيات المستخدمين المحسّنة ═══
window.renderUserStats = function() {
    const container = document.getElementById('user-stats-container');
    if (!container) return;

    const users   = JSON.parse(localStorage.getItem('global_store_users'))   || [];
    const orders  = JSON.parse(localStorage.getItem('global_store_orders'))  || [];
    const archive = JSON.parse(localStorage.getItem('global_store_archive')) || [];
    const allOrders = [...orders, ...archive];
    const cairoNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));

    // حساب مشتريات كل مستخدم
    const phoneMap = {};
    allOrders.forEach(o => {
        const ph = o.clientPhone || o.customerPhone || o.phone || '';
        if (!ph) return;
        if (!phoneMap[ph]) phoneMap[ph] = { count: 0, spent: 0, todayCount: 0 };
        phoneMap[ph].count++;
        phoneMap[ph].spent += parseFloat((o.finalPrice||o.total||'0').replace(/[^\d.]/g,'')) || 0;
        const ts = o.timestamp || 0;
        if (ts && new Date(ts).toDateString() === cairoNow.toDateString()) phoneMap[ph].todayCount++;
    });

    // أكثر شراءً اليوم
    const todayBuyers = users
        .map(u => ({ ...u, todayCount: (phoneMap[u.phone]||{}).todayCount || 0 }))
        .filter(u => u.todayCount > 0)
        .sort((a, b) => b.todayCount - a.todayCount);

    // أكثر شراءً الشهر الحالي
    const monthOrders = allOrders.filter(o => {
        const ts = o.timestamp || 0;
        if (!ts) return false;
        const d = new Date(ts);
        return d.getMonth()===cairoNow.getMonth() && d.getFullYear()===cairoNow.getFullYear();
    });
    const monthPhoneMap = {};
    monthOrders.forEach(o => {
        const ph = o.clientPhone || o.customerPhone || o.phone || '';
        if (ph) monthPhoneMap[ph] = (monthPhoneMap[ph]||0) + 1;
    });
    const topMonthBuyer = users
        .map(u => ({ ...u, mcount: monthPhoneMap[u.phone]||0 }))
        .sort((a,b) => b.mcount - a.mcount)[0];

    // أكثر شراءً عموماً
    const topBuyer = users
        .map(u => ({ ...u, allCount: (phoneMap[u.phone]||{}).count || 0 }))
        .sort((a,b) => b.allCount - a.allCount)[0];

    const activeCount  = users.filter(u => {
        const d = phoneMap[u.phone];
        return d && allOrders.some(o => {
            const ph = o.clientPhone||o.customerPhone||o.phone||'';
            const ts = o.timestamp||0;
            return ph===u.phone && ts && (Date.now()-ts) < 24*60*60*1000;
        });
    }).length;
    const nonBuyersCount = users.filter(u => !(phoneMap[u.phone] && phoneMap[u.phone].count > 0)).length;

    container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
        <div style="background:linear-gradient(135deg,#1a7f4b,#1a7f4b);color:#fff;padding:16px;border-radius:12px;text-align:center;">
            <div style="font-size:2rem;font-weight:bold;">${users.length}</div>
            <div style="font-size:0.85rem;">إجمالي المستخدمين</div>
        </div>
        <div style="background:linear-gradient(135deg,#1b2a4a,#1b2a4a);color:#fff;padding:16px;border-radius:12px;text-align:center;">
            <div style="font-size:2rem;font-weight:bold;">${activeCount}</div>
            <div style="font-size:0.85rem;">🟢 نشطون (24 ساعة)</div>
        </div>
        <div style="background:linear-gradient(135deg,#a8884f,#d35400);color:#fff;padding:16px;border-radius:12px;text-align:center;">
            <div style="font-size:2rem;font-weight:bold;">${nonBuyersCount}</div>
            <div style="font-size:0.85rem;">😴 لم يشتروا</div>
        </div>
        <div style="background:linear-gradient(135deg,#2a3d66,#2a3d66);color:#fff;padding:16px;border-radius:12px;text-align:center;">
            <div style="font-size:2rem;font-weight:bold;">${users.filter(u=>u.badge==='vip').length}</div>
            <div style="font-size:0.85rem;">⭐ مميزون</div>
        </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:15px;">
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-right:4px solid #d9962b;">
            <div style="font-size:0.82rem;color:#777;margin-bottom:4px;">🏆 أكثر شراءً اليوم</div>
            <div style="font-weight:bold;color:#14203a;">${todayBuyers[0] ? todayBuyers[0].name + ' (' + todayBuyers[0].todayCount + ' طلبات اليوم)' : '—'}</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-right:4px solid #1b2a4a;">
            <div style="font-size:0.82rem;color:#777;margin-bottom:4px;">📅 أكثر شراءً هذا الشهر</div>
            <div style="font-weight:bold;color:#14203a;">${topMonthBuyer && topMonthBuyer.mcount > 0 ? topMonthBuyer.name + ' (' + topMonthBuyer.mcount + ' طلبات)' : '—'}</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-right:4px solid #1a7f4b;">
            <div style="font-size:0.82rem;color:#777;margin-bottom:4px;">🥇 أكثر شراءً عموماً</div>
            <div style="font-weight:bold;color:#14203a;">${topBuyer && topBuyer.allCount > 0 ? topBuyer.name + ' (' + topBuyer.allCount + ' طلب)' : '—'}</div>
        </div>
    </div>`;
};

// ═══ التوقيت المصري في أي حاجة جديدة تتحفظ ═══
// يضمن إن أي حاجة بتتحفظ في localStorage بتاخد توقيت مصر
window._egyptNow = function() {
    return new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
};
window._egyptTimestamp = function() {
    return Date.now(); // timestamp دايماً UTC - التحويل يحصل عند العرض
};


// =========================================================================
// STORE v5 ADDITIONS
// =========================================================================

// ─── 2. زرار النسخ العام (Copy Button) لأي عنصر ────────────────────────────
function createCopyButton(text, label) {
    label = label || '📋 نسخ';
    var btn = document.createElement('button');
    btn.className = 'store-copy-btn';
    btn.innerHTML = label;
    btn.style.cssText = 'background:linear-gradient(135deg,#3498db,#2980b9);color:#fff;border:none;' +
        'border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;font-weight:700;' +
        'font-family:inherit;white-space:nowrap;transition:all .15s;vertical-align:middle;margin-right:6px;';
    btn.onclick = function(e) {
        e.stopPropagation();
        _globalCopy(text);
        btn.innerHTML = '✅ تم';
        setTimeout(function(){ btn.innerHTML = label; }, 1500);
    };
    return btn;
}

function _globalCopy(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(String(text)).then(function(){
            if (typeof showToast === 'function') showToast('✅ تم النسخ!');
        }).catch(function(){ _fallbackCopy(text); });
    } else {
        _fallbackCopy(text);
    }
}

function _fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = String(text);
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); if (typeof showToast === 'function') showToast('✅ تم النسخ!'); } catch(e) {}
    document.body.removeChild(ta);
}

// نسخ ID المستخدم
function copyCurrentUserId() {
    var user = getCurrentUser ? getCurrentUser() : null;
    if (!user) return;
    _globalCopy(user.userId);
}

// نسخ كلمة سر المستخدم
function copyCurrentUserPass() {
    var user = getCurrentUser ? getCurrentUser() : null;
    if (!user) return;
    _globalCopy(user.password);
}

// ─── 3. إضافة أزرار نسخ جنب أكواد الخصم وأكواد التتبع ──────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // أكواد التتبع في صفحة تتبع الطلب
    injectCopyBtnsOnSelector('.tracking-code, [data-copy], .order-id-display', function(el) {
        return el.dataset.copy || el.innerText.trim();
    });

    // أكواد الخصم في السلة
    injectCopyBtnsOnSelector('.coupon-code, #active-coupon-code, [data-coupon]', function(el) {
        return el.dataset.coupon || el.innerText.trim();
    });

});

function injectCopyBtnsOnSelector(selector, getTextFn) {
    document.querySelectorAll(selector).forEach(function(el) {
        if (el.dataset.copyInjected) return;
        el.dataset.copyInjected = '1';
        var text = getTextFn(el);
        if (!text) return;
        var btn = createCopyButton(text);
        if (el.nextSibling) {
            el.parentNode.insertBefore(btn, el.nextSibling);
        } else {
            el.parentNode.appendChild(btn);
        }
    });
}

// ─── 4. ربط زرار نسخ في صفحة التتبع ───────────────────────────────────────
// يعمل بعد أن يظهر نتيجة البحث
var _origTrackOrder = window.trackOrder;
window.trackOrder = function() {
    if (typeof _origTrackOrder === 'function') _origTrackOrder.apply(this, arguments);
    setTimeout(function() {
        var orderIdEls = document.querySelectorAll('.order-result-id, #track-order-id');
        orderIdEls.forEach(function(el) {
            if (!el || el.dataset.copyInjected) return;
            el.dataset.copyInjected = '1';
            var text = el.innerText.trim();
            if (!text) return;
            var btn = createCopyButton(text);
            el.parentNode && el.parentNode.insertBefore(btn, el.nextSibling);
        });
    }, 300);
};

// ─── 5. إضافة زر نسخ جنب عرض الكوبون المفعّل ─────────────────────────────
var _origRenderCart = window.renderCart;
window.renderCart = function() {
    if (typeof _origRenderCart === 'function') _origRenderCart.apply(this, arguments);
    setTimeout(function() {
        var couponDisplay = document.querySelector('#applied-coupon-display, .applied-coupon-code');
        if (couponDisplay && !couponDisplay.dataset.copyInjected) {
            couponDisplay.dataset.copyInjected = '1';
            var code = couponDisplay.innerText.trim();
            if (code) {
                var btn = createCopyButton(code);
                couponDisplay.parentNode && couponDisplay.parentNode.insertBefore(btn, couponDisplay.nextSibling);
            }
        }
    }, 300);
};

// ─── 6. حماية من البان ومنع التلاعب ────────────────────────────────────────
(function() {
    var _origSetCurrentUser = window.setCurrentUser;
    window.setCurrentUser = function(user) {
        if (!user) return _origSetCurrentUser && _origSetCurrentUser(user);
        // تحقق من حظر المستخدم في كل مرة
        var users = JSON.parse(localStorage.getItem('global_store_users')) || [];
        var fresh = users.find(function(u){ return u.userId == user.userId; });
        if (fresh && fresh.isBanned) {
            if (window.FBAuth) window.FBAuth.logout(); else localStorage.removeItem('current_user');
            if (window.location.pathname.indexOf('admin') === -1) {
                if (typeof showAlert === 'function') {
                    showAlert('🚫','محظور','تم حظر هذا الحساب. تواصل مع الإدارة.');
                }
            }
            return;
        }
        return _origSetCurrentUser && _origSetCurrentUser(user);
    };
})();

// ─── 7. فحص الجلسة دورياً ───────────────────────────────────────────────────
setInterval(function() {
    var user = getCurrentUser ? getCurrentUser() : null;
    if (!user) return;
    var users = JSON.parse(localStorage.getItem('global_store_users')) || [];
    var fresh = users.find(function(u){ return u.userId == user.userId; });
    if (fresh && fresh.isBanned) {
        localStorage.removeItem('current_user');
        if (typeof showToast === 'function') showToast('🚫 تم حظر حسابك!');
        setTimeout(function(){ window.location.href = 'index.html'; }, 1500);
    }
}, 30000);


/**
 * কাছের দোকান - Feature Upgrade Layer
 * Adds profiles/photos, product photo library, rider workflow, live badges,
 * dynamic availability, and Bangla Edge-TTS seller greeting with date/weather.
 */

Object.assign(state, {
  userShops: [],
  ownerShopOpen: true,
  unreadChat: Number(localStorage.getItem('kd_unread_chat') || 0),
  unreadCalls: Number(localStorage.getItem('kd_unread_calls') || 0),
  lastChatOrderId: localStorage.getItem('kd_last_chat_order') || '',
  lastChatOrderNumber: localStorage.getItem('kd_last_chat_order_number') || '',
  lastCallOrderId: localStorage.getItem('kd_last_call_order') || '',
  voiceAlertLanguage: state.lang || localStorage.getItem('kd_lang') || 'en',
  voiceAudio: null,
  voiceAudioUrl: '',
  selectedDefaultProductImage: '/images/products/grocery.svg',
  lowStockProducts: [],
  lastStockReminderText: ''
});

let riderRefreshTimer = null;
const KD_DEFAULT_AVATAR = '/images/default-avatar.svg';
const KD_DEFAULT_PRODUCT_IMAGES = [
  ['Milk / দুধ', '/images/products/milk.svg'],
  ['Oil / তেল', '/images/products/oil.svg'],
  ['Chips / চিপস', '/images/products/chips.svg'],
  ['Rice / চাল', '/images/products/rice.svg'],
  ['Eggs / ডিম', '/images/products/eggs.svg'],
  ['Bread / পাউরুটি', '/images/products/bread.svg'],
  ['Biscuit / বিস্কুট', '/images/products/biscuit.svg'],
  ['Tea / চা', '/images/products/tea.svg'],
  ['Salt / লবণ', '/images/products/salt.svg'],
  ['Lentil / ডাল', '/images/products/lentil.svg'],
  ['Noodles / নুডলস', '/images/products/noodles.svg'],
  ['Soap / সাবান', '/images/products/soap.svg'],
  ['Drink / পানীয়', '/images/products/drink.svg'],
  ['Spice / মসলা', '/images/products/spice.svg'],
  ['Grocery / মুদি', '/images/products/grocery.svg']
];

function kdRoleLabel(role) {
  const labels = state.lang === 'bn'
    ? { USER: 'ক্রেতা', SHOP_OWNER: 'দোকানদার', RIDER: 'রাইডার', ADMIN: 'অ্যাডমিন' }
    : { USER: 'Customer', SHOP_OWNER: 'Shop Owner', RIDER: 'Rider', ADMIN: 'Admin' };
  return labels[role] || role;
}

const KD_CATEGORY_BN = {
  'Rice & Grains':'চাল ও শস্য','Lentils & Pulses':'ডাল ও ডালজাত পণ্য','Dairy & Eggs':'দুধ ও ডিম','Oil & Ghee':'তেল ও ঘি','Oil & Spices':'তেল ও মসলা','Spices & Condiments':'মসলা ও সস','Fruits & Vegetables':'ফল ও সবজি','Meat & Fish':'মাংস ও মাছ','Bakery & Bread':'বেকারি ও রুটি','Snacks & Biscuits':'স্ন্যাকস ও বিস্কুট','Snacks & Tea':'চা ও নাশতা','Beverages':'পানীয়','Tea & Coffee':'চা ও কফি','Frozen Foods':'ফ্রোজেন খাবার','Instant Foods':'ইনস্ট্যান্ট খাবার','Personal Care':'ব্যক্তিগত যত্ন','Baby Care':'শিশু যত্ন','Household & Cleaning':'গৃহস্থালি ও পরিষ্কার-পরিচ্ছন্নতা','Stationery':'স্টেশনারি','Pet Care':'পোষা প্রাণীর পণ্য','Electronics & Accessories':'ইলেকট্রনিক্স ও আনুষঙ্গিক','Others':'অন্যান্য'
};
function kdCategoryLabel(value) { const v=String(value||''); return state.lang==='bn' ? (KD_CATEGORY_BN[v] || v) : v; }
function kdText(en,bn){ return state.lang==='bn' ? bn : en; }

function kdToBanglaDigits(value) {
  const map = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(value).replace(/\d/g, d => map[Number(d)]);
}

function kdUpdateNotificationBadges() {
  const chat = document.getElementById('chatUnreadBadge');
  const call = document.getElementById('callUnreadBadge');
  if (chat) { chat.textContent = state.unreadChat > 99 ? '99+' : String(state.unreadChat); chat.style.display = state.unreadChat ? 'inline-flex' : 'none'; }
  if (call) { call.textContent = state.unreadCalls > 99 ? '99+' : String(state.unreadCalls); call.style.display = state.unreadCalls ? 'inline-flex' : 'none'; }
  localStorage.setItem('kd_unread_chat', String(state.unreadChat));
  localStorage.setItem('kd_unread_calls', String(state.unreadCalls));
}

function kdUpdateHeaderProfile() {
  if (!state.user) return;
  const img = document.getElementById('headerProfileImage');
  if (img) img.src = state.user.imageUrl || KD_DEFAULT_AVATAR;
  const riderImg = document.getElementById('riderHeroImage');
  if (riderImg && state.user.role === 'RIDER') riderImg.src = state.user.imageUrl || KD_DEFAULT_AVATAR;
  const name = document.getElementById('authUserName');
  if (name) name.textContent = `${state.user.name} (${kdRoleLabel(state.user.role)})`;
}

async function kdReadFileAsDataUrl(file) {
  if (!file) return '';
  if (file.size > 4 * 1024 * 1024) throw new Error(kdText('Image must be smaller than 4 MB.','ছবির আকার ৪ MB-এর কম হতে হবে।'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(kdText('Unable to read selected image.','নির্বাচিত ছবি পড়া যায়নি।')));
    reader.readAsDataURL(file);
  });
}

async function kdUploadImage(file, kind) {
  const dataUrl = await kdReadFileAsDataUrl(file);
  const res = await apiFetch('/api/uploads/image', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, dataUrl })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || kdText('Image upload failed.','ছবি আপলোড করা যায়নি।'));
  return data.url;
}

function kdStopVoice() {
  try { if (state.voiceAudio) state.voiceAudio.pause(); } catch (e) {}
  state.voiceAudio = null;
  if (state.voiceAudioUrl) URL.revokeObjectURL(state.voiceAudioUrl);
  state.voiceAudioUrl = '';
}

async function kdSpeak(text, lang = 'bn') {
  if (!text || !state.authToken) return;
  try {
    kdStopVoice();
    const res = await apiFetch('/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });
    if (!res.ok) throw new Error('Voice service unavailable');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    state.voiceAudio = audio; state.voiceAudioUrl = url;
    await new Promise(async (resolve, reject) => {
      audio.onended = () => { kdStopVoice(); resolve(); };
      audio.onerror = () => { kdStopVoice(); reject(new Error('Audio playback failed')); };
      try { await audio.play(); } catch (err) { reject(err); }
    });
  } catch (err) {
    console.warn('Edge TTS:', err.message);
    // Project-show fallback: if the online Edge TTS request fails, use the browser's
    // built-in speech engine instead of silently losing the seller announcement.
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : 'bn-BD';
        utterance.rate = 0.94;
        window.speechSynthesis.speak(utterance);
        showToast(kdText('Online voice unavailable — using device voice.','অনলাইন ভয়েস পাওয়া যায়নি — ডিভাইসের ভয়েস ব্যবহার হচ্ছে।'));
        return;
      }
    } catch (_) {}
    showToast(kdText('Voice is temporarily unavailable. The notification remains visible on the dashboard.','ভয়েস সাময়িকভাবে পাওয়া যাচ্ছে না। নোটিফিকেশন ড্যাশবোর্ডে থাকবে।'));
  }
}

async function kdGetCoords() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(state.userCoords);
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(state.userCoords),
      { enableHighAccuracy: false, timeout: 4500, maximumAge: 120000 }
    );
  });
}

async function kdSellerGreeting(speak = false) {
  if (state.user?.role !== 'SHOP_OWNER') return;
  const card = document.getElementById('sellerGreetingCard');
  if (card) card.style.display = 'flex';
  const bn = state.lang === 'bn';
  const locale = bn ? 'bn-BD' : 'en-GB';
  const dateText = new Intl.DateTimeFormat(locale, { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date());
  let weatherSpeech = bn ? 'আবহাওয়ার তথ্য পাওয়া যায়নি' : 'Weather information is unavailable';
  let weatherDisplay = weatherSpeech;
  try {
    const coords = await kdGetCoords();
    const res = await apiFetch(`/api/weather?lat=${coords.latitude}&lng=${coords.longitude}`);
    const data = await res.json();
    if (data.success) {
      const temp = Math.round(Number(data.temperature));
      const desc = bn ? (data.description?.bn || 'আবহাওয়া স্বাভাবিক') : (data.description?.en || 'Normal weather');
      weatherSpeech = bn ? `${desc}, তাপমাত্রা ${kdToBanglaDigits(temp)} ডিগ্রি সেলসিয়াস` : `${desc}, temperature ${temp} degrees Celsius`;
      weatherDisplay = `${desc} · ${bn ? kdToBanglaDigits(temp) : temp}°C`;
    }
  } catch (_) {}
  const greeting = bn ? `স্বাগতম ${state.user.name}। আজ ${dateText}। ${weatherSpeech}।` : `Welcome ${state.user.name}. Today is ${dateText}. ${weatherSpeech}.`;
  const text = document.getElementById('sellerGreetingText');
  const weather = document.getElementById('sellerWeatherText');
  if (text) text.textContent = bn ? `স্বাগতম ${state.user.name} · ${dateText}` : `Welcome ${state.user.name} · ${dateText}`;
  if (weather) weather.textContent = weatherDisplay;
  if (speak) await kdSpeak(greeting, state.lang);
  await kdLoadLowStockReminder(speak);
}

function kdEnsureLowStockCard() {
  let card = document.getElementById('sellerLowStockCard');
  if (card) return card;
  const greeting = document.getElementById('sellerGreetingCard');
  if (!greeting) return null;
  card = document.createElement('div');
  card.id = 'sellerLowStockCard';
  card.className = 'card seller-low-stock-card';
  card.style.display = 'none';
  greeting.insertAdjacentElement('afterend', card);
  return card;
}

async function kdLoadLowStockReminder(speak = false) {
  if (state.user?.role !== 'SHOP_OWNER' || !state.ownerShopId) return [];
  try {
    const res = await apiFetch(`/api/shops/${state.ownerShopId}/low-stock`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || kdText('Unable to load low stock.','কম স্টকের তথ্য পাওয়া যায়নি।'));
    const products = data.data || []; state.lowStockProducts = products;
    const card = kdEnsureLowStockCard();
    if (!products.length) { state.lastStockReminderText=''; if(card) card.style.display='none'; return products; }
    const bn = state.lang === 'bn';
    const names = products.map(p => bn ? (p.nameBn || p.name) : p.name).join(', ');
    const reminder = bn
      ? `গুরুত্বপূর্ণ রিমাইন্ডার। আপনার দোকানে ${names} এর স্টক প্রায় শেষ। অনুগ্রহ করে দ্রুত রিস্টক করুন।`
      : `Important reminder. Stock is running low for ${names}. Please restock these products soon.`;
    state.lastStockReminderText = reminder;
    if (card) {
      card.style.display='block';
      card.innerHTML = `<div class="low-stock-head"><div><strong>⚠️ ${bn?'গুরুত্বপূর্ণ স্টক রিমাইন্ডার':'Important stock reminder'}</strong><div>${bn?'৫টির কম থাকা পণ্য':'Products with fewer than 5 items'}</div></div><button type="button" class="btn btn-sm btn-outline" onclick="window.kdRepeatStockReminder()">🔊 ${bn?'আবার শুনুন':'Play again'}</button></div>
      <div class="low-stock-grid">${products.map(p => `<div class="low-stock-item"><img src="${p.imageUrl || '/images/products/grocery.svg'}" alt=""><div class="low-stock-info"><strong>${escapeHtml(bn?(p.nameBn||p.name):p.name)}</strong><span>${bn?`বাকি ${kdToBanglaDigits(p.stock)}টি`:`${p.stock} remaining`}</span></div><button type="button" class="btn btn-sm btn-primary" onclick="window.kdRestockProduct('${p._id}','${String(p.name||'').replace(/'/g,"&#39;")}',${Number(p.stock)||0})">${bn?'রিস্টক':'Restock'}</button></div>`).join('')}</div>`;
    }
    if (speak) await kdSpeak(reminder, state.lang);
    return products;
  } catch (err) { console.warn('Low stock reminder:', err.message); return []; }
}

async function kdRestockProduct(productId, productName = 'Product', currentStock = 0) {
  const raw = window.prompt(state.lang==='bn' ? `${productName} এখন ${kdToBanglaDigits(currentStock)}টি আছে। কতটি নতুন করে যোগ করবেন?` : `${productName} currently has ${currentStock} items. How many would you like to add?`, '10');
  if (raw === null) return;
  const addQuantity = Number.parseInt(raw, 10);
  if (!Number.isInteger(addQuantity) || addQuantity < 1) return showToast(kdText('Restock quantity must be at least 1.','স্টক যোগ করতে অন্তত ১ লিখুন।'));
  try {
    const res = await apiFetch(`/api/products/${productId}/restock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addQuantity }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Restock failed.');
    showToast(state.lang==='bn' ? `${data.data.nameBn || data.data.name} · নতুন স্টক ${kdToBanglaDigits(data.data.stock)}` : `${data.data.name} restocked. New stock: ${data.data.stock}`);
    await loadOwnerInventory();
    await kdLoadLowStockReminder(false);
  } catch (err) { showToast(state.lang==='bn' ? 'পণ্যের স্টক যোগ করা যায়নি।' : (err.message || 'Unable to restock product.')); }
}

async function kdRepeatStockReminder() {
  if (!state.lastStockReminderText) await kdLoadLowStockReminder(false);
  if (state.lastStockReminderText) await kdSpeak(state.lastStockReminderText, state.lang);
  else showToast(kdText('No low-stock items.','কম স্টকের কোনো পণ্য নেই।'));
}

window.kdRestockProduct = kdRestockProduct;
window.kdRepeatStockReminder = kdRepeatStockReminder;

function kdRenderDefaultProductPhotos() {
  const grid = document.getElementById('defaultProductPhotoGrid');
  if (!grid) return;
  grid.innerHTML = KD_DEFAULT_PRODUCT_IMAGES.map(([label, url], i) => `
    <button type="button" class="default-photo-option ${i === KD_DEFAULT_PRODUCT_IMAGES.length - 1 ? 'active' : ''}" data-image-url="${url}" title="${label}">
      <img src="${url}" alt="${label}"><span>${label}</span>
    </button>`).join('');
  grid.querySelectorAll('.default-photo-option').forEach(button => button.addEventListener('click', () => {
    grid.querySelectorAll('.default-photo-option').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const url = button.dataset.imageUrl;
    state.selectedDefaultProductImage = url;
    document.getElementById('newProdImageUrl').value = url;
    document.getElementById('newProdImagePreview').src = url;
    document.getElementById('newProdImageFile').value = '';
  }));
}

function kdSetProductPhotoMode(mode) {
  const upload = mode === 'upload';
  document.getElementById('btnUploadProductPhoto')?.classList.toggle('active', upload);
  document.getElementById('btnChooseDefaultProductPhoto')?.classList.toggle('active', !upload);
  const input = document.getElementById('newProdImageFile');
  const grid = document.getElementById('defaultProductPhotoGrid');
  if (input) input.style.display = upload ? 'block' : 'none';
  if (grid) grid.style.display = upload ? 'none' : 'grid';
}

// Override add-product submit so a seller can choose a default image or upload their own.
handleAddProduct = async function(event) {
  event.preventDefault();
  try {
    let imageUrl = document.getElementById('newProdImageUrl')?.value || state.selectedDefaultProductImage;
    const file = document.getElementById('newProdImageFile')?.files?.[0];
    if (file) imageUrl = await kdUploadImage(file, 'product');
    const payload = {
      shopId: state.ownerShopId,
      name: document.getElementById('newProdName').value.trim(),
      nameBn: document.getElementById('newProdNameBn').value.trim(),
      category: document.getElementById('newProdCategory').value === 'Others'
        ? (document.getElementById('newProdCustomCategory')?.value.trim() || 'Others')
        : document.getElementById('newProdCategory').value,
      brand: document.getElementById('newProdBrand')?.value.trim() || '',
      description: document.getElementById('newProdDescription')?.value.trim() || '',
      unit: document.getElementById('newProdUnit').value.trim(),
      price: document.getElementById('newProdPrice').value,
      stock: document.getElementById('newProdStock').value,
      available: document.getElementById('newProdAvailable')?.checked !== false,
      imageUrl
    };
    const res = await apiFetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || (state.lang === 'bn' ? 'পণ্য যোগ করা যায়নি।' : 'Unable to add product.'));
    showToast(state.lang === 'bn' ? 'ছবিসহ নতুন পণ্য সফলভাবে যোগ হয়েছে।' : 'New product added successfully with photo.');
    document.getElementById('formAddProduct').reset();
    state.selectedDefaultProductImage = '/images/products/grocery.svg';
    document.getElementById('newProdImageUrl').value = state.selectedDefaultProductImage;
    document.getElementById('newProdImagePreview').src = state.selectedDefaultProductImage;
    kdRenderDefaultProductPhotos();
    kdSetProductPhotoMode('default');
    document.getElementById('addProductModal').style.display = 'none';
    loadOwnerDashboard();
  } catch (err) { showToast(err.message || (state.lang === 'bn' ? 'পণ্য যোগ করা ব্যর্থ হয়েছে।' : 'Failed to add product.')); }
};

const kdBaseLoadOwnerInventory = loadOwnerInventory;
loadOwnerInventory = async function() {
  const tbody = document.getElementById('ownerProductsTableBody');
  if (!tbody || !state.ownerShopId) return;
  try {
    const res = await apiFetch(`/api/shops/${state.ownerShopId}/products`);
    const data = await res.json();
    if (!data.success) return;
    const bn = state.lang === 'bn';
    tbody.innerHTML = (data.data || []).map(p => {
      const active = p.available !== false && Number(p.stock) > 0;
      const stockLabel = Number(p.stock) <= 0 ? (bn ? '🔴 স্টক শেষ' : '🔴 Out of Stock') : Number(p.stock) < 5 ? (bn ? '🟡 স্টক কম' : '🟡 Low Stock') : active ? (bn ? '🟢 প্রাপ্য' : '🟢 Available') : (bn ? '🔴 অনুপলব্ধ' : '🔴 Unavailable');
      const displayName = bn ? (p.nameBn || p.name) : p.name;
      const secondaryName = bn ? p.name : (p.nameBn || '');
      return `<tr>
        <td><div class="inventory-product-cell"><img class="inventory-product-thumb" src="${p.imageUrl || '/images/products/grocery.svg'}" alt=""><div><strong>${escapeHtml(displayName)}</strong><div style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(secondaryName)} · ${escapeHtml(p.unit || '')}</div></div></div></td>
        <td><span class="badge badge-primary">${escapeHtml(kdCategoryLabel(p.category || 'Groceries'))}</span></td>
        <td><strong>৳${p.price}</strong></td>
        <td><input type="number" value="${p.stock}" id="stockInput_${p._id}" style="width:78px;padding:6px 8px;border:1px solid var(--border-color);border-radius:8px"></td>
        <td><span class="badge ${active && p.stock >= 5 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}">${stockLabel}</span></td>
        <td><div class="v18-inventory-actions"><button class="btn btn-xs btn-outline" onclick="window.appQuickUpdateStock('${p._id}')">${bn ? 'সেভ' : 'Save'}</button><button class="btn btn-xs btn-primary" onclick="window.kdRestockProduct('${p._id}','${String(p.name || '').replace(/'/g, "&#39;")}',${Number(p.stock)||0})">${bn ? 'রিস্টক' : 'Restock'}</button><button class="btn btn-xs btn-outline" onclick="window.kdOpenProductEditorById('${p._id}')">${bn ? 'সম্পাদনা' : 'Edit'}</button></div></td>
      </tr>`;
    }).join('') || `<tr><td colspan="6" class="empty-state-small">${bn ? 'এখনও কোনো পণ্য নেই।' : 'No products yet.'}</td></tr>`;
    state.ownerProductsCache = data.data || [];
    await kdLoadLowStockReminder(false);
  } catch (err) { console.error(err); }
};

const kdBaseRenderStoreProducts = renderStoreProducts;
renderStoreProducts = function(products, shop) {
  kdBaseRenderStoreProducts(products.map(p => ({ ...p, imageUrl: p.imageUrl || '/images/products/grocery.svg' })), shop);
  if (!shop.open) {
    document.querySelectorAll('#modalProductsGrid button').forEach(btn => { btn.disabled = true; btn.style.opacity = '.5'; });
    const grid = document.getElementById('modalProductsGrid');
    grid?.insertAdjacentHTML('afterbegin', `<div style="grid-column:1/-1" class="empty-state-small">${state.lang==='bn'?'🔴 দোকানটি এখন বন্ধ। পণ্য দেখা যাবে, কিন্তু নতুন অর্ডার করা যাবে না।':'🔴 This shop is currently unavailable/closed. Products are visible, but new orders are disabled.'}</div>`);
  }
};

function kdOpenProfile() {
  if (!state.user) return;
  const u = state.user;
  document.getElementById('profileModalTitle').textContent = `${u.name} · ${kdRoleLabel(u.role)}`;
  document.getElementById('profileName').value = u.name || '';
  document.getElementById('profilePhone').value = u.phone || '';
  document.getElementById('profileEmail').value = u.email || '';
  document.getElementById('profileRole').value = kdRoleLabel(u.role);
  document.getElementById('profileAddress').value = u.address || '';
  document.getElementById('profileVehicleType').value = u.vehicleType || 'Bicycle';
  document.getElementById('profileImageUrl').value = u.imageUrl || '';
  document.getElementById('profileImagePreview').src = u.imageUrl || KD_DEFAULT_AVATAR;
  document.querySelectorAll('.rider-profile-only').forEach(el => el.style.display = u.role === 'RIDER' ? '' : 'none');
  const seller = document.getElementById('sellerProfileFields');
  seller.style.display = u.role === 'SHOP_OWNER' ? 'block' : 'none';
  if (u.role === 'SHOP_OWNER') {
    const shop = state.userShops?.[0];
    document.getElementById('profileShopName').value = shop?.shopName || '';
    document.getElementById('profileShopNameBn').value = shop?.shopNameBn || '';
    document.getElementById('profileShopAddress').value = shop?.address || '';
  }
  document.getElementById('profileImageFile').value = '';
  document.getElementById('profileModal').style.display = 'flex';
}

async function kdSaveProfile(event) {
  event.preventDefault();
  try {
    let imageUrl = document.getElementById('profileImageUrl').value;
    const file = document.getElementById('profileImageFile').files?.[0];
    if (file) imageUrl = await kdUploadImage(file, 'profile');
    const profileRes = await apiFetch('/api/auth/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('profileName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        address: document.getElementById('profileAddress').value.trim(),
        imageUrl,
        vehicleType: document.getElementById('profileVehicleType').value
      })
    });
    const profile = await profileRes.json();
    if (!profile.success) throw new Error(profile.message || 'Profile update failed.');
    state.user = profile.user;
    state.userShops = profile.shops || state.userShops;
    if (state.user.role === 'SHOP_OWNER' && state.ownerShopId) {
      const shopRes = await apiFetch(`/api/shops/${state.ownerShopId}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName: document.getElementById('profileShopName').value.trim(), shopNameBn: document.getElementById('profileShopNameBn').value.trim(), address: document.getElementById('profileShopAddress').value.trim(), phone: state.user.phone, imageUrl: state.user.imageUrl || '' })
      });
      const shopData = await shopRes.json();
      if (shopData.success) state.userShops = [shopData.data, ...(state.userShops || []).slice(1)];
    }
    kdUpdateHeaderProfile();
    document.getElementById('profileModal').style.display = 'none';
    showToast(kdText('Profile updated successfully.','প্রোফাইল সফলভাবে আপডেট হয়েছে।'));
    if (state.user.role === 'SHOP_OWNER' && state.userShops[0]) {
      const shop = state.userShops[0];
      document.getElementById('ownerShopName').textContent = `${shop.shopNameBn || shop.shopName}`;
      document.getElementById('ownerShopAddress').textContent = `${shop.address} • ${kdText('Phone','ফোন')}: ${shop.phone}`;
    }
    if (state.user.role === 'RIDER') loadRiderDashboard();
  } catch (err) { showToast(state.lang==='bn' ? 'প্রোফাইল সংরক্ষণ করা যায়নি।' : (err.message || 'Unable to save profile.')); }
}

async function kdGetRiderCoords() {
  const coords = await kdGetCoords();
  state.userCoords = coords;
  const gps = document.getElementById('gpsCoordsText');
  if (gps) gps.textContent = `GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
  return coords;
}

async function loadRiderDashboard() {
  if (state.user?.role !== 'RIDER') return;
  document.getElementById('riderWelcomeName').textContent = kdText(`Welcome ${state.user.name}`,`স্বাগতম ${state.user.name}`);
  document.getElementById('riderHeroImage').src = state.user.imageUrl || KD_DEFAULT_AVATAR;
  const toggle = document.getElementById('riderAvailabilityToggle');
  if (toggle) toggle.checked = state.user.riderAvailable !== false;
  const label = document.getElementById('riderAvailabilityLabel');
  if (label) label.textContent = state.user.riderAvailable !== false ? `🟢 ${kdText('Available','উপলভ্য')}` : `🔴 ${kdText('Not Available','অনুপলভ্য')}`;
  try {
    const coords = await kdGetRiderCoords();
    const [nearRes, mineRes] = await Promise.all([
      apiFetch(`/api/rider/orders/nearby?lat=${coords.latitude}&lng=${coords.longitude}&radius=3000`),
      apiFetch('/api/rider/orders/mine')
    ]);
    const near = await nearRes.json(); const mine = await mineRes.json();
    kdRenderNearbyRiderOrders(near.data || [], near.available !== false, Boolean(near.locationFallback));
    kdRenderAssignedRiderOrders(mine.data || []);
  } catch (err) { showToast(kdText('Unable to refresh rider dashboard.','রাইডার ড্যাশবোর্ড রিফ্রেশ করা যায়নি।')); }
}

function kdRenderNearbyRiderOrders(orders, available, locationFallback = false) {
  const box = document.getElementById('riderNearbyOrders');
  if (!box) return;
  if (!available) { box.innerHTML = `<div class="empty-state-small">${kdText('You are not available. Turn availability on to receive delivery orders.','আপনি বর্তমানে অনুপলভ্য। ডেলিভারি অর্ডার পেতে প্রাপ্যতা চালু করুন।')}</div>`; return; }
  if (!orders.length) { box.innerHTML = `<div class="empty-state-small">${kdText('No nearby delivery order right now. This list refreshes automatically.','এই মুহূর্তে কাছাকাছি কোনো ডেলিভারি অর্ডার নেই। তালিকাটি স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে।')}</div>`; return; }
  const fallbackNotice = locationFallback ? '<div class="empty-state-small" style="margin-bottom:.6rem">📍 Precise shop location is not configured, so available delivery orders are shown as a fallback.</div>' : '';
  box.innerHTML = fallbackNotice + orders.map(order => `
    <div class="rider-order-card">
      <div class="rider-order-top"><div><h4>Order #${escapeHtml(order.orderNumber)}</h4><span class="badge badge-warning">${escapeHtml(order.status)}</span></div><strong>৳${order.totalPrice}</strong></div>
      <div class="rider-order-details">🏪 ${escapeHtml(order.shop?.shopNameBn || order.shop?.shopName || order.shopName)}${Number.isFinite(Number(order.shop?.distanceMeters)) ? ` · ${Math.round(Number(order.shop.distanceMeters))}m` : ''}<br>📍 ${escapeHtml(order.deliveryAddress || '')}<br>📦 ${(order.items || []).map(i => `${escapeHtml(i.productNameBn || i.productName)} × ${i.quantity}`).join(', ')}</div>
      <div class="rider-order-actions">${order.myOffer?.status === 'PENDING' ? '<span class="badge badge-warning">Offer sent · waiting seller</span>' : `<button class="btn btn-sm btn-primary" onclick="window.kdSendRiderOffer('${order._id}')"><i class="fa-solid fa-hand"></i> I am available</button>`}</div>
    </div>`).join('');
}

function kdRenderAssignedRiderOrders(orders) {
  const box = document.getElementById('riderAssignedOrders');
  if (!box) return;
  const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const list = active.length ? active : orders.slice(0, 5);
  if (!list.length) { box.innerHTML = `<div class="empty-state-small">${kdText('No assigned delivery yet.','এখনও কোনো ডেলিভারি নির্ধারিত হয়নি।')}</div>`; return; }
  box.innerHTML = list.map(order => `
    <div class="rider-order-card">
      <div class="rider-order-top"><div><h4>Order #${escapeHtml(order.orderNumber)}</h4><span class="badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-primary'}">${escapeHtml(order.status)}</span></div><strong>৳${order.totalPrice}</strong></div>
      <div class="rider-order-details">🏪 ${escapeHtml(order.shopNameBn || order.shopName)}<br>📍 ${escapeHtml(order.deliveryAddress || '')}<br>📞 Customer: ${escapeHtml(order.customerPhone || '')}</div>
      ${order.pickupCode && order.status !== 'DELIVERED' ? `<div style="margin:.55rem 0">Pickup Code: <span class="pickup-code-box">${escapeHtml(order.pickupCode)}</span></div>` : ''}
      <div class="rider-order-actions">
        ${order.status === 'READY' ? `<input id="pickup_${order._id}" class="form-input pickup-code-input" maxlength="6" placeholder="6-digit code"><button class="btn btn-sm btn-primary" onclick="window.kdVerifyPickup('${order._id}')">Verify & Pick Up</button>` : ''}
        ${order.status === 'OUT_FOR_DELIVERY' ? `<button class="btn btn-sm btn-success" onclick="window.kdMarkDelivered('${order._id}')"><i class="fa-solid fa-circle-check"></i> Mark Delivered</button>` : ''}
        <button class="btn btn-sm btn-outline" onclick="window.appOpenOrderChatById('${order._id}','${order.orderNumber}')">💬 Chat</button>
      </div>
    </div>`).join('');
}

async function kdSendRiderOffer(orderId) {
  try {
    const res = await apiFetch(`/api/rider/orders/${orderId}/offer`, { method: 'POST' });
    const data = await res.json(); if (!data.success) throw new Error(data.message);
    showToast(kdText('Delivery offer sent to seller.','ডেলিভারির প্রস্তাব দোকানদারের কাছে পাঠানো হয়েছে।')); loadRiderDashboard();
  } catch (err) { showToast(state.lang==='bn' ? 'প্রস্তাব পাঠানো যায়নি।' : (err.message || 'Offer could not be sent.')); }
}

async function kdVerifyPickup(orderId) {
  const code = document.getElementById(`pickup_${orderId}`)?.value.trim();
  try {
    const res = await apiFetch(`/api/rider/orders/${orderId}/verify-pickup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    const data = await res.json(); if (!data.success) throw new Error(data.message);
    showToast(kdText('✅ Pickup code verified. Order is now out for delivery.','✅ সংগ্রহ কোড যাচাই হয়েছে। অর্ডারটি এখন ডেলিভারির পথে।')); loadRiderDashboard();
  } catch (err) { showToast(state.lang==='bn' ? 'সংগ্রহ কোড যাচাই করা যায়নি।' : (err.message || 'Pickup verification failed.')); }
}

async function kdMarkDelivered(orderId) {
  try {
    const res = await apiFetch(`/api/rider/orders/${orderId}/delivered`, { method: 'POST' });
    const data = await res.json(); if (!data.success) throw new Error(data.message);
    showToast(kdText('✅ Delivery completed.','✅ ডেলিভারি সম্পন্ন হয়েছে।')); loadRiderDashboard();
  } catch (err) { showToast(state.lang==='bn' ? 'ডেলিভারি সম্পন্ন করা যায়নি।' : (err.message || 'Unable to complete delivery.')); }
}

async function kdToggleRiderAvailability(available) {
  try {
    const coords = await kdGetRiderCoords();
    const res = await apiFetch('/api/rider/availability', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available, lat: coords.latitude, lng: coords.longitude }) });
    const data = await res.json(); if (!data.success) throw new Error(data.message);
    state.user = { ...state.user, ...data.data };
    showToast(available ? kdText('Rider is now available for delivery.','রাইডার এখন ডেলিভারির জন্য উপলভ্য।') : kdText('Rider is now not available.','রাইডার এখন অনুপলভ্য।'));
    loadRiderDashboard();
  } catch (err) { showToast(kdText('Availability update failed.','প্রাপ্যতা আপডেট করা যায়নি।')); }
}

async function loadSellerRiderOffers() {
  if (state.user?.role !== 'SHOP_OWNER' || !state.ownerShopId) return;
  const box = document.getElementById('sellerRiderOffersList');
  try {
    const res = await apiFetch(`/api/shops/${state.ownerShopId}/rider-offers`);
    const data = await res.json();
    const offers = data.success ? (data.data || []) : [];
    document.getElementById('riderOfferCount').textContent = String(offers.length);
    if (!offers.length) { box.innerHTML = `<div class="empty-state-small">${kdText('No rider requests yet.','এখনও কোনো রাইডার অনুরোধ নেই।')}</div>`; return; }
    box.innerHTML = offers.map(offer => `
      <div class="rider-offer-item"><div class="rider-person-row"><img src="${offer.riderImageUrl || KD_DEFAULT_AVATAR}" alt=""><div class="rider-meta"><strong>${escapeHtml(offer.riderName)}</strong><small>${escapeHtml(offer.vehicleType || 'Rider')} · ${escapeHtml(offer.riderPhone || '')}<br>Order #${escapeHtml(offer.order?.orderNumber || '')} · ৳${offer.order?.totalPrice || ''}</small></div><button class="btn btn-sm btn-success" onclick="window.kdAcceptRiderOffer('${offer.orderId}','${offer._id}')">Accept Rider</button></div></div>`).join('');
  } catch (err) { console.warn(err); }
}

async function kdAcceptRiderOffer(orderId, offerId) {
  try {
    const res = await apiFetch(`/api/orders/${orderId}/rider-offers/${offerId}/accept`, { method: 'POST' });
    const data = await res.json(); if (!data.success) throw new Error(data.message);
    showToast(state.lang==='bn' ? `রাইডার গ্রহণ করা হয়েছে। সংগ্রহ কোড: ${kdToBanglaDigits(data.data.pickupCode)}` : `Rider accepted. Pickup code: ${data.data.pickupCode}`);
    loadOwnerDashboard();
  } catch (err) { showToast(state.lang==='bn' ? 'রাইডার গ্রহণ করা যায়নি।' : (err.message || 'Unable to accept rider.')); }
}

const kdBaseLoadOwnerOrders = loadOwnerOrders;
loadOwnerOrders = async function() {
  const container = document.getElementById('ownerOrdersListContainer');
  if (!container || !state.ownerShopId) return;
  try {
    const res = await apiFetch(`/api/orders?shopId=${state.ownerShopId}`); const data = await res.json();
    if (!data.success || !(data.data || []).length) { container.innerHTML = `<div class="empty-state-small">${kdText('No orders found for this shop.','এই দোকানে কোনো অর্ডার পাওয়া যায়নি।')}</div>`; return; }
    container.innerHTML = data.data.map(order => `
      <div class="owner-order-card">
        <div class="order-top-row"><div><span class="order-id">Order #${escapeHtml(order.orderNumber)}</span> <span class="badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}">${escapeHtml(order.status)}</span></div><strong>৳${order.totalPrice}</strong></div>
        <div class="order-items-detail"><div><strong>Items:</strong> ${(order.items || []).map(i => `${escapeHtml(i.productNameBn || i.productName)} × ${i.quantity}`).join(', ')}</div><div style="margin-top:3px;font-size:.78rem;color:var(--text-muted)">📍 ${escapeHtml(order.deliveryAddress || '')} • 📞 ${escapeHtml(order.customerPhone || '')} • ${escapeHtml(order.orderType || '')}</div></div>
        ${order.acceptedRiderId ? `<div class="rider-offer-item" style="margin-top:.65rem"><div class="rider-person-row"><img src="${order.acceptedRiderImageUrl || KD_DEFAULT_AVATAR}" alt=""><div class="rider-meta"><strong>🛵 ${escapeHtml(order.acceptedRiderName || order.deliveryTracking?.riderName || 'Assigned Rider')}</strong><small>${escapeHtml(order.riderStatus || '')}</small></div>${order.pickupCode && order.status !== 'DELIVERED' ? `<span class="pickup-code-box" title="Share this code with the assigned rider at pickup">${escapeHtml(order.pickupCode)}</span>` : ''}</div></div>` : (order.orderType === 'DELIVERY' ? '<div style="margin-top:.55rem" class="badge badge-warning">Waiting for rider offer</div>' : '')}
        <div class="order-actions-bar"><div style="font-size:.75rem;color:var(--text-muted)">Placed: ${new Date(order.createdAt).toLocaleTimeString()}</div><div style="display:flex;gap:.4rem;flex-wrap:wrap">
          <button class="btn btn-xs btn-outline" onclick="window.appOpenOrderChatById('${order._id}','${order.orderNumber}')">💬 Chat</button><button class="btn btn-xs btn-outline" onclick="window.appCallOrderPartyById('${order._id}')">📞 Call</button>
          ${order.status === 'PLACED' ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','ACCEPTED')">Accept</button><button class="btn btn-xs btn-outline" style="color:var(--danger)" onclick="window.appUpdateOrderStatus('${order._id}','CANCELLED')">Reject</button>` : ''}
          ${order.status === 'ACCEPTED' ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','PREPARING')">Start Packing</button>` : ''}
          ${order.status === 'PREPARING' ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','READY')">Mark Ready</button>` : ''}
          ${order.status === 'READY' && !order.acceptedRiderId ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','OUT_FOR_DELIVERY')">Manual Delivery</button>` : ''}
          ${order.status === 'OUT_FOR_DELIVERY' && !order.acceptedRiderId ? `<button class="btn btn-xs btn-success" onclick="window.appUpdateOrderStatus('${order._id}','DELIVERED')">Complete</button>` : ''}
        </div></div>
      </div>`).join('');
  } catch (err) { console.error(err); }
};

const kdBaseLoadOwnerDashboard = loadOwnerDashboard;
loadOwnerDashboard = async function() {
  await kdBaseLoadOwnerDashboard();
  await loadSellerRiderOffers();
};

const kdBaseActivateView = activateView;
activateView = function(view) {
  kdBaseActivateView(view);
  if (view === 'rider') loadRiderDashboard();
};

const kdBaseApplyAuthenticatedUser = applyAuthenticatedUser;
applyAuthenticatedUser = function(user, shops) {
  kdBaseApplyAuthenticatedUser(user, shops);
  state.user = user;
  state.userShops = shops || [];
  if (user.role === 'SHOP_OWNER' && shops?.[0]) {
    state.ownerShopId = shops[0]._id;
    state.ownerShopOpen = shops[0].open !== false;
    document.getElementById('ownerShopStatusBadge').textContent = state.ownerShopOpen ? `🟢 ${kdText('Available','প্রাপ্য')}` : `🔴 ${kdText('Unavailable','অনুপলভ্য')}`;
    document.getElementById('ownerShopStatusBadge').className = state.ownerShopOpen ? 'badge badge-success' : 'badge badge-danger';
    document.getElementById('ownerShopName').textContent = shops[0].shopNameBn || shops[0].shopName;
  }
  const buttons = { customer: document.getElementById('btnCustomerView'), owner: document.getElementById('btnOwnerView'), rider: document.getElementById('btnRiderView'), database: document.getElementById('btnDbView') };
  Object.values(buttons).forEach(b => { if (b) b.style.display = 'none'; });
  if (user.role === 'USER' && buttons.customer) buttons.customer.style.display = '';
  if (user.role === 'SHOP_OWNER' && buttons.owner) buttons.owner.style.display = '';
  if (user.role === 'RIDER' && buttons.rider) buttons.rider.style.display = '';
  if (user.role === 'ADMIN' && buttons.database) buttons.database.style.display = '';
  document.getElementById('btnOpenCart').style.display = user.role === 'USER' ? '' : 'none';
  document.getElementById('btnChatAlerts').style.display = user.role === 'ADMIN' ? 'none' : '';
  document.getElementById('btnCallAlerts').style.display = user.role === 'ADMIN' ? 'none' : '';
  kdUpdateHeaderProfile(); kdUpdateNotificationBadges();
  if (realtimeSocket && state.authToken) realtimeSocket.emit('user:identify', { token: state.authToken });
  if (user.role === 'RIDER') {
    activateView('rider');
    if (ownerRefreshTimer) { clearInterval(ownerRefreshTimer); ownerRefreshTimer = null; }
    if (riderRefreshTimer) clearInterval(riderRefreshTimer);
    riderRefreshTimer = setInterval(loadRiderDashboard, 12000);
  } else if (riderRefreshTimer) { clearInterval(riderRefreshTimer); riderRefreshTimer = null; }
  if (user.role === 'SHOP_OWNER') { kdSellerGreeting(false); loadSellerRiderOffers(); }
};

// Override login so seller greeting can play immediately after the login action.
handleLogin = async function(event) {
  event.preventDefault();
  const errorEl = document.getElementById('loginError'); errorEl.textContent = '';
  const isRegistering = state.authMode === 'register';
  const identifier = isRegistering ? document.getElementById('registerEmail').value.trim() : document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering
      ? { name: document.getElementById('registerName').value.trim(), email: identifier, phone: document.getElementById('registerPhone').value.trim(), password, role: state.authRole, language: state.lang, location: { type: 'Point', coordinates: [state.userCoords.longitude, state.userCoords.latitude] } }
      : { identifier, password, role: state.authRole };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json(); if (!data.success) throw new Error(data.message || 'Login failed.');
    state.authToken = data.token; localStorage.setItem('kd_auth_token', data.token);
    applyAuthenticatedUser(data.user, data.shops || []);
    document.getElementById('loginForm').reset();
    if (data.user.role === 'SHOP_OWNER') setTimeout(() => kdSellerGreeting(true), 250);
  } catch (err) { errorEl.textContent = err.message; }
};

const kdBaseClearSession = clearSession;
clearSession = function() {
  kdStopVoice();
  if (riderRefreshTimer) clearInterval(riderRefreshTimer);
  riderRefreshTimer = null;
  kdBaseClearSession();
};

const kdBaseOpenOrderChat = openOrderChat;
openOrderChat = async function(order) { state.unreadChat = 0; kdUpdateNotificationBadges(); return kdBaseOpenOrderChat(order); };
const kdBaseOpenOrderChatById = openOrderChatById;
openOrderChatById = async function(orderId, orderNumber='') { state.unreadChat = 0; kdUpdateNotificationBadges(); return kdBaseOpenOrderChatById(orderId, orderNumber); };

const kdBaseCallOrderParty = callOrderParty;
callOrderParty = async function(order) {
  if (order?._id) { try { await apiFetch(`/api/orders/${order._id}/call-request`, { method: 'POST' }); } catch (e) {} }
  return kdBaseCallOrderParty(order);
};
callOrderPartyById = async function(orderId) {
  try { await apiFetch(`/api/orders/${orderId}/call-request`, { method: 'POST' }); } catch (e) {}
  try {
    const res = await apiFetch(`/api/orders/${orderId}/contact`); const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const phone = state.user?.role === 'SHOP_OWNER' ? data.data.customer.phone : data.data.shop.phone;
    if (phone) window.location.href = `tel:${String(phone).replace(/\s+/g,'')}`; else showToast(kdText('Phone number unavailable.','ফোন নম্বর পাওয়া যায়নি।'));
  } catch (err) { showToast(kdText('Unable to load contact.','যোগাযোগের তথ্য লোড করা যায়নি।')); }
};

function kdFormatBanglaOrderItem(item) {
  const name = item?.productNameBn || item?.productName || 'পণ্য';
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const rawUnit = String(item?.unit || '').trim().toLowerCase();

  // Product.unit describes one sellable pack (for example: 1 kg, 5 kg,
  // 1 litre, 400 gm, 12 pcs).  The spoken amount therefore needs to be
  // pack-size × ordered quantity, not simply "Nটি product".
  const match = rawUnit.match(/([0-9]+(?:\.[0-9]+)?)\s*(kg|kgs|kilogram|kilograms|gm|g|gram|grams|litre|litres|liter|liters|ltr|l|ml|millilitre|millilitres|milliliter|milliliters|pcs|pc|piece|pieces|dozen|dozens)\b/i);
  if (!match) return `${kdToBanglaDigits(quantity)}টি ${name}`;

  const packAmount = Number(match[1]);
  const kind = match[2].toLowerCase();
  if (!Number.isFinite(packAmount) || packAmount <= 0) return `${kdToBanglaDigits(quantity)}টি ${name}`;

  let amount = packAmount * quantity;
  let unitBn = '';

  if (['kg','kgs','kilogram','kilograms'].includes(kind)) unitBn = 'কেজি';
  else if (['gm','g','gram','grams'].includes(kind)) unitBn = 'গ্রাম';
  else if (['litre','litres','liter','liters','ltr','l'].includes(kind)) unitBn = 'লিটার';
  else if (['ml','millilitre','millilitres','milliliter','milliliters'].includes(kind)) unitBn = 'মিলিলিটার';
  else if (['pcs','pc','piece','pieces'].includes(kind)) unitBn = 'টি';
  else if (['dozen','dozens'].includes(kind)) { amount *= 12; unitBn = 'টি'; }

  // Avoid floating-point speech such as 1.5000000002 kg.
  amount = Math.round(amount * 1000) / 1000;
  if (unitBn === 'টি') return `${kdToBanglaDigits(amount)}টি ${name}`;
  return `${kdToBanglaDigits(amount)} ${unitBn} ${name}`.replace(/\s+/g, ' ').trim();
}

function kdSpeakNewOrder(order) {
  if (state.user?.role !== 'SHOP_OWNER') return;
  const lang = state.lang === 'bn' ? 'bn' : 'en';
  const itemsBn = (order.items || []).map(kdFormatBanglaOrderItem).join(', ');
  const itemsEn = (order.items || []).map(i => `${i.quantity} ${i.productName}`).join(', ');
  const bn = `নতুন অর্ডার এসেছে। ${order.customerName || 'একজন ক্রেতা'} অর্ডার করেছেন ${itemsBn}। মোট ${kdToBanglaDigits(order.totalPrice)} টাকা।`;
  const en = `New order received from ${order.customerName || 'a customer'}. Items: ${itemsEn}. Total ${order.totalPrice} taka.`;
  kdSpeak(lang === 'bn' ? bn : en, lang);
}


// Dynamic seller availability: saved in MongoDB and broadcast to customer screens.
toggleShopStatus = async function() {
  if (!state.ownerShopId) return;
  try {
    const desired = !state.ownerShopOpen;
    const res = await apiFetch(`/api/shops/${state.ownerShopId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ open: desired }) });
    const data = await res.json(); if (!data.success) throw new Error(data.message);
    state.ownerShopOpen = data.data.open;
    if (state.userShops?.[0] && String(state.userShops[0]._id) === String(state.ownerShopId)) state.userShops[0].open = state.ownerShopOpen;
    const badge = document.getElementById('ownerShopStatusBadge');
    if (badge) { badge.textContent = state.ownerShopOpen ? `🟢 ${kdText('Available','প্রাপ্য')}` : `🔴 ${kdText('Unavailable','অনুপলভ্য')}`; badge.className = state.ownerShopOpen ? 'badge badge-success' : 'badge badge-danger'; }
    showToast(state.ownerShopOpen ? kdText('Shop is now available for new orders.','দোকান এখন নতুন অর্ডারের জন্য প্রাপ্য।') : kdText('Shop is now unavailable. New orders are blocked.','দোকান এখন অনুপলভ্য। নতুন অর্ডার বন্ধ আছে।'));
  } catch (err) { showToast(state.lang==='bn' ? 'দোকানের প্রাপ্যতা আপডেট করা যায়নি।' : (err.message || 'Failed to update availability.')); }
};

const kdBaseSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
  kdBaseSetupEventListeners();
  document.querySelector('.auth-role-option[data-role="RIDER"]')?.addEventListener('click', () => {
    document.getElementById('authFormTitle').textContent = kdText('Rider account','রাইডার অ্যাকাউন্ট');
    document.getElementById('authFormSubtitle').textContent = kdText('Log in or create a delivery rider account.','লগইন করুন অথবা নতুন রাইডার অ্যাকাউন্ট তৈরি করুন।');
  });
  document.getElementById('btnOpenProfile')?.addEventListener('click', kdOpenProfile);
  document.getElementById('btnCloseProfile')?.addEventListener('click', () => document.getElementById('profileModal').style.display = 'none');
  document.getElementById('profileForm')?.addEventListener('submit', kdSaveProfile);
  document.getElementById('profileImageFile')?.addEventListener('change', async e => { const file=e.target.files?.[0]; if(file) document.getElementById('profileImagePreview').src=await kdReadFileAsDataUrl(file); });
  document.getElementById('btnRemoveProfilePhoto')?.addEventListener('click', () => { document.getElementById('profileImageFile').value=''; document.getElementById('profileImageUrl').value=''; document.getElementById('profileImagePreview').src=KD_DEFAULT_AVATAR; });
  document.getElementById('btnChooseDefaultProductPhoto')?.addEventListener('click', () => kdSetProductPhotoMode('default'));
  document.getElementById('btnUploadProductPhoto')?.addEventListener('click', () => kdSetProductPhotoMode('upload'));
  document.getElementById('newProdImageFile')?.addEventListener('change', async e => { const file=e.target.files?.[0]; if(file) document.getElementById('newProdImagePreview').src=await kdReadFileAsDataUrl(file); });
  const categorySelect = document.getElementById('newProdCategory');
  const customCategory = document.getElementById('newProdCustomCategory');
  const syncCustomCategory = () => { if(customCategory) { customCategory.style.display = categorySelect?.value === 'Others' ? 'block' : 'none'; customCategory.required = categorySelect?.value === 'Others'; } };
  categorySelect?.addEventListener('change', syncCustomCategory); syncCustomCategory();
  document.getElementById('btnReplayGreeting')?.addEventListener('click', () => kdSellerGreeting(true));
  document.getElementById('voiceLanguageSelect')?.addEventListener('change', () => { const select=document.getElementById('voiceLanguageSelect'); if(select) select.value=state.lang; });
  document.getElementById('riderAvailabilityToggle')?.addEventListener('change', e => kdToggleRiderAvailability(e.target.checked));
  document.getElementById('btnRefreshRiderOrders')?.addEventListener('click', loadRiderDashboard);
  document.getElementById('btnChatAlerts')?.addEventListener('click', () => { if(state.lastChatOrderId) openOrderChatById(state.lastChatOrderId,state.lastChatOrderNumber); else showToast(kdText('No unread conversation.','পড়া হয়নি এমন কোনো কথোপকথন নেই।')); });
  document.getElementById('btnCallAlerts')?.addEventListener('click', () => { state.unreadCalls=0; kdUpdateNotificationBadges(); showToast(kdText('Call notifications marked as seen.','কল নোটিফিকেশন দেখা হয়েছে হিসেবে চিহ্নিত হয়েছে।')); });
  kdRenderDefaultProductPhotos(); kdSetProductPhotoMode('default'); kdUpdateNotificationBadges();
  const select=document.getElementById('voiceLanguageSelect'); if(select) { select.value=state.lang; select.disabled=true; }
};

// Realtime additions. Dedicated user rooms make red-dot notifications work even when chat is closed.
if (realtimeSocket) {
  realtimeSocket.on('notification:chat', msg => {
    if (String(msg.senderId) === String(state.user?._id)) return;
    state.lastChatOrderId = String(msg.orderId || ''); state.lastChatOrderNumber = msg.orderNumber || '';
    localStorage.setItem('kd_last_chat_order', state.lastChatOrderId); localStorage.setItem('kd_last_chat_order_number', state.lastChatOrderNumber);
    if (String(state.chatOrderId || '') !== String(msg.orderId || '')) state.unreadChat += 1;
    kdUpdateNotificationBadges();
    showToast(`💬 ${msg.senderName || (state.lang==='bn'?'নতুন বার্তা':'New message')}: ${String(msg.text || '').slice(0,60)}`);
  });
  realtimeSocket.on('notification:call', info => {
    state.unreadCalls += 1; state.lastCallOrderId = String(info.orderId || ''); localStorage.setItem('kd_last_call_order',state.lastCallOrderId); kdUpdateNotificationBadges();
    showToast(state.lang==='bn' ? `📞 ${info.fromName || 'ব্যবহারকারী'} থেকে কল অনুরোধ · অর্ডার #${info.orderNumber || ''}` : `📞 Call request from ${info.fromName || 'User'} · Order #${info.orderNumber || ''}`);
  });
  realtimeSocket.on('notification:order', order => {
    if (state.user?.role !== 'SHOP_OWNER') return;
    showToast(state.lang==='bn' ? `🛍️ নতুন অর্ডার #${order.orderNumber} · ৳${order.totalPrice}` : `🛍️ New order #${order.orderNumber} · ৳${order.totalPrice}`); kdSpeakNewOrder(order); loadOwnerDashboard();
  });
  realtimeSocket.on('rider:offer', offer => { if(state.user?.role==='SHOP_OWNER'){ showToast(state.lang==='bn' ? `🛵 ${offer.riderName} অর্ডার #${offer.orderNumber} ডেলিভারি করতে প্রস্তুত` : `🛵 ${offer.riderName} is available for Order #${offer.orderNumber}`); loadSellerRiderOffers(); } });
  realtimeSocket.on('rider:accepted', order => { if(state.user?.role==='RIDER'){ showToast(state.lang==='bn' ? `✅ অর্ডার #${order.orderNumber}-এর জন্য দোকানদার আপনাকে গ্রহণ করেছেন। সংগ্রহ কোড: ${kdToBanglaDigits(order.pickupCode)}` : `✅ Seller accepted you for Order #${order.orderNumber}. Pickup code: ${order.pickupCode}`); loadRiderDashboard(); } });
  realtimeSocket.on('product:stock', info => {
    if (state.user?.role === 'SHOP_OWNER' && String(info.shopId || '') === String(state.ownerShopId || '')) { loadOwnerInventory(); kdLoadLowStockReminder(false); }
    if (state.selectedShop?._id && String(state.selectedShop._id) === String(info.shopId || '')) { fetch(`/api/shops/${state.selectedShop._id}/products`).then(r => r.json()).then(d => { if (d.success) renderStoreProducts(d.data || [], state.selectedShop); }).catch(() => {}); }
  });
  realtimeSocket.on('rider:new-order', order => {
    if (state.user?.role !== 'RIDER' || state.user?.riderAvailable === false) return;
    showToast(state.lang==='bn' ? `🛵 নতুন ডেলিভারি পাওয়া গেছে · অর্ডার #${order.orderNumber || ''}` : `🛵 New delivery available · Order #${order.orderNumber || ''}`);
    // Fetch from MongoDB immediately so the card is rendered with the rider's offer state and shop details.
    loadRiderDashboard();
  });
  let kdRiderRealtimeRefreshTimer = null;
  realtimeSocket.on('rider:orders-changed', () => {
    if (state.user?.role !== 'RIDER') return;
    clearTimeout(kdRiderRealtimeRefreshTimer);
    kdRiderRealtimeRefreshTimer = setTimeout(loadRiderDashboard, 250);
  });
  realtimeSocket.on('shop:status', update => {
    const shop = state.shops.find(s => String(s._id) === String(update.shopId)); if(shop) shop.open=update.open;
    if(state.selectedShop && String(state.selectedShop._id)===String(update.shopId)){ state.selectedShop.open=update.open; }
    if(state.currentView==='customer') renderShopsList(state.shops);
  });
  realtimeSocket.on('shop:profile', shop => { const i=state.shops.findIndex(s=>String(s._id)===String(shop._id)); if(i>=0) state.shops[i]={...state.shops[i],...shop}; if(state.currentView==='customer') renderShopsList(state.shops); });
  realtimeSocket.on('order:rider', order => { if(state.user?.role==='USER' && state.activeOrder?._id===order._id){ state.activeOrder=order; showOrderTrackingWithoutTimer(order); } });
}

// Re-point inline HTML helpers at upgraded functions.
window.appAddToCart = addToCart;
window.appOpenOrderChatById = openOrderChatById;
window.appCallOrderPartyById = callOrderPartyById;
window.kdSendRiderOffer = kdSendRiderOffer;
window.kdVerifyPickup = kdVerifyPickup;
window.kdMarkDelivered = kdMarkDelivered;
window.kdAcceptRiderOffer = kdAcceptRiderOffer;


/* ==========================================================================
   V3 WORKFLOW FIXES
   - inline + / - quantities in shop modal
   - dynamic seller order filters/counts
   - seller replay order announcement
   - order-scoped chat roles + avatars
   - persistent action notification center
   - optional rider identity / address verification documents
   ========================================================================== */
Object.assign(state, {
  ownerOrderFilter: 'ALL',
  ownerOrdersCache: [],
  ownerOrdersById: {},
  modalProductsById: {},
  unreadActions: 0,
  actionNotifications: [],
  lastOrderForReplay: null
});

function kdCartQty(productId) {
  return state.activeCart.items.find(i => String(i.productId) === String(productId))?.quantity || 0;
}

function kdRenderShopQuantityControl(product) {
  const qty = kdCartQty(product._id);
  if (product.stock <= 0 || !product.available) return '<button class="btn btn-sm btn-primary" disabled style="opacity:.5">Out</button>';
  if (!qty) return `<button class="btn btn-sm btn-primary" onclick="window.kdChangeShopProductQty('${product._id}',1)"><i class="fa-solid fa-plus"></i> Add</button>`;
  return `<div class="shop-product-qty-control" data-product-stepper="${product._id}"><button type="button" onclick="window.kdChangeShopProductQty('${product._id}',-1)" aria-label="Decrease quantity">−</button><span class="qty-number">${qty}</span><button type="button" onclick="window.kdChangeShopProductQty('${product._id}',1)" ${qty >= product.stock ? 'disabled' : ''} aria-label="Increase quantity">+</button></div>`;
}

renderStoreProducts = function(products, shop) {
  const grid = document.getElementById('modalProductsGrid');
  if (!grid) return;
  state.modalProductsById = Object.fromEntries((products || []).map(p => [String(p._id), { ...p, imageUrl: p.imageUrl || '/images/products/grocery.svg' }]));
  if (!products.length) { grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted)">${kdText('No products currently available in this store.','এই দোকানে বর্তমানে কোনো পণ্য পাওয়া যাচ্ছে না।')}</div>`; return; }
  const closedNotice = !shop.open ? '<div style="grid-column:1/-1" class="empty-state-small">🔴 এই দোকানটি এখন Unavailable/Closed. পণ্য দেখা যাবে, কিন্তু নতুন order করা যাবে না।</div>' : '';
  grid.innerHTML = closedNotice + products.map(p0 => {
    const p = { ...p0, imageUrl: p0.imageUrl || '/images/products/grocery.svg' };
    const name = state.lang === 'bn' && p.nameBn ? p.nameBn : p.name;
    const out = p.stock <= 0 || !p.available;
    return `<div class="product-card" data-shop-product="${p._id}"><img src="${p.imageUrl}" alt="${escapeHtml(name)}" class="product-img"><div class="product-details"><div><h5 style="font-size:.95rem;font-weight:700;color:var(--text-primary);margin-bottom:2px">${escapeHtml(name)}</h5><span style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(p.unit || '')}</span></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:.5rem"><div><strong style="color:var(--primary);font-size:1.05rem">৳${p.price}</strong><div style="font-size:.7rem;color:${out ? 'var(--danger)' : 'var(--text-muted)'}">${out ? 'Out of stock' : `Stock: ${p.stock}`}</div></div><div class="shop-qty-slot" id="shopQty_${p._id}">${shop.open ? kdRenderShopQuantityControl(p) : `<button class="btn btn-sm btn-primary" disabled style="opacity:.5">${kdText('Closed','বন্ধ')}</button>`}</div></div></div></div>`;
  }).join('');
};

function kdRefreshShopQuantitySteppers() {
  if (!state.selectedShop) return;
  for (const [id, product] of Object.entries(state.modalProductsById || {})) {
    const slot = document.getElementById(`shopQty_${id}`);
    if (slot) slot.innerHTML = state.selectedShop.open ? kdRenderShopQuantityControl(product) : `<button class="btn btn-sm btn-primary" disabled style="opacity:.5">${kdText('Closed','বন্ধ')}</button>`;
  }
}

function kdChangeShopProductQty(productId, delta) {
  const product = state.modalProductsById[String(productId)];
  const shop = state.selectedShop;
  if (!product || !shop || !shop.open) return;
  const existing = state.activeCart.items.find(i => String(i.productId) === String(productId));
  if (delta > 0) {
    addToCart(String(shop._id), shop.shopName, String(product._id), state.lang === 'bn' && product.nameBn ? product.nameBn : product.name, Number(product.price), product.unit || '', Number(product.stock), Number(shop.deliveryFee) || 20);
  } else if (existing) {
    updateCartQuantity(String(productId), -1);
  }
  kdRefreshShopQuantitySteppers();
}

const kdV3BaseAddToCart = addToCart;
addToCart = function(...args) { const result = kdV3BaseAddToCart(...args); kdRefreshShopQuantitySteppers(); return result; };
const kdV3BaseUpdateCartQuantity = updateCartQuantity;
updateCartQuantity = function(productId, delta) { const result = kdV3BaseUpdateCartQuantity(productId, delta); kdRefreshShopQuantitySteppers(); return result; };

function kdUpdateOwnerFilterCounts(orders) {
  const counts = {
    ALL: orders.length,
    PLACED: orders.filter(o => o.status === 'PLACED').length,
    PREPARING: orders.filter(o => ['ACCEPTED','PREPARING','READY'].includes(o.status)).length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length
  };
  const map = { countAllOrders: counts.ALL, countNewOrders: counts.PLACED, countPreparingOrders: counts.PREPARING, countCompletedOrders: counts.DELIVERED };
  Object.entries(map).forEach(([id,val]) => { const el=document.getElementById(id); if(el) el.textContent=String(val); });
}

function kdRenderOwnerOrders(orders) {
  const container = document.getElementById('ownerOrdersListContainer');
  if (!container) return;
  const filter = state.ownerOrderFilter || 'ALL';
  const shown = filter === 'ALL' ? orders : filter === 'PREPARING' ? orders.filter(o => ['ACCEPTED','PREPARING','READY'].includes(o.status)) : orders.filter(o => o.status === filter);
  if (!shown.length) { container.innerHTML = `<div class="empty-state-small">No ${filter === 'ALL' ? '' : filter.toLowerCase() + ' '}orders found.</div>`; return; }
  container.innerHTML = shown.map(order => `
    <div class="owner-order-card">
      <div class="order-top-row"><div><span class="order-id">Order #${escapeHtml(order.orderNumber)}</span> <span class="badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}">${escapeHtml(order.status)}</span></div><strong>৳${order.totalPrice}</strong></div>
      <div class="order-items-detail"><div><strong>Items:</strong> ${(order.items || []).map(i => `${escapeHtml(i.productNameBn || i.productName)} × ${i.quantity}`).join(', ')}</div><div style="margin-top:3px;font-size:.78rem;color:var(--text-muted)">📍 ${escapeHtml(order.deliveryAddress || '')} • 📞 ${escapeHtml(order.customerPhone || '')} • ${escapeHtml(order.orderType || '')}</div></div>
      ${order.acceptedRiderId ? `<div class="rider-offer-item" style="margin-top:.65rem"><div class="rider-person-row"><img src="${order.acceptedRiderImageUrl || KD_DEFAULT_AVATAR}" alt=""><div class="rider-meta"><strong>🛵 ${escapeHtml(order.acceptedRiderName || order.deliveryTracking?.riderName || 'Assigned Rider')}</strong><small>${escapeHtml(order.riderStatus || '')}</small></div>${order.pickupCode && order.status !== 'DELIVERED' ? `<span class="pickup-code-box">${escapeHtml(order.pickupCode)}</span>` : ''}</div></div>` : (order.orderType === 'DELIVERY' ? '<div style="margin-top:.55rem" class="badge badge-warning">Waiting for rider offer</div>' : '')}
      <div class="order-actions-bar"><div style="font-size:.75rem;color:var(--text-muted)">Placed: ${new Date(order.createdAt).toLocaleTimeString()}</div><div style="display:flex;gap:.4rem;flex-wrap:wrap">
        <button class="btn btn-xs btn-outline order-replay-btn" onclick="window.kdReplayOrderVoice('${order._id}')"><i class="fa-solid fa-volume-high"></i> Replay Voice</button>
        <button class="btn btn-xs btn-outline" onclick="window.appOpenOrderChatById('${order._id}','${order.orderNumber}')">💬 Chat</button><button class="btn btn-xs btn-outline" onclick="window.appCallOrderPartyById('${order._id}')">📞 Call</button>
        ${order.status === 'PLACED' ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','ACCEPTED')">Accept</button><button class="btn btn-xs btn-outline" style="color:var(--danger)" onclick="window.appUpdateOrderStatus('${order._id}','CANCELLED')">Reject</button>` : ''}
        ${order.status === 'ACCEPTED' ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','PREPARING')">Start Packing</button>` : ''}
        ${order.status === 'PREPARING' ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','READY')">Mark Ready</button>` : ''}
        ${order.status === 'READY' && !order.acceptedRiderId ? `<button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}','OUT_FOR_DELIVERY')">Manual Delivery</button>` : ''}
        ${order.status === 'OUT_FOR_DELIVERY' && !order.acceptedRiderId ? `<button class="btn btn-xs btn-success" onclick="window.appUpdateOrderStatus('${order._id}','DELIVERED')">Complete</button>` : ''}
      </div></div>
    </div>`).join('');
}

loadOwnerOrders = async function() {
  if (!state.ownerShopId) return;
  try {
    const res = await apiFetch(`/api/orders?shopId=${state.ownerShopId}`);
    const data = await res.json();
    const orders = data.success ? (data.data || []) : [];
    state.ownerOrdersCache = orders;
    state.ownerOrdersById = Object.fromEntries(orders.map(o => [String(o._id), o]));
    state.lastOrderForReplay = orders[0] || null;
    const replay = document.getElementById('btnReplayLastOrder'); if (replay) replay.disabled = !state.lastOrderForReplay;
    kdUpdateOwnerFilterCounts(orders);
    kdRenderOwnerOrders(orders);
  } catch (err) { console.error('Failed to load dynamic owner orders:', err); }
};

function kdReplayOrderVoice(orderId) {
  const order = state.ownerOrdersById[String(orderId)] || (String(state.lastOrderForReplay?._id) === String(orderId) ? state.lastOrderForReplay : null);
  if (!order) return showToast(kdText('Order information is not loaded yet.','অর্ডারের তথ্য এখনও লোড হয়নি।'));
  state.lastOrderForReplay = order;
  kdSpeakNewOrder(order);
  showToast(state.lang==='bn' ? `🔊 অর্ডার #${order.orderNumber} আবার শোনানো হচ্ছে` : `🔊 Replaying Order #${order.orderNumber}`);
}

renderChatMessages = function(messages) {
  const box = document.getElementById('chatMessages');
  if (!messages.length) { box.innerHTML=`<div class="chat-empty">${kdText('No messages yet. This chat belongs only to this order. 👋','এখনও কোনো বার্তা নেই। এই চ্যাটটি শুধু এই অর্ডারের জন্য। 👋')}</div>`; return; }
  box.innerHTML = messages.map(m => {
    const mine = String(m.senderId) === String(state.user?._id);
    const role = kdRoleLabel(m.senderRole || 'USER');
    return `<div class="chat-message-row ${mine ? 'mine' : ''}"><img class="chat-avatar" src="${m.senderImageUrl || KD_DEFAULT_AVATAR}" alt=""><div class="chat-message-stack"><div class="chat-sender-block"><span class="chat-sender-name">${escapeHtml(m.senderName || 'User')}</span><span class="chat-sender-role">${escapeHtml(role)} · ${new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div><div class="chat-bubble ${mine ? 'mine' : ''}"><div class="chat-text">${escapeHtml(m.text)}</div></div></div></div>`;
  }).join('');
  box.scrollTop = box.scrollHeight;
};

function kdUpdateActionBadge() {
  const badge = document.getElementById('actionUnreadBadge');
  if (!badge) return;
  badge.textContent = state.unreadActions > 99 ? '99+' : String(state.unreadActions);
  badge.style.display = state.unreadActions ? 'inline-flex' : 'none';
}

async function kdLoadNotifications(openModal = false) {
  if (!state.authToken) return;
  try {
    const res = await apiFetch('/api/notifications?limit=60'); const data = await res.json();
    if (!data.success) return;
    state.actionNotifications = data.data || []; state.unreadActions = Number(data.unread || 0); kdUpdateActionBadge();
    const list = document.getElementById('notificationCenterList');
    if (list) list.innerHTML = state.actionNotifications.length ? state.actionNotifications.map(n => `<div class="notification-item ${n.read ? '' : 'unread'}"><div class="notification-item-top"><span class="notification-item-title">${escapeHtml(n.title || 'Update')}</span><span class="notification-item-time">${new Date(n.createdAt).toLocaleString()}</span></div><div class="notification-item-message">${escapeHtml(n.message || '')}</div></div>`).join('') : `<div class="empty-state-small">${kdText('No notifications yet.','এখনও কোনো নোটিফিকেশন নেই।')}</div>`;
    if (openModal) document.getElementById('notificationCenterModal').style.display = 'flex';
  } catch (err) { console.warn('Notifications:', err.message); }
}

async function kdOpenNotificationCenter() {
  await kdLoadNotifications(true);
  if (state.unreadActions) {
    try { await apiFetch('/api/notifications/read-all', { method:'POST' }); } catch (_) {}
    state.unreadActions = 0; kdUpdateActionBadge();
    document.querySelectorAll('.notification-item').forEach(el => el.classList.remove('unread'));
  }
}

async function kdReadRegistrationDocument(file) {
  if (!file) return '';
  if (file.size > 3 * 1024 * 1024) throw new Error('Each rider document must be smaller than 3 MB.');
  const allowed = ['image/png','image/jpeg','image/webp','application/pdf'];
  if (!allowed.includes(file.type)) throw new Error('Rider documents must be PNG, JPG, WEBP or PDF.');
  return new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result||'')); reader.onerror=()=>reject(new Error('Unable to read rider document.')); reader.readAsDataURL(file); });
}

function kdRefreshRiderRegistrationFields() {
  const section = document.getElementById('riderRegistrationSecurity');
  if (!section) return;
  section.style.display = state.authMode === 'register' && state.authRole === 'RIDER' ? 'block' : 'none';
}

async function kdSaveRiderVerificationFromProfile() {
  if (state.user?.role !== 'RIDER') return;
  const idFile = document.getElementById('profileIdDocumentFile')?.files?.[0];
  const utilityFile = document.getElementById('profileUtilityBillFile')?.files?.[0];
  const payload = {
    permanentAddress: document.getElementById('profilePermanentAddress')?.value.trim() || '',
    verificationType: document.getElementById('profileVerificationType')?.value || '',
    verificationNumber: document.getElementById('profileVerificationNumber')?.value.trim() || ''
  };
  if (idFile) payload.idDocumentDataUrl = await kdReadRegistrationDocument(idFile);
  if (utilityFile) payload.utilityBillDataUrl = await kdReadRegistrationDocument(utilityFile);
  const res = await apiFetch('/api/rider/verification', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  const data = await res.json(); if (!data.success) throw new Error(data.message || 'Verification update failed.');
  state.user = data.user;
}

const kdV3BaseOpenProfile = kdOpenProfile;
kdOpenProfile = function() {
  kdV3BaseOpenProfile();
  if (state.user?.role === 'RIDER') {
    const v = state.user.riderVerification || {};
    document.getElementById('profilePermanentAddress').value = state.user.permanentAddress || '';
    document.getElementById('profileVerificationType').value = v.idType || '';
    document.getElementById('profileVerificationNumber').value = v.idNumber || '';
    document.getElementById('profileVerificationStatus').textContent = state.user.riderVerificationStatus || 'NOT_SUBMITTED';
    document.getElementById('profileIdDocumentState').textContent = v.idDocumentFile ? '✓ ID document already submitted · choose a new file to replace' : 'Optional · max 3 MB';
    document.getElementById('profileUtilityBillState').textContent = v.utilityBillFile ? '✓ Utility bill already submitted · choose a new file to replace' : 'Optional · max 3 MB';
  }
};

const kdV3BaseSaveProfile = kdSaveProfile;
kdSaveProfile = async function(event) {
  event.preventDefault();
  try {
    if (state.user?.role === 'RIDER') await kdSaveRiderVerificationFromProfile();
    return await kdV3BaseSaveProfile(event);
  } catch (err) { showToast(state.lang==='bn' ? 'রাইডার যাচাইয়ের তথ্য সংরক্ষণ করা যায়নি।' : (err.message || 'Unable to save rider verification.')); }
};

// Final registration override adds optional rider security fields/documents.
handleLogin = async function(event) {
  event.preventDefault();
  const errorEl = document.getElementById('loginError'); errorEl.textContent = '';
  const isRegistering = state.authMode === 'register';
  const identifier = isRegistering ? document.getElementById('registerEmail').value.trim() : document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering ? { name: document.getElementById('registerName').value.trim(), email: identifier, phone: document.getElementById('registerPhone').value.trim(), password, role: state.authRole, language: state.lang, location: { type:'Point', coordinates:[state.userCoords.longitude,state.userCoords.latitude] } } : { identifier, password, role: state.authRole };
    if (isRegistering && state.authRole === 'RIDER') {
      body.verificationType = document.getElementById('registerRiderIdType').value;
      body.verificationNumber = document.getElementById('registerRiderIdNumber').value.trim();
      body.permanentAddress = document.getElementById('registerRiderPermanentAddress').value.trim();
      const idFile = document.getElementById('registerRiderIdFile').files?.[0];
      const utilityFile = document.getElementById('registerRiderUtilityFile').files?.[0];
      if (idFile) body.idDocumentDataUrl = await kdReadRegistrationDocument(idFile);
      if (utilityFile) body.utilityBillDataUrl = await kdReadRegistrationDocument(utilityFile);
    }
    const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const data = await res.json(); if (!data.success) throw new Error(data.message || 'Login failed.');
    state.authToken = data.token; localStorage.setItem('kd_auth_token', data.token);
    applyAuthenticatedUser(data.user, data.shops || []);
    document.getElementById('loginForm').reset(); kdRefreshRiderRegistrationFields();
    if (data.user.role === 'SHOP_OWNER') setTimeout(() => kdSellerGreeting(true), 250);
    showToast(isRegistering ? kdText('Account created successfully.','অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।') : kdText('Logged in successfully.','সফলভাবে লগইন হয়েছে।'));
  } catch (err) { errorEl.textContent = err.message; }
};

const kdV3BaseSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
  kdV3BaseSetupEventListeners();
  document.querySelectorAll('.filter-btn[data-status]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-status]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); state.ownerOrderFilter = btn.dataset.status || 'ALL'; kdRenderOwnerOrders(state.ownerOrdersCache || []);
  }));
  document.getElementById('btnReplayLastOrder')?.addEventListener('click', () => { if (state.lastOrderForReplay) kdReplayOrderVoice(state.lastOrderForReplay._id); });
  document.getElementById('btnActionAlerts')?.addEventListener('click', kdOpenNotificationCenter);
  document.getElementById('btnCloseNotificationCenter')?.addEventListener('click', () => document.getElementById('notificationCenterModal').style.display='none');
  document.querySelectorAll('.auth-role-option').forEach(btn => btn.addEventListener('click', () => setTimeout(kdRefreshRiderRegistrationFields, 0)));
  document.querySelectorAll('.auth-mode').forEach(btn => btn.addEventListener('click', () => setTimeout(kdRefreshRiderRegistrationFields, 0)));
  kdRefreshRiderRegistrationFields();
};

const kdV3BaseApplyAuthenticatedUser = applyAuthenticatedUser;
applyAuthenticatedUser = function(user, shops) {
  kdV3BaseApplyAuthenticatedUser(user, shops);
  const btn = document.getElementById('btnActionAlerts'); if (btn) btn.style.display = user.role === 'ADMIN' ? 'none' : '';
  setTimeout(() => kdLoadNotifications(false), 100);
};

if (realtimeSocket) {
  realtimeSocket.on('notification:action', notification => {
    if (!state.user) return;
    state.actionNotifications.unshift(notification); state.unreadActions += 1; kdUpdateActionBadge();
    if (!['CHAT_MESSAGE','CALL_REQUEST'].includes(notification.type)) showToast(`🔔 ${notification.title}: ${notification.message}`);
  });
}

window.kdChangeShopProductQty = kdChangeShopProductQty;
window.kdReplayOrderVoice = kdReplayOrderVoice;
window.appAddToCart = addToCart;
window.appUpdateCartQty = updateCartQuantity;

window.kdOpenProductEditorById = function(id){ const p=(state.ownerProductsCache||[]).find(x=>String(x._id)===String(id)); if(p && typeof window.kdOpenProductEditor==='function') window.kdOpenProductEditor(p); };

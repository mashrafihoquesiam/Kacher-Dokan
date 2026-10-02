/**
 * V12: Customer catalog scroll + dynamic suggestions/categories +
 * seller payment announcement and transaction history.
 */
(function () {
  Object.assign(state, {
    storeProductsCache: [],
    storeCategory: 'all',
    dynamicSuggestions: [],
    lastPaymentForReplay: null
  });

  function v12PaymentNumberBox() {
    let box = document.getElementById('mobilePaymentSenderBox');
    if (box) return box;
    const paymentGrid = document.getElementById('paymentMethodGrid');
    if (!paymentGrid) return null;
    const group = paymentGrid.closest('.form-group');
    if (!group) return null;
    box = document.createElement('div');
    box.id = 'mobilePaymentSenderBox';
    box.className = 'mobile-payment-sender-box';
    box.style.display = 'none';
    box.innerHTML = `
      <label class="form-label" for="mobilePaymentSenderPhone">Wallet sender number</label>
      <input id="mobilePaymentSenderPhone" class="form-input" type="tel" inputmode="numeric"
             autocomplete="tel" placeholder="e.g. 01712345678" maxlength="18">
      <small>Seller will only receive the last 3 digits for payment verification. The full number is not stored.</small>`;
    group.appendChild(box);
    return box;
  }

  function v12UpdatePaymentNumberVisibility() {
    const box = v12PaymentNumberBox();
    if (!box) return;
    const online = state.selectedPaymentMethod && state.selectedPaymentMethod !== 'CASH_ON_DELIVERY';
    box.style.display = online ? 'block' : 'none';
    const input = document.getElementById('mobilePaymentSenderPhone');
    if (online && input && !input.value) {
      input.value = document.getElementById('checkoutPhone')?.value || state.user?.phone || '';
    }
  }

  function v12SenderPhone() {
    return String(document.getElementById('mobilePaymentSenderPhone')?.value || '').replace(/\D/g, '');
  }

  function v12ValidSenderPhone() {
    const digits = v12SenderPhone();
    return digits.length >= 10 && digits.length <= 15;
  }

  // Replace payment orchestration so the wallet sender number is carried to the
  // backend. Backend persists only the last 3 digits.
  processSelectedPayment = async function(order, method) {
    try {
      const senderPhone = v12SenderPhone();
      if (!v12ValidSenderPhone()) {
        showToast(state.lang==='bn'?'পেমেন্টের আগে সঠিক মোবাইল ওয়ালেট নম্বর লিখুন।':'Enter a valid mobile wallet sender number before paying.');
        return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
      }
      const res = await apiFetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id, method, senderPhone })
      });
      const data = await res.json();
      if (!data.success) {
        showToast(state.lang==='bn'?'পেমেন্ট সেটআপ এখনো প্রস্তুত নয়। অর্ডারটি অপরিশোধিত থাকবে।':(data.message || 'Payment setup is not available yet. Order remains unpaid.'));
        return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
      }
      if (data.demo) {
        const last3 = senderPhone.slice(-3);
        const ok = window.confirm(state.lang==='bn' ? `${method} পরীক্ষামূলক পেমেন্ট\n\nপরিমাণ: ৳${order.totalPrice}\nপ্রেরক নম্বরের শেষ ৩ ডিজিট: ${last3}\n\nসফল পরীক্ষামূলক পেমেন্ট নিশ্চিত করতে OK চাপুন।` : `${method} DEMO PAYMENT\n\nAmount: ৳${order.totalPrice}\nSender ending: ${last3}\n\nPress OK to simulate a successful provider payment.`);
        if (ok) {
          const confirmRes = await apiFetch(`/api/payments/${data.data._id}/demo-confirm`, { method: 'POST' });
          const confirmed = await confirmRes.json();
          if (confirmed.success) {
            const trx = confirmed.payment?.transactionId || confirmed.data?.paymentTransactionId || '';
            showToast(state.lang==='bn' ? `✅ ${method} পেমেন্ট সফল${trx ? ` · ট্রানজ্যাকশন আইডি ${trx}` : ''}` : `✅ ${method} payment successful${trx ? ` · TrxID ${trx}` : ''}`);
            return confirmed.data;
          }
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      showToast(state.lang==='bn'?'অর্ডার হয়েছে, কিন্তু পেমেন্ট সম্পন্ন হয়নি।':'Order placed, but payment could not be completed.');
    }
    return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
  };

  function v12CategoryLabel(category) {
    if (category === 'all') return state.lang === 'bn' ? 'সব পণ্য' : 'All Items';
    return category;
  }

  function v12BuildCategoryTabs(products) {
    const tabs = document.getElementById('modalCategoryTabs');
    if (!tabs) return;
    const categories = [...new Set((products || []).map(p => String(p.category || 'Groceries').trim()).filter(Boolean))].sort();
    const valid = new Set(['all', ...categories]);
    if (!valid.has(state.storeCategory)) state.storeCategory = 'all';
    tabs.innerHTML = ['all', ...categories].map(cat => `
      <button type="button" class="cat-tab ${state.storeCategory === cat ? 'active' : ''}" data-v12-category="${escapeHtml(cat)}">
        ${escapeHtml(v12CategoryLabel(cat))}
      </button>`).join('');
  }

  const v12BaseRenderStoreProducts = renderStoreProducts;
  renderStoreProducts = function(products, shop) {
    state.storeProductsCache = Array.isArray(products) ? products : [];
    v12BuildCategoryTabs(state.storeProductsCache);
    const visible = state.storeCategory === 'all'
      ? state.storeProductsCache
      : state.storeProductsCache.filter(p => String(p.category || 'Groceries') === state.storeCategory);
    return v12BaseRenderStoreProducts(visible, shop);
  };

  document.addEventListener('click', event => {
    const tab = event.target.closest?.('[data-v12-category]');
    if (tab) {
      state.storeCategory = tab.dataset.v12Category || 'all';
      renderStoreProducts(state.storeProductsCache, state.selectedShop);
      document.getElementById('modalProductsGrid')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const chip = event.target.closest?.('#quickChipsContainer .chip-btn');
    if (chip) {
      const query = chip.dataset.query || '';
      const input = document.getElementById('productNearMeInput');
      if (input) input.value = query;
      const clear = document.getElementById('btnClearSearch');
      if (clear) clear.style.display = query ? 'block' : 'none';
      if (query) searchProductNearMe(query);
    }
    if (event.target.closest?.('.payment-method')) {
      setTimeout(v12UpdatePaymentNumberVisibility, 0);
    }
  });

  const v12BaseOpenStoreModal = openStoreModal;
  openStoreModal = async function(shopId) {
    state.storeCategory = 'all';
    const result = await v12BaseOpenStoreModal(shopId);
    const grid = document.getElementById('modalProductsGrid');
    if (grid) grid.scrollTop = 0;
    return result;
  };
  window.appOpenStoreModal = openStoreModal;

  async function loadDynamicProductSuggestions() {
    if (state.user?.role && state.user.role !== 'USER') return;
    const container = document.getElementById('quickChipsContainer');
    if (!container) return;
    try {
      container.innerHTML = `<span class="chip-label">${state.lang === 'bn' ? 'কাছাকাছি পণ্য খোঁজা হচ্ছে…' : 'Finding nearby products…'}</span>`;
      const lat = state.userCoords?.latitude ?? 23.8103;
      const lng = state.userCoords?.longitude ?? 90.4125;
      const radius = Math.max(Number(state.radius || 200), 500);
      const res = await fetch(`/api/products/suggestions?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}&limit=6`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load suggestions');
      state.dynamicSuggestions = Array.isArray(data.data) ? data.data : [];
      if (!state.dynamicSuggestions.length) {
        container.innerHTML = `<span class="chip-label">${state.lang === 'bn' ? 'এখন কোনো কাছাকাছি পণ্যের সাজেশন নেই। উপরের সার্চ ব্যবহার করুন।' : 'No nearby suggestions right now. Search for any product above.'}</span>`;
        return;
      }
      container.innerHTML = `<span class="chip-label">${state.lang === 'bn' ? 'আপনার জন্য:' : 'Suggested nearby:'}</span>` +
        data.data.map(item => {
          const label = state.lang === 'bn' ? (item.productNameBn || item.productName) : item.productName;
          return `<button type="button" class="chip-btn dynamic-chip" data-query="${escapeHtml(item.productName || label)}" title="${escapeHtml(item.category || '')}">
            <img src="${escapeHtml(item.imageUrl || '/images/products/grocery.svg')}" alt="">
            <span>${escapeHtml(label)}</span>
          </button>`;
        }).join('');
    } catch (err) {
      console.warn('Dynamic suggestions:', err.message);
      container.innerHTML = `<span class="chip-label">${state.lang === 'bn' ? 'সাজেশন লোড হয়নি—সার্চ ব্যবহার করুন।' : 'Suggestions unavailable—use search above.'}</span>`;
    }
  }
  window.kdLoadDynamicProductSuggestions = loadDynamicProductSuggestions;

  const v12BaseFetchNearbyShops = fetchNearbyShops;
  fetchNearbyShops = async function(...args) {
    const result = await v12BaseFetchNearbyShops(...args);
    loadDynamicProductSuggestions();
    return result;
  };

  function v12EnsurePaymentHistoryCard() {
    let card = document.getElementById('sellerPaymentHistoryCard');
    if (card) return card;
    const ordersTab = document.getElementById('ownerTabOrders');
    if (!ordersTab) return null;
    card = document.createElement('div');
    card.id = 'sellerPaymentHistoryCard';
    card.className = 'card seller-payment-history-card';
    card.innerHTML = `
      <div class="seller-payment-history-head">
        <div>
          <h3 class="card-title"><i class="fa-solid fa-money-bill-transfer"></i> Online Payment Transactions</h3>
          <p>Verified bKash, Nagad and Upay payments for this shop.</p>
        </div>
        <div class="seller-payment-actions">
          <button type="button" class="btn btn-sm btn-outline" id="btnReplayLastPayment" disabled>🔊 Replay Last Payment</button>
          <button type="button" class="btn btn-sm btn-outline" id="btnRefreshPayments"><i class="fa-solid fa-rotate"></i> Refresh</button>
        </div>
      </div>
      <div id="sellerPaymentHistoryList" class="seller-payment-history-list">
        <div class="empty-state-small">Loading payment transactions…</div>
      </div>`;
    ordersTab.insertAdjacentElement('afterbegin', card);
    document.getElementById('btnRefreshPayments')?.addEventListener('click', loadSellerPaymentHistory);
    document.getElementById('btnReplayLastPayment')?.addEventListener('click', () => {
      if (state.lastPaymentForReplay) v12SpeakPayment(state.lastPaymentForReplay);
    });
    return card;
  }

  function v12MethodBadge(method) {
    const m = String(method || '').toUpperCase();
    if (m === 'BKASH') return '🟣 bKash';
    if (m === 'NAGAD') return '🟠 Nagad';
    if (m === 'UPAY') return '🟢 Upay';
    return escapeHtml(method || 'Online');
  }

  async function loadSellerPaymentHistory() {
    if (state.user?.role !== 'SHOP_OWNER' || !state.ownerShopId) return;
    v12EnsurePaymentHistoryCard();
    const list = document.getElementById('sellerPaymentHistoryList');
    try {
      const res = await apiFetch(`/api/seller/payments?shopId=${encodeURIComponent(state.ownerShopId)}&limit=30`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load payment history.');
      const payments = data.data || [];
      if (!payments.length) {
        list.innerHTML = `<div class="empty-state-small">${state.lang==='bn'?'এখনও কোনো সফল অনলাইন পেমেন্ট নেই।':'No successful online payments yet.'}</div>`;
        return;
      }
      state.lastPaymentForReplay = payments[0];
      const replay = document.getElementById('btnReplayLastPayment');
      if (replay) replay.disabled = false;
      list.innerHTML = payments.map(payment => `
        <div class="seller-payment-row">
          <div class="seller-payment-main">
            <div class="seller-payment-name">${escapeHtml(payment.customerName || 'Customer')} <span>${v12MethodBadge(payment.method)}</span></div>
            <div class="seller-payment-meta">${state.lang==='bn'?'অর্ডার':'Order'} #${escapeHtml(payment.orderNumber || '')} · ${state.lang==='bn'?'প্রেরক নম্বরের শেষ':'Sender ending'} <strong>${escapeHtml(payment.senderLast3 || '---')}</strong> · ${new Date(payment.paidAt).toLocaleString(state.lang==='bn'?'bn-BD':'en-GB')}</div>
            <div class="seller-payment-trx">TrxID: <strong>${escapeHtml(payment.transactionId || '—')}</strong></div>
          </div>
          <div class="seller-payment-amount">৳${Number(payment.amount || 0).toLocaleString()}</div>
        </div>`).join('');
    } catch (err) {
      if (list) list.innerHTML = `<div class="empty-state-small">${escapeHtml(state.lang==='bn'?'পেমেন্ট ইতিহাস লোড করা যায়নি।':(err.message || 'Unable to load payment history.'))}</div>`;
    }
  }
  window.kdLoadSellerPaymentHistory = loadSellerPaymentHistory;

  function v12SpeakPayment(payment) {
    if (state.user?.role !== 'SHOP_OWNER' || !payment) return;
    const bn = state.lang === 'bn';
    const provider = bn
      ? (({ BKASH:'বিকাশ', NAGAD:'নগদ', UPAY:'উপায়' })[String(payment.method || '').toUpperCase()] || payment.methodBn || 'অনলাইন পেমেন্ট')
      : (({ BKASH:'bKash', NAGAD:'Nagad', UPAY:'Upay' })[String(payment.method || '').toUpperCase()] || payment.methodLabel || 'online payment');
    const amount = bn && typeof kdToBanglaDigits === 'function' ? kdToBanglaDigits(Number(payment.amount || 0)) : String(payment.amount || 0);
    const last3 = bn && typeof kdToBanglaDigits === 'function' ? kdToBanglaDigits(payment.senderLast3 || '') : String(payment.senderLast3 || '');
    const text = bn
      ? `${payment.customerName || 'একজন ক্রেতা'} ${provider} থেকে ${amount} টাকা পেমেন্ট করেছেন। প্রেরক নম্বরের শেষ তিন ডিজিট ${last3}।`
      : `${payment.customerName || 'A customer'} has paid ${amount} taka using ${provider}. The sender number ends in ${last3}.`;
    if (typeof kdSpeak === 'function') kdSpeak(text, state.lang);
  }

  if (realtimeSocket) {
    realtimeSocket.on('payment:received', payment => {
      if (state.user?.role !== 'SHOP_OWNER') return;
      if (payment.shopId && String(payment.shopId) !== String(state.ownerShopId)) return;
      state.lastPaymentForReplay = payment;
      showToast(state.lang==='bn' ? `💳 পেমেন্ট পাওয়া গেছে · ${payment.customerName} · ৳${payment.amount} · ${payment.methodLabel || payment.method}` : `💳 Payment received · ${payment.customerName} · ৳${payment.amount} · ${payment.methodLabel || payment.method}`);
      v12SpeakPayment(payment);
      loadSellerPaymentHistory();
      if (typeof loadOwnerDashboard === 'function') loadOwnerDashboard();
    });
  }

  const v12BaseLoadOwnerDashboard = loadOwnerDashboard;
  loadOwnerDashboard = async function(...args) {
    const result = await v12BaseLoadOwnerDashboard(...args);
    v12EnsurePaymentHistoryCard();
    loadSellerPaymentHistory();
    return result;
  };

  const v12BaseApplyAuthenticatedUser = applyAuthenticatedUser;
  applyAuthenticatedUser = function(...args) {
    const result = v12BaseApplyAuthenticatedUser(...args);
    if (state.user?.role === 'USER') setTimeout(loadDynamicProductSuggestions, 150);
    if (state.user?.role === 'SHOP_OWNER') setTimeout(() => { v12EnsurePaymentHistoryCard(); loadSellerPaymentHistory(); }, 150);
    return result;
  };

  document.addEventListener('DOMContentLoaded', () => {
    v12PaymentNumberBox();
    v12UpdatePaymentNumberVisibility();
    setTimeout(() => {
      if (state.user?.role === 'USER') loadDynamicProductSuggestions();
      if (state.user?.role === 'SHOP_OWNER') { v12EnsurePaymentHistoryCard(); loadSellerPaymentHistory(); }
    }, 400);
  });
})();

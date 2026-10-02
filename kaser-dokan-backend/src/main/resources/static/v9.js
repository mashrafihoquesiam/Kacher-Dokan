/** V9: Seller Analytics + Order Cancellation with Reason */
(function () {
  const CUSTOMER_REASONS = [
    'Changed my mind',
    'Ordered by mistake',
    'Wrong item or quantity',
    'Wrong delivery address',
    'Delivery is taking too long',
    'Other'
  ];
  const CUSTOMER_REASONS_BN = [
    'অর্ডারটি আর প্রয়োজন নেই',
    'ভুল করে অর্ডার করেছি',
    'পণ্য বা পরিমাণ ভুল হয়েছে',
    'ডেলিভারি ঠিকানা ভুল',
    'ডেলিভারিতে অনেক দেরি হচ্ছে',
    'অন্যান্য'
  ];
  const SELLER_REASONS = [
    'Out of stock',
    'Shop is closing',
    'Unable to prepare the order',
    'Customer requested cancellation',
    'Delivery unavailable',
    'Other'
  ];

  function money(value) {
    return `৳${Math.round(Number(value || 0)).toLocaleString()}`;
  }

  function ensureCancelModal() {
    let modal = document.getElementById('v9CancelOrderModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'v9CancelOrderModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <div><h3 style="margin:0">Cancel Order</h3><p style="margin:.2rem 0 0;color:var(--text-muted);font-size:.78rem">A reason is required and will be visible to the other party.</p></div>
          <button class="modal-close-btn" id="v9CancelClose">&times;</button>
        </div>
        <div style="padding:1rem;">
          <label class="form-label" for="v9CancelReasonSelect">Suggested reason</label>
          <select class="form-input" id="v9CancelReasonSelect"></select>
          <div style="height:.7rem"></div>
          <label class="form-label">Optional details</label>
          <textarea class="form-input" id="v9CancelReasonDetails" rows="3" maxlength="160" placeholder="Add a short detail if needed"></textarea>
          <div style="display:flex;justify-content:flex-end;gap:.6rem;margin-top:1rem">
            <button class="btn btn-outline" id="v9CancelBack">Keep Order</button>
            <button class="btn btn-danger" id="v9CancelConfirm">Cancel Order</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  let pendingCancel = null;
  function openCancelModal(orderId, actor) {
    const modal = ensureCancelModal();
    const select = document.getElementById('v9CancelReasonSelect');
    const details = document.getElementById('v9CancelReasonDetails');
    const isBn = state.lang === 'bn';
    const reasons = actor === 'seller' ? SELLER_REASONS : (isBn ? CUSTOMER_REASONS_BN : CUSTOMER_REASONS);
    select.innerHTML = reasons.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
    details.value = '';
    const title = modal.querySelector('h3');
    const sub = modal.querySelector('.modal-header p');
    const reasonLabel = modal.querySelector('label[for="v9CancelReasonSelect"]');
    if (title) title.textContent = state.lang==='bn' ? 'অর্ডার বাতিল করুন' : 'Cancel Order';
    if (sub) sub.textContent = isBn && actor !== 'seller' ? 'দোকানদার প্রস্তুতি শুরু করার আগে বাতিল করা যাবে। একটি কারণ নির্বাচন করুন।' : 'Choose a suggested reason. Customer cancellation closes when preparation starts.';
    pendingCancel = { orderId, actor };
    modal.style.display = 'flex';
  }

  function closeCancelModal() {
    const modal = document.getElementById('v9CancelOrderModal');
    if (modal) modal.style.display = 'none';
    pendingCancel = null;
  }

  async function submitCancellation() {
    if (!pendingCancel) return;
    const { orderId, actor } = pendingCancel;
    const selected = document.getElementById('v9CancelReasonSelect')?.value || '';
    const details = document.getElementById('v9CancelReasonDetails')?.value.trim() || '';
    const isOther = ['Other', 'অন্যান্য'].includes(selected);
    if (isOther && !details) { showToast(state.lang === 'bn' ? 'অন্যান্য নির্বাচন করলে কারণটি লিখুন।' : 'Please write the reason when Other is selected.'); return; }
    const reason = isOther ? details : (details ? `${selected}: ${details}` : selected);
    const button = document.getElementById('v9CancelConfirm');
    if (button) button.disabled = true;
    try {
      const res = await apiFetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to cancel order.');
      closeCancelModal();
      showToast(state.lang==='bn' ? `অর্ডার বাতিল হয়েছে। কারণ: ${reason}` : `Order cancelled. Reason: ${reason}`);
      if (actor === 'customer') {
        if (typeof openCustomerOrders === 'function') await openCustomerOrders();
      } else {
        if (typeof loadOwnerDashboard === 'function') await loadOwnerDashboard();
      }
      if (state.activeOrder && String(state.activeOrder._id) === String(orderId)) {
        state.activeOrder = data.data;
        if (typeof showOrderTrackingWithoutTimer === 'function') showOrderTrackingWithoutTimer(data.data);
      }
      await loadSellerAnalytics();
    } catch (err) {
      showToast(state.lang==='bn' ? 'অর্ডার বাতিল করা যায়নি।' : (err.message || 'Unable to cancel order.'));
    } finally {
      if (button) button.disabled = false;
    }
  }

  window.kdCancelOrder = openCancelModal;

  document.addEventListener('click', event => {
    if (event.target?.id === 'v9CancelClose' || event.target?.id === 'v9CancelBack') closeCancelModal();
    if (event.target?.id === 'v9CancelConfirm') submitCancellation();
    if (event.target?.closest?.('.filter-btn[data-status]')) setTimeout(decorateSellerCancellation, 0);
  });

  const baseUpdateOrderStatus = window.appUpdateOrderStatus;
  window.appUpdateOrderStatus = async function(orderId, status) {
    if (status === 'CANCELLED') return openCancelModal(orderId, 'seller');
    const result = await baseUpdateOrderStatus(orderId, status);
    setTimeout(loadSellerAnalytics, 250);
    return result;
  };

  // Replace customer order renderer so cancellation is available before preparation starts.
  window.renderCustomerOrdersList = function(orders) {
    const list = document.getElementById('customerOrdersList');
    if (!list) return;
    if (!orders?.length) { list.innerHTML = `<div class="empty-state-small">${state.lang==='bn'?'এখনও কোনো অর্ডার নেই।':'No orders yet.'}</div>`; return; }
    list.innerHTML = orders.map(order => {
      const normalizedStatus = String(order.status || '').toUpperCase();
      const canCancel = ['PLACED', 'ACCEPTED'].includes(normalizedStatus);
      const isPreparing = normalizedStatus === 'PREPARING';
      const reason = order.cancellationReason ? `<div class="cancelled-reason"><strong>Cancellation reason:</strong> ${escapeHtml(order.cancellationReason)}</div>` : '';
      const cancelHint = canCancel ? `<div class="customer-cancel-hint"><strong>💡 Cancellation available:</strong> You can cancel before the seller starts preparing. Choose a suggested reason such as wrong item/quantity, wrong address, or ordered by mistake.</div>` : (isPreparing ? `<div class="customer-cancel-closed">🔒 Seller has started preparing this order, so customer cancellation is now closed.</div>` : '');
      return `<div style="border:1px solid var(--border-color);border-radius:14px;padding:.9rem;margin-bottom:.8rem;background:var(--bg-card);">
        <div style="display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;"><div><div style="font-weight:800">${escapeHtml(order.shopNameBn||order.shopName||'Shop')}</div><div style="font-size:.76rem;color:var(--text-muted)">Order #${escapeHtml(order.orderNumber||'')}</div></div><span class="badge ${order.status==='CANCELLED'?'badge-danger':'badge-primary'}">${escapeHtml(order.status||'PLACED')}</span></div>
        <div style="margin:.65rem 0;font-size:.84rem">${(order.items||[]).map(i=>`<div>• ${escapeHtml(i.productNameBn||i.productName)} × ${i.quantity} — ৳${Number(i.price)*Number(i.quantity)}</div>`).join('')}</div>
        ${reason}
        ${cancelHint}
        <div style="display:flex;justify-content:space-between;gap:.7rem;align-items:center;flex-wrap:wrap;margin-top:.7rem"><strong>৳${order.totalPrice}</strong><div style="display:flex;gap:.45rem;flex-wrap:wrap"><button class="btn btn-sm btn-outline" onclick="window.kdTrackCustomerOrder('${order._id}')"><i class="fa-solid fa-location-dot"></i> Track</button><button class="btn btn-sm btn-outline" onclick="window.appOpenOrderChatById('${order._id}','${escapeHtml(order.orderNumber||'')}')"><i class="fa-solid fa-message"></i> Chat</button>${canCancel?`<button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="window.kdCancelOrder('${order._id}','customer')"><i class="fa-solid fa-ban"></i> Cancel with reason</button>`:''}</div></div>
      </div>`;
    }).join('');
  };
  try { renderCustomerOrdersList = window.renderCustomerOrdersList; } catch (_) {}

  // Inject a cancel action into seller cards for all cancellable pre-dispatch statuses.
  function decorateSellerCancellation() {
    const orders = state.ownerOrdersCache || [];
    const cards = [...document.querySelectorAll('#ownerOrdersListContainer .owner-order-card')];
    cards.forEach(card => {
      const orderNumber = card.querySelector('.order-id')?.textContent?.replace(/^Order\s*#/i,'').trim();
      const order = orders.find(o => String(o.orderNumber) === String(orderNumber));
      if (!order) return;
      if (order.cancellationReason && !card.querySelector('.cancelled-reason')) {
        const detail = card.querySelector('.order-items-detail');
        if (detail) detail.insertAdjacentHTML('afterend', `<div class="cancelled-reason"><strong>Cancellation reason:</strong> ${escapeHtml(order.cancellationReason)}</div>`);
      }
      if (!['PLACED','ACCEPTED','PREPARING','READY'].includes(order.status)) return;
      const actions = card.querySelector('.order-actions-bar > div:last-child');
      if (!actions || actions.querySelector('.v9-cancel-btn')) return;
      actions.insertAdjacentHTML('beforeend', `<button class="btn btn-xs btn-outline v9-cancel-btn" style="color:var(--danger)" onclick="window.kdCancelOrder('${order._id}','seller')"><i class="fa-solid fa-ban"></i> Cancel</button>`);
    });
  }

  const baseLoadOwnerOrders = window.loadOwnerOrders;
  if (typeof baseLoadOwnerOrders === 'function') {
    window.loadOwnerOrders = async function(...args) {
      const result = await baseLoadOwnerOrders(...args);
      decorateSellerCancellation();
      return result;
    };
    try { loadOwnerOrders = window.loadOwnerOrders; } catch (_) {}
  }


  function decorateCancelledTracking(order) {
    const summary = document.getElementById('trackItemsSummary');
    if (!summary || !order) return;
    summary.querySelector?.('.v13-track-cancel-window')?.remove();
    summary.querySelector?.('.v13-track-cancel-closed')?.remove();
    if (order.status === 'CANCELLED') {
      document.querySelectorAll('#orderTrackingModal .track-step, #orderTrackingModal .tracking-step').forEach(el => el.classList.remove('active'));
      const existing = summary.querySelector?.('.v9-track-cancelled');
      if (existing) existing.remove();
      summary.insertAdjacentHTML('afterbegin', `<div class="cancelled-reason v9-track-cancelled" style="margin-bottom:.7rem"><strong>Order cancelled</strong><br>${escapeHtml(order.cancellationReason || 'No reason provided.')}</div>`);
      return;
    }
    if (state.user?.role !== 'USER') return;
    const normalizedStatus = String(order.status || '').toUpperCase();
    if (['PLACED','ACCEPTED'].includes(normalizedStatus)) {
      const message = state.lang === 'bn' ? 'দোকানদার প্রস্তুতি শুরু করার আগে আপনি অর্ডার বাতিল করতে পারবেন।' : 'You can cancel before the seller starts preparing.';
      const buttonLabel = state.lang === 'bn' ? 'কারণ দিয়ে বাতিল' : 'Cancel with reason';
      summary.insertAdjacentHTML('afterbegin', `<div class="customer-cancel-hint v13-track-cancel-window" style="margin-bottom:.7rem"><strong>💡 ${escapeHtml(message)}</strong><div style="margin-top:.55rem"><button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="window.kdCancelOrder('${order._id}','customer')"><i class="fa-solid fa-ban"></i> ${escapeHtml(buttonLabel)}</button></div></div>`);
    } else if (normalizedStatus === 'PREPARING') {
      const message = state.lang === 'bn' ? 'দোকানদার প্রস্তুতি শুরু করেছেন — customer cancellation এখন বন্ধ।' : 'Seller has started preparing — customer cancellation is now closed.';
      summary.insertAdjacentHTML('afterbegin', `<div class="customer-cancel-closed v13-track-cancel-closed" style="margin-bottom:.7rem">🔒 ${escapeHtml(message)}</div>`);
    }
  }

  const baseShowOrderTracking = window.showOrderTracking;
  if (typeof baseShowOrderTracking === 'function') {
    window.showOrderTracking = function(order) {
      const result = baseShowOrderTracking(order);
      decorateCancelledTracking(order);
      return result;
    };
    try { showOrderTracking = window.showOrderTracking; } catch (_) {}
  }
  const baseShowOrderTrackingWithoutTimer = window.showOrderTrackingWithoutTimer;
  if (typeof baseShowOrderTrackingWithoutTimer === 'function') {
    window.showOrderTrackingWithoutTimer = function(order) {
      const result = baseShowOrderTrackingWithoutTimer(order);
      decorateCancelledTracking(order);
      return result;
    };
    try { showOrderTrackingWithoutTimer = window.showOrderTrackingWithoutTimer; } catch (_) {}
  }

  async function loadSellerAnalytics() {
    if (state.user?.role !== 'SHOP_OWNER' || !state.ownerShopId) return;
    const loading = document.getElementById('analyticsLoading');
    const content = document.getElementById('analyticsContent');
    if (loading) loading.style.display = '';
    try {
      const res = await apiFetch(`/api/seller/analytics?shopId=${encodeURIComponent(state.ownerShopId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load analytics.');
      const a = data.data || {};
      const s = a.summary || {};
      const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
      set('analyticsTodayRevenue', money(s.todayRevenue));
      set('analyticsWeekRevenue', money(s.weekRevenue));
      set('analyticsMonthRevenue', money(s.monthRevenue));
      set('analyticsAov', money(s.averageOrderValue));
      set('analyticsCompleted', s.completedOrders || 0);
      set('analyticsCancelled', s.cancelledOrders || 0);
      set('analyticsFulfillment', `${s.fulfillmentRate || 0}%`);
      set('analyticsLowStock', a.lowStockCount || 0);

      const bars = document.getElementById('analyticsRevenueBars');
      if (bars) {
        const rows = a.dailyRevenue || [];
        const max = Math.max(1, ...rows.map(x => Number(x.revenue || 0)));
        bars.innerHTML = rows.map(x => `<div class="analytics-bar-col"><div class="analytics-bar-value">${money(x.revenue)}</div><div class="analytics-bar-track"><div class="analytics-bar-fill" style="height:${Math.max(3,(Number(x.revenue||0)/max)*100)}%"></div></div><div class="analytics-bar-label">${escapeHtml(x.label)}</div></div>`).join('');
      }
      const top = document.getElementById('analyticsTopProducts');
      if (top) top.innerHTML = (a.topProducts || []).length ? a.topProducts.map((p,i)=>`<div class="analytics-product-row"><span class="analytics-rank">${i+1}</span><span class="analytics-product-name">${escapeHtml(p.nameBn||p.name)}</span><span class="analytics-product-meta">${p.quantity} sold<br>${money(p.revenue)}</span></div>`).join('') : `<div class="empty-state-small">${state.lang==='bn'?'এখনও কোনো সম্পন্ন বিক্রি নেই।':'No completed sales yet.'}</div>`;
      const status = document.getElementById('analyticsStatusSummary');
      if (status) {
        const b = a.statusBreakdown || {};
        status.innerHTML = [['New',b.PLACED||0],['Preparing',b.PREPARING||0],['Completed',b.COMPLETED||0],['Cancelled',b.CANCELLED||0]].map(([label,val])=>`<div class="analytics-status-chip"><span>${label}</span><strong>${val}</strong></div>`).join('');
      }
      if (content) content.style.display = '';
      if (loading) loading.style.display = 'none';
    } catch (err) {
      if (loading) { loading.style.display = ''; loading.textContent = err.message || 'Unable to load analytics.'; }
    }
  }
  window.loadSellerAnalytics = loadSellerAnalytics;

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnRefreshAnalytics')?.addEventListener('click', loadSellerAnalytics);
    document.querySelector('.owner-tab-btn[data-tab="analytics"]')?.addEventListener('click', loadSellerAnalytics);
  });

  const baseLoadOwnerDashboard = window.loadOwnerDashboard;
  if (typeof baseLoadOwnerDashboard === 'function') {
    window.loadOwnerDashboard = async function(...args) {
      const result = await baseLoadOwnerDashboard(...args);
      await loadSellerAnalytics();
      decorateSellerCancellation();
      return result;
    };
    try { loadOwnerDashboard = window.loadOwnerDashboard; } catch (_) {}
  }
})();

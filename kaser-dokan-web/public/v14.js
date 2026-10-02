/* V14: full inventory editing, shared photo refresh, and available-shop map. */
(() => {
  const DEFAULT_IMG = '/images/products/grocery.svg';
  state.v14OwnerProducts = {};
  state.v14EditAvailable = true;

  function v14ImageUrl(value){ return value || DEFAULT_IMG; }
  function v14SetEditAvailability(value){
    state.v14EditAvailable = Boolean(value);
    const btn = document.getElementById('editProdAvailability');
    if (!btn) return;
    btn.textContent = state.v14EditAvailable ? (state.lang==='bn'?'🟢 প্রাপ্য':'🟢 Available') : (state.lang==='bn'?'🔴 বর্তমানে অনুপলভ্য':'🔴 Currently Unavailable');
    btn.classList.toggle('off', !state.v14EditAvailable);
  }
  function v14RenderDefaultImages(selected){
    const grid = document.getElementById('editProdDefaultGrid');
    if (!grid) return;
    const choices = typeof KD_DEFAULT_PRODUCT_IMAGES !== 'undefined' ? KD_DEFAULT_PRODUCT_IMAGES : [['Grocery',DEFAULT_IMG]];
    grid.innerHTML = choices.map(([label,url]) => `<button type="button" class="default-photo-option ${url===selected?'active':''}" data-url="${url}"><img src="${url}" alt="${escapeHtml(label)}"><span>${escapeHtml(label)}</span></button>`).join('');
    grid.querySelectorAll('.default-photo-option').forEach(btn => btn.addEventListener('click', () => {
      grid.querySelectorAll('.default-photo-option').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
      document.getElementById('editProdImageUrl').value = btn.dataset.url;
      document.getElementById('editProdImagePreview').src = btn.dataset.url;
      document.getElementById('editProdImageFile').value = '';
    }));
  }
  function v14SetPhotoMode(mode){
    const upload = mode === 'upload';
    document.getElementById('editProdChooseUpload')?.classList.toggle('active', upload);
    document.getElementById('editProdChooseDefault')?.classList.toggle('active', !upload);
    const file = document.getElementById('editProdImageFile'); const grid = document.getElementById('editProdDefaultGrid');
    if(file) file.style.display = upload ? 'block' : 'none'; if(grid) grid.style.display = upload ? 'none' : 'grid';
  }

  window.kdEditProduct = function(productId){
    const p = state.v14OwnerProducts[String(productId)]; if(!p) return;
    document.getElementById('editProdId').value = p._id;
    document.getElementById('editProdName').value = p.name || '';
    document.getElementById('editProdNameBn').value = p.nameBn || '';
    document.getElementById('editProdCategory').value = p.category || 'Groceries';
    document.getElementById('editProdBrand').value = p.brand || '';
    document.getElementById('editProdDescription').value = p.description || '';
    document.getElementById('editProdUnit').value = p.unit || '';
    document.getElementById('editProdPrice').value = p.price ?? 0;
    document.getElementById('editProdStock').value = p.stock ?? 0;
    document.getElementById('editProdImageUrl').value = v14ImageUrl(p.imageUrl);
    document.getElementById('editProdImagePreview').src = v14ImageUrl(p.imageUrl);
    document.getElementById('editProdCurrentName').textContent = p.name || 'Product';
    document.getElementById('editProdImageFile').value = '';
    v14SetEditAvailability(p.available !== false);
    v14RenderDefaultImages(v14ImageUrl(p.imageUrl)); v14SetPhotoMode('default');
    document.getElementById('editProductModal').style.display = 'flex';
  };

  loadOwnerInventory = async function(){
    const tbody=document.getElementById('ownerProductsTableBody'); if(!tbody||!state.ownerShopId) return;
    try{
      const res=await apiFetch(`/api/shops/${state.ownerShopId}/products`); const data=await res.json(); if(!data.success) return;
      state.v14OwnerProducts=Object.fromEntries((data.data||[]).map(p=>[String(p._id),p]));
      tbody.innerHTML=(data.data||[]).map(p=>{
        const available=p.available!==false && Number(p.stock)>0;
        return `<tr><td><div class="inventory-product-cell"><img class="inventory-product-thumb" src="${v14ImageUrl(p.imageUrl)}" alt=""><div><strong>${escapeHtml(p.name)}</strong><div style="font-size:.75rem;color:var(--text-muted)">${escapeHtml(p.nameBn||'')} · ${escapeHtml(p.unit||'')}</div></div></div></td><td><span class="badge badge-primary">${escapeHtml(p.category||'Groceries')}</span></td><td><strong>৳${Number(p.price||0).toFixed(2)}</strong></td><td><input type="number" min="0" value="${Number(p.stock||0)}" id="stockInput_${p._id}" style="width:70px;padding:4px 6px;border:1px solid var(--border-color);border-radius:4px"></td><td><div class="v14-inventory-status"><span class="v14-availability-pill ${available?'on':'off'}">${available?'🟢 Available':'🔴 Unavailable'}</span>${Number(p.stock)<5?'<span class="badge badge-warning">Low stock</span>':''}</div></td><td><div class="v14-inventory-actions"><button class="btn btn-xs btn-outline" onclick="window.appQuickUpdateStock('${p._id}')">Quick Stock</button><button class="btn btn-xs btn-primary" onclick="window.kdRestockProduct('${p._id}','${String(p.name||'').replace(/'/g,'&#39;')}',${Number(p.stock)||0})">Restock</button><button class="btn btn-xs btn-outline" onclick="window.kdEditProduct('${p._id}')"><i class="fa-solid fa-pen"></i> Edit</button></div></td></tr>`;
      }).join('')||'<tr><td colspan="6" class="empty-state-small">No products yet.</td></tr>';
      if(typeof kdLoadLowStockReminder==='function') await kdLoadLowStockReminder(false);
    }catch(err){ console.error('[V14 inventory]',err); }
  };

  async function v14SaveProduct(event){
    event.preventDefault(); const id=document.getElementById('editProdId').value; if(!id) return;
    try{
      let imageUrl=document.getElementById('editProdImageUrl').value||DEFAULT_IMG;
      const file=document.getElementById('editProdImageFile').files?.[0]; if(file) imageUrl=await kdUploadImage(file,'product');
      const payload={name:document.getElementById('editProdName').value.trim(),nameBn:document.getElementById('editProdNameBn').value.trim(),category:document.getElementById('editProdCategory').value.trim()||'Groceries',brand:document.getElementById('editProdBrand').value.trim(),description:document.getElementById('editProdDescription').value.trim(),unit:document.getElementById('editProdUnit').value.trim()||'1 unit',price:Number(document.getElementById('editProdPrice').value),stock:Number(document.getElementById('editProdStock').value),available:state.v14EditAvailable,imageUrl};
      const res=await apiFetch(`/api/products/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await res.json(); if(!res.ok||!data.success) throw new Error(data.message||'Unable to update product.');
      document.getElementById('editProductModal').style.display='none'; showToast(state.lang==='bn'?'পণ্যের তথ্য ক্রেতাদের জন্য আপডেট হয়েছে।':'Product details updated for customers.'); await loadOwnerInventory();
      if(state.selectedShop && String(state.selectedShop._id)===String(data.data.shopId)){ const r=await fetch(`/api/shops/${data.data.shopId}/products`); const j=await r.json(); if(j.success) renderStoreProducts(j.data,state.selectedShop); }
    }catch(err){showToast(state.lang==='bn'?'পণ্য সংরক্ষণ করা যায়নি।':(err.message||'Unable to save product.'));}
  }
  async function v14DeleteProduct(){
    const id=document.getElementById('editProdId').value; const p=state.v14OwnerProducts[id]; if(!id||!p) return;
    if(!confirm(state.lang==='bn' ? `"${p.nameBn || p.name}" ইনভেন্টরি থেকে মুছবেন? এটি পরে ফিরিয়ে আনা যাবে না।` : `Delete "${p.name}" from inventory? This cannot be undone.`)) return;
    try{ const res=await apiFetch(`/api/products/${id}`,{method:'DELETE'}); const data=await res.json(); if(!res.ok||!data.success) throw new Error(data.message||'Unable to delete product.'); document.getElementById('editProductModal').style.display='none'; showToast(state.lang==='bn'?'পণ্য ইনভেন্টরি থেকে মুছে দেওয়া হয়েছে।':'Product deleted from inventory.'); await loadOwnerInventory(); }
    catch(err){showToast(state.lang==='bn' ? 'পণ্য মুছতে সমস্যা হয়েছে।' : (err.message||'Unable to delete product.'));}
  }

  // Keep the regular nearby-shop list, but map only shops that are actually open and have available stock.
  fetchNearbyShops = async function(){
    const statusEl=document.getElementById('shopsFoundCount'); if(statusEl) statusEl.textContent=state.lang==='bn'?'কাছের দোকান খোঁজা হচ্ছে…':'Finding nearby shops…';
    try{
      const q=`lat=${state.userCoords.latitude}&lng=${state.userCoords.longitude}&radius=${state.radius}`;
      const [listRes,mapRes]=await Promise.all([fetch(`/api/shops/nearby?${q}`),fetch(`/api/shops/available-map?${q}`)]);
      const list=await listRes.json(); const mapped=await mapRes.json();
      if(list.success){state.shops=list.data||[];renderShopsList(state.shops);const badge=document.getElementById('nearbyCountBadge');if(badge)badge.textContent=`${list.count} ${state.lang==='bn'?'দোকান':(list.count===1?'Shop':'Shops')}`;}
      if(mapped.success){renderMapShopMarkers(mapped.data||[]);if(statusEl)statusEl.innerHTML=`${mapped.count} available shop${mapped.count===1?'':'s'} on map <div class="v14-map-note">Only open shops with in-stock products are pinned.</div>`;}
    }catch(err){console.error('[V14 map]',err);if(statusEl)statusEl.textContent=state.lang==='bn'?'কাছের দোকান রিফ্রেশ করা যায়নি।':'Unable to refresh nearby shops.';}
  };

  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('btnCloseEditProduct')?.addEventListener('click',()=>document.getElementById('editProductModal').style.display='none');
    document.getElementById('editProductForm')?.addEventListener('submit',v14SaveProduct);
    document.getElementById('btnDeleteProduct')?.addEventListener('click',v14DeleteProduct);
    document.getElementById('editProdAvailability')?.addEventListener('click',()=>v14SetEditAvailability(!state.v14EditAvailable));
    document.getElementById('editProdChooseDefault')?.addEventListener('click',()=>v14SetPhotoMode('default'));
    document.getElementById('editProdChooseUpload')?.addEventListener('click',()=>v14SetPhotoMode('upload'));
    document.getElementById('editProdImageFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)document.getElementById('editProdImagePreview').src=URL.createObjectURL(f);});
    if(state.currentView==='customer') setTimeout(()=>fetchNearbyShops(),400);
  });

  if(realtimeSocket){
    realtimeSocket.on('product:updated',info=>{if(state.user?.role==='SHOP_OWNER'&&String(info.shopId)===String(state.ownerShopId))loadOwnerInventory();if(state.currentView==='customer'){fetchNearbyShops();if(state.selectedShop&&String(state.selectedShop._id)===String(info.shopId))openStoreModal(state.selectedShop._id);}});
    realtimeSocket.on('product:deleted',info=>{if(state.user?.role==='SHOP_OWNER'&&String(info.shopId)===String(state.ownerShopId))loadOwnerInventory();if(state.currentView==='customer')fetchNearbyShops();});
    realtimeSocket.on('user:profile-updated',()=>{if(state.currentView==='customer')fetchNearbyShops();});
  }
})();

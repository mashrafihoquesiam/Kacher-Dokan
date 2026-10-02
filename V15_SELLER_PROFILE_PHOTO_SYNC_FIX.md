# v15 Seller Profile Photo Sync Fix

- Fixed seller profile photo not updating on customer shop cards.
- Seller `/api/auth/profile` now synchronizes the new photo to both `shops.ownerImageUrl` and the legacy/customer-facing `shops.imageUrl`.
- Nearby-shop and available-map APIs now return `ownerName` and `ownerImageUrl`.
- Web and Expo customer shop views prefer `ownerImageUrl`, with `imageUrl` as fallback.
- Connected web customers receive an immediate `shop:profile` event after seller profile changes.
- Mobile customers continue to refresh nearby shops automatically and therefore receive the new photo without re-login.

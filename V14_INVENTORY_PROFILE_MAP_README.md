# Kacher Dokan v14 — Inventory Customization + Shared Photos + Available Shop Map

This build continues directly from v13 and keeps the previous cart scrolling, customer cancellation, payment voice/history, analytics, rider tracking and other features.

## 1) Seller inventory customization
Every existing product now has seller controls on web and mobile:
- Edit English/Bangla product name
- Change category and unit/weight
- Change price and stock
- Change/upload product photo
- Mark **Available** or **Currently Unavailable** without deleting it
- Restock quickly
- Permanently delete a product from inventory

When a product is unavailable, the backend blocks new orders for it even if stock still exists. Deleting a product does not erase old order history because orders keep their own item snapshot.

## 2) Shared profile/product photos
Mobile profile photos are now uploaded to the backend `/uploads` area instead of saving a phone-local URI.

When a user changes name/photo:
- the main `users` record is updated,
- customer order snapshots are updated,
- rider offer/assigned-rider snapshots are updated,
- previous chat sender snapshots are updated,
- web clients receive a `user:profile-updated` event.

Product updates emit `product:updated` / `product:deleted`, so customer web views refresh immediately. Mobile shop/catalog data refreshes periodically, so another phone/device sees the updated product photo/name/availability.

## 3) Available shops on customer map
A new endpoint `/api/shops/available-map` returns only shops that:
- are approved,
- are currently open,
- are within the selected radius,
- have at least one product that is available and in stock.

### Web
The existing Leaflet customer map now pins only those currently available shops.

### Mobile
The customer home screen now includes an interactive map with:
- customer location/radius,
- markers for available shops,
- marker tap to open the shop.

The mobile map uses `react-native-maps` 1.27.2 for Expo SDK 57.

## Mobile setup after extracting
From `kaser-dokan-mobile` run:

```bash
npm install
npx expo start
```

The existing `.env` still points to:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.104:3000
```

If the Mac/PC IP changes, update this value before starting Expo.

## Quick test
1. Login as seller.
2. Open Inventory and edit a product name/photo.
3. Mark it Unavailable and save.
4. Open customer web/mobile on another device and confirm the updated product appears and cannot be ordered while unavailable.
5. Mark it Available again and confirm ordering works.
6. Change customer or rider profile photo and confirm order/chat/rider displays refresh with the server-hosted photo.
7. From customer home, open the map and confirm only open shops with available in-stock products have markers.
8. Delete a test product and confirm it disappears from customer catalog/inventory while old orders remain intact.

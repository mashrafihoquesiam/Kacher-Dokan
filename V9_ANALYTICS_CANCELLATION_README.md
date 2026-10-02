# V9 — Seller Analytics + Order Cancellation

This build is based on V8 and keeps the existing web/mobile, multi-store, rider, location, Edge-TTS, low-stock and restock features.

## 1) Seller Analytics Dashboard

The seller analytics page is now calculated from real MongoDB data instead of static sample numbers.

Web seller analytics includes:
- Today's completed-order revenue
- Last 7 days revenue
- Current month revenue
- Average completed-order value
- Completed and cancelled order counts
- Fulfillment rate
- Low-stock count
- Last-7-days revenue bars
- Top-selling products
- Order status summary

Expo/mobile seller dashboard includes the same key metrics and top-selling products, with automatic refresh.

Only DELIVERED/COMPLETED orders count as revenue. Cancelled orders do not count toward sales.

## 2) Order Cancellation + Required Reason

### Customer
A customer may cancel only while the order is `PLACED` or `ACCEPTED` (before preparation starts).

### Seller
A seller may cancel while the order is `PLACED`, `ACCEPTED`, `PREPARING`, or `READY` (before it is out for delivery).

### When cancelled
- A cancellation reason is required.
- The reason is stored on the order.
- Reserved stock is restored.
- Pending/accepted rider offers are cancelled.
- Customer, seller, and assigned rider (if any) receive notifications.
- Paid orders are marked `REFUND_PENDING`; unpaid orders are marked `CANCELLED` for payment status.
- Web and mobile order lists display the cancellation reason.
- Analytics immediately reflects the cancelled order.

## Existing setup

Keep using your working `.env` files. They are intentionally not packaged with secrets.

Web backend:
```
cd kaser-dokan-web
npm install
npm start
```

Expo mobile:
```
cd kaser-dokan-mobile
npm install
npx expo start --lan --clear
```

For a physical phone, `kaser-dokan-mobile/.env` should contain your computer's LAN IP, for example:
```
EXPO_PUBLIC_API_URL=http://192.168.1.108:3000
```

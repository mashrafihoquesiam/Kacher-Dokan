# Kacher Dokan V12 — Scroll, Dynamic Suggestions & Payment Voice

This build is based on **Kacher-Dokan-v10-Unit-Aware-Bangla-Voice** and keeps the existing project structure/features.

## 1. Customer shop scrolling fixed

### Web
- The shop/product modal now uses a stable viewport height.
- The product list has its own vertical scroll area.
- Works better with mouse, trackpad and mobile touch scrolling.
- The category/header area stays usable while products scroll.

### Expo mobile
- The product list remains scrollable even with many products.
- Added bottom spacing so the floating cart/checkout controls do not cover the last products.
- Added nested/touch-friendly ScrollView settings.

## 2. Suggestions/categories are no longer static

### Web home suggestions
- `/api/products/suggestions` builds suggestions from products that are actually **in stock** in nearby **open/approved shops**.
- Suggestions are ranked using order history, distance and stock.
- Old fixed suggestion buttons are replaced when the customer view loads.
- If no nearby suggestion is available, the UI tells the user to use search instead of showing fake/static suggestions.

### Shop product categories
- Category tabs are generated from the actual categories of that shop's current products.
- Choosing a category filters the products in that shop.
- The same dynamic category behavior is used in the Expo mobile app.

## 3. Online payment sender verification

For **bKash, Nagad and Upay** checkout:
- Customer enters the wallet/mobile number used to send the payment.
- Backend receives it for the payment request but **stores only the last 3 digits**.
- The full sender number is not saved in the payment/order records.
- A successful demo payment receives a generated transaction ID (TrxID).
- Duplicate demo-confirm retries do not create a second seller payment announcement.

> Current provider flow is still the project's demo payment mode. Real bKash/Nagad/Upay settlement requires merchant credentials and provider callbacks.

## 4. Seller Bangla payment announcement

After a successful online payment, the seller web dashboard receives a real-time socket event and announces in Bangla, for example:

`Ananto বিকাশ থেকে ২১০ টাকা পেমেন্ট করেছেন। প্রেরক নম্বরের শেষ তিন ডিজিট ১২৩।`

The existing Edge TTS service is used on web. The payment announcement is always Bangla even if the order-alert language is set differently.

The Expo seller app also checks for new successful payments and uses `expo-speech` with `bn-BD` to announce newly received payments. The first history load is treated as a baseline so old transactions are not spoken again on login.

## 5. Seller transaction history

Seller dashboard now shows successful online payment history with:
- Customer name
- Order number
- bKash / Nagad / Upay
- Paid amount
- Sender number last 3 digits
- Transaction ID
- Payment time

Web also has **Replay Last Payment** and **Refresh** controls.

## Main files changed/added

- `kaser-dokan-web/server.js`
- `kaser-dokan-web/public/index.html`
- `kaser-dokan-web/public/v12.js` (new)
- `kaser-dokan-web/public/v12.css` (new)
- `kaser-dokan-mobile/App.js`
- `kaser-dokan-mobile/package.json`
- `kaser-dokan-mobile/package-lock.json`

## Run / install note

Because mobile Bangla payment speech adds `expo-speech`, run the normal install once inside the mobile folder after extracting the ZIP:

```bash
cd kaser-dokan-mobile
npm install
```

For a physical phone, `kaser-dokan-mobile/.env` is preconfigured for the current Mac IP you supplied (`192.168.1.104`). If your Wi-Fi/LAN IP changes, update it, for example:

```env
EXPO_PUBLIC_API_URL=http://YOUR_MAC_OR_PC_IP:3000
```

Then start the web/server and Expo using the same commands you already use for this project.

## Quick test

1. Log in as customer and open a shop with many products.
2. Scroll to the bottom and add a product from lower in the list.
3. Verify shop category tabs match that shop's real product categories.
4. On web customer home, verify the suggestion chips are populated dynamically from nearby inventory.
5. Add items and choose bKash/Nagad/Upay.
6. Enter a sender wallet number and complete the demo payment.
7. Log in/open the seller dashboard.
8. Confirm the Bangla announcement says customer, operator, amount and last 3 digits.
9. Open **Online Payment Transactions** and verify TrxID + payment history.

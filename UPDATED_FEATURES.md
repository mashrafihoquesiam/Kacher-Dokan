# Kaser Dokan – Updated Feature Build

This build adds the requested customer/shop communication, delivery tracking, payment choices, and aligned mobile/web flows.

## Added

- Order-scoped customer ↔ seller chat.
  - Web: Socket.IO realtime updates.
  - Mobile: chat view with automatic 5-second refresh.
- Call buttons for customer and seller.
  - Opens the device/system phone dialer using the order contact number.
- Delivery tracking enhancements.
  - Status flow: PLACED → ACCEPTED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED.
  - Status history is stored with each order.
  - Web receives live order status updates and also refreshes as a fallback.
  - Mobile refreshes active tracking every 8 seconds.
- Payment choices: Cash on Delivery, bKash, Nagad, Upay.
  - Demo payment mode works without merchant accounts.
  - Payment records are stored in the `payments` collection.
  - Orders show payment method and payment status.
- Shared feature language and design patterns across web/mobile: green primary actions, matching payment choices, order tracking, chat/call actions.
- MongoDB Atlas friendly configuration through `.env`.
- Secrets are no longer printed in server logs.

## Important: live mobile payments

bKash/Nagad/Upay live payments cannot be activated with only application code. Each provider requires merchant onboarding/approval, merchant credentials, callback/redirect URLs, and sometimes an approved production domain/app. This project therefore defaults to `PAYMENT_MODE=demo` so the full checkout and payment-state flow can be demonstrated safely.

When merchant credentials are available, replace the demo payment section in `kaser-dokan-web/server.js` with the official provider API calls and set `PAYMENT_MODE=live` only after callbacks/signature verification are implemented.

## Call feature

The Call button is click-to-call via the phone/system dialer. It is not an in-app VoIP/WebRTC call. In-app VoIP would require an additional calling service or WebRTC infrastructure and platform permissions.


## V3 workflow fixes (latest)
- Inline + / - quantity controls inside shop product cards.
- Dynamic Seller order filters and live filter counts.
- Replay Voice on Seller order cards + Replay Last Order.
- Order-scoped chat messages show sender photo, name and role.
- Persistent bell notification center for meaningful actions.
- Optional Rider NID/Birth Certificate, permanent-address and utility-bill verification fields/documents.

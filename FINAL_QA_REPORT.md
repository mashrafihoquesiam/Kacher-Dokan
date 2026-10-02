# Final QA Report — v17 Final Configured Project Show Build

Date: 30 September 2026

## Checks completed

- Node backend syntax: **PASS**
- Web `app.js`: **PASS**
- Web `upgrade.js`: **PASS**
- Web v9/v12/v14 JavaScript: **PASS**
- Image migration script syntax: **PASS**
- `package.json`, `app.json`, `eas.json`: **PASS / valid JSON**
- MongoDB Atlas configuration remains environment-based: **PASS**
- Render health endpoint `/healthz`: **ADDED**
- Cloudinary server-side image upload path: **ADDED**
- Local upload fallback for laptop development: **PRESERVED**
- Cloud deployment prevents silent Render-local image persistence when Cloudinary is missing: **PASS**
- Existing local-image migration utility: **ADDED**
- Mobile registration no longer stores a device-local profile image URI: **FIXED**
- Seller profile/shop image synchronization: **PRESENT**
- Web realtime shop/profile/product refresh: **PRESENT**
- Mobile cross-device shop/product refresh: **~4 second polling**
- Customer cart/checkout scrolling fix from v13: **PRESERVED**
- Customer cancellation before `PREPARING`: **PRESERVED + server enforced**
- Inventory edit/delete/availability/restock: **PRESERVED**
- Available-shop customer map: **PRESERVED**
- Demo online payment history/TrxID/last-3-digits voice flow: **PRESERVED**
- Duplicate payment announcement guard: **PRESERVED**
- Universal `123456` authentication bypass: **REMOVED**
- Legacy password compatibility + automatic `scrypt` upgrade: **ADDED**
- Browser voice fallback when Edge TTS fails: **ADDED**
- Misleading localhost DB status label: **FIXED**
- Legacy Spring Boot Mongo URI/port/JWT configuration changed to environment-variable form: **IMPROVED**

## v17 configuration verification

- Private `kaser-dokan-web/.env` included: **PASS**
- MongoDB Atlas URI structurally valid and loaded from `.env`: **PASS**
- Cloudinary URL structurally valid and loaded from `.env`: **PASS**
- Cloudinary secret is not printed by config/startup diagnostics: **PASS**
- `npm run check:config` masked configuration check: **PASS**
- Mac MongoDB setup preserves Cloudinary configuration: **FIXED**
- Windows PowerShell MongoDB setup preserves Cloudinary configuration: **FIXED**
- Live MongoDB/Cloudinary network authentication from this build environment: **NOT VERIFIED** (external network access unavailable here)

## What cannot be fully verified inside this ZIP-only QA environment

The following require your real external accounts/network and therefore must be tested once after deployment:

- Actual MongoDB Atlas connection with your credentials.
- Actual Cloudinary upload using your `CLOUDINARY_URL`.
- Render deployment/public URL.
- EAS/Expo standalone build using your Expo account.
- Real two-device GPS/map behavior at the show venue.
- Online Edge TTS and weather API under the venue network.

## Known intentional limitations

1. bKash/Nagad/Upay are demo payment simulations. No real merchant money transfer occurs.
2. Mobile shop/product/photo synchronization is automatic polling (~4 seconds), not a Socket.IO client connection.
3. The feature-complete runtime is Node/Express. The Spring Boot module is retained but is not the main runtime for the current feature set.
4. Old local uploaded images can only be migrated if the original image files still exist on the laptop that created them.

## Final show recommendation

After cloud deployment, perform at least two complete rehearsals from a clean restart using separate Customer, Seller, and Rider accounts. Verify image upload, payment announcement, order status transitions, cancellation restriction, map, and rider delivery on the same network/device setup you will use at the project show.

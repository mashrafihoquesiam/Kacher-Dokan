# Kacher Dokan v22 — Submission Fix

This build fixes the v21 landing-page regression where the page rendered but the language and Get Started buttons could become non-responsive.

## Critical fixes

- Restored the missing shared language helpers (`ui`, `uiKey`, `localizedRole`).
- Attached authentication/language click handlers before optional map initialization.
- Leaflet/CDN failure can no longer stop login, language selection, or Get Started.
- Added a graceful map-unavailable message while keeping shopping/order features usable.
- Fixed landing-page language labels so English mode shows Kacher Dokan/Bangla/English and Bangla mode shows কাছের দোকান/বাংলা/ইংরেজি.
- Fixed the landing search placeholder to follow the selected language.
- Removed the mixed Bangla script from the English product-name label.
- Localized additional customer/seller/payment/status messages that were still hard-coded.
- Localized demo payment confirmation and inventory delete confirmation.

## Verified

- `app.js`, `server.js`, `upgrade.js`, `v9.js`, `v12.js`, and `v14.js` pass Node syntax checks.
- Mobile `App.js` passes TypeScript JSX syntax parsing with `tsc --noEmit`.
- No duplicate HTML IDs.
- Every HTML `data-i18n` key exists in both English and Bangla dictionaries.
- English/Bangla dictionaries have matching key sets (282 keys each).
- Runtime smoke test verified:
  - page initialization succeeds when Leaflet is unavailable;
  - Bangla click changes the hero text to Bangla;
  - English click changes it back to English;
  - Get Started opens the account-selection step.

## Important

User-entered data (names, addresses, custom product/category text, chat content) is displayed as the user entered it and is not machine-translated. Application-controlled UI/system text follows the selected language.

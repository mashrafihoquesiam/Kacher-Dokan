# V20 Final Inventory + Language + Voice Polish

## Requested fixes
- Seller Add Product / inventory polished on web and mobile.
- Large category list + Others / Custom category preserved.
- Existing product editor supports photo, names, category, brand, details, unit, price, stock, availability and delete/restock.
- Known product categories display in Bangla when Bangla UI is selected.
- One language setting now controls UI **and** voice. There is no separate order-voice language.
- Bangla mode: seller greeting, low-stock reminder, new-order voice, and online-payment voice speak Bangla.
- English mode: the same announcements speak English.
- Main customer/seller/rider static labels that were still hard-coded have been localized.
- Language choice is persisted to the user record through `/api/auth/language` on best-effort basis.

## QA performed
- Node syntax checks for server/web JavaScript.
- JSX syntax/transpile check for Expo App.js.
- JSON parse checks for package/app/eas config.
- ZIP integrity check.

## Note
Brand names, user-entered custom category names, addresses, chat text, and product names that were entered only in one language are user/database content; the UI does not machine-translate user-entered content.

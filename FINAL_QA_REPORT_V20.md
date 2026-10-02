# V20 Final QA Report

## Scope checked
- Seller Add Product and existing inventory editor (web + Expo mobile)
- Category selection including Others / Custom
- Product photo, names, brand, details, unit, price, stock, availability, restock and delete
- Customer-facing category labels for known categories
- Customer / Seller / Rider language switching
- Seller voice announcements: greeting, low-stock, new order, online payment
- Mobile seller online-payment voice
- Main seller/rider action buttons and profile controls

## Language behavior
One selected language now controls both the UI and voice.

### Bangla mode
- Main Customer, Seller and Rider controls use Bangla.
- Known inventory category labels display in Bangla.
- Seller greeting speaks Bangla.
- Low-stock reminder speaks Bangla.
- New-order announcement speaks Bangla.
- Online-payment announcement speaks Bangla.

### English mode
- Main Customer, Seller and Rider controls use English.
- Known inventory category labels display in English.
- Seller greeting speaks English.
- Low-stock reminder speaks English.
- New-order announcement speaks English.
- Online-payment announcement speaks English.

The user's preferred language is also saved to MongoDB via `/api/auth/language` when authenticated.

## Important content note
Names, brands, addresses, chat messages and custom categories are user/database content. If a seller enters those only in English, the application does not automatically machine-translate the content itself. Interface labels and generated system messages follow the selected language.

## Static checks completed
- `node --check` server.js: PASS
- `node --check` public/app.js: PASS
- `node --check` public/upgrade.js: PASS
- `node --check` public/v12.js: PASS
- TypeScript JSX parser (`tsc --allowJs --jsx react-native --noEmit --noResolve App.js`): PASS
- package.json/app.json/eas.json JSON parsing: PASS
- ZIP integrity: checked after packaging

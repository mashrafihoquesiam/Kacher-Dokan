# V7 – Mobile UI cleanup + low-stock reminder/restock

This build continues from V6. Spring Boot migration is intentionally NOT included.

## What changed

### Mobile UI/UX
- Kept the same structure/flows as the web app, but tightened spacing and sizing for smaller phones.
- Role selection becomes a vertical stack on narrow phones instead of squeezing three cards into one row.
- More compact header, seller dashboard cards, order cards and product rows on small screens.
- Product catalog cards use smaller responsive images/padding on narrow screens.

### Seller low-stock warning
- Low stock means **fewer than 5 units** (0–4).
- Seller dashboard shows a warning card listing every low-stock product.
- Mobile seller receives a Bangla important-reminder alert after login/dashboard load when low-stock products exist.
- Web seller greeting uses the existing Edge TTS service and, after the welcome/date/weather greeting finishes, speaks the Bangla low-stock reminder.
- Web has a **Repeat stock reminder** voice button.

### Restock
- Low-stock products have a **Restock** button on web and mobile.
- Seller enters how many units to ADD. Example: stock 3 + restock 10 = stock 13.
- Restock is atomic in MongoDB and automatically sets the product available again.
- A seller notification is created after restocking.
- The server emits a stock update event so open web shop/inventory screens can refresh.
- Mobile open shop product lists poll for fresh stock while the shop is open.

## Run
Web backend:
- Windows: `RUN_WINDOWS.bat`
- Or `npm start` from `kaser-dokan-web`

Mobile:
- Set `kaser-dokan-mobile/.env` with `EXPO_PUBLIC_API_URL=http://YOUR_PC_OR_MAC_IP:3000`
- Run `npm install`
- Run `npx expo start --lan --clear`

## Database
Use your existing working `kaser-dokan-web/.env`. No database reset or reseed is needed.

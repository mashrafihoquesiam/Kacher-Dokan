# কাছের দোকান — V3 Workflow Fixes

This build keeps the existing Customer / Seller / Rider project and adds the requested workflow fixes.

## What changed

1. **Inline shop quantity controls** — after Customer presses Add inside a shop, the product immediately becomes `− 1 +`. Quantity can be changed without opening Cart.
2. **Dynamic Seller order filters** — All, New Orders, Preparing, and Completed now filter live MongoDB orders and show live counts. Preparing groups Accepted / Preparing / Ready orders.
3. **Replay order audio** — every Seller order card has **Replay Voice**, plus **Replay Last Order** in the Seller header. It uses the selected Bangla/English Edge TTS voice.
4. **Order-scoped chat identity** — chats remain isolated by order. Every message now shows profile photo, name, and role (Customer / Shop Owner / Rider).
5. **Activity notification center** — a bell icon shows persistent notifications for important actions such as order placement/status, rider offer/acceptance, pickup verification, delivery completion, profile/inventory/availability changes, chat, and calls.
6. **Optional Rider verification at registration/profile** — Rider can optionally submit NID or Birth Certificate type/number, permanent address, ID document, and electricity/gas/utility bill. Files accept PNG/JPG/WEBP/PDF up to 3 MB each.

## Rider-document privacy

Rider verification files are saved under `kaser-dokan-web/private_uploads/rider-documents`. This folder is **not** mounted as a public web/static folder. MongoDB stores only the private filename and verification metadata/status.

## Run on Windows

1. Keep/copy your working `.env` into `kaser-dokan-web`.
2. Double-click `RUN_WINDOWS.bat`.
3. If MongoDB setup is requested, use `SETUP_DATABASE.bat`.
4. Open `http://localhost:3000`.

## Suggested quick test

- Customer: open a shop → Add a product → use `− / +` directly on the product card.
- Seller: place several orders and test All / New Orders / Preparing / Completed counts and filters.
- Seller: press **Replay Voice** on any order.
- Open an order chat as two roles and verify name + role under each sender.
- Perform order/rider/status actions and open the bell icon.
- Register a Rider → Register tab → optional verification section appears.

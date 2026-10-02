# কাছের দোকান — Expo/Mobile Sync v6

This build continues from v5. Spring Boot was NOT added in this step.

## Mobile features synchronized with the current Node/MongoDB backend
- Customer / Shop Owner / Rider login and registration
- Optional Rider NID/Birth Certificate details + ID photo + utility bill photo during registration
- Multi-store cart on mobile
- One checkout creates separate shop orders
- Separate customer tracking/chat for every shop order
- Rider availability, nearby delivery jobs, offer-to-deliver, assigned deliveries, pickup-code verification, delivered action
- Seller can see pending rider offers and accept a rider
- Seller availability toggle
- Seller order filters: ALL / NEW / PREPARING / COMPLETED
- Notification bell + persistent notification center
- Order chat shows sender role (Customer / Seller / Rider)
- Customer/Seller/Rider profile screen fields
- Relative backend image URLs are converted correctly for physical phones
- Existing web Rider real-time events and v5 multi-store backend remain unchanged

## Run on a physical phone with Expo Go
1. Start `kaser-dokan-web` on the PC first.
2. Phone and PC must be on the same Wi-Fi.
3. Find PC IPv4 with `ipconfig` (Windows) or `ipconfig getifaddr en0` (Mac).
4. In `kaser-dokan-mobile`, copy `.env.example` to `.env` and replace the example IP:
   `EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3000`
5. Run `npm install`.
6. Run `npx expo start --clear`.
7. Scan the Expo QR code with Expo Go.

Never use `localhost:3000` inside the physical phone app. On the phone, localhost means the phone itself.

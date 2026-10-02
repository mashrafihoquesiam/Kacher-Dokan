# Kacher Dokan v18 — Final Cloud + Language + Inventory Polish

## Added
- Seller Add Product UI polished on web and mobile.
- New product supports photo, English/Bangla name, category, unit, price, stock, and initial customer availability.
- Seller inventory actions are clearer and bilingual.
- Language switch has been expanded across customer, seller and rider UI; switching to Bangla/English refreshes seller inventory labels too.
- Mobile language now starts from the account language when available.
- Mobile API is prepared for the public Render URL instead of a private 192.168.x.x address.

## Important: public access requires deployment
The ZIP is deployment-ready, but a Render service must be created in your Render account. After Render gives a URL such as `https://kacher-dokan-xxxx.onrender.com`, put it in `kaser-dokan-mobile/.env` as `EXPO_PUBLIC_API_URL=...`, then restart Expo with `npx expo start -c`.

## Render environment variables
Set `MONGO_URI`, `DB_NAME=kaser_dokan`, `CLOUDINARY_URL`, and `NODE_ENV=production` in Render. Do not expose them in the frontend.

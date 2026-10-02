# Deploy on Render (public internet access)
1. Connect the Render integration in ChatGPT or open Render and create a new Web Service from this project repository.
2. Root directory: `kaser-dokan-web`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `MONGO_URI`, `DB_NAME`, `CLOUDINARY_URL`, `NODE_ENV=production`.
6. Deploy and copy the generated HTTPS URL.
7. Put that URL in `kaser-dokan-mobile/.env` as `EXPO_PUBLIC_API_URL=https://...onrender.com`.
8. Run `npx expo start -c`, or build an EAS standalone app for use without Metro.

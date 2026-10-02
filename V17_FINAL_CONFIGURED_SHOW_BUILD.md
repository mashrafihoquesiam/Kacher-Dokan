# Kacher Dokan v17 – Final Configured Project Show Build

This build is based on v16 and is pre-configured for the owner's current MongoDB Atlas and Cloudinary accounts for local project-show testing.

## What was fixed
- `kaser-dokan-web/.env` is included for immediate local testing.
- MongoDB Atlas and Cloudinary are loaded from that `.env`.
- Cloudinary startup diagnostics show only the cloud name and a masked API key. The secret is never printed.
- `npm run check:config` checks that both MongoDB and Cloudinary configuration strings are present and structurally valid without printing secrets.
- Mac/Windows database setup scripts preserve `CLOUDINARY_URL` and `PUBLIC_BASE_URL` instead of accidentally deleting them.
- Existing v16 cloud/mobile/security/photo-sync/cart/cancellation/inventory/map/payment features are retained.

## Run on this Mac/PC
```bash
cd kaser-dokan-web
npm install
npm run check:config
npm start
```

Then open `http://localhost:3000/healthz`. `storage` should report `cloudinary`.

## Mobile
The included mobile `.env` still targets the current local development server. After Render deployment, replace `EXPO_PUBLIC_API_URL` with the public HTTPS Render URL and rebuild/restart Expo.

## Security before public submission
This ZIP intentionally contains temporary live project-show credentials at the owner's explicit request. Do not upload this exact ZIP or `.env` to a public GitHub repository. Rotate the MongoDB password and Cloudinary API secret after the project show, then update `.env`/Render environment variables.

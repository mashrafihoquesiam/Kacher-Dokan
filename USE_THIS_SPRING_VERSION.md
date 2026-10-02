# Kacher Dokan v23 — Spring Boot Backend

This is the submission build where the active backend is Spring Boot.

## Architecture
- Web frontend: existing HTML/CSS/JavaScript UI preserved.
- Mobile frontend: existing Expo/React Native app preserved.
- Backend: **Spring Boot 3.5.5 + Java 21**.
- Database: existing MongoDB Atlas database/collections preserved.
- Realtime web updates: Spring Boot Server-Sent Events compatibility bridge.
- Uploaded images: Cloudinary when `CLOUDINARY_URL` is configured, otherwise local fallback.

The old runnable Express `server.js` has been removed. `kaser-dokan-web` now contains only the web frontend/source assets.

## Run the web + Spring Boot backend

Requirements:
1. Java JDK 21
2. Maven 3.9+
3. Internet access on the first Maven run so dependencies can be downloaded

### macOS / Linux
Run:

```bash
./RUN_SPRING_MAC.command
```

or manually:

```bash
cd kaser-dokan-backend
mvn spring-boot:run
```

Open:

```text
http://localhost:3000
```

### Windows
Double-click `RUN_SPRING_WINDOWS.bat`, or:

```bat
cd kaser-dokan-backend
mvn spring-boot:run
```

Then open `http://localhost:3000`.

## Run the mobile app

The mobile app still talks to port 3000. For local testing, put your laptop/PC LAN IP in:

`kaser-dokan-mobile/.env`

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.104:3000
```

Then:

```bash
cd kaser-dokan-mobile
npm install
npx expo start -c
```

Phone and computer must be on the same Wi-Fi for a local-IP setup. A public cloud URL can be used later without changing the Spring API.

## Existing data

The Spring application uses the same `MONGO_URI` and `DB_NAME`, so existing accounts, products, orders, transactions, chats and other MongoDB data remain available.

## Important

This private ZIP contains the configured environment file from the previous private show build. Do not upload this ZIP publicly. Rotate MongoDB and Cloudinary credentials after the project show/submission.

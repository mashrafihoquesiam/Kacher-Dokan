KACHER DOKAN - FINAL FULL FEATURE BUILD
======================================

WINDOWS (recommended)
1. Extract the ZIP completely.
2. Open: kaser-dokan-web
3. Double-click RUN_WINDOWS.bat
4. If the MongoDB connection is missing/wrong, the launcher automatically offers SETUP_DATABASE.bat.
5. In Atlas: Cluster0 > Connect > Drivers. Copy the current connection string.
6. The setup asks for the database password privately and URL-encodes it automatically.
7. After the database check says SUCCESS, the app opens at http://localhost:3000

WHY THIS BUILD FIXES THE PREVIOUS STARTUP PROBLEMS
- It kills an old process using port 3000 before starting.
- The Spring Boot backend loads the project .env before startup so stale OS variables do not override the configured project values.
- It tests MongoDB BEFORE launching the app.
- It clearly distinguishes bad password/authentication, DNS/host, and network-access errors.
- The Windows setup safely URL-encodes special characters in the Atlas password.
- No MongoDB password is included in this ZIP.

FEATURES INCLUDED
- Customer, Shop Owner, and Rider roles
- Rider nearby-delivery offers and seller acceptance
- 6-digit pickup verification flow
- Dynamic seller/rider availability
- Customer/Seller/Rider editable profiles and profile photos
- Product photo upload and built-in grocery image library
- Existing products get default photos when missing
- Bangla branding: কাছের দোকান
- Chat/call notification badges
- Bangla welcome greeting + date + weather
- Microsoft Edge online neural TTS for Bangla/English voice
- Existing order, payment, chat, call, tracking and MongoDB functionality retained

SECURITY
Never upload your .env to a public GitHub repository. It contains the MongoDB credential.

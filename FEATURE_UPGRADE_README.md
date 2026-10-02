# কাছের দোকান — Feature Upgrade Build

This build extends the uploaded working Windows project without requiring a database reset.

## Added
- Bangla seller greeting after login with seller name, today's Bangla date, and live weather.
- Free Microsoft Edge online neural TTS (`bn-BD-NabanitaNeural` / `en-US-JennyNeural`) for greeting and new-order voice alerts. No Azure key is required.
- Third account type: Rider.
- Rider availability, nearby delivery orders, rider offer to seller, seller acceptance, shared 6-digit pickup code, pickup verification, Out for Delivery, and Delivered flow.
- Customer / Shop Owner / Rider profile page by clicking the name/photo in the header.
- Profile photo upload, name/phone/address editing, seller shop details, and rider vehicle type.
- Product image upload plus a built-in default image gallery for milk, oil, chips, rice, eggs, bread, biscuit, tea, salt, lentil, noodles, soap, drinks and spices.
- Existing database products that have no `imageUrl` automatically receive a matching default image when the server starts.
- Visible branding uses only `কাছের দোকান` (the English name is removed from the visible UI).
- Real-time red unread badges for new chat messages and incoming call requests.
- Shop Available/Unavailable is database-backed, updates customers in real time, and blocks new orders when unavailable.
- Rider Available/Not Available is database-backed.
- Windows and macOS launch scripts.

## Important before first run
The uploaded project did not contain your private `.env`. Copy the `.env` from your CURRENT WORKING Windows project into:

`kaser-dokan-web/.env`

Do not upload that `.env` to a public GitHub repository.

Then on Windows double-click `RUN_WINDOWS.bat`.

## Rider demo
From the login screen choose **Rider → Register** and create a rider account. Log the rider in from another browser/incognito window or another device on the same site.

Suggested faculty demo:
1. Seller logs in. Bangla welcome greeting plays and displays date/weather.
2. Customer places a **Delivery** order.
3. Rider sets **Available** and sees the nearby order.
4. Rider presses **I am available**.
5. Seller sees Rider Delivery Request and accepts it.
6. Seller and rider both see the same pickup code.
7. Seller marks order **Ready**.
8. Rider enters the code → order becomes **Out for Delivery**.
9. Rider marks **Delivered**.

## Notes
- Weather and Edge TTS need internet access.
- Uploaded images are saved locally under `kaser-dokan-web/uploads/`; MongoDB stores the image path.
- The project does not need Azure Speech subscription/API keys.

## Windows MongoDB auth fix
This build explicitly loads `kaser-dokan-web/.env` with override enabled. This prevents an older Windows `MONGO_URI` environment variable from silently overriding the `.env` file. Startup prints only the active MongoDB username and host, never the password.

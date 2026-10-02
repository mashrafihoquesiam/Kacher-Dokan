# Spring Boot Migration Report

## Goal
Replace the active Node/Express backend with Spring Boot while keeping the existing Kacher Dokan web/mobile behavior and MongoDB data model.

## Migrated backend areas
- Authentication: login, registration, current-user profile, language preference
- Customer nearby-shop discovery and available-shop map
- Product search, suggestions, categories and shop products
- Seller product create/edit/delete/restock/availability and low-stock queries
- Shop profile and open/unavailable state
- Single-shop and multi-store checkout
- Order lists/details/status history
- Customer cancellation with pre-PREPARING restriction
- Demo bKash/Nagad/Upay payment initiate/confirm/history
- Seller dashboard stats and analytics
- Chat and call-request workflow
- Persistent notifications
- Rider availability, verification, nearby deliveries and delivery offers
- Rider acceptance, pickup verification, tracking and delivered state
- Profile/product image upload and Cloudinary support
- Weather endpoint
- Database inspection/health endpoints
- Realtime browser events through Spring SSE

## Compatibility work
The frontend URL paths and request/response shapes were kept aligned with the latest Express backend. The existing frontend still uses the same `/api/...` paths, and the mobile app continues to use `EXPO_PUBLIC_API_URL`.

## Route parity check
The latest Express backend and this Spring controller were statically compared:

- Express API routes: 52
- Spring API routes: 52
- Missing Spring routes: 0
- Unexpected Spring API routes: 0

`/healthz` is an additional Spring deployment health route and is not part of the frontend API contract.

## Realtime migration
The old web client expected Socket.IO-style `.on()` events. A small compatibility client (`spring-realtime.js`) preserves the existing event names while using a Spring Boot Server-Sent Events stream underneath. This avoids redesigning the frontend event handlers.

## Voice
Mobile voice still uses the device/Expo speech flow. On web, the existing voice function falls back to browser speech synthesis when the Spring `/api/tts` endpoint does not return generated MP3 audio. This keeps the user-facing voice behavior without keeping a Node TTS backend.

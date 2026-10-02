# Rider Real-Time Order Update Fix

This build changes only the first requested implementation task: Rider real-time order updates.

## What changed
- Authenticated Rider sockets join a dedicated `role:RIDER` realtime room.
- When a new DELIVERY order is created, connected available Rider screens receive an immediate `rider:new-order` event and refresh from MongoDB.
- Rider screens also refresh when an order status changes or another rider is accepted, so stale jobs disappear quickly.
- The existing 12-second safety refresh remains as a fallback if a WebSocket event is missed.
- If precise shop coordinates are not configured and the GPS radius finds no shops, the Rider dashboard shows open delivery orders with a clear location-fallback notice. This prevents demo/test orders from disappearing only because older shops still have default coordinates.

## Not included yet
Multi-store checkout splitting, separate multi-store tracking, and Expo/mobile synchronization are intentionally NOT implemented in this build. Those are the next tasks to do one-by-one.

## Quick test
1. Run the web app and log in as a Rider in one browser/device.
2. Set Rider to Available.
3. In another browser/device log in as a Customer and place a DELIVERY order.
4. The Rider dashboard should update immediately without manual refresh.
5. Send an offer. Once the Seller accepts a Rider, the open delivery should disappear from other Rider dashboards and appear under the assigned Rider.

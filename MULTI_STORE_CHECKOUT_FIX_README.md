# V5 – Multi-Store Checkout & Separate Tracking

This build continues from the Rider real-time fix and implements only the next requested task: true multi-store ordering.

## What changed
- Customer cart can now contain products from multiple shops at the same time.
- The old single-shop cart confirmation/clear behavior was removed.
- Cart UI groups products by shop and shows each shop separately.
- Delivery fee is calculated per shop for delivery orders; pickup remains free.
- Checkout calls `/api/orders/multi-store`.
- Backend validates all shops/products before stock is changed.
- One independent order is created for each shop.
- Every shop-order gets its own order number, seller, rider flow, status, chat, pickup verification code, tracking and notifications.
- All orders from the same checkout carry a `checkoutGroupId` for traceability.
- If the customer buys from more than one shop, the My Orders window opens and shows separate cards with Track and Chat buttons.
- The My Orders button now loads all of the customer's real orders from MongoDB instead of only the most recent active order.
- Stock updates use guarded decrements and best-effort rollback if checkout fails partway through.

## Example
Milk from Shop A + Bread from Shop B in one cart creates:
- Order A: Shop A / Milk / independent delivery tracking
- Order B: Shop B / Bread / independent delivery tracking

## Not changed in this step
- Spring Boot migration
- Expo/mobile synchronization

Those remain separate tasks so completed working features are not rebuilt unnecessarily.

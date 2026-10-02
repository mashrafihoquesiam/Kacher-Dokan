# Kacher Dokan v13 — Cart Scroll + Customer Cancellation UX

## Fixed
- Customer cart/checkout on mobile can scroll reliably.
- The **Confirm Order** button is now pinned in a bottom checkout bar, so it stays reachable even with a long cart.
- Web cart drawer now scrolls as one full checkout panel, including the checkout form and Place Order button.

## Customer cancellation
- A customer can cancel only while the order status is **PLACED** or **ACCEPTED**.
- Once the seller changes the order to **PREPARING**, customer cancellation is blocked by the backend.
- The customer UI now clearly explains the cancellation window.
- Suggested reasons are shown, with Bangla suggestions when Bangla language is active.
- An optional detail can be added. Choosing **Other / অন্যান্য** requires a custom reason.
- Cancellation reason is stored with the order and is visible to the seller.
- Reserved stock is restored by the existing cancellation flow.
- If an online-paid order is cancelled, the existing payment state changes to **REFUND_PENDING**.

## Suggested customer reasons
- Ordered by mistake
- Wrong item or quantity
- Wrong delivery address
- Changed my mind / no longer needed
- Delivery is taking too long
- Other

## Quick test
1. Log in as customer and add enough items to make the cart long.
2. Open Cart and verify scrolling works; the green **Confirm Order** button remains visible at the bottom.
3. Place an order and open **My Orders**.
4. While status is PLACED/ACCEPTED, use **Cancel with reason** and select a suggested reason.
5. Place another order, then log in as seller and move it to PREPARING.
6. Return to customer: the UI should say cancellation is closed, and the API will also reject cancellation.

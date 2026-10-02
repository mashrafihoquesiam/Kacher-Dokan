# V8 Mobile Location + UX Upgrade

This build keeps the existing web/backend features and upgrades the Expo customer experience.

## What changed
- Uses the phone GPS through `expo-location` instead of the old fixed Uttara coordinates.
- Reverse geocodes the device location and shows the current area plus coordinates/accuracy.
- Nearby-shop and product-search APIs now use the live phone coordinates.
- Rider nearby-order queries also use the live device coordinates.
- Clear permission-denied/error state, retry, Apple/Google Maps shortcut, and an explicit demo-location fallback.
- Customer mobile UI is simplified into Home and Orders with a persistent bottom shortcut bar for Home, Orders, Cart and Profile.
- Search results use the same inline `− / quantity / +` control as the catalog once an item is in the cart.
- Loading, empty, selected and live/offline states are more visible.

## Shneiderman's 8 Golden Rules applied
1. **Consistency** — same card, button, quantity and status patterns across the customer flow.
2. **Shortcuts** — persistent Home / Orders / Cart / Profile navigation.
3. **Informative feedback** — GPS state, accuracy, live/offline state, loaders, badges and status chips.
4. **Closure** — order status/tracking and clear success/error feedback remain in the workflow.
5. **Error prevention** — live location is never silently replaced with demo shops; demo mode is explicitly labeled.
6. **Easy reversal** — cart quantity can be decreased back to zero and search can be cleared instantly.
7. **User control** — refresh location, open map, choose radius, switch Home/Orders, and use demo location deliberately.
8. **Reduce memory load** — Home focuses on location/search/nearby shops; orders are moved to their own screen.

## First run
From `kaser-dokan-mobile` run:

```bash
npm install
npx expo start --lan --clear
```

The phone will ask for foreground Location permission. Choose **Allow While Using App** to get true nearby shops.

# V21 Strict Language QA

Checked:
- Web main UI language switching
- Web upgrade/rider/profile/notification layer
- Web cancellation/payment/inventory/map layers
- Mobile authentication/customer/seller/rider visible UI
- Bangla/English voice remains tied to UI language
- JavaScript syntax for web/server
- JSX/JavaScript parse for mobile

Rule enforced: application-controlled UI uses Bangla in Bangla mode and English in English mode. User-entered content, shop/product proper names, addresses, payment brand names, IDs and transaction IDs remain as stored rather than being automatically translated.

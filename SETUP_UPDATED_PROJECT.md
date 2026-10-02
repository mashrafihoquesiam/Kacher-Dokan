# Run the Updated Kaser Dokan Project

## 1) Web/API server

Open a terminal in `kaser-dokan-web`.

Copy `.env.example` to `.env` and put your own MongoDB Atlas connection string in `MONGO_URI`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm start
```

Open: `http://localhost:3000`

Do not commit or share your `.env` file.

## 2) MongoDB Atlas

The app will create/use these collections as features are used:

- `orders`
- `messages`
- `payments`
- `shops`
- `products`
- `users`

For Atlas, make sure your Database User is valid and Network Access permits your current IP.

## 3) Mobile app

Open another terminal in `kaser-dokan-mobile`:

```powershell
npm install
```

Create a `.env` file in `kaser-dokan-mobile` and set your PC's Wi-Fi IPv4 address:

```text
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
```

Your phone and PC must be on the same Wi-Fi.

Then run:

```powershell
npx expo start
```

## 4) Test the new flow

1. Log in as a customer.
2. Place an order.
3. Choose Cash, bKash, Nagad, or Upay.
4. For mobile wallets, demo mode simulates a successful provider payment.
5. Open tracking and use Chat or Call.
6. Log in as the shop owner in another browser/device.
7. Open the same order, chat back, and progress the delivery status.
8. Customer tracking updates as the seller changes the status.

## Security note

Use `.env` for MongoDB and production credentials. Never hardcode passwords in `server.js`, `App.js`, or a public Git repository.

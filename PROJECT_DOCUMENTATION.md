# 📚 Kaser Dokan (কাছের দোকান) — Complete Technical Documentation

> **Bangla Title**: কাছের দোকান  
> **Tagline (Bangla)**: *“কাছের দোকান, সহজ কেনাকাটা”*  
> **Tagline (English)**: *“Find Nearby. Shop Easily.”*  
> **Database Name**: `kaser_dokan`  
> **Core Concept**: Hyperlocal Grocery Shop Discovery & Fast Ordering within **100–200 meters**.

---

## 1. Project Overview & Architecture

**Kaser Dokan** is a specialized hyperlocal e-commerce platform designed to connect neighborhood residents with their nearest corner grocery shops (*মুদি দোকান*). Unlike conventional city-wide platforms, Kaser Dokan prioritizes **physical proximity (100m, 200m, 500m, 1km)** and real-time inventory availability.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Web & Mobile App)                      │
│   • HTML5 / Vanilla CSS / JavaScript (Browser Web Application)         │
│   • Leaflet Interactive OpenStreetMap / React Native Expo Mobile       │
│   • Bilingual Engine (Bangla 🇧🇩 & English 🇬🇧)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  BACKEND API & APPLICATION SERVERS                     │
│   • Node.js & Express REST API Server (Port: 3000)                     │
│   • Java Spring Boot 3 Enterprise API Backend (Port: 8080)             │
│   • Spring Security 6 + Stateless JWT Bearer Authentication            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ MongoDB Wire Protocol
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB CE / Atlas)                 │
│   • Database Name: "kaser_dokan"                                       │
│   • Geospatial Index: 2dsphere on location Point [lng, lat]            │
│   • Collections: users, shops, products, categories, orders, reviews   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tools, Technologies & Programming Languages

### 2.1. Programming Languages
* **JavaScript (ES6+)**: Used for the frontend application logic, map synchronization, Leaflet rendering, and Express backend API.
* **Java 17 / 21**: Used for the enterprise Spring Boot backend microservices.
* **HTML5**: Semantic markup for the responsive web interface.
* **Vanilla CSS3**: Modern design system, HSL color tokens, dark/light themes, and glassmorphism.
* **MongoDB Query Language (MQL)**: Geospatial `$geoNear` aggregation pipelines, `$lookup` joins, and `$text` searches.
* **JSON**: Data serialization format for all client-server communications.

### 2.2. Development Tools & Libraries
| Category | Tool / Library | Purpose |
| :--- | :--- | :--- |
| **Database** | [MongoDB](https://www.mongodb.com) | Primary NoSQL document store with native `2dsphere` spatial indexing. |
| **DB Shell** | `mongosh` (v2.10.0) | Interactive CLI for database administration, seeding, and query testing. |
| **Web Server** | [Express.js](https://expressjs.com) (v4.19.2) | REST API framework serving geospatial endpoints and static assets. |
| **Mapping Engine** | [Leaflet.js](https://leafletjs.com) (v1.9.4) | Interactive map rendering with custom pulsing user markers and shop pins. |
| **Java Framework** | [Spring Boot 3](https://spring.io) (v3.1.5) | Enterprise backend framework with Spring Data MongoDB and Spring Security. |
| **Security** | `jjwt` / `BCrypt` | Cryptographic password hashing and Stateless JSON Web Token generation. |
| **Icons & Typography** | FontAwesome 6 & Google Fonts | *Outfit* (English) and *Hind Siliguri* (Bangla) typography. |

---

## 3. Project File Structure & Directory Map

```
kaser-dokan/
│
├── kaser-dokan-web/                              # Live Web Application & Express Server
│   ├── package.json                              # Node.js dependencies (express, mongodb, cors)
│   ├── server.js                                 # Express API backend connecting to kaser_dokan
│   └── public/
│       ├── index.html                            # Semantic HTML5 single-page application UI
│       ├── style.css                             # Complete design system with Dark/Light modes
│       └── app.js                                # Frontend logic, Map, Cart, Order, and i18n
│
├── kaser-dokan-backend/                          # Spring Boot 3 Java Enterprise Backend
│   ├── pom.xml                                   # Maven dependencies & plugins
│   ├── src/main/resources/
│   │   └── application.properties                # MongoDB URI, server port 8080, JWT secret
│   └── src/main/java/com/kaserdokan/
│       ├── KaserDokanApplication.java            # Main Spring Boot application entrypoint
│       ├── config/                               # Security & Password encoder configurations
│       │   ├── PasswordEncoderConfig.java
│       │   └── SecurityConfig.java
│       ├── controller/                           # REST API Controllers
│       │   ├── AuthController.java               # Login, JWT validation endpoints
│       │   └── UserController.java               # Customer & Owner registration/CRUD
│       ├── dto/                                  # Data Transfer Objects (Requests & Responses)
│       │   ├── AuthResponse.java
│       │   ├── LoginRequest.java
│       │   ├── UserRegistrationRequest.java
│       │   ├── UserResponse.java
│       │   └── UserUpdateRequest.java
│       ├── exception/                            # Global Exception Handling
│       │   ├── GlobalExceptionHandler.java
│       │   ├── ResourceNotFoundException.java
│       │   └── BadRequestException.java
│       ├── model/                                # MongoDB Document Entities
│       │   └── User.java
│       ├── repository/                           # Spring Data Repositories
│       │   └── UserRepository.java
│       ├── security/                             # JWT Token Provider & Auth Filters
│       │   ├── CustomUserDetailsService.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── JwtTokenProvider.java
│       └── service/                              # Core Business Logic Layer
│           ├── AuthService.java
│           └── UserService.java
│
├── seed_kaser_dokan.mongosh.js                   # Database initialization & seeding script
├── test_queries.mongosh.js                       # Spatial query verification script
├── PROGRESS.md                                   # Backend roadmap & development milestones
├── SETUP_INSTRUCTIONS.md                         # Local environment setup instructions
└── PROJECT_DOCUMENTATION.md                      # Complete master technical documentation
```

### Key Workspace File Links:
* [kaser-dokan-web/server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js) — Express backend server connecting to `kaser_dokan`.
* [kaser-dokan-web/public/index.html](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/public/index.html) — Frontend HTML with Map, Shop List, and Modals.
* [kaser-dokan-web/public/style.css](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/public/style.css) — Design system stylesheet.
* [kaser-dokan-web/public/app.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/public/app.js) — Client-side JavaScript application.
* [seed_kaser_dokan.mongosh.js](file:///c:/Users/user/Desktop/kaser%20dokan/seed_kaser_dokan.mongosh.js) — Database seeder script.
* [kaser-dokan-backend/src/main/resources/application.properties](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-backend/src/main/resources/application.properties) — Spring Boot properties.

---

## 4. Database Design (`kaser_dokan`)

The database uses MongoDB with strict GeoJSON standard coordinates (`[longitude, latitude]`).

### 4.1. Spatial Index Setup
```javascript
// Generated in seed_kaser_dokan.mongosh.js
db.shops.createIndex({ location: "2dsphere" });
db.users.createIndex({ location: "2dsphere" });
db.products.createIndex({ shopId: 1 });
db.products.createIndex({ name: "text", nameBn: "text" });
```

### 4.2. MongoDB Collections Schema

#### 1. `shops` Collection
```json
{
  "_id": "ObjectId('65e01a2b8c9d4e001f11a011')",
  "ownerId": "ObjectId('65e01a2b8c9d4e001f11a002')",
  "shopName": "Rahman Grocery",
  "shopNameBn": "রহমান গ্রোসারী স্টোর",
  "description": "Fresh everyday groceries, dairy, rice, and household essentials.",
  "phone": "01811000002",
  "address": "House 14, Road 4, Sector 3, Uttara, Dhaka",
  "location": {
    "type": "Point",
    "coordinates": [90.4127, 23.8105]
  },
  "imageUrl": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600",
  "openingTime": "07:30",
  "closingTime": "23:00",
  "rating": 4.8,
  "totalRatings": 86,
  "approved": true,
  "open": true,
  "deliveryAvailable": true,
  "minDeliveryOrder": 80,
  "deliveryFee": 20
}
```

#### 2. `products` Collection
```json
{
  "_id": "ObjectId('65e01a2b8c9d4e001f11a031')",
  "shopId": "ObjectId('65e01a2b8c9d4e001f11a011')",
  "categoryId": "ObjectId('65e01a2b8c9d4e001f11a021')",
  "category": "Rice & Grains",
  "name": "Miniket Premium Rice",
  "nameBn": "মিনিকেট প্রিমিয়াম চাল",
  "price": 420,
  "stock": 35,
  "unit": "5 kg",
  "available": true,
  "lowStockThreshold": 5
}
```

#### 3. `orders` Collection
```json
{
  "_id": "ObjectId('65e01a2b8c9d4e001f11a061')",
  "orderNumber": "KD-20260901-001",
  "userId": "ObjectId('65e01a2b8c9d4e001f11a001')",
  "shopId": "ObjectId('65e01a2b8c9d4e001f11a011')",
  "shopName": "Rahman Grocery",
  "items": [
    {
      "productId": "ObjectId('65e01a2b8c9d4e001f11a031')",
      "productName": "Miniket Premium Rice",
      "unit": "5 kg",
      "price": 420,
      "quantity": 1
    }
  ],
  "subtotal": 420,
  "deliveryFee": 20,
  "totalPrice": 440,
  "orderType": "DELIVERY",
  "deliveryAddress": "House 12, Road 4, Sector 3, Uttara, Dhaka",
  "customerPhone": "01711000001",
  "status": "PLACED",
  "paymentMethod": "CASH_ON_DELIVERY",
  "paymentStatus": "PENDING",
  "createdAt": "2026-09-01T00:05:00.000Z"
}
```

---

## 5. REST API Specifications

| Method | Endpoint | Query / Body Params | Purpose | Source File |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | Verify MongoDB connection and collection counts | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L48-L64) |
| `GET` | `/api/shops/nearby` | `lat`, `lng`, `radius` | Get shops within radius sorted nearest first via `$geoNear` | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L67-L113) |
| `GET` | `/api/shops/:id` | Path `id` | Get details, timings, and rating for a specific shop | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L116-L124) |
| `GET` | `/api/shops/:id/products` | Path `id`, Query `category` | Fetch product catalog for a specific shop | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L127-L141) |
| `GET` | `/api/products/search-near-me` | `query`, `lat`, `lng`, `radius` | Find nearby shops stocking a specific product | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L144-L208) |
| `POST` | `/api/orders` | `shopId`, `items`, `orderType`, `deliveryAddress` | Place new order & atomically decrement product stock | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L221-L295) |
| `GET` | `/api/orders` | `shopId`, `userId`, `status` | Retrieve order history for customer or shop owner | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L298-L310) |
| `PUT` | `/api/orders/:id/status` | `status` (`ACCEPTED`, `PREPARING`, `DELIVERED`) | Update order state; restores stock if cancelled | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L313-L352) |
| `POST` | `/api/products` | `shopId`, `name`, `price`, `stock`, `unit` | Add new product to shop inventory | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L355-L374) |
| `PUT` | `/api/products/:id` | `price`, `stock`, `available` | Instant stock or price update | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L376-L394) |
| `GET` | `/api/stats/shop/:id` | Path `id` | Shop KPI stats (sales, orders, pending) | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L397-L418) |
| `GET` | `/api/db/collections` | None | Live DB Inspector: list all collections & sample docs | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L421-L433) |
| `POST` | `/api/db/query` | `collection`, `pipeline`, `findQuery` | Live DB Inspector: execute raw MongoDB queries | [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L445-L459) |

---

## 6. How Data Fetching Works (Step-by-Step)

### Step 1: Getting User GPS Coordinates
When the user opens the application, [app.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/public/app.js#L236-L253) accesses the device GPS or default coordinates (`23.8103, 90.4125`).

### Step 2: Fetching Nearby Shops (Client -> Server)
[app.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/public/app.js#L327-L350) executes a `fetch` request:
```javascript
const response = await fetch(`/api/shops/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
const data = await response.json();
```

### Step 3: MongoDB Geospatial `$geoNear` Aggregation (Server -> Database)
In [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L73-L100), MongoDB uses the `2dsphere` index to locate points in spherical space and returns distance in meters:
```javascript
const pipeline = [
  {
    $geoNear: {
      near: { type: 'Point', coordinates: [lng, lat] },
      distanceField: 'distanceMeters',
      maxDistance: radius, // 100, 200, 500, or 1000 meters
      spherical: true,
      query: { approved: true }
    }
  },
  { $sort: { distanceMeters: 1 } }
];
const shops = await db.collection('shops').aggregate(pipeline).toArray();
```

### Step 4: "Find Product Near Me" Pipeline
When a user searches for *"Milk"* or *"ডিম"*, [server.js](file:///c:/Users/user/Desktop/kaser%20dokan/kaser-dokan-web/server.js#L156-L198) joins the `shops` and `products` collections using `$lookup`:
```javascript
const pipeline = [
  {
    $geoNear: {
      near: { type: 'Point', coordinates: [lng, lat] },
      distanceField: 'distanceMeters',
      maxDistance: 1000,
      spherical: true,
      query: { approved: true }
    }
  },
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: 'shopId',
      as: 'matchedProducts'
    }
  },
  { $unwind: '$matchedProducts' },
  {
    $match: {
      $or: [
        { 'matchedProducts.name': { $regex: searchQuery, $options: 'i' } },
        { 'matchedProducts.nameBn': { $regex: searchQuery, $options: 'i' } }
      ]
    }
  },
  { $sort: { distanceMeters: 1, 'matchedProducts.available': -1 } }
];
```

---

## 7. How to Run and Test the Project

### Running the Web Server & Live Application
1. Ensure MongoDB is running on `localhost:27017`.
2. Seed the database:
   ```bash
   mongosh "mongodb://localhost:27017/kaser_dokan" seed_kaser_dokan.mongosh.js
   ```
3. Start the web application:
   ```bash
   cd "kaser-dokan-web"
   node server.js
   ```
4. Open your browser and navigate to:
   ```text
   http://127.0.0.1:3000/
   ```

### Testing Key Features in Browser:
1. **Radius Switching**: Click `100m`, `200m`, `500m`, `1km` to see the map circle and nearby shops update.
2. **Find Product Near Me**: Type *"Milk"* or *"Rice"* in the search bar.
3. **Cart & Checkout**: Select a shop, add products, click Cart, and place a Cash-on-Delivery order.
4. **Live Order Tracking**: Observe the visual stepper timeline updating from *Placed* to *Delivered*.
5. **Shop Owner Portal**: Switch to the *Shop Owner* view to manage inventory and advance order states.
6. **Live DB Inspector**: Click *DB Inspector* to run live MongoDB queries directly against `kaser_dokan`.

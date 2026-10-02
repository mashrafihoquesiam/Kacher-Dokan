// Mongosh seed script for kaser_dokan
const db = db.getSiblingDB('kaser_dokan');

print("=== Initializing kaser_dokan Database ===");

// 1. Drop existing collections
['users', 'shops', 'categories', 'products', 'carts', 'orders', 'reviews', 'favorites'].forEach(name => {
  try {
    db.getCollection(name).drop();
    print("Dropped collection: " + name);
  } catch(e) {}
});

// 2. Create 2dsphere and unique indexes
print("Creating Indexes...");
db.shops.createIndex({ location: "2dsphere" });
db.shops.createIndex({ ownerId: 1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true });
db.products.createIndex({ shopId: 1 });
db.products.createIndex({ name: "text", nameBn: "text" });
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ shopId: 1 });

// IDs
const customerId = ObjectId("65e01a2b8c9d4e001f11a001");
const owner1Id = ObjectId("65e01a2b8c9d4e001f11a002");
const owner2Id = ObjectId("65e01a2b8c9d4e001f11a003");
const owner3Id = ObjectId("65e01a2b8c9d4e001f11a004");
const adminId = ObjectId("65e01a2b8c9d4e001f11a005");

// Users
db.users.insertMany([
  {
    _id: customerId,
    name: "Fahad Molla",
    phone: "01711000001",
    email: "fahad@gmail.com",
    passwordHash: "123456",
    role: "USER",
    location: { type: "Point", coordinates: [90.4125, 23.8103] },
    preferredLanguage: "bn",
    createdAt: new Date("2026-08-01T08:00:00Z"),
    active: true
  },
  {
    _id: owner1Id,
    name: "Abdur Rahman",
    phone: "01811000002",
    email: "rahman@gmail.com",
    passwordHash: "123456",
    role: "SHOP_OWNER",
    location: { type: "Point", coordinates: [90.4127, 23.8105] },
    preferredLanguage: "bn",
    createdAt: new Date("2026-08-01T08:00:00Z"),
    active: true
  },
  {
    _id: owner2Id,
    name: "Karim Ullah",
    phone: "01911000003",
    email: "karim@gmail.com",
    passwordHash: "123456",
    role: "SHOP_OWNER",
    location: { type: "Point", coordinates: [90.4132, 23.8098] },
    preferredLanguage: "bn",
    createdAt: new Date("2026-08-01T08:00:00Z"),
    active: true
  },
  {
    _id: owner3Id,
    name: "Hasan Mahmud",
    phone: "01611000004",
    email: "hasan@gmail.com",
    passwordHash: "123456",
    role: "SHOP_OWNER",
    location: { type: "Point", coordinates: [90.4140, 23.8115] },
    preferredLanguage: "en",
    createdAt: new Date("2026-08-01T08:00:00Z"),
    active: true
  },
  {
    _id: adminId,
    name: "System Admin",
    phone: "01511000000",
    email: "admin@kaserdokan.com",
    passwordHash: "123456",
    role: "ADMIN",
    location: { type: "Point", coordinates: [90.4125, 23.8103] },
    preferredLanguage: "en",
    createdAt: new Date("2026-08-01T08:00:00Z"),
    active: true
  }
]);
print("Users inserted.");

// Shops
const shop1Id = ObjectId("65e01a2b8c9d4e001f11a011");
const shop2Id = ObjectId("65e01a2b8c9d4e001f11a012");
const shop3Id = ObjectId("65e01a2b8c9d4e001f11a013");
const shop4Id = ObjectId("65e01a2b8c9d4e001f11a014");
const shop5Id = ObjectId("65e01a2b8c9d4e001f11a015");

db.shops.insertMany([
  {
    _id: shop1Id,
    ownerId: owner1Id,
    shopName: "Rahman Grocery",
    shopNameBn: "রহমান গ্রোসারী স্টোর",
    description: "Fresh everyday groceries, milk, bread, rice, oil & household essentials.",
    phone: "01811000002",
    address: "House 14, Road 4, Sector 3, Uttara, Dhaka",
    location: { type: "Point", coordinates: [90.4127, 23.8105] }, // ~35m away
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80",
    openingTime: "07:30",
    closingTime: "23:00",
    rating: 4.8,
    totalRatings: 86,
    approved: true,
    open: true,
    deliveryAvailable: true,
    minDeliveryOrder: 80,
    deliveryFee: 20,
    createdAt: new Date("2026-08-01T08:00:00Z")
  },
  {
    _id: shop2Id,
    ownerId: owner2Id,
    shopName: "Karim General Store",
    shopNameBn: "করিম জেনারেল স্টোর",
    description: "Quality grains, pulses, fresh eggs, packaged dairy, and beverages.",
    phone: "01911000003",
    address: "Road 3, Block B, Sector 3, Uttara, Dhaka",
    location: { type: "Point", coordinates: [90.4132, 23.8098] }, // ~115m away
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
    openingTime: "08:00",
    closingTime: "22:30",
    rating: 4.5,
    totalRatings: 54,
    approved: true,
    open: true,
    deliveryAvailable: true,
    minDeliveryOrder: 100,
    deliveryFee: 20,
    createdAt: new Date("2026-08-01T08:00:00Z")
  },
  {
    _id: shop3Id,
    ownerId: owner3Id,
    shopName: "Hasan Mini Supermarket",
    shopNameBn: "হাসান মিনি সুপারমার্কেট",
    description: "Full range of pantry staples, baby care, confectionery and hygiene.",
    phone: "01611000004",
    address: "Road 5, Avenue 1, Sector 3, Uttara, Dhaka",
    location: { type: "Point", coordinates: [90.4140, 23.8115] }, // ~185m away
    imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=80",
    openingTime: "08:30",
    closingTime: "22:00",
    rating: 4.6,
    totalRatings: 39,
    approved: true,
    open: true,
    deliveryAvailable: false,
    minDeliveryOrder: 0,
    deliveryFee: 0,
    createdAt: new Date("2026-08-01T08:00:00Z")
  },
  {
    _id: shop4Id,
    ownerId: owner1Id,
    shopName: "Bismillah Store",
    shopNameBn: "বিসমিল্লাহ ভ্যারাইটিজ স্টোর",
    description: "Spices, mustard oil, premium lentils and daily fresh produce.",
    phone: "01711223344",
    address: "Road 8, Sector 3, Uttara, Dhaka",
    location: { type: "Point", coordinates: [90.4155, 23.8125] }, // ~380m away
    imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&auto=format&fit=crop&q=80",
    openingTime: "08:00",
    closingTime: "23:00",
    rating: 4.4,
    totalRatings: 28,
    approved: true,
    open: false,
    deliveryAvailable: true,
    minDeliveryOrder: 150,
    deliveryFee: 25,
    createdAt: new Date("2026-08-01T08:00:00Z")
  },
  {
    _id: shop5Id,
    ownerId: owner2Id,
    shopName: "Green Fresh Mart",
    shopNameBn: "গ্রিন ফ্রেশ মার্ট",
    description: "Organic vegetables, local fruits, and premium spices.",
    phone: "01855667788",
    address: "Sector 4 Main Road, Dhaka",
    location: { type: "Point", coordinates: [90.4180, 23.8150] }, // ~750m away
    imageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&auto=format&fit=crop&q=80",
    openingTime: "07:00",
    closingTime: "21:00",
    rating: 4.9,
    totalRatings: 112,
    approved: true,
    open: true,
    deliveryAvailable: true,
    minDeliveryOrder: 200,
    deliveryFee: 30,
    createdAt: new Date("2026-08-01T08:00:00Z")
  }
]);
print("Shops inserted with 2dsphere coordinates.");

// Categories
const catRice = ObjectId("65e01a2b8c9d4e001f11a021");
const catDairy = ObjectId("65e01a2b8c9d4e001f11a022");
const catOil = ObjectId("65e01a2b8c9d4e001f11a023");
const catBakery = ObjectId("65e01a2b8c9d4e001f11a024");
const catSnacks = ObjectId("65e01a2b8c9d4e001f11a025");

db.categories.insertMany([
  { _id: catRice, name: "Rice & Grains", nameBn: "চাল ও ডাল", icon: "🍚" },
  { _id: catDairy, name: "Dairy & Eggs", nameBn: "দুধ ও ডিম", icon: "🥛" },
  { _id: catOil, name: "Oil & Spices", nameBn: "তেল ও মসলা", icon: "🧂" },
  { _id: catBakery, name: "Bakery & Bread", nameBn: "বেকারি ও রুটি", icon: "🍞" },
  { _id: catSnacks, name: "Snacks & Tea", nameBn: "চা ও নাশতা", icon: "☕" }
]);
print("Categories inserted.");

// Products
db.products.insertMany([
  // Shop 1
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a031"),
    shopId: shop1Id,
    categoryId: catRice,
    category: "Rice & Grains",
    name: "Miniket Premium Rice",
    nameBn: "মিনিকেট প্রিমিয়াম চাল",
    description: "Polished aromatic white grain miniket rice, clean and stone-free.",
    price: 420,
    stock: 35,
    unit: "5 kg",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 5
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a032"),
    shopId: shop1Id,
    categoryId: catDairy,
    category: "Dairy & Eggs",
    name: "Aarong Pasteurized Liquid Milk",
    nameBn: "আড়ং তরল দুধ",
    description: "Pure, fresh 100% full-cream pasteurized liquid milk.",
    price: 90,
    stock: 18,
    unit: "1 Litre",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 4
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a033"),
    shopId: shop1Id,
    categoryId: catDairy,
    category: "Dairy & Eggs",
    name: "Farm Fresh Brown Eggs",
    nameBn: "ফার্মের লাল ডিম (১ ডজন)",
    description: "Fresh healthy high protein layer eggs.",
    price: 155,
    stock: 40,
    unit: "12 pcs (1 Dozen)",
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 6
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a034"),
    shopId: shop1Id,
    categoryId: catOil,
    category: "Oil & Spices",
    name: "Rupchanda Fortified Soybean Oil",
    nameBn: "রূপচাঁদা সয়াবিন তেল",
    description: "Vitamin A enriched pure refined edible cooking oil.",
    price: 190,
    stock: 22,
    unit: "1 Litre",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 5
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a035"),
    shopId: shop1Id,
    categoryId: catBakery,
    category: "Bakery & Bread",
    name: "All Time Milk Bread",
    nameBn: "অল টাইম মিল্ক ব্রেড",
    description: "Soft sliced enriched family bread.",
    price: 55,
    stock: 12,
    unit: "400 gm",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 3
  },

  // Shop 2
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a041"),
    shopId: shop2Id,
    categoryId: catDairy,
    category: "Dairy & Eggs",
    name: "Pran Pasteurised Liquid Milk",
    nameBn: "প্রাণ পাস্তুরিত তরল দুধ",
    description: "Fresh local dairy milk.",
    price: 88,
    stock: 25,
    unit: "1 Litre",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 5
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a042"),
    shopId: shop2Id,
    categoryId: catDairy,
    category: "Dairy & Eggs",
    name: "Farm Fresh Brown Eggs",
    nameBn: "ফার্মের লাল ডিম",
    description: "Fresh eggs directly from poultry farms.",
    price: 150,
    stock: 30,
    unit: "12 pcs",
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 5
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a043"),
    shopId: shop2Id,
    categoryId: catRice,
    category: "Rice & Grains",
    name: "Nazirshail Polished Rice",
    nameBn: "নাজিরশাইল চাল",
    description: "Fine long grain premium Nazirshail.",
    price: 390,
    stock: 15,
    unit: "5 kg",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 3
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a044"),
    shopId: shop2Id,
    categoryId: catOil,
    category: "Oil & Spices",
    name: "ACI Pure Vacuum Evaporated Salt",
    nameBn: "এসিআই পিওর লবণ",
    description: "100% pure crystal iodized cooking salt.",
    price: 42,
    stock: 45,
    unit: "1 kg",
    imageUrl: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 8
  },

  // Shop 3
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a051"),
    shopId: shop3Id,
    categoryId: catDairy,
    category: "Dairy & Eggs",
    name: "Milk Vita Pasteurized Milk",
    nameBn: "মিল্ক ভিটা তরল দুধ",
    description: "Cooperative dairy pure liquid milk.",
    price: 90,
    stock: 0, // OUT OF STOCK for comparison!
    unit: "1 Litre",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    available: false,
    lowStockThreshold: 5
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a052"),
    shopId: shop3Id,
    categoryId: catSnacks,
    category: "Snacks & Tea",
    name: "Ispahani Mirzapore Black Tea",
    nameBn: "ইস্পাহানি মির্জাপুর চা",
    description: "Strong rich blend premium Bangladesh tea.",
    price: 240,
    stock: 20,
    unit: "400 gm",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
    available: true,
    lowStockThreshold: 4
  }
]);
print("Products inserted.");

// Sample Orders
db.orders.insertMany([
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a061"),
    orderNumber: "KD-20260901-001",
    userId: customerId,
    shopId: shop1Id,
    shopName: "Rahman Grocery",
    items: [
      {
        productId: ObjectId("65e01a2b8c9d4e001f11a031"),
        productName: "Miniket Premium Rice",
        unit: "5 kg",
        price: 420,
        quantity: 1
      },
      {
        productId: ObjectId("65e01a2b8c9d4e001f11a032"),
        productName: "Aarong Pasteurized Liquid Milk",
        unit: "1 Litre",
        price: 90,
        quantity: 2
      }
    ],
    subtotal: 600,
    deliveryFee: 20,
    totalPrice: 620,
    orderType: "DELIVERY",
    deliveryAddress: "House 12, Road 4, Sector 3, Uttara, Dhaka",
    customerPhone: "01711000001",
    status: "DELIVERED",
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PAID",
    createdAt: new Date("2026-08-31T15:30:00Z"),
    updatedAt: new Date("2026-08-31T16:10:00Z")
  },
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a062"),
    orderNumber: "KD-20260901-002",
    userId: customerId,
    shopId: shop1Id,
    shopName: "Rahman Grocery",
    items: [
      {
        productId: ObjectId("65e01a2b8c9d4e001f11a033"),
        productName: "Farm Fresh Brown Eggs",
        unit: "12 pcs",
        price: 155,
        quantity: 1
      },
      {
        productId: ObjectId("65e01a2b8c9d4e001f11a035"),
        productName: "All Time Milk Bread",
        unit: "400 gm",
        price: 55,
        quantity: 1
      }
    ],
    subtotal: 210,
    deliveryFee: 20,
    totalPrice: 230,
    orderType: "DELIVERY",
    deliveryAddress: "House 12, Road 4, Sector 3, Uttara, Dhaka",
    customerPhone: "01711000001",
    status: "PREPARING",
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000)
  }
]);
print("Orders inserted.");

// Sample Reviews
db.reviews.insertMany([
  {
    _id: ObjectId("65e01a2b8c9d4e001f11a071"),
    userId: customerId,
    userName: "Fahad Molla",
    shopId: shop1Id,
    orderId: ObjectId("65e01a2b8c9d4e001f11a061"),
    rating: 5,
    comment: "Very fast delivery! Received fresh rice and cold milk in just 12 minutes.",
    commentBn: "খুব দ্রুত ডেলিভারি পেয়েছি! মাত্র ১২ মিনিটে চাল ও তাজা দুধ পেয়েছি।",
    createdAt: new Date("2026-08-31T17:00:00Z")
  }
]);
print("Reviews inserted.");

print("=== MongoDB kaser_dokan Database Initialized and Populated Successfully! ===");

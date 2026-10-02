const db = db.getSiblingDB('kaser_dokan');

const userCoord = [90.4125, 23.8103];
const radius = 200; // 200 meters

print("\n--- 1. Nearby Shops within 200m (Sorted nearest first) ---");
const nearbyShops = db.shops.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: userCoord },
      distanceField: "distanceMeters",
      maxDistance: radius,
      spherical: true,
      query: { approved: true }
    }
  },
  {
    $project: {
      shopName: 1,
      shopNameBn: 1,
      distanceMeters: { $round: ["$distanceMeters", 1] },
      open: 1,
      rating: 1,
      deliveryAvailable: 1
    }
  }
]).toArray();

printjson(nearbyShops);

print("\n--- 2. 'Find Product Near Me' (Searching 'Milk') ---");
const milkNearMe = db.shops.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: userCoord },
      distanceField: "distanceMeters",
      maxDistance: 500,
      spherical: true,
      query: { approved: true }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "shopId",
      as: "products"
    }
  },
  { $unwind: "$products" },
  {
    $match: {
      "products.name": { $regex: "milk", $options: "i" }
    }
  },
  {
    $project: {
      _id: 0,
      shopId: "$_id",
      shopName: 1,
      distanceMeters: { $round: ["$distanceMeters", 1] },
      productName: "$products.name",
      price: "$products.price",
      unit: "$products.unit",
      stock: "$products.stock",
      available: "$products.available"
    }
  },
  { $sort: { distanceMeters: 1 } }
]).toArray();

printjson(milkNearMe);

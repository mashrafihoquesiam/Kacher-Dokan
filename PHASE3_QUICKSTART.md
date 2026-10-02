# Phase 3: Shop Management - Quick Start Guide

## 🎯 Phase 3 Objective

Implement shop management system where:
- **Shop Owners** can register and manage their shops
- **Customers** can view nearby shops
- **Admin** can approve/reject new shops (foundation for Phase 32)

---

## 📋 Phase 3 Implementation Checklist

### Step 1: Create Shop Entity
- [ ] Create `src/main/java/com/kaserdokan/model/Shop.java`
- [ ] Add all required fields (see below)
- [ ] Add MongoDB document mapping
- [ ] Add timestamps

### Step 2: Create Shop Repository
- [ ] Create `src/main/java/com/kaserdokan/repository/ShopRepository.java`
- [ ] Add custom query methods
- [ ] Add location-based search (for Phase 4)

### Step 3: Create Shop DTOs
- [ ] `ShopRegistrationRequest.java` (Stage 1: Owner info)
- [ ] `ShopDetailsRequest.java` (Stage 2: Shop info)
- [ ] `ShopResponse.java` (API response)
- [ ] `ShopSearchRequest.java` (Search filters)

### Step 4: Create Shop Service
- [ ] `ShopService.java`
- [ ] Implement CRUD operations
- [ ] Add validation logic
- [ ] Owner-specific operations

### Step 5: Create Shop Controller
- [ ] `ShopController.java`
- [ ] Implement REST endpoints
- [ ] Add proper HTTP status codes
- [ ] Add security annotations

### Step 6: Update User Service (Optional)
- [ ] Add shop owner specific methods
- [ ] Link users to shops

### Step 7: Create Tests
- [ ] Test shop registration
- [ ] Test shop CRUD
- [ ] Test owner access control
- [ ] Test shop retrieval

### Step 8: Update Security Configuration
- [ ] Add SHOP_OWNER role authorization
- [ ] Protect owner-only endpoints

---

## 🗂️ Shop Entity Structure

```java
@Document(collection = "shops")
public class Shop {
    @Id
    private String id;
    
    // Owner Reference
    private String ownerId;  // References User.id
    
    // Shop Information
    private String shopName;
    private String description;
    private String phone;
    private String address;
    
    // Location
    private Location location;  // {latitude, longitude}
    
    // Operating Hours
    private String openingTime;    // "09:00"
    private String closingTime;    // "22:00"
    
    // Status
    private Boolean approved = false;
    private Boolean open = true;
    private Boolean deliveryAvailable = false;
    
    // Rating
    private Double rating = 0.0;
    private Integer ratingCount = 0;
    
    // Additional
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 📡 Phase 3 API Endpoints

### Create Shop (Two-Stage Process)

**Stage 1: Owner Registration**
```
POST /api/shops/register/owner
Body: {
  "ownerName": "Ali Khan",
  "phone": "01987654321",
  "email": "ali@example.com",
  "password": "pass123",
  "confirmPassword": "pass123"
}
```

**Stage 2: Shop Details**
```
POST /api/shops/register/details
Header: Authorization: Bearer {token}
Body: {
  "shopName": "Rahman Grocery",
  "address": "Dhaka, Bangladesh",
  "phone": "01234567890",
  "description": "Fresh groceries daily",
  "openingTime": "08:00",
  "closingTime": "22:00",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "deliveryAvailable": true
}
```

### Shop CRUD Operations

```
POST   /api/shops                        - Create shop (by owner)
GET    /api/shops                        - Get all approved shops
GET    /api/shops/{id}                   - Get shop by ID
PUT    /api/shops/{id}                   - Update shop (by owner)
DELETE /api/shops/{id}                   - Delete shop (by owner)

GET    /api/shops/owner/{ownerId}        - Get owner's shops
GET    /api/shops/search?name=X          - Search shops by name
```

---

## 🔐 Permission Model

### Shop Owner Can:
- ✅ Create/Read/Update/Delete own shops
- ✅ View own shop details
- ✅ Modify shop information
- ❌ Cannot modify other owners' shops
- ❌ Cannot delete shops (admin only)

### Customer Can:
- ✅ View all approved shops
- ✅ Search shops by name
- ✅ View shop details
- ✅ See shop location
- ❌ Cannot modify shop
- ❌ Cannot create shop

### Admin Can:
- ✅ View all shops (approved and pending)
- ✅ Approve/reject shop registration
- ✅ Delete shops
- ✅ Manage shop information
- (Admin implementation: Phase 32)

---

## 🛠️ Step-by-Step Implementation

### Step 1: Create Location Class

```java
// File: src/main/java/com/kaserdokan/model/Location.java

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    private Double latitude;
    private Double longitude;
}
```

---

### Step 2: Create Shop Entity

```java
// File: src/main/java/com/kaserdokan/model/Shop.java

@Document(collection = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shop {
    @Id
    private String id;
    private String ownerId;
    private String shopName;
    private String description;
    private String phone;
    private String address;
    private Location location;
    private String openingTime;
    private String closingTime;
    private Boolean approved = false;
    private Boolean open = true;
    private Boolean deliveryAvailable = false;
    private Double rating = 0.0;
    private Integer ratingCount = 0;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### Step 3: Create Shop Repository

```java
// File: src/main/java/com/kaserdokan/repository/ShopRepository.java

@Repository
public interface ShopRepository extends MongoRepository<Shop, String> {
    Optional<Shop> findById(String id);
    List<Shop> findByOwnerId(String ownerId);
    List<Shop> findByShopNameContainingIgnoreCase(String name);
    List<Shop> findByApprovedTrue();
    Boolean existsByShopName(String shopName);
}
```

---

## 🧪 Testing Phase 3

### Test 1: Register Shop Owner
```
POST /api/shops/register/owner
{
  "ownerName": "Ali Khan",
  "phone": "01987654321",
  "email": "alikhang.shop@example.com",
  "password": "ShopPass123!",
  "confirmPassword": "ShopPass123!",
  "role": "SHOP_OWNER"
}
```

### Test 2: Add Shop Details
```
POST /api/shops/register/details
Header: Authorization: Bearer {token}
{
  "shopName": "Ali's Grocery",
  "address": "123 Main Street, Dhaka",
  "phone": "01234567890",
  "description": "Fresh produce and daily groceries",
  "openingTime": "08:00",
  "closingTime": "22:00",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "deliveryAvailable": true
}
```

### Test 3: Get All Shops
```
GET /api/shops
```

---

## 📊 Database Design

### shops Collection
```javascript
{
  _id: ObjectId,
  ownerId: String (FK -> users._id),
  shopName: String (unique),
  description: String,
  phone: String,
  address: String,
  location: {
    latitude: Double,
    longitude: Double
  },
  openingTime: String,
  closingTime: String,
  approved: Boolean,
  open: Boolean,
  deliveryAvailable: Boolean,
  rating: Double,
  ratingCount: Number,
  imageUrl: String,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Indexes
```
ownerId
shopName (unique)
location (for geospatial queries - Phase 4)
approved
```

---

## 🔄 Workflow

### Shop Registration Workflow
```
1. Owner fills personal info
   ↓
2. System creates user account
   ↓
3. System logs in owner
   ↓
4. Owner fills shop details
   ↓
5. System creates shop with approved=false
   ↓
6. Admin reviews (Phase 32)
   ↓
7. Admin approves
   ↓
8. Shop appears to customers
```

---

## ⚠️ Important Validations

```
✅ Shop name uniqueness
✅ Owner ID validity
✅ Phone number format
✅ Operating hours validity (closing > opening)
✅ Location coordinates validity
✅ Address not empty
✅ Owner can only modify own shops
✅ Only approved shops visible to customers
```

---

## 🚀 Quick Build Commands

```bash
# After implementing Phase 3

# Build
mvn clean install

# Run
mvn spring-boot:run

# Test (with Postman)
# Import: Create new Postman requests for shops

# Verify in MongoDB
mongosh
use kaser_dokan
db.shops.find().pretty()
```

---

## 📚 Files to Create/Modify

### Create (11 files):
- [ ] `model/Shop.java`
- [ ] `model/Location.java`
- [ ] `repository/ShopRepository.java`
- [ ] `dto/ShopRegistrationRequest.java`
- [ ] `dto/ShopDetailsRequest.java`
- [ ] `dto/ShopResponse.java`
- [ ] `service/ShopService.java`
- [ ] `controller/ShopController.java`
- [ ] `PHASE3_README.md`

### Modify (2 files):
- [ ] `application.properties` (if needed)
- [ ] `config/SecurityConfig.java` (add SHOP_OWNER authorization)

---

## 🎯 Success Criteria

Phase 3 is complete when:
- ✅ Shop entity created and working
- ✅ All CRUD operations implemented
- ✅ Shop owner registration (2-stage) working
- ✅ Owner can only modify own shops
- ✅ Customers can view approved shops
- ✅ All tests passing in Postman
- ✅ Database schema verified
- ✅ Error handling implemented
- ✅ Documentation complete

---

## 📋 Checklist for Phase 3 Start

- [ ] Phase 1 & 2 fully tested and working
- [ ] MongoDB running
- [ ] Application building without errors
- [ ] JWT authentication confirmed working
- [ ] Ready to add shop functionality

---

## 🔗 Related Phases

**Depends On:** Phase 1 ✅, Phase 2 ✅

**Enables:** Phase 4 (Geospatial Search)

**Future Dependencies:** 
- Phase 5: Products (needs shops)
- Phase 6: Orders (needs shops and products)
- Phase 32: Admin Approval (needs shops)

---

## 📞 Quick Reference

### Common Phase 3 Tasks

| Task | File | Method |
|------|------|--------|
| Create shop | ShopService | `createShop()` |
| Get shop | ShopService | `getShopById()` |
| Update shop | ShopService | `updateShop()` |
| Get owner shops | ShopService | `getShopsByOwnerId()` |
| Search shops | ShopService | `searchShops()` |
| Validate owner | ShopService | `validateOwnership()` |

---

## 🚀 Ready to Start Phase 3?

1. ✅ Save this file for reference
2. ✅ Review Shop entity structure above
3. ✅ Start with creating `model/Shop.java`
4. ✅ Follow the implementation order
5. ✅ Test each component with Postman

**Phase 3 will add ~1000 lines of code and 6 new endpoints.**

Good luck! 🎉

---

**Next Phase:** Phase 4 - Geospatial Search & Nearby Shops

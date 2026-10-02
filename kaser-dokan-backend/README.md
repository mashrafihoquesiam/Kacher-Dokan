# Kaser Dokan Backend - Phase 1: User Management

## Project Overview
Kaser Dokan is a hyperlocal grocery shopping application connecting customers with nearby local grocery shops.

**Phase 1 Status**: User Model, Registration, and CRUD Operations ✅

---

## Prerequisites
- Java 17+
- Maven 3.6+
- MongoDB (Running on localhost:27017)
- Postman (for API testing)

---

## Setup & Installation

### 1. Install MongoDB
**On Windows:**
```bash
# Download and install from: https://www.mongodb.com/try/download/community
# After installation, start MongoDB:
"C:\Program Files\MongoDB\Server\[version]\bin\mongod.exe"
```

**On Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**On Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### 2. Verify MongoDB is Running
```bash
mongosh  # or mongo
```
If you see a connection prompt, MongoDB is running.

### 3. Build the Project
```bash
cd kaser-dokan-backend
mvn clean install
```

### 4. Run the Application
```bash
mvn spring-boot:run
```

**Expected Output:**
```
Kaser Dokan Backend Application Started
Server running on http://localhost:8080/api
```

---

## API Testing with Postman

### 1. Import Collection
Create a new Postman collection called "Kaser Dokan Phase 1"

### 2. Test Endpoints

#### **A. Register a New User (Customer)**
- **Method:** POST
- **URL:** `http://localhost:8080/api/users/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Ahmed Rahman",
  "phone": "01912345678",
  "email": "ahmed@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "USER"
}
```
- **Expected Response:** `201 Created`
- **Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "name": "Ahmed Rahman",
    "email": "ahmed@example.com",
    "role": "USER",
    "createdAt": "2026-08-31T10:30:00"
  }
}
```

#### **B. Register a Shop Owner**
- **Method:** POST
- **URL:** `http://localhost:8080/api/users/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Ali Khan",
  "phone": "01987654321",
  "email": "shop@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "SHOP_OWNER"
}
```

#### **C. Get User by ID**
- **Method:** GET
- **URL:** `http://localhost:8080/api/users/{userId}`
- **Replace {userId} with the actual user ID from registration response**

#### **D. Get All Users**
- **Method:** GET
- **URL:** `http://localhost:8080/api/users`

#### **E. Update User Profile**
- **Method:** PUT
- **URL:** `http://localhost:8080/api/users/{userId}`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Ahmed Rahman Updated",
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

#### **F. Delete User**
- **Method:** DELETE
- **URL:** `http://localhost:8080/api/users/{userId}`

#### **G. Check if Email Exists**
- **Method:** GET
- **URL:** `http://localhost:8080/api/users/check/email?email=ahmed@example.com`

#### **H. Check if Phone Exists**
- **Method:** GET
- **URL:** `http://localhost:8080/api/users/check/phone?phone=01912345678`

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  email: String (unique),
  password: String (hashed with BCrypt),
  role: String (USER or SHOP_OWNER),
  latitude: Double,
  longitude: Double,
  active: Boolean,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Error Handling

### Common Errors & Solutions

**1. Email Already Exists**
```json
{
  "status": 400,
  "message": "Bad Request",
  "errors": {
    "error": "Email already exists"
  }
}
```
**Solution:** Use a different email address

**2. Passwords Don't Match**
```json
{
  "status": 400,
  "message": "Bad Request",
  "errors": {
    "error": "Passwords do not match"
  }
}
```
**Solution:** Ensure password and confirmPassword are identical

**3. Invalid Role**
```json
{
  "status": 400,
  "message": "Bad Request",
  "errors": {
    "error": "Invalid role. Must be USER or SHOP_OWNER"
  }
}
```
**Solution:** Use role: "USER" or role: "SHOP_OWNER"

**4. User Not Found**
```json
{
  "status": 404,
  "message": "Resource Not Found",
  "errors": {
    "error": "User not found with ID: 12345"
  }
}
```
**Solution:** Verify the user ID is correct

---

## Phase 1 Completion Checklist ✅
- [x] Spring Boot project setup
- [x] MongoDB connection configured
- [x] User model created
- [x] User repository with custom queries
- [x] User service with business logic
- [x] User controller with REST APIs
- [x] Password hashing with BCrypt
- [x] Exception handling
- [x] Input validation
- [x] API testing ready

---

## Next Phase: Phase 2 - Authentication & JWT
In Phase 2, we will:
1. Create JWT token generation and validation
2. Create login endpoint with JWT
3. Implement role-based access control
4. Secure endpoints with authentication

---

## Project Structure
```
kaser-dokan-backend/
├── src/main/java/com/kaserdokan/
│   ├── config/
│   │   ├── PasswordEncoderConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   └── UserController.java
│   ├── dto/
│   │   ├── UserRegistrationRequest.java
│   │   ├── UserResponse.java
│   │   └── UserUpdateRequest.java
│   ├── exception/
│   │   ├── BadRequestException.java
│   │   ├── ErrorResponse.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── ResourceNotFoundException.java
│   ├── model/
│   │   └── User.java
│   ├── repository/
│   │   └── UserRepository.java
│   ├── service/
│   │   └── UserService.java
│   └── KaserDokanApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

---

## Troubleshooting

### MongoDB Connection Error
```
Exception: Cannot connect to MongoDB
```
**Solution:**
1. Check MongoDB is running: `mongosh`
2. Verify `spring.data.mongodb.uri` in `application.properties`
3. Default: `mongodb://localhost:27017/kaser_dokan`

### Port Already in Use
```
Port 8080 is already in use
```
**Solution:**
```bash
# Change port in application.properties:
server.port=8081
```

### Build Failed
```bash
mvn clean install -DskipTests
```

---

## Contact & Support
For issues or questions, refer to the main project documentation.

**Happy Coding! 🚀**

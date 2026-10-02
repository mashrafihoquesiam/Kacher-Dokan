# Phase 2: Authentication & JWT Implementation

## Overview
Phase 2 implements JWT-based authentication for the Kaser Dokan application. This phase enables users to securely log in and access protected endpoints.

---

## What Was Added

### 1. JWT Token Provider (`JwtTokenProvider`)
- Generates JWT tokens with user email and role
- Validates JWT tokens
- Extracts claims (email, role) from tokens
- Handles token expiration

### 2. Custom User Details Service (`CustomUserDetailsService`)
- Loads user details from MongoDB by email
- Integrates with Spring Security
- Provides user information for authentication

### 3. JWT Authentication Filter (`JwtAuthenticationFilter`)
- Intercepts incoming HTTP requests
- Extracts JWT token from Authorization header
- Validates token and sets security context
- Allows authenticated user access to protected endpoints

### 4. Authentication Service (`AuthService`)
- Authenticates user credentials
- Generates JWT token on successful login
- Validates token
- Extracts user information from token

### 5. Authentication Controller (`AuthController`)
- Login endpoint: POST `/api/auth/login`
- Token validation endpoint: GET `/api/auth/validate`
- Current user endpoint: GET `/api/auth/me`

### 6. Updated Security Configuration (`SecurityConfig`)
- Configured JWT-based stateless authentication
- Set up authentication manager
- Defined public and protected endpoints
- Integrated JWT filter into security chain

---

## New API Endpoints

### 1. Login (Generate JWT Token)
**Endpoint:** `POST /api/auth/login`
**Access:** Public (No authentication required)

**Request:**
```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "email": "ahmed@example.com",
    "name": "Ahmed Rahman",
    "role": "USER",
    "expiresIn": 86400000
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": 400,
  "message": "Bad Request",
  "errors": {
    "error": "Invalid email or password"
  }
}
```

### 2. Validate Token
**Endpoint:** `GET /api/auth/validate`
**Access:** Public (sends token in header)
**Header:** `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "email": "ahmed@example.com"
}
```

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`
**Access:** Protected (requires valid JWT token)
**Header:** `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "email": "ahmed@example.com"
}
```

---

## Updated Endpoints Security

### Public Endpoints (No Authentication Required)
```
POST   /api/users/register        - Register new user
POST   /api/auth/login            - Login and get token
GET    /api/users/check/email     - Check email existence
GET    /api/users/check/phone     - Check phone existence
GET    /api/users/health          - Health check
```

### Protected Endpoints (JWT Token Required)
```
GET    /api/users                 - Get all users
GET    /api/users/{id}            - Get user by ID
GET    /api/users/email/{email}   - Get user by email
PUT    /api/users/{id}            - Update user
DELETE /api/users/{id}            - Delete user
GET    /api/auth/validate         - Validate token
GET    /api/auth/me               - Get current user
```

---

## Testing Phase 2

### Step 1: Register a User
First, register a test user:

**Endpoint:** `POST http://localhost:8080/api/users/register`

**Body:**
```json
{
  "name": "Test User",
  "phone": "01912345678",
  "email": "test@example.com",
  "password": "TestPass123!",
  "confirmPassword": "TestPass123!",
  "role": "USER"
}
```

**Expected Response:** 201 Created

---

### Step 2: Login User
Login with the registered credentials:

**Endpoint:** `POST http://localhost:8080/api/auth/login`

**Body:**
```json
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**Expected Response:** 200 OK

**Response Body:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "email": "test@example.com",
    "name": "Test User",
    "role": "USER",
    "expiresIn": 86400000
  }
}
```

**⚠️ IMPORTANT:** Save the `accessToken` - you'll need it for protected endpoints.

---

### Step 3: Access Protected Endpoint
Use the token to access protected endpoints:

**Endpoint:** `GET http://localhost:8080/api/users/{userId}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
Content-Type: application/json
```

**Expected Response:** 200 OK

---

### Step 4: Test Invalid Token
Try accessing with an invalid token:

**Endpoint:** `GET http://localhost:8080/api/users`

**Headers:**
```
Authorization: Bearer invalid_token_here
```

**Expected Response:** 403 Forbidden
```json
{
  "status": 403,
  "message": "Forbidden"
}
```

---

### Step 5: Test Token Validation
Validate your token:

**Endpoint:** `GET http://localhost:8080/api/auth/validate`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "valid": true,
  "email": "test@example.com"
}
```

---

## Postman Setup for Phase 2

### 1. Import Collection
Import the updated Postman collection file.

### 2. Set Environment Variables
In Postman, create an environment with these variables:

**Variable Name:** `base_url`
**Value:** `http://localhost:8080/api`

**Variable Name:** `token`
**Value:** (Will be set after login)

### 3. Create Pre-request Script
In the login request, add a pre-request script:
```javascript
// None needed
```

### 4. Create Test Script
In the login request, add this test script (Post-response):
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.accessToken);
    console.log("Token saved:", jsonData.data.accessToken);
}
```

### 5. Use Token in Requests
For protected endpoints, set header:
```
Authorization: Bearer {{token}}
```

---

## JWT Token Structure

### Header
```json
{
  "alg": "HS512",
  "typ": "JWT"
}
```

### Payload
```json
{
  "sub": "ahmed@example.com",  // Subject (email)
  "role": "USER",              // User role
  "iat": 1693390200,           // Issued at
  "exp": 1693476600            // Expires at
}
```

### Signature
```
HMACSHA512(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

---

## Error Handling

### Authentication Errors

**1. Invalid Credentials**
```json
{
  "status": 400,
  "message": "Bad Request",
  "errors": {
    "error": "Invalid email or password"
  }
}
```

**2. User Not Found**
```json
{
  "status": 404,
  "message": "Resource Not Found",
  "errors": {
    "error": "User not found with email: test@example.com"
  }
}
```

**3. Missing Authorization Header**
```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

**4. Invalid Token Format**
```json
{
  "status": 403,
  "message": "Forbidden"
}
```

---

## Configuration

All JWT settings are in `application.properties`:

```properties
# JWT Secret (change in production!)
jwt.secret=kaserdokan_secret_key_for_jwt_token_generation_in_2026_please_change_in_production

# Token expiration in milliseconds (24 hours)
jwt.expiration=86400000
```

⚠️ **IMPORTANT FOR PRODUCTION:**
- Change the `jwt.secret` to a very long, random string
- Store in environment variable, not hardcoded
- Use HTTPS to encrypt tokens in transit
- Implement token refresh mechanism

---

## Security Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login
       │    (email, password)
       ▼
┌─────────────────────────┐
│ AuthController.login()  │
└──────┬──────────────────┘
       │ 2. Authenticate
       ▼
┌──────────────────────────────────┐
│ AuthenticationManager            │
│  → CustomUserDetailsService      │
│  → Password comparison (BCrypt)  │
└──────┬───────────────────────────┘
       │ 3. If valid
       ▼
┌──────────────────────────────────┐
│ JwtTokenProvider                 │
│  → Generate JWT token            │
│  → Sign with secret key          │
└──────┬───────────────────────────┘
       │ 4. Return token
       ▼
┌─────────────┐
│   Client    │  (stores token)
└──────┬──────┘
       │
       │ 5. GET /api/users
       │    Header: Authorization: Bearer token
       ▼
┌──────────────────────────────────┐
│ JwtAuthenticationFilter          │
│  → Extract token from header     │
│  → Validate signature            │
│  → Check expiration              │
└──────┬───────────────────────────┘
       │ 6. If valid
       ▼
┌──────────────────────────────────┐
│ SecurityContext                  │
│  → Set authenticated principal   │
│  → Set user role/authorities     │
└──────┬───────────────────────────┘
       │ 7. Allow access
       ▼
┌──────────────────────────────────┐
│ UserController                   │
│  → Process request               │
│  → Return response               │
└──────────────────────────────────┘
```

---

## Phase 2 Completion Checklist

- [x] JWT Token Provider implemented
- [x] Custom User Details Service created
- [x] JWT Authentication Filter created
- [x] Login endpoint implemented
- [x] Authentication Service created
- [x] Security Configuration updated
- [x] Protected endpoints secured
- [x] Token validation implemented
- [x] Error handling for auth failures
- [x] Documentation created

---

## Important Notes

### Token Expiration
- Tokens expire after 24 hours (86400000 ms)
- After expiration, user must login again
- In future phases, implement refresh token mechanism

### Role-Based Access
- Currently supports two roles: `USER` and `SHOP_OWNER`
- More roles (e.g., `ADMIN`) can be added in Phase 3
- Role is encoded in JWT token

### Password Security
- Passwords are never sent in responses
- Passwords are hashed with BCrypt
- Original password only stored in DB

### Token Storage
- Client (mobile app) should store token securely
- On React Native: Use secure storage (e.g., expo-secure-store)
- Never store in localStorage on web
- Always send via HTTPS in production

---

## Next Steps: Phase 3

Phase 3 will implement:
1. Shop entity and model
2. Shop owner registration (two-stage)
3. Shop CRUD operations
4. Shop location management
5. Admin approval system for shops

---

**Phase 2 Complete! ✅**

*Ready to proceed to Phase 3: Shop Management*

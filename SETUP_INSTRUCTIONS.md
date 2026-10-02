# Kaser Dokan - Complete Setup Instructions

## Phase 1: User Management System

This document provides complete step-by-step instructions to set up and run the Kaser Dokan backend for Phase 1.

---

## 📋 Requirements
- **Operating System:** Windows, Mac, or Linux
- **Java:** Version 17 or higher
- **Maven:** Version 3.6 or higher
- **MongoDB:** Latest community edition
- **Postman:** For API testing (optional but recommended)
- **IDE:** VS Code, IntelliJ IDEA, or Eclipse (optional)

---

## Step 1: Install Java 17

### Windows
1. Download from: https://www.oracle.com/java/technologies/downloads/#java17
2. Run the installer and follow the wizard
3. Verify installation:
```bash
java -version
javac -version
```

### Mac
```bash
brew install openjdk@17
```

### Linux
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

---

## Step 2: Install Maven

### Windows
1. Download from: https://maven.apache.org/download.cgi
2. Extract to a folder (e.g., C:\Maven)
3. Add to environment variables:
   - Variable name: `MAVEN_HOME`
   - Value: `C:\Maven\apache-maven-3.x.x`
4. Add to PATH: `%MAVEN_HOME%\bin`
5. Verify:
```bash
mvn -v
```

### Mac
```bash
brew install maven
mvn -v
```

### Linux
```bash
sudo apt install maven
mvn -v
```

---

## Step 3: Install MongoDB

### Windows
1. Download Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer with default settings
3. Start MongoDB:
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`
   - Or run directly: `"C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe"`

### Mac
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux
```bash
curl https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

### Verify MongoDB Installation
```bash
mongosh
```
If you see `>` prompt, MongoDB is running. Exit with `exit()`.

---

## Step 4: Clone/Setup Project

### Option A: If using Git
```bash
cd Desktop
git clone <repository-url>
cd kaser-dokan-backend
```

### Option B: Direct folder setup
1. Navigate to: `c:\Users\user\Desktop\kaser dokan\kaser-dokan-backend`
2. You should see `pom.xml`, `src/`, `README.md`

---

## Step 5: Build the Project

Open terminal/command prompt and navigate to the project folder:

```bash
cd "c:\Users\user\Desktop\kaser dokan\kaser-dokan-backend"
```

Build the project:
```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the code
- Run tests (if any)

**Expected output:**
```
BUILD SUCCESS
Total time: XX.XXX s
```

If you see errors, check:
1. Java version: `java -version` (should be 17+)
2. Maven installation: `mvn -v`
3. MongoDB running

---

## Step 6: Run the Application

```bash
mvn spring-boot:run
```

**Expected output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.5)

2026-08-31 10:30:00.000  INFO 12345 --- [  main] com.kaserdokan.KaserDokanApplication    : Starting KaserDokanApplication v1.0.0
2026-08-31 10:30:02.000  INFO 12345 --- [  main] com.kaserdokan.KaserDokanApplication    : Started KaserDokanApplication in 2.5 seconds (JVM running for 3.2s)
```

**Server is now running on:** `http://localhost:8080/api`

---

## Step 7: Test the Application

### Option A: Using Postman (Recommended)

1. **Download Postman:** https://www.postman.com/downloads/
2. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select: `Kaser_Dokan_Phase1.postman_collection.json`
3. **Set Variables:**
   - Go to "Variables" tab
   - Replace `{{userId}}` with an actual user ID from registration

### Option B: Using curl (Terminal)

#### Register a User
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Rahman",
    "phone": "01912345678",
    "email": "ahmed@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "USER"
  }'
```

#### Get All Users
```bash
curl -X GET http://localhost:8080/api/users
```

#### Get User by ID
```bash
curl -X GET http://localhost:8080/api/users/USER_ID_HERE
```

---

## Step 8: Test Workflow

### 1. Register Customer User
**Endpoint:** POST `/api/users/register`

**Request:**
```json
{
  "name": "Ahmed Rahman",
  "phone": "01912345678",
  "email": "ahmed.rahman@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "USER"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "64f3a1b2c5d6e7f8g9h0i1j2",
    "name": "Ahmed Rahman",
    "phone": "01912345678",
    "email": "ahmed.rahman@example.com",
    "role": "USER",
    "latitude": null,
    "longitude": null,
    "active": true,
    "createdAt": "2026-08-31T10:30:00",
    "updatedAt": "2026-08-31T10:30:00"
  }
}
```

**Save the ID** for next tests.

### 2. Register Shop Owner
**Endpoint:** POST `/api/users/register`

**Request:**
```json
{
  "name": "Ali Khan",
  "phone": "01987654321",
  "email": "alikhang.shop@example.com",
  "password": "ShopPass456!",
  "confirmPassword": "ShopPass456!",
  "role": "SHOP_OWNER"
}
```

### 3. Get User by ID
**Endpoint:** GET `/api/users/{id}`

Replace `{id}` with the ID from registration:
```
http://localhost:8080/api/users/64f3a1b2c5d6e7f8g9h0i1j2
```

### 4. Update User Location
**Endpoint:** PUT `/api/users/{id}`

**Request:**
```json
{
  "name": "Ahmed Rahman",
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

### 5. Delete User
**Endpoint:** DELETE `/api/users/{id}`

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed
```
Exception: Unable to connect to MongoDB
```

**Solution:**
1. Check if MongoDB is running:
   ```bash
   mongosh
   ```
2. Verify connection URI in `application.properties`:
   ```
   spring.data.mongodb.uri=mongodb://localhost:27017/kaser_dokan
   ```
3. Restart MongoDB:
   - Windows: `net stop MongoDB` then `net start MongoDB`
   - Mac: `brew services restart mongodb-community`
   - Linux: `sudo systemctl restart mongod`

### Issue: Port 8080 Already in Use
```
Address already in use: bind
```

**Solution:**
1. Edit `application.properties`:
   ```
   server.port=8081
   ```
2. Or kill the process using port 8080:
   - Windows: `netstat -ano | findstr :8080`
   - Mac/Linux: `lsof -i :8080` and `kill -9 PID`

### Issue: Build Fails - Maven Not Found
```
'mvn' is not recognized
```

**Solution:**
1. Verify Maven installation: `mvn -v`
2. Add Maven to PATH:
   - Windows: `set PATH=%PATH%;C:\Maven\bin`
   - Mac/Linux: `export PATH=$PATH:/usr/local/Cellar/maven/X.X.X/bin`

### Issue: Java Version Error
```
Unsupported class version 61.0
```

**Solution:**
- Your Java version is too old
- Install Java 17+: `java -version`
- Update `JAVA_HOME` environment variable

### Issue: Validation Error on Registration
```
"error": "Passwords do not match"
```

**Solution:**
- Ensure `password` and `confirmPassword` are identical
- Check for extra spaces or typos

---

## 📚 Project Structure

```
kaser-dokan-backend/
│
├── src/main/java/com/kaserdokan/
│   ├── config/                      # Spring configurations
│   │   ├── PasswordEncoderConfig.java
│   │   └── SecurityConfig.java
│   │
│   ├── controller/                  # REST API endpoints
│   │   └── UserController.java
│   │
│   ├── dto/                         # Data Transfer Objects
│   │   ├── UserRegistrationRequest.java
│   │   ├── UserResponse.java
│   │   └── UserUpdateRequest.java
│   │
│   ├── exception/                   # Exception handling
│   │   ├── BadRequestException.java
│   │   ├── ErrorResponse.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── ResourceNotFoundException.java
│   │
│   ├── model/                       # MongoDB entities
│   │   └── User.java
│   │
│   ├── repository/                  # Data access layer
│   │   └── UserRepository.java
│   │
│   ├── service/                     # Business logic
│   │   └── UserService.java
│   │
│   └── KaserDokanApplication.java   # Main application class
│
├── src/main/resources/
│   └── application.properties       # Configuration file
│
├── pom.xml                          # Maven dependencies
├── README.md                        # Project documentation
└── .gitignore                       # Git ignore rules
```

---

## 📋 API Summary - Phase 1

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/users/register` | Register new user | 201 Created |
| GET | `/users` | Get all users | 200 OK |
| GET | `/users/{id}` | Get user by ID | 200 OK |
| GET | `/users/email/{email}` | Get user by email | 200 OK |
| PUT | `/users/{id}` | Update user | 200 OK |
| DELETE | `/users/{id}` | Delete user | 200 OK |
| GET | `/users/check/email` | Check if email exists | 200 OK |
| GET | `/users/check/phone` | Check if phone exists | 200 OK |

---

## ✅ Phase 1 Checklist

- [ ] Java 17 installed and verified
- [ ] Maven installed and verified
- [ ] MongoDB installed and running
- [ ] Project built successfully
- [ ] Application starts without errors
- [ ] Can register user via API
- [ ] Can retrieve user via API
- [ ] Can update user via API
- [ ] Can delete user via API
- [ ] Password hashing working (MongoDB shows hashed passwords)
- [ ] All validation rules enforced
- [ ] Postman collection imported

---

## 🚀 Next Steps

Once Phase 1 is complete and all tests pass:

1. **Phase 2: Authentication & JWT**
   - Implement login endpoint
   - Create JWT token generation
   - Add role-based authorization

2. Continue with subsequent phases as outlined in the main build prompt

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Review the Troubleshooting section above
3. Verify all prerequisites are installed
4. Ensure MongoDB is running
5. Check application logs in terminal

**Congratulations! You've successfully set up Kaser Dokan Phase 1!** 🎉

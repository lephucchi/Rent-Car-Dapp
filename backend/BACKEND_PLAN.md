# KẾ HOẠCH CHI TIẾT HOÀN THIỆN BACKEND
## Rent Car DApp - Node.js + Express + TypeScript + Supabase

---

## 🎯 **MỤC TIÊU TỔNG QUAN**
Phát triển backend API cho ứng dụng thuê xe DApp với các chức năng:
- Authentication & Authorization
- CRUD operations cho Cars, Users, Contracts
- Tích hợp với Smart Contract
- Event listening từ blockchain
- Email verification & notifications

---

## 📋 **PHASE 1: DATABASE SETUP (✅ HOÀN THÀNH)**
### ✅ Đã tạo migration files cho Supabase
- [x] Users table với 4 loại người dùng
- [x] Cars table với thông tin xe
- [x] Contracts table liên kết với smart contract
- [x] Contract_events table theo dõi blockchain events
- [x] Functions, triggers và views

### 🔄 **Bước tiếp theo:**
1. Setup Supabase project
2. Chạy migrations theo thứ tự
3. Verify database schema

---

## 📋 **PHASE 2: BACKEND SETUP & STRUCTURE**

### **2.1 Project Initialization**
```bash
# Bước 1: Initialize Node.js project
cd backend
npm init -y

# Bước 2: Install dependencies
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install @supabase/supabase-js nodemailer multer express-rate-limit
npm install ethers express-validator class-validator

# Bước 3: Install TypeScript & dev dependencies  
npm install -D typescript @types/node @types/express @types/cors
npm install -D @types/bcryptjs @types/jsonwebtoken @types/nodemailer
npm install -D @types/multer ts-node nodemon
```

### **2.2 TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **2.3 Project Structure**
```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── car.controller.ts
│   │   ├── contract.controller.ts
│   │   └── blockchain.controller.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── car.routes.ts
│   │   ├── contract.routes.ts
│   │   └── blockchain.routes.ts
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── car.service.ts
│   │   ├── contract.service.ts
│   │   ├── blockchain.service.ts
│   │   ├── email.service.ts
│   │   └── storage.service.ts
│   ├── models/             # Data models & DTOs
│   │   ├── user.model.ts
│   │   ├── car.model.ts
│   │   ├── contract.model.ts
│   │   └── api-response.model.ts
│   ├── config/             # Configuration
│   │   ├── database.ts
│   │   ├── blockchain.ts
│   │   ├── email.ts
│   │   └── storage.ts
│   ├── utils/              # Utilities
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── logger.ts
│   ├── types/              # TypeScript types
│   │   ├── user.types.ts
│   │   ├── car.types.ts
│   │   ├── contract.types.ts
│   │   └── blockchain.types.ts
│   └── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── uploads/                # File uploads
├── logs/                   # Application logs
├── migrations/             # Database migrations (✅ Done)
├── package.json
├── tsconfig.json
└── .env
```

---

## 📋 **PHASE 3: CORE IMPLEMENTATION**

### **3.1 Authentication System (Priority: HIGH)**
#### **Features:**
- [x] JWT-based authentication
- [x] Email verification
- [x] Password reset
- [x] Role-based authorization (renter, lessor, insurance, admin)

#### **Implementation Steps:**
1. **Setup JWT & bcrypt utilities**
2. **Create auth middleware**
3. **Implement registration with email verification**
4. **Implement login/logout**
5. **Password reset functionality**
6. **Role-based access control**

### **3.2 User Management (Priority: HIGH)**
#### **Features:**
- [x] CRUD operations cho users
- [x] Profile management
- [x] Wallet address linking
- [x] User verification status

#### **API Endpoints:**
```typescript
// User Routes
GET    /api/users/profile              // Get current user profile
PUT    /api/users/profile              // Update profile
POST   /api/users/link-wallet          // Link wallet address
GET    /api/users/dashboard            // User dashboard data
GET    /api/users                      // Admin: List all users
PUT    /api/users/:id/verify           // Admin: Verify user
```

### **3.3 Car Management (Priority: HIGH)**
#### **Features:**
- [x] CRUD operations cho cars
- [x] Image upload
- [x] Search & filtering
- [x] Availability management

#### **API Endpoints:**
```typescript
// Car Routes  
GET    /api/cars                       // List available cars
GET    /api/cars/:id                   // Get car details
POST   /api/cars                       // Create new car (lessor only)
PUT    /api/cars/:id                   // Update car (owner only)
DELETE /api/cars/:id                   // Delete car (owner only)
POST   /api/cars/:id/images            // Upload car images
GET    /api/cars/search                // Search cars with filters
```

---

## 📋 **PHASE 4: BLOCKCHAIN INTEGRATION**

### **4.1 Smart Contract Integration (Priority: CRITICAL)**
#### **Features:**
- [x] Deploy smart contract cho mỗi rental
- [x] Listen blockchain events
- [x] Sync contract state với database
- [x] Handle transaction failures

#### **Implementation:**
```typescript
// Blockchain Service Functions
1. deployRentalContract()     // Deploy new contract
2. listenContractEvents()     // Event listener
3. syncContractState()        // Sync với database
4. handleTransactionError()   // Error handling
```

### **4.2 Contract Management (Priority: CRITICAL)**
#### **Features:**
- [x] Create rental contracts
- [x] Track contract lifecycle
- [x] Handle returns & damage assessment
- [x] Payment processing

#### **API Endpoints:**
```typescript
// Contract Routes
POST   /api/contracts                  // Create new contract
GET    /api/contracts                  // List user contracts
GET    /api/contracts/:id              // Get contract details
PUT    /api/contracts/:id/start        // Start rental
PUT    /api/contracts/:id/return       // Request return
PUT    /api/contracts/:id/confirm      // Confirm return
PUT    /api/contracts/:id/damage       // Report damage
PUT    /api/contracts/:id/assess       // Assess damage
POST   /api/contracts/:id/complete     // Complete rental
```

---

## 📋 **PHASE 5: ADVANCED FEATURES**

### **5.1 Event Listening & Sync (Priority: MEDIUM)**
#### **Features:**
- [x] Real-time blockchain event monitoring
- [x] Automatic database sync
- [x] Event notification system
- [x] Error recovery mechanisms

### **5.2 File Upload & Storage (Priority: MEDIUM)**
#### **Features:**
- [x] Car image upload to Supabase Storage
- [x] Profile image upload
- [x] Document upload (driver's license, etc.)
- [x] Image resizing & optimization

### **5.3 Email Notifications (Priority: MEDIUM)**
#### **Features:**
- [x] Registration confirmation
- [x] Contract status updates
- [x] Payment reminders
- [x] Damage reports

### **5.4 Analytics & Reporting (Priority: LOW)**
#### **Features:**
- [x] Revenue tracking cho lessors
- [x] Usage statistics
- [x] Popular cars reporting
- [x] Admin dashboard metrics

---

## 📋 **PHASE 6: TESTING & DEPLOYMENT**

### **6.1 Testing (Priority: HIGH)**
- [x] Unit tests cho services
- [x] Integration tests cho APIs
- [x] Blockchain interaction tests
- [x] E2E testing

### **6.2 Security & Performance (Priority: HIGH)**
- [x] Input validation & sanitization
- [x] Rate limiting
- [x] SQL injection protection
- [x] API response optimization
- [x] Database query optimization

### **6.3 Deployment (Priority: MEDIUM)**
- [x] Environment configuration
- [x] CI/CD pipeline setup
- [x] Server deployment (Heroku/Vercel/AWS)
- [x] Database backups
- [x] Monitoring & logging

---

## 🚀 **EXECUTION TIMELINE**

### **Week 1: Foundation (Phase 1-2)**
- [x] Database setup & migrations ✅
- [x] Project structure & dependencies
- [x] Basic Express server setup
- [x] TypeScript configuration

### **Week 2: Core Features (Phase 3)**
- [x] Authentication system
- [x] User management
- [x] Car management
- [x] Basic API endpoints

### **Week 3: Blockchain (Phase 4)**
- [x] Smart contract integration
- [x] Contract management
- [x] Event listening
- [x] Transaction handling

### **Week 4: Advanced Features (Phase 5)**
- [x] File upload system
- [x] Email notifications
- [x] Real-time updates
- [x] Error handling

### **Week 5: Polish & Deploy (Phase 6)**
- [x] Testing & debugging
- [x] Security hardening
- [x] Performance optimization
- [x] Production deployment

---

## 📝 **NEXT IMMEDIATE ACTIONS**

### **1. Database Setup (Today)**
```bash
# Setup Supabase project
1. Tạo project trên supabase.com
2. Chạy migrations đã tạo
3. Configure RLS policies
4. Test connection
```

### **2. Backend Initialization (Tomorrow)**
```bash
# Initialize backend project
cd backend
npm init -y
# Install dependencies theo danh sách trên
# Setup TypeScript
# Create basic folder structure
```

### **3. Start Development (This Week)**
```bash
# Implement theo thứ tự:
1. Basic Express server
2. Supabase connection
3. Authentication routes
4. User management
5. Car management
```

---

## 💡 **TECHNICAL DECISIONS**

### **Framework & Libraries:**
- **Backend:** Node.js + Express.js + TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + bcrypt
- **Blockchain:** ethers.js
- **Email:** Nodemailer
- **File Upload:** Multer + Supabase Storage
- **Validation:** express-validator

### **Architecture Pattern:**
- **MVC Pattern** với service layer
- **Repository Pattern** cho database operations
- **Middleware-based** authentication & validation
- **Event-driven** blockchain integration

Bạn có muốn tôi bắt đầu implement bất kỳ phase nào cụ thể không?

# 🚗 Rent Car DApp - Backend API

Backend API cho ứng dụng thuê xe blockchain sử dụng Node.js, Express.js, TypeScript và Supabase.

## 🏗️ **ARCHITECTURE**

Cấu trúc backend tuân theo pattern: **Routes → Controllers → Services → Models**

```
src/
├── controllers/        # Request handlers
├── services/          # Business logic
├── models/            # Database interactions
├── routes/            # API routing
├── middleware/        # Custom middleware
├── utils/             # Utilities & helpers
├── types/             # TypeScript types
├── config/            # Configuration files
├── app.ts             # Express app setup
└── server.ts          # Server entry point
```

## 🚀 **QUICK START**

### **1. Prerequisites**
- Node.js 18+ 
- TypeScript
- Supabase project với database đã setup

### **2. Installation**
```bash
# Clone repository
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### **3. Environment Configuration**
Cập nhật file `.env` với thông tin của bạn:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### **4. Database Setup**
Đảm bảo đã chạy migrations trong folder `migrations/` trên Supabase Dashboard.

### **5. Start Development Server**
```bash
# Development with hot reload
npm run dev

# Build for production
npm run build
npm start
```

## 📋 **API ENDPOINTS**

### **Authentication & Users** - `/api/auth`

#### **Public Routes:**
```http
POST   /api/auth/register           # Đăng ký user mới
POST   /api/auth/login              # Đăng nhập  
GET    /api/auth/verify/:token      # Xác minh email
POST   /api/auth/forgot-password    # Quên mật khẩu
POST   /api/auth/reset-password     # Reset mật khẩu
```

#### **Authenticated Routes:**
```http
GET    /api/auth/profile            # Lấy profile user
PUT    /api/auth/profile            # Cập nhật profile
POST   /api/auth/link-wallet        # Liên kết ví blockchain
GET    /api/auth/dashboard          # Dashboard data
POST   /api/auth/change-password    # Đổi mật khẩu
POST   /api/auth/refresh-token      # Refresh JWT
POST   /api/auth/logout             # Đăng xuất
DELETE /api/auth/account            # Xóa tài khoản
```

#### **Admin Routes:**
```http
GET    /api/auth/users/:type        # Lấy users theo loại
PUT    /api/auth/users/:id/verify   # Xác minh user (admin)
GET    /api/auth/stats              # Thống kê users
```

### **Cars Management** - `/api/cars`

#### **Public Routes:**
```http
GET    /api/cars                    # Lấy tất cả xe available
GET    /api/cars/search             # Search xe với filters
GET    /api/cars/popular            # Xe phổ biến
GET    /api/cars/:id                # Chi tiết xe
GET    /api/cars/:id/availability   # Kiểm tra available
GET    /api/cars/lessor/:lessorId   # Xe của lessor
```

#### **Lessor Routes:**
```http
POST   /api/cars                    # Tạo xe mới
GET    /api/cars/my/cars            # Xe của tôi
GET    /api/cars/my/stats           # Thống kê xe
PUT    /api/cars/:id                # Cập nhật xe
DELETE /api/cars/:id                # Xóa xe
PATCH  /api/cars/:id/status         # Cập nhật status xe
POST   /api/cars/:id/images         # Upload ảnh xe
```

## 🔐 **AUTHENTICATION**

### **JWT Token Authentication**
```http
Authorization: Bearer <jwt_token>
```

### **User Roles:**
- **renter**: Người thuê xe
- **lessor**: Người cho thuê xe  
- **insurance**: Bên bảo hiểm/định giá
- **admin**: Quản trị viên

### **Role-based Access Control:**
```typescript
// Middleware examples
requireAuth        // Bất kỳ user đã đăng nhập
requireAdmin       // Chỉ admin
requireLessor      // Lessor hoặc admin
requireInsurance   // Insurance hoặc admin
requireRenter      // Renter hoặc admin
```

## 📊 **API RESPONSE FORMAT**

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error message", 
  "error": "Detailed error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **Paginated Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🛡️ **SECURITY FEATURES**

### **Rate Limiting:**
- General API: 100 requests/15 minutes
- Auth endpoints: 20 requests/15 minutes

### **Input Validation:**
- express-validator cho tất cả inputs
- Sanitization để prevent XSS
- Type checking với TypeScript

### **Security Headers:**
- Helmet.js cho security headers
- CORS configuration
- JWT với expiration

## 🔄 **ERROR HANDLING**

### **Global Error Handler:**
```typescript
// Tự động detect error types
401 - Unauthorized (invalid token, credentials)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource không tồn tại)
409 - Conflict (email exists, duplicate data)
400 - Bad Request (validation errors)
500 - Internal Server Error
```

## 📁 **PROJECT STRUCTURE DETAILS**

### **Controllers Layer:**
```typescript
// auth.controller.ts
export class AuthController {
  static async register(req, res, next) { ... }
  static async login(req, res, next) { ... }
}
```

### **Services Layer:**
```typescript
// auth.service.ts  
export class AuthService {
  static async register(userData) { ... }
  static async login(email, password) { ... }
}
```

### **Models Layer:**
```typescript
// user.model.ts
export class UserModel {
  static async create(userData) { ... }
  static async findByEmail(email) { ... }
}
```

### **Routes Layer:**
```typescript
// auth.routes.ts
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
```

## 🛠️ **DEVELOPMENT**

### **Available Scripts:**
```bash
npm run dev          # Development với hot reload
npm run build        # Build TypeScript
npm start           # Start production server
npm run clean       # Clean build files
```

### **Code Structure:**
- **TypeScript** cho type safety
- **ESLint** cho code quality
- **Prettier** cho code formatting
- **Modular architecture** cho maintainability

## 🚀 **DEPLOYMENT**

### **Environment Variables:**
Đảm bảo tất cả env vars được set:
- SUPABASE_* keys
- JWT_SECRET  
- NODE_ENV=production

### **Build & Deploy:**
```bash
npm run build
npm start
```

## 📝 **NEXT STEPS**

### **Phase 4: Blockchain Integration** (Coming Next)
- Contract deployment service
- Event listening từ blockchain  
- Transaction handling
- Smart contract interaction

### **Phase 5: Advanced Features**
- File upload cho car images
- Email notification service
- Real-time updates với WebSocket
- Analytics & reporting

---

## 🤝 **CONTRIBUTING**

1. Tuân theo cấu trúc Routes → Controllers → Services → Models
2. Thêm validation cho tất cả inputs
3. Write TypeScript types cho data structures
4. Test tất cả endpoints trước khi commit
5. Update documentation cho API changes

**Status:** ✅ Authentication & User Management hoàn thành | ✅ Car Management hoàn thành | 🔄 Contract Management đang phát triển

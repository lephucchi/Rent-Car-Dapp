# Car Rental DApp - Authentication System

## Overview
The Car Rental DApp implements a comprehensive JWT-based authentication system with role-based access control (RBAC), MetaMask integration, and admin management features.

## Key Features

### 🔐 Core Authentication
- **JWT Token-based Authentication**: Secure stateless authentication using JSON Web Tokens
- **Password Hashing**: bcrypt encryption for secure password storage
- **User Registration & Login**: Standard email/password authentication
- **Token Refresh**: Endpoint to refresh access tokens without re-login
- **Password Management**: Secure password change functionality

### 👤 User Management
- **User Profiles**: Complete user information with display names
- **Account Status**: Active/inactive user management
- **Role-based Access**: Support for user, admin, and inspector roles
- **MetaMask Integration**: Connect and manage Ethereum wallet addresses

### 🛡️ Security Features
- **Input Validation**: Comprehensive request validation with Pydantic schemas
- **Password Policies**: Minimum length requirements and validation
- **Protected Endpoints**: Secure routes requiring authentication
- **Role-based Authorization**: Different access levels for different user types

### 🔧 Admin Features
- **User Management**: View, activate, deactivate users
- **Role Management**: Change user roles (user, admin, inspector)
- **User Statistics**: Comprehensive dashboard metrics
- **Account Deletion**: Safe user account removal with protection

## API Endpoints

### Authentication (`/api/v1/auth`)
```
POST   /register              - Register new user
POST   /login                 - User login
GET    /me                    - Get current user info
POST   /refresh-token         - Refresh access token
POST   /change-password       - Change user password
POST   /logout                - Logout (client-side)
POST   /connect-metamask      - Connect MetaMask wallet
POST   /disconnect-metamask   - Disconnect MetaMask wallet
POST   /deactivate-account    - Deactivate user account
```

### Admin Management (`/api/v1/admin`)
```
GET    /users                 - Get all users (paginated)
GET    /users/{user_id}       - Get user by ID
POST   /users/{user_id}/activate      - Activate user account
POST   /users/{user_id}/deactivate    - Deactivate user account
POST   /users/{user_id}/change-role   - Change user role
DELETE /users/{user_id}               - Delete user account
GET    /stats                         - Get user statistics
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    wallet_address VARCHAR(42) UNIQUE,
    metamask_address VARCHAR(42) UNIQUE,
    role VARCHAR(20) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Indexes
- `idx_users_username` - Username lookup
- `idx_users_email` - Email lookup
- `idx_users_wallet_address` - Wallet address lookup
- `idx_users_metamask_address` - MetaMask address lookup
- `idx_users_role` - Role-based queries
- `idx_users_active` - Active status filtering

## User Roles

### 👤 User (`user`)
- Default role for new registrations
- Access to personal profile and basic endpoints
- Can connect MetaMask wallet
- Can change own password and deactivate account

### 👨‍💼 Admin (`admin`)
- Full system access
- User management capabilities
- Can view system statistics
- Can change user roles and manage accounts
- Cannot delete or change own admin role (safety protection)

### 🔍 Inspector (`inspector`)
- Intermediate role for contract inspection
- Can access inspection-related endpoints
- Future extension for rental contract validation

## Security Implementation

### JWT Configuration
```python
JWT_SECRET_KEY = "your-secret-key"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 1440  # 24 hours
```

### Password Security
- Minimum 6 characters
- bcrypt hashing with salt
- Current password verification for changes

### MetaMask Integration
- Ethereum address validation (0x + 40 hex chars)
- Case-insensitive storage (lowercase)
- Unique constraint per address
- Connection/disconnection endpoints

## Testing Examples

### Register New User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "display_name": "Test User"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Admin - Get User Statistics
```bash
curl -X GET "http://localhost:8000/api/v1/admin/stats" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user not found)
- `422` - Unprocessable Entity (validation errors)

### Example Error Response
```json
{
  "detail": "Invalid credentials"
}
```

## Docker Integration

The authentication system is fully containerized with:
- **FastAPI Backend**: Auto-reloading development server
- **PostgreSQL Database**: Persistent user data storage
- **Docker Compose**: Orchestrated services with health checks

### Environment Variables
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/car_rental
JWT_SECRET_KEY=your-jwt-secret-key
JWT_EXPIRE_MINUTES=1440
```

## Future Enhancements

### Planned Features
- [ ] Email verification for registration
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Social login integration
- [ ] API rate limiting
- [ ] Audit logging for admin actions
- [ ] Session management
- [ ] OAuth2 support

### Security Improvements
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] IP-based access restrictions
- [ ] Token blacklisting for logout
- [ ] CSRF protection
- [ ] Input sanitization enhancements

## Status: ✅ Fully Implemented

The authentication system is **complete and operational** with:
- ✅ User registration and login
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ MetaMask wallet integration
- ✅ Admin management panel
- ✅ Password management
- ✅ Database integration
- ✅ Docker containerization
- ✅ Comprehensive API documentation
- ✅ Error handling and validation

**Ready for frontend integration and production deployment.**

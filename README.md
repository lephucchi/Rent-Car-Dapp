# 🚗 **Blockchain Car Rental DApp**

A comprehensive decentralized application for car rental built on Ethereum blockchain. This full-stack Web3 project includes a smart contract, RESTful API backend, React frontend, and PostgreSQL database.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.14.0-green.svg)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## 🌟 **Features**

### 🔐 **Authentication & Authorization**
- ✅ JWT-based user authentication
- ✅ Role-based access control (User, Owner, Admin)
- ✅ MetaMask wallet integration
- ✅ Secure password hashing with bcrypt

### 🚙 **Car Management**
- ✅ Add/Edit/Delete cars (Owner only)
- ✅ Car search and filtering
- ✅ Availability management
- ✅ Image upload and gallery
- ✅ Detailed car specifications

### 🤝 **Rental System**
- ✅ Smart contract-based rental agreements
- ✅ Automatic deposit calculation (30% of total fee)
- ✅ Damage assessment system
- ✅ Overdue fee calculation (150% daily rate)
- ✅ Multi-party return confirmation

### 💰 **Payment & Security**
- ✅ Blockchain-based payments
- ✅ Transparent fee calculation
- ✅ Refund mechanism for cancellations
- ✅ Damage compensation handling

### 📊 **Admin Dashboard**
- ✅ User management
- ✅ Contract monitoring
- ✅ Analytics and reporting
- ✅ Event logging system

---

## 🏗️ **Architecture**

### **📊 System Overview Diagram**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │◄──►│   Backend   │◄──►│  Database   │    │   Smart     │
│  (React.js) │    │ (Node.js)   │    │ (Supabase)  │    │  Contract   │
│             │    │             │    │             │    │ (Solidity)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                               │
       └───────────────────┼───────────────────────────────┘
                          Web3.js / ethers.js
```

### **🔄 Data Flow Overview**
```
User ──► Frontend ──► Backend API ──► Database
 │           │            │
 │           │            ▼
 │           │       Smart Contract
 │           │            │
 │           ▼            ▼
 └──► MetaMask ──► Ethereum Blockchain
```

### **🎯 Component Responsibilities**
- **🌐 Frontend (React.js)**: User interface, Web3 integration, state management
- **🛠️ Backend (Node.js)**: API endpoints, authentication, business logic
- **�️ Database (Supabase)**: Data storage, user management, rental records
- **⛓️ Smart Contract (Solidity)**: Payment processing, rental agreements
- **� Web3 Layer**: Blockchain interaction, MetaMask integration

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React.js 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **ethers.js** - Ethereum interaction
- **CSS3** - Responsive styling

### **Backend**
- **Node.js 22.14.0** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication
- **express-validator** - Input validation

### **Database**
- **PostgreSQL** - Primary database
- **Supabase** - Backend as a Service
- **Row Level Security** - Data protection

### **Blockchain**
- **Solidity 0.8.28** - Smart contract language
- **Hardhat** - Development framework
- **ethers.js v5** - Ethereum library
- **OpenZeppelin** - Security standards

---

## 📋 **Prerequisites**

Before running this project, make sure you have the following installed:

- � [Node.js](https://nodejs.org/) (v22.14.0 or higher)
- 🟢 [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- 🟢 [Git](https://git-scm.com/)
- � [MetaMask](https://metamask.io/) browser extension
- 🟢 [Supabase](https://supabase.com/) account

---

## 🚀 **Getting Started**

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/lephucchi/Blockchain-Dapp.git
cd Blockchain-Dapp
```

### **2️⃣ Database Setup (Supabase)**
1. Create a new project on [Supabase](https://supabase.com/)
2. Run the migration files in order:
   ```sql
   -- Execute these files in Supabase SQL Editor
   migrations/01_create_users_table.sql
   migrations/02_create_cars_table.sql
   migrations/03_create_contracts_table.sql
   migrations/04_create_contract_events_table.sql
   migrations/05_sample_data.sql
   ```

### **3️⃣ Backend Setup**
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

**Backend Environment Variables:**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PORT=5000
```

### **4️⃣ Smart Contract Setup**
```bash
cd smartcontract
npm install --legacy-peer-deps

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local blockchain
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### **5️⃣ Frontend Setup**
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### **6️⃣ Access the Application**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Hardhat Network:** http://localhost:8545

---

## 📁 **Project Structure**

```
Blockchain-Dapp/
├── 📁 backend/                 # Node.js API Server
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Request handlers
│   │   ├── 📁 services/        # Business logic
│   │   ├── 📁 models/          # Database models
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 middleware/      # Auth & validation
│   │   ├── 📁 utils/           # Helper functions
│   │   └── 📁 types/           # TypeScript types
│   ├── 📁 migrations/          # Database migrations
│   └── 📄 package.json
├── 📁 frontend/               # React.js Client
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 hooks/          # Custom hooks
│   │   ├── 📁 utils/          # Utilities
│   │   └── 📁 styles/         # CSS files
│   ├── 📁 public/             # Static assets
│   └── 📄 package.json
├── 📁 smartcontract/          # Solidity Contracts
│   ├── 📁 contracts/         # Smart contracts
│   ├── 📁 scripts/           # Deployment scripts
│   ├── 📁 test/              # Contract tests
│   └── 📄 hardhat.config.js
├── 📁 documents/             # Documentation
│   ├── 📄 database-report.tex
│   ├── 📄 backend-report.tex
│   ├── 📄 frontend-report.tex
│   └── 📄 smartcontract-report.tex
├── 📄 PROJECT_SUMMARY.md     # Detailed project summary
└── 📄 README.md              # This file
```

---

## 📡 **API Endpoints**

### **Authentication**
```http
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/refresh       # Refresh JWT token
POST   /api/auth/logout        # User logout
GET    /api/auth/profile       # Get user profile
```

### **Car Management**
```http
GET    /api/cars               # List all cars (with filters)
GET    /api/cars/:id           # Get car details
POST   /api/cars               # Add new car (Owner only)
PUT    /api/cars/:id           # Update car
DELETE /api/cars/:id           # Delete car
GET    /api/cars/owner/:id     # Get cars by owner
PUT    /api/cars/:id/availability # Update availability
```

### **User Management**
```http
GET    /api/users              # List users (Admin only)
GET    /api/users/:id          # Get user details
PUT    /api/users/:id          # Update user profile
PUT    /api/users/:id/role     # Update user role (Admin only)
```

---

## 🔗 **Smart Contract Functions**

### **Rental Management**
```solidity
rent()                    // Start rental with deposit
cancelRental()           // Cancel rental and refund
requestReturn()          // Renter requests return
confirmReturn()          // Owner confirms return
completeRental()         // Final payment and completion
```

### **Damage Assessment**
```solidity
reportDamage()           // Owner reports damage
assessDamage(amount)     // Assessor evaluates damage
setActualUsage(days)     // Set actual usage days
```

### **Utility Functions**
```solidity
getTotalRentalFee()      // Calculate total rental fee
getDeposit()            // Calculate required deposit
getRemainingPayment()    // Calculate remaining payment
```

---

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
npm test
```

### **Smart Contract Tests**
```bash
cd smartcontract
npx hardhat test
```

### **Test Coverage**
- ✅ **Unit Tests** for all services and models
- ✅ **Integration Tests** for API endpoints  
- ✅ **Contract Tests** for all smart contract functions
- ✅ **End-to-End Tests** for user workflows

---

## 🔐 **Security Features**

### **Backend Security**
- 🔒 **JWT Authentication** with refresh tokens
- 🔒 **bcryptjs** password hashing
- 🔒 **CORS** configuration
- 🔒 **Helmet.js** security headers
- 🔒 **Rate limiting** for API protection
- 🔒 **Input validation** and sanitization
- 🔒 **SQL injection** prevention

### **Smart Contract Security**
- 🔒 **Access control** modifiers
- 🔒 **Reentrancy** protection
- 🔒 **Integer overflow** protection
- 🔒 **Gas optimization** techniques
- 🔒 **Event logging** for transparency

### **Database Security**
- 🔒 **Row Level Security** (RLS)
- 🔒 **Foreign key** constraints
- 🔒 **Data validation** triggers
- 🔒 **Backup** and recovery

---

## 🚀 **Deployment**

### **Production Environment Variables**
```env
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
JWT_SECRET=your_strong_jwt_secret
ETHEREUM_NETWORK=mainnet
CONTRACT_ADDRESS=deployed_contract_address
```

### **Deployment Steps**
1. **Deploy Smart Contract** to mainnet/testnet
2. **Deploy Backend** to Vercel/Heroku/AWS
3. **Deploy Frontend** to Netlify/Vercel
4. **Configure Domain** and SSL certificates
5. **Set up Monitoring** and analytics

---

## 📖 **Documentation**

Detailed technical documentation is available in LaTeX format:

- 📄 **Database Report** - `documents/database-report.tex`
- 📄 **Backend Report** - `documents/backend-report.tex`
- 📄 **Frontend Report** - `documents/frontend-report.tex`
- 📄 **Smart Contract Report** - `documents/smartcontract-report.tex`

To compile LaTeX documents:
```bash
cd documents
pdflatex database-report.tex
pdflatex backend-report.tex
pdflatex frontend-report.tex
pdflatex smartcontract-report.tex
```

---

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow **TypeScript** coding standards
- Write **comprehensive tests** for new features
- Update **documentation** when needed
- Use **conventional commits** for clear history

---

## 🐛 **Known Issues**

- **MetaMask Integration**: Requires manual network switching for local development
- **Gas Fees**: High gas fees on Ethereum mainnet (consider Layer 2 solutions)
- **File Upload**: Currently using base64 encoding (consider IPFS for production)

---

## 🔮 **Future Enhancements**

### **Planned Features**
- 🚀 **Layer 2 Integration** (Polygon, Arbitrum)
- 🚀 **IPFS** for decentralized file storage
- � **NFT Integration** for rental certificates
- 🚀 **Mobile App** (React Native)
- � **Oracle Integration** for real-time pricing
- 🚀 **Multi-signature** wallet support
- � **DAO Governance** for platform decisions

### **Performance Improvements**
- ⚡ **Caching** strategies
- ⚡ **Database** optimization
- ⚡ **CDN** integration
- ⚡ **Image** compression

---

## � **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

### **Built With**
- 🔧 [Ethereum](https://ethereum.org/) - Blockchain platform
- 🔧 [Solidity](https://soliditylang.org/) - Smart contract language
- 🔧 [Hardhat](https://hardhat.org/) - Ethereum development environment
- 🔧 [React](https://reactjs.org/) - Frontend framework
- 🔧 [Node.js](https://nodejs.org/) - Backend runtime
- 🔧 [TypeScript](https://www.typescriptlang.org/) - Type safety
- 🔧 [Supabase](https://supabase.com/) - Backend as a Service
- 🔧 [ethers.js](https://docs.ethers.org/) - Ethereum library

### **Special Thanks**
- 🎯 **OpenZeppelin** for security standards
- 🎯 **Hardhat Team** for development tools
- 🎯 **Ethereum Foundation** for the blockchain platform
- 🎯 **Supabase Team** for the database solution

---

## 📞 **Support**

If you have any questions or need help with setup, please:

- 📧 **Email**: lephucchi@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/lephucchi/Blockchain-Dapp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/lephucchi/Blockchain-Dapp/discussions)

---

**⭐ If you find this project helpful, please give it a star on GitHub! ⭐**

---

*Last Updated: August 31, 2025*

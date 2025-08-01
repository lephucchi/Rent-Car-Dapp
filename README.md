# Car Rental DApp

A decentralized car rental platform built with blockchain technology, enabling peer-to-peer vehicle rentals with smart contract automation.

## 🚀 Features

- **Blockchain Integration**: Smart contracts for transparent and secure rental agreements
- **User Management**: Role-based access control (User, Admin, Inspector)
- **MetaMask Integration**: Seamless wallet connectivity for blockchain transactions
- **Real-time Updates**: Live contract status monitoring and updates
- **Admin Dashboard**: Comprehensive user and system management
- **Responsive Design**: Modern UI with glassmorphism and neon aesthetics

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (State Management)
- ethers.js (Web3 Integration)
- React Query (Data Fetching)

**Backend:**
- FastAPI + Python 3.11+
- PostgreSQL + SQLAlchemy
- JWT Authentication
- Web3.py (Blockchain Integration)
- Docker Containerization

**Blockchain:**
- Solidity Smart Contracts
- Hardhat Development Framework
- Local Hardhat Network (Chain ID: 1337)

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.11 or higher)
- **Docker & Docker Compose**
- **MetaMask** browser extension

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd car-rental-dapp
```

### 2. Start with Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- React frontend on port 3000

### 3. Deploy Smart Contract
```bash
cd smartcontract
npm install
npm run node  # Start Hardhat network (new terminal)
npm run deploy:local  # Deploy contract (another terminal)
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Manual Setup (Development)

### Backend Setup
```bash
cd backend-fastapi
pip install -r requirements.txt
cp .env.example .env  # Configure environment variables
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

### Smart Contract Setup
```bash
cd smartcontract
npm install
npm run node     # Terminal 1: Start Hardhat network
npm run deploy:local  # Terminal 2: Deploy contracts
```

## 👥 Default Accounts

### Test Users (Database)
- **Admin**: `admin` / `admin123`
- **User**: `testuser` / `user123`

### Hardhat Accounts (Blockchain)
- **Owner**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Renter**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Inspector**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

## 🎯 Usage Guide

### For Users
1. **Register/Login**: Create account with username, email, password
2. **Connect Wallet**: Link your MetaMask wallet
3. **Browse Contracts**: View available rental contracts
4. **Start Rental**: Initiate rental with automatic payment
5. **Manage Rentals**: Monitor active rentals and complete returns

### For Admins
1. **Access Admin Panel**: Navigate to `/admin` (admin role required)
2. **User Management**: View, activate/deactivate users
3. **Role Management**: Assign roles (user, admin, inspector)
4. **System Statistics**: Monitor platform usage and metrics

### For Inspectors
1. **Access Inspector Panel**: Navigate to `/inspector`
2. **Vehicle Inspection**: Assess returned vehicles
3. **Damage Reporting**: Report vehicle condition and compensation

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission management
- **Smart Contract Security**: Access modifiers and validation
- **Input Validation**: Comprehensive request validation
- **HTTPS Ready**: SSL/TLS encryption support

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/connect-metamask` - Connect wallet

### Admin Management
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users/{id}/activate` - Activate user
- `POST /api/v1/admin/users/{id}/deactivate` - Deactivate user
- `GET /api/v1/admin/stats` - System statistics

### Smart Contract
- `GET /api/contract/status` - Contract status
- `GET /api/contract/accounts` - Hardhat accounts
- `POST /api/contract/start-rental` - Start rental
- `POST /api/contract/end-rental` - End rental

## 🧪 Testing

### Backend Testing
```bash
cd backend-fastapi
python test_auth.py  # Test authentication system
```

### Smart Contract Testing
```bash
cd smartcontract
npm test  # Run Hardhat tests
```

### Frontend Testing
```bash
cd frontend
npm test  # Run React tests
```

## 🚀 Deployment

### Production Deployment
1. **Configure Environment**: Update `.env` files with production values
2. **Build Images**: `docker-compose -f docker-compose.prod.yml build`
3. **Deploy**: Use your preferred cloud provider (AWS, Azure, GCP)
4. **SSL Setup**: Configure HTTPS with Let's Encrypt or cloud SSL

### Environment Variables
Key environment variables to configure:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: JWT signing secret
- `WEB3_PROVIDER_URL`: Blockchain RPC endpoint
- `ALLOWED_ORIGINS`: Frontend URLs for CORS

## 📚 Documentation

- **API Documentation**: Available at `/docs` when backend is running
- **Business Analysis**: See `BA.md` for detailed business requirements
- **Technical Documentation**: See `tech_document.tex` for comprehensive technical details
- **Setup Guide**: See `SETUP.md` for detailed setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Check PostgreSQL is running
- Verify environment variables in `.env`
- Ensure port 8000 is available

**Frontend not connecting:**
- Verify backend is running on port 8000
- Check CORS configuration
- Ensure MetaMask is installed and connected

**Smart contract issues:**
- Ensure Hardhat network is running
- Check contract deployment was successful
- Verify MetaMask is connected to localhost:8545

**Database connection issues:**
- Check PostgreSQL service status
- Verify database credentials
- Ensure database exists and is accessible

### Support

For technical support or questions:
- Check the documentation in `/docs`
- Review the troubleshooting guide
- Open an issue on the repository

## 🎉 Status

**✅ Completed:**
- Backend API with authentication
- Smart contract deployment
- Database integration
- Docker containerization
- Admin dashboard
- User management system

**🔄 In Progress:**
- Frontend integration testing
- Production deployment setup
- Mobile responsiveness optimization

**⏳ Planned:**
- Mobile applications
- Advanced analytics
- Multi-chain support
- IPFS integration

---

**Built with ❤️ by the Car Rental DApp Team**
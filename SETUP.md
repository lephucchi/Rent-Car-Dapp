# Car Rental DApp Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (running locally or cloud instance)
3. **MetaMask** browser extension

## Environment Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` file with your configurations:
```
MONGODB_URI=mongodb://localhost:27017/rent-car-dapp
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
RPC_URL=http://localhost:8545
PRIVATE_KEY_INSPECTOR=your-inspector-private-key-here
PORT=4000
NODE_ENV=development
```

### 2. Smart Contract Setup

```bash
cd smartcontract
npm install
```

Start local Hardhat network:
```bash
npm run node
```

Deploy contract (in new terminal):
```bash
npm run deploy:local
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` file:
```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_NODE_ENV=development
```

## Running the Application

### Start all services:

1. **MongoDB** (make sure it's running)

2. **Hardhat Network** (Terminal 1):
```bash
cd smartcontract
npm run node
```

3. **Deploy Contract** (Terminal 2):
```bash
cd smartcontract
npm run deploy:local
```

4. **Backend** (Terminal 3):
```bash
cd backend
npm run dev
```

5. **Frontend** (Terminal 4):
```bash
cd frontend
npm run dev
```

## Application Flow

1. **Register/Login**: Create account with username, email, password, and display name
2. **Connect Wallet**: After login, connect MetaMask wallet
3. **View Contract**: See the deployed car rental contract details
4. **Interact**: Use available actions based on your role:
   - **Anyone**: Activate contract (become lessee)
   - **Lessee**: Return car when rental is active
   - **Inspector**: Mark car as damaged/undamaged after return
   - **Lessor**: Finalize contract after inspection

## Default Inspector Address

The contract uses a fixed inspector address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

To get the private key for this address in Hardhat network, check the console output when running `npm run node`.

## Troubleshooting

### Backend Issues:
- Ensure MongoDB is running
- Check if JWT_SECRET is set
- Verify MONGODB_URI connection string

### Contract Issues:
- Make sure Hardhat network is running
- Check if contract was deployed successfully
- Verify MetaMask is connected to localhost:8545

### Frontend Issues:
- Check if VITE_API_BASE_URL points to running backend
- Ensure MetaMask is installed and connected
- Verify contract-address.json exists in public folder

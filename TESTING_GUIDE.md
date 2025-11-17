# 🧪 Testing Guide - Rent Car DApp

## ✅ Tóm tắt chức năng đã hoàn thiện

### 1. **Authentication (Xác thực)** ✅
- [x] Register (đăng ký tự động verify)
- [x] Login
- [x] Logout
- [x] Profile management

### 2. **Wallet Connection (Kết nối ví)** ✅
- [x] Connect MetaMask
- [x] Auto-link wallet to account
- [x] Disconnect wallet
- [x] Display wallet address & balance

### 3. **Lend Car (Cho thuê xe)** ✅
- [x] Create car
- [x] Deploy smart contract to blockchain
- [x] Set rental terms (fee, duration, insurance)

### 4. **Rent Car (Thuê xe)** ✅
- [x] Browse available contracts
- [x] Start rental
- [x] Pay deposit (50% via smart contract)

### 5. **Transaction History (Lịch sử giao dịch)** ✅
- [x] View contracts as lessor
- [x] View contracts as lessee
- [x] View blockchain events
- [x] Transaction details with Etherscan links

---

## 🚀 Hướng dẫn test từng chức năng

### **Bước 1: Setup môi trường**

#### 1.1 Hardhat Local Blockchain
```powershell
cd c:\code\Web\project\Rent-Car-Dapp\smartcontract
npx hardhat node
```
✅ Kết quả: Hiển thị 20 test accounts với 10000 ETH mỗi account

#### 1.2 Backend Server
```powershell
cd c:\code\Web\project\Rent-Car-Dapp\backend
npm run dev
```
✅ Kết quả: `Server running on port 8080`

#### 1.3 Frontend
```powershell
cd c:\code\Web\project\Rent-Car-Dapp\frontend
npm run dev
```
✅ Kết quả: `http://localhost:3000`

---

### **Bước 2: Cấu hình MetaMask**

1. Mở MetaMask extension
2. **Add Network** với thông tin:
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

3. **Import Account** bằng private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   (Account #0 từ Hardhat với 10000 ETH)

---

### **Bước 3: Test Authentication** ✅

#### 3.1 Register
1. Truy cập `http://localhost:3000`
2. Click **Register** ở navbar
3. Điền form:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Full name: `John Doe`
   - Phone: `0123456789`
   - Address: `123 Main St`
   - User type: `Lessor` (người cho thuê)
4. Click **Register**

✅ **Kết quả**: 
- Account tự động verified
- Redirect về trang login

#### 3.2 Login
1. Nhập email/password vừa tạo
2. Click **Login**

✅ **Kết quả**:
- Redirect về Home
- Navbar hiển thị user profile
- Hiển thị nút **Connect Wallet**

---

### **Bước 4: Test Wallet Connection** ✅

1. Click nút **Connect Wallet** ở navbar
2. MetaMask popup → Click **Connect**
3. Chọn Account #0 (đã import)

✅ **Kết quả**:
- Navbar hiển thị địa chỉ wallet (0xf39F...)
- Hiển thị balance
- Wallet tự động link vào user account
- Console log: `Wallet linked successfully`

---

### **Bước 5: Test Lend Car (Cho thuê xe)** ✅

1. Click **Lend Car** trên navbar
2. Điền form:
   - Model: `Tesla Model 3`
   - Year: `2024`
   - License Plate: `29A-12345`
   - Location: `Ho Chi Minh City`
   - Daily Rate: `100` (USD)
   - Insurance Fee: `500` (USD)
   - Duration: `7` (days)
   - Description: `Brand new Tesla, perfect condition`
3. Click **Register Car**

✅ **Kết quả**:
- Loading spinner hiển thị
- Car được tạo trong database
- Smart contract deploy lên blockchain
- Success message: `Car registered successfully! Contract deployed at: 0x123...`
- Backend logs:
  ```
  POST /api/cars 201
  POST /api/contracts 201
  ```

#### Kiểm tra blockchain:
- Hardhat terminal hiển thị transaction:
  ```
  eth_sendTransaction
  Contract deployed to: 0x...
  ```

---

### **Bước 6: Test Rent Car (Thuê xe)** ✅

#### 6.1 Chuẩn bị account thứ 2 (người thuê)
1. Logout khỏi account Lessor
2. Register account mới với `user_type: 'Lessee'`
3. Login
4. Connect wallet với Account #1 từ Hardhat:
   ```
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```

#### 6.2 Rent Car
1. Click **Rent Car** trên navbar
2. Xem danh sách xe available
3. Click **Rent Now** trên xe Tesla vừa tạo

✅ **Kết quả**:
- MetaMask popup yêu cầu confirm transaction
- Deposit = 50% * (daily_rate * duration + insurance)
  - Ví dụ: 50% * (100 * 7 + 500) = 600 USD
- Transaction confirmed
- Success message: `Rental started successfully!`
- Backend logs:
  ```
  POST /api/contracts/:id/rent 200
  ```

#### Kiểm tra blockchain:
```
eth_sendTransaction
  from: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Lessee)
  to: 0x... (Contract address)
  value: 600000000000000000000 (600 ETH ~ 600 USD)
```

---

### **Bước 7: Test Transaction History** ✅

1. Click **Transaction** trên navbar
2. Filter:
   - All Statuses / Active / Completed
   - Search by contract ID

✅ **Kết quả**:
- Hiển thị danh sách contracts (cả lessor và lessee)
- Mỗi contract có:
  - Contract ID
  - Status badge (active/completed/cancelled)
  - Daily rate, duration
  - Link to Etherscan

#### Click vào contract:
- Chi tiết contract hiển thị bên phải
- Contract events timeline:
  - `RentalStarted` - Block #xxx - Transaction hash
  - Links to Etherscan for each event

---

### **Bước 8: Test Rental Lifecycle** ✅

#### 8.1 Request Return (Người thuê)
```typescript
POST /api/contracts/:id/request-return
```
✅ Kết quả: `renter_requested_return = true`

#### 8.2 Confirm Return (Người cho thuê)
```typescript
POST /api/contracts/:id/confirm-return
```
✅ Kết quả: `owner_confirmed_return = true`

#### 8.3 Report Damage
```typescript
POST /api/contracts/:id/report-damage
```
✅ Kết quả: `is_damaged = true`

#### 8.4 Set Actual Usage
```typescript
POST /api/contracts/:id/set-usage
Body: { actual_days: 5 }
```
✅ Kết quả: `actual_days = 5`

#### 8.5 Complete Rental
```typescript
POST /api/contracts/:id/complete
```
✅ Kết quả: 
- `status = 'completed'`
- Funds transferred on blockchain
- Events recorded

---

## 📊 API Endpoints Summary

### Auth
- ✅ `POST /api/auth/register` - Register user
- ✅ `POST /api/auth/login` - Login
- ✅ `GET /api/auth/profile` - Get profile
- ✅ `POST /api/auth/link-wallet` - Link wallet

### Cars
- ✅ `POST /api/cars` - Create car
- ✅ `GET /api/cars` - Get all cars
- ✅ `GET /api/cars/:id` - Get car by ID
- ✅ `GET /api/cars/my/cars` - Get my cars

### Contracts
- ✅ `POST /api/contracts` - Create contract (deploy to blockchain)
- ✅ `POST /api/contracts/:id/rent` - Start rental
- ✅ `POST /api/contracts/:id/request-return` - Request return
- ✅ `POST /api/contracts/:id/confirm-return` - Confirm return
- ✅ `POST /api/contracts/:id/report-damage` - Report damage
- ✅ `POST /api/contracts/:id/set-usage` - Set actual usage
- ✅ `POST /api/contracts/:id/complete` - Complete rental
- ✅ `POST /api/contracts/:id/cancel` - Cancel contract
- ✅ `GET /api/contracts/:id` - Get contract
- ✅ `GET /api/contracts/my/contracts` - Get my contracts (lessor)
- ✅ `GET /api/contracts/my/rentals` - Get my rentals (lessee)
- ✅ `GET /api/contracts/:id/events` - Get contract events
- ✅ `GET /api/contracts/active` - Get active contracts

---

## 🐛 Troubleshooting

### Issue: "Wallet not connected"
**Solution**: Click **Connect Wallet** trên navbar trước khi thực hiện thao tác

### Issue: "Transaction failed"
**Solution**: 
1. Kiểm tra balance trong MetaMask
2. Kiểm tra Hardhat node đang chạy
3. Xem console logs để debug

### Issue: "Contract deployment failed"
**Solution**:
1. Kiểm tra `PRIVATE_KEY` trong backend/.env
2. Restart Hardhat node
3. Redeploy contract

### Issue: "Email verification error"
**Solution**: Đã tự động verify, không cần verify email

---

## ✅ Checklist Testing Complete

- [x] User registration with auto-verification
- [x] User login/logout
- [x] Wallet connection với MetaMask
- [x] Auto-link wallet to account
- [x] Create car (Lend Car)
- [x] Deploy smart contract to blockchain
- [x] Browse available rentals (Rent Car)
- [x] Start rental with deposit payment
- [x] View transaction history
- [x] Filter & search contracts
- [x] View blockchain events
- [x] Request return
- [x] Confirm return
- [x] Report damage
- [x] Set actual usage
- [x] Complete rental
- [x] Cancel contract

---

## 🎉 Kết luận

**TẤT CẢ CHỨC NĂNG ĐÃ HOẠT ĐỘNG:**
1. ✅ Authentication
2. ✅ Wallet Connection & Auto-linking
3. ✅ Lend Car (Create + Deploy Contract)
4. ✅ Rent Car (Browse + Start Rental)
5. ✅ Transaction History từ blockchain

**Next Steps:**
- Deploy lên testnet (Sepolia/Mumbai)
- Add file upload cho hình ảnh xe
- Implement real USD/ETH conversion
- Add notification system
- Optimize gas fees

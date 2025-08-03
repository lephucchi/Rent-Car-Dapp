# Rent Car DApp - Hướng dẫn sử dụng

## 🚀 Khởi động nhanh

### Cách 1: Sử dụng script tự động (Khuyến nghị)
```powershell
# Chạy script tự động setup và khởi động
.\start-dev.ps1
```

### Cách 2: Khởi động thủ công

#### 1. Khởi động Hardhat Network
```bash
cd smartcontract
npx hardhat node
```

#### 2. Deploy Contract (Terminal mới)
```bash
cd smartcontract
npx hardhat run scripts/deploy-fixed-rental.js --network localhost
```

#### 3. Khởi động Frontend (Terminal mới)
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Cấu hình MetaMask

### Thêm Hardhat Network
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 1337
- **Currency Symbol:** ETH

### Import Test Accounts

#### Account #0 (Contract Owner/Lessor)
- **Address:** 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- **Private Key:** 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

#### Account #1 (Renter/Lessee)
- **Address:** 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- **Private Key:** 0x59c6995e998f97d3db2f06c5b6c4e6a7e1c42b43a8a9c65e33c9f22e0e2dc3c8

## 🌐 Các trang có sẵn

- **Homepage:** http://localhost:5173/
- **Rent Car:** http://localhost:5173/rent
- **Lend Car:** http://localhost:5173/lend
- **Contract Dashboard:** http://localhost:5173/contract ⭐ **MỚI**
- **Transactions:** http://localhost:5173/transactions
- **Inspector:** http://localhost:5173/inspector
- **Admin:** http://localhost:5173/admin

## 🎯 Hướng dẫn Test

### 1. Kết nối ví và xem thông tin contract
1. Mở http://localhost:5173/contract
2. Kết nối MetaMask với Account #0 (Contract Owner)
3. Xem thông tin contract và fee breakdown

### 2. Test luồng thuê xe

#### Bước 1: Người thuê kết nối
1. Chuyển sang Account #1 trong MetaMask
2. Refresh trang hoặc truy cập lại http://localhost:5173/contract
3. Click "Rent Asset" và trả tiền cọc (50% tổng phí)

#### Bước 2: Sử dụng xe
- Sau khi thuê thành công, contract sẽ chuyển sang trạng thái "Currently Rented"
- Người thuê có thể "Request Return" khi muốn trả xe

#### Bước 3: Trả xe
1. Người thuê: Click "Request Return"
2. Chuyển về Account #0 (Owner)
3. Owner có thể:
   - Set actual usage (phút sử dụng thực tế)
   - Report damage nếu có
   - Confirm return

#### Bước 4: Hoàn tất giao dịch
1. Sau khi Owner confirm return
2. Người thuê trả phần còn lại của phí thuê
3. Click "Complete Rental" để hoàn tất

### 3. Test các tính năng khác

#### Cancel Rental
- Người thuê có thể cancel trong quá trình thuê
- Tiền cọc sẽ được chia đôi (50% refund, 50% cho owner)

#### Damage Reporting
- Owner có thể report damage
- Phí bồi thường sẽ được thêm vào tổng chi phí

## 🔍 Debug và Troubleshooting

### Kiểm tra contract deployment
```bash
cd smartcontract
# Clean cache nếu có xung đột tên contract
npx hardhat clean
# Deploy contract
npx hardhat run scripts/deploy-fixed-rental.js --network localhost
```

### Lỗi thường gặp khi deploy

#### 1. "Multiple artifacts for contract"  
**Nguyên nhân:** Có nhiều contract cùng tên trong dự án
**Giải pháp:**
```bash
cd smartcontract
npx hardhat clean
npx hardhat run scripts/deploy-fixed-rental.js --network localhost
```

#### 2. "Cannot connect to network localhost"
**Nguyên nhân:** Hardhat network chưa chạy
**Giải pháp:**
```bash
# Terminal 1: Khởi động network
cd smartcontract
npx hardhat node

npx hardhat clean

# Terminal 2: Deploy contract  
cd smartcontract
npx hardhat run scripts/deploy-fixed-rental.js --network localhost
```

### Kiểm tra contract address
- File: `frontend/src/lib/contractConfig.ts`
- Đảm bảo address match với deployed contract

### Lỗi thường gặp

#### 1. "MetaMask is not installed"
- Cài đặt MetaMask extension
- Refresh browser

#### 2. "Failed to connect wallet"
- Kiểm tra MetaMask đã kết nối Hardhat network
- Đảm bảo Chain ID = 1337

#### 3. "Contract not initialized"
- Kiểm tra Hardhat network đang chạy
- Verify contract address trong config

#### 4. "Transaction failed"
- Kiểm tra balance đủ để trả gas fee
- Verify contract state và user role

## 📊 Contract Information

### FixedRentalContract Details
- **Asset:** Toyota Camry 2023
- **Rental Fee:** 1 gwei per minute
- **Duration:** 10080 minutes (7 days)
- **Insurance Fee:** 0.01 ETH
- **Insurance Compensation:** 0.1 ETH
- **Total Rental Fee:** ~10.09 ETH
- **Required Deposit:** ~5.04 ETH (50%)

### User Roles
- **Lessor:** Contract owner (Account #0)
- **Lessee:** Renter (anyone except lessor)
- **Other:** Non-participants (view only)

## 🚀 Advanced Usage

### Thêm accounts khác
```javascript
// Hardhat cung cấp 20 accounts với 10000 ETH mỗi account
// Accounts 2-19 có thể được sử dụng để test multiple users
```

### Custom contract parameters
```javascript
// Chỉnh sửa trong smartcontract/scripts/deploy-fixed-rental.js
const assetName = "Your Car Name";
const rentalFeePerMinute = ethers.utils.parseUnits("2", "gwei");
const durationMinutes = 60 * 24 * 3; // 3 days
```

## 📝 Notes

- Contract sử dụng `minutes` làm đơn vị thời gian
- Tất cả payment đều bằng ETH
- Contract tự động calculate fees dựa trên actual usage
- Damage compensation là cố định (0.1 ETH)
- Preview mode vẫn hoạt động song song với real mode

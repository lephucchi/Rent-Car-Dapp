# 🚗 Rent Car DApp - Phiên bản Tích hợp Web3

## 📋 Tổng quan

Đây là ứng dụng phi tập trung (DApp) cho thuê xe được xây dựng trên Ethereum blockchain với smart contract `FixedRentalContract`. Ứng dụng cho phép người dùng thuê và cho thuê xe một cách an toàn thông qua smart contract.

### ✨ Tính năng chính

- **Smart Contract Integration**: Tích hợp trực tiếp với FixedRentalContract
- **MetaMask Integration**: Kết nối và tương tác với MetaMask wallet
- **Real-time Contract State**: Hiển thị trạng thái contract theo thời gian thực
- **Multi-role Support**: Hỗ trợ Lessor (người cho thuê) và Lessee (người thuê)
- **Complete Rental Flow**: Luồng thuê xe hoàn chỉnh từ đặt cọc đến hoàn tất
- **Preview Mode**: Chế độ preview với mock data để demo

## 🏗️ Kiến trúc hệ thống

### Smart Contract
- **Contract**: `FixedRentalContract.sol`
- **Network**: Hardhat Local (Chain ID: 1337)
- **Features**: Deposit system, damage reporting, usage tracking

### Frontend
- **Framework**: React + TypeScript + Vite
- **Web3 Library**: Ethers.js v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Router**: React Router v6

### Tích hợp Web3
- **Unified Web3 Service**: `web3-integration.ts`
- **Store Architecture**: `unifiedWeb3Store.ts`
- **Auto-connection**: Tự động kết nối lại khi refresh
- **Error Handling**: Xử lý lỗi toàn diện

## 🚀 Cài đặt và Khởi động

### Prerequisites
- Node.js >= 16
- npm hoặc yarn
- MetaMask extension

### Cách 1: Sử dụng Script Tự động (Khuyến nghị)
```powershell
# Windows PowerShell
.\start-dev.ps1
```

Script sẽ tự động:
- Khởi động Hardhat network
- Deploy smart contract
- Cập nhật contract address trong frontend
- Khởi động frontend dev server
- Hiển thị thông tin cấu hình MetaMask

### Cách 2: Khởi động Thủ công

#### 1. Khởi động Hardhat Network
```bash
cd smartcontract
npm install
npx hardhat node
```

#### 2. Deploy Contract (Terminal mới)
```bash
cd smartcontract
npx hardhat run scripts/deploy-fixed-rental.js --network localhost
```

#### 3. Cập nhật Contract Address
Sao chép địa chỉ contract và cập nhật trong:
```typescript
// frontend/src/lib/contractConfig.ts
export const contractConfig = {
  address: "0x_YOUR_CONTRACT_ADDRESS_HERE",
  // ...
}
```

#### 4. Khởi động Frontend (Terminal mới)
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Cấu hình MetaMask

### Thêm Hardhat Network
- **Network Name**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 1337
- **Currency Symbol**: ETH

### Import Test Accounts

#### Account #0 (Contract Owner/Lessor)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Account #1 (Renter/Lessee)
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97d3db2f06c5b6c4e6a7e1c42b43a8a9c65e33c9f22e0e2dc3c8
```

## 🌐 Các trang có sẵn

- **Home**: `/` - Trang chủ với thông tin tổng quan
- **Rent Car**: `/rent` - Trang thuê xe (với mock data)
- **Lend Car**: `/lend` - Trang cho thuê xe (admin only)
- **🆕 Contract Dashboard**: `/contract` - **Trang chính với tích hợp Web3**
- **Transactions**: `/transactions` - Lịch sử giao dịch
- **Inspector**: `/inspector` - Trang kiểm định (inspector only)
- **Admin**: `/admin` - Trang quản trị (admin only)

## 📱 Hướng dẫn sử dụng

### 🎯 Contract Dashboard (Trang chính)

Truy cập: http://localhost:5173/contract

#### 1. Kết nối Wallet
- Click "Connect Wallet" để kết nối MetaMask
- Chọn Hardhat Local network
- Approve connection

#### 2. Xem thông tin Contract
- **Contract Information**: Thông tin xe và phí thuê
- **Rental Status**: Trạng thái thuê hiện tại
- **Fee Breakdown**: Chi tiết phí và tiền cọc
- **Available Actions**: Các hành động có thể thực hiện

#### 3. Luồng thuê xe hoàn chỉnh

**Bước 1: Thuê xe (Lessee)**
1. Kết nối với Account #1 (Lessee)
2. Click "Rent Asset" 
3. Trả tiền cọc (50% tổng phí ≈ 5.04 ETH)
4. Confirm transaction trong MetaMask

**Bước 2: Sử dụng xe**
- Contract chuyển sang trạng thái "Currently Rented"
- Thông tin lessee sẽ được hiển thị
- Start time được ghi nhận

**Bước 3: Yêu cầu trả xe**
1. Lessee click "Request Return"
2. Contract ghi nhận yêu cầu trả xe

**Bước 4: Xác nhận trả xe (Lessor)**
1. Chuyển sang Account #0 (Lessor/Owner)
2. Set actual usage nếu cần: nhập số phút sử dụng thực tế
3. Report damage nếu có hư hỏng
4. Click "Confirm Return"

**Bước 5: Hoàn tất thuê xe**
1. Chuyển về Account #1 (Lessee)
2. Click "Complete Rental"
3. Trả phần còn lại của phí thuê
4. Contract reset về trạng thái ban đầu

### 🔄 Các tính năng khác

#### Cancel Rental
- Lessee có thể cancel trong quá trình thuê
- Tiền cọc chia đôi: 50% refund cho lessee, 50% cho lessor

#### Damage Reporting
- Lessor có thể report damage
- Phí bồi thường (0.1 ETH) sẽ được thêm vào tổng chi phí

#### Actual Usage Setting
- Lessor có thể set số phút sử dụng thực tế
- Phí thuê sẽ được tính lại dựa trên actual usage

## 🔍 Contract Information

### FixedRentalContract Details
```
Asset: Toyota Camry 2023
Rental Fee: 1 gwei per minute
Duration: 10,080 minutes (7 days)
Insurance Fee: 0.01 ETH
Insurance Compensation: 0.1 ETH
Total Rental Fee: ~10.09 ETH
Required Deposit: ~5.04 ETH (50%)
```

### User Roles
- **Lessor**: Contract owner/deployer (Account #0)
- **Lessee**: Anyone except lessor (Account #1, #2, ...)
- **Other**: Non-participants (view-only mode)

## 🛠️ Debug và Troubleshooting

### Kiểm tra Contract Deployment
```bash
cd smartcontract
npx hardhat run scripts/deploy-fixed-rental.js --network localhost
```

### Verify Contract Address
Kiểm tra file `frontend/src/lib/contractConfig.ts` có đúng address không

### Lỗi thường gặp

#### 1. "MetaMask is not installed"
- Cài đặt MetaMask browser extension
- Refresh browser

#### 2. "Failed to connect wallet"
- Kiểm tra MetaMask đã add Hardhat network
- Verify Chain ID = 1337
- Kiểm tra RPC URL = http://127.0.0.1:8545

#### 3. "Contract not initialized"
- Hardhat network có đang chạy không?
- Contract address có đúng không?
- Network có match không?

#### 4. "Transaction failed"
- Balance có đủ để trả gas + amount không?
- Contract state có hợp lệ không?
- User role có đúng không?

#### 5. "Incorrect deposit amount"
- Kiểm tra số tiền gửi có match với `getDeposit()` không
- Refresh contract state và thử lại

## 📊 Technical Architecture

### Web3 Integration Layer
```
web3-integration.ts (Core Service)
    ↓
unifiedWeb3Store.ts (State Management)
    ↓
Web3Context.tsx (React Context)
    ↓
Components (UI Layer)
```

### State Management Flow
```
User Action → Store Action → Web3 Service → Smart Contract
    ↑                                                ↓
UI Update ← State Update ← Event/Response ← Transaction
```

### Error Handling
- Connection errors: MetaMask detection & network switching
- Transaction errors: Gas estimation & revert handling
- Contract errors: State validation & user feedback
- Network errors: RPC connection & retry logic

## 📝 Development Notes

### Preview Mode vs Real Mode
- **Preview Mode**: Sử dụng mock data, không cần MetaMask
- **Real Mode**: Tương tác trực tiếp với smart contract

### Contract State Sync
- Auto-refresh sau mỗi transaction
- Manual refresh button available
- Real-time balance updates

### Multi-account Testing
```javascript
// Hardhat provides 20 accounts with 10,000 ETH each
// Use different accounts to test various scenarios:
// Account #0: Contract owner (lessor)
// Account #1: Primary renter (lessee)
// Account #2-19: Additional testers
```

## 🔮 Future Enhancements

- [ ] Multi-contract support (factory pattern)
- [ ] ENS integration
- [ ] IPFS metadata storage
- [ ] Mobile-responsive improvements
- [ ] Transaction history with filters
- [ ] Push notifications for state changes
- [ ] Integration with testnet/mainnet

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra USAGE.md cho hướng dẫn chi tiết
2. Verify setup theo troubleshooting guide
3. Check console logs cho error messages
4. Open GitHub issue với reproduction steps

# Database Migrations for Rent Car DApp

## Thứ tự thực hiện migrations trên Supabase

### 1. Chuẩn bị Supabase
- Tạo project mới trên [supabase.com](https://supabase.com)
- Lấy URL và API keys từ Project Settings
- Enable Row Level Security (RLS) cho tất cả tables

### 2. Thực hiện migrations theo thứ tự

#### Migration 1: Users Table
```bash
# File: 001_create_users_table.sql
```
- Tạo bảng users với 4 loại người dùng
- Tạo enum user_type
- Thiết lập RLS policies
- Tạo trigger auto-update timestamp

#### Migration 2: Cars Table  
```bash
# File: 002_create_cars_table.sql
```
- Tạo bảng cars lưu thông tin xe
- Tạo enum car_status
- Thiết lập indexes để tối ưu performance
- Thiết lập RLS policies

#### Migration 3: Contracts Table
```bash
# File: 003_create_contracts_table.sql
```
- Tạo bảng contracts lưu thông tin hợp đồng thuê
- Liên kết với smart contract address
- Tạo enum contract_status
- Thiết lập constraints và RLS

#### Migration 4: Contract Events Table
```bash
# File: 004_create_contract_events_table.sql
```
- Tạo bảng lưu events từ blockchain
- Theo dõi tất cả transactions và events
- Thiết lập indexing cho performance

#### Migration 5: Functions và Views
```bash
# File: 005_create_functions_and_views.sql
```
- Tạo các stored functions tiện ích
- Tạo trigger tự động cập nhật car status
- Tạo view contract_summary
- Insert dữ liệu mẫu

### 3. Cách chạy migrations

#### Option 1: Sử dụng Supabase Dashboard
1. Đăng nhập vào Supabase Dashboard
2. Vào SQL Editor
3. Copy nội dung từng file migration
4. Chạy theo thứ tự từ 001 đến 005

#### Option 2: Sử dụng Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### 4. Verify migrations
Sau khi chạy xong, kiểm tra:
- [ ] Tất cả 4 bảng đã được tạo
- [ ] RLS policies đã được enable
- [ ] Indexes đã được tạo
- [ ] Functions và views hoạt động
- [ ] Sample data đã được insert

### 5. Environment Variables cần thiết
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Lưu ý quan trọng
- **Luôn backup database** trước khi chạy migration
- **Test trên environment dev** trước khi apply lên production
- **Chạy migrations theo đúng thứ tự** để tránh lỗi foreign key
- **Verify RLS policies** để đảm bảo security

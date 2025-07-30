import React, { useState, useEffect } from 'react';
import { Car, Shield, Clock, CreditCard, ChevronRight, Wallet, Plus } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole, useConnectionState } from '../stores/globalWeb3Store';
import { mockDataService, type MockCar } from '../services/mockDataService';
import { CarCard } from '../components/CarCard';
import { debugMetaMaskConnection } from '../lib/debugMetaMask';
import { isMetaMaskInstalled as checkMetaMaskInstalled } from '../utils/metamaskUtils';

export default function Landing() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const { isLoading, error } = useConnectionState();
  const globalUserRole = useGlobalUserRole();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Determine effective role and connection state
  const effectiveRole = isPreviewMode ? simulatedRole : 
    (globalUserRole === 'admin' ? 'admin' : 
     globalUserRole === 'inspector' ? 'inspector' : 'user');
  
  const shouldShowContent = isConnected || isPreviewMode;

  const handleConnectWallet = async () => {
    try {
      setConnectionError(null);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectionError(errorMessage);
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = checkMetaMaskInstalled();

  // Get cars based on mode and role
  const getCars = (): MockCar[] => {
    if (isPreviewMode) {
      return mockDataService.getCarsForRole(simulatedRole);
    }
    
    // When connected to real blockchain, we would get real data here
    // For now, return mock data filtered by role
    if (effectiveRole === 'admin') {
      return mockDataService.getOwnedCars(address || '0x1234567890123456789012345678901234567890');
    } else if (effectiveRole === 'inspector') {
      return mockDataService.getCarsForInspection();
    } else {
      return mockDataService.getAvailableCars();
    }
  };

  const handleRentCar = (carId: string) => {
    if (isPreviewMode) {
      alert('Preview Mode: This would initiate the rental process');
      return;
    }
    // Real rental logic would go here
    console.log('Renting car:', carId);
  };

  const handleManageCar = (carId: string) => {
    if (isPreviewMode) {
      alert('Preview Mode: This would open car management options');
      return;
    }
    // Navigate to admin panel or show management modal
    window.location.href = '/admin';
  };

  const handleInspectCar = (carId: string) => {
    if (isPreviewMode) {
      alert('Preview Mode: This would open inspection interface');
      return;
    }
    // Navigate to inspector panel
    window.location.href = '/inspector';
  };

  // Show connection interface if not connected and not in preview mode
  if (!shouldShowContent) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="luxury-section">
          <div className="luxury-container">
            <div className="text-center">
              <h1 className="luxury-heading mb-6">
                Luxury Car Rental
                <br />
                <span className="font-bold">Reimagined</span>
              </h1>
              <p className="luxury-subheading max-w-3xl mx-auto mb-12">
                Experience premium car rental with blockchain security.
                Connect your wallet to rent luxury vehicles with transparent pricing and instant confirmations.
              </p>
              
              <div className="luxury-card p-8 max-w-4xl mx-auto mb-12">
                <div className="luxury-grid-3">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Blockchain Security</h3>
                    <p className="text-muted-foreground">Smart contracts ensure transparent and secure transactions</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Instant Rental</h3>
                    <p className="text-muted-foreground">Rent immediately with cryptocurrency payments</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Transparent Pricing</h3>
                    <p className="text-muted-foreground">All fees calculated on-chain with no hidden costs</p>
                  </div>
                </div>
              </div>

              {/* Connection Error Display */}
              {(connectionError || error) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <p className="text-red-600 text-sm">{connectionError || error}</p>
                </div>
              )}

              {/* Simple Connection Guide */}
              <div className="max-w-4xl mx-auto">
                {!isMetaMaskInstalled ? (
                  <div className="space-y-8">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Hướng dẫn cài đặt và kết nối ví
                      </h2>
                      <p className="text-muted-foreground">
                        Thực hiện các bước sau để bắt đầu sử dụng dịch vụ thuê xe blockchain
                      </p>
                    </div>

                    {/* 4 Steps Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      {/* Step 1 */}
                      <div className="aurora-glass border border-primary/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">1</div>
                        <h3 className="font-semibold text-foreground mb-2">Tải MetaMask</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Tải extension MetaMask cho trình duyệt
                        </p>
                        <a
                          href="https://metamask.io/download/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          metamask.io
                        </a>
                      </div>

                      {/* Step 2 */}
                      <div className="aurora-glass border border-secondary/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">2</div>
                        <h3 className="font-semibold text-foreground mb-2">Cài đặt</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Thêm extension vào trình duyệt của bạn
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          1-2 phút
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="aurora-glass border border-aurora-green/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-aurora-green text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">3</div>
                        <h3 className="font-semibold text-foreground mb-2">Thiết lập ví</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Tạo ví mới hoặc import ví hiện có
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Bảo mật
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="aurora-glass border border-aurora-teal/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-aurora-teal text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">4</div>
                        <h3 className="font-semibold text-foreground mb-2">Hoàn tất</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Sẵn sàng kết nối với AuroraRent
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Car className="w-3 h-3 mr-1" />
                          Sẵn sàng
                        </div>
                      </div>
                    </div>

                    {/* Install MetaMask Notice */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-600 text-sm font-medium text-center">
                        ⚠️ Bạn cần cài đặt MetaMask trước khi kết nối ví
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        MetaMask đã sẵn sàng!
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Tuyệt vời! MetaMask đã được cài đặt. Bây giờ hãy kết nối ví của bạn để bắt đầu thuê xe
                      </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="aurora-glass border border-aurora-teal/30 rounded-lg p-6 mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Tiến trình kết nối</h3>
                        <span className="text-sm text-muted-foreground">Bước 1/3</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-2 bg-primary rounded-full"></div>
                        <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>

                    {/* Step 1: Connect Wallet - Active */}
                    <div className="aurora-glass border-2 border-primary rounded-xl p-8 shadow-lg">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <h3 className="text-2xl font-bold text-foreground">Kết nối ví MetaMask</h3>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Sẵn sàng</span>
                          </div>

                          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                            Nhấn nút bên dưới để kết nối ví MetaMask với AuroraRent. Quá trình này hoàn toàn miễn phí và an toàn.
                          </p>

                          {/* What happens next */}
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
                            <h4 className="font-semibold text-primary mb-3 flex items-center">
                              <span className="w-5 h-5 text-primary mr-2">🔗</span>
                              Điều gì sẽ xảy ra tiếp theo?
                            </h4>
                            <ul className="text-primary text-sm space-y-2">
                              <li>• Một popup MetaMask sẽ xuất hi��n</li>
                              <li>• Chọn tài khoản bạn muốn kết nối</li>
                              <li>• Xác nhận kết nối - hoàn toàn miễn phí</li>
                              <li>• Bắt đầu khám phá và thuê xe ngay lập tức</li>
                            </ul>
                          </div>

                          {/* Main CTA */}
                          <button
                            onClick={handleConnectWallet}
                            disabled={isLoading}
                            className="aurora-button w-full disabled:opacity-50 text-lg py-4 mb-4"
                          >
                            <Wallet className="w-5 h-5 mr-3" />
                            {isLoading ? 'Đang kết nối...' : 'Kết nối ví MetaMask ngay'}
                          </button>

                          {/* Security note */}
                          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            <span>Kết nối an toàn - Chúng tôi không bao giờ truy cập vào tiền của bạn</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Confirmation Process */}
                    <div className="aurora-glass border border-secondary/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-3">
                            Xác nhận trong MetaMask
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Sau khi nhấn "Kết nối ví", hãy làm theo các bước sau trong popup MetaMask:
                          </p>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                              <h4 className="font-medium text-foreground mb-2">1️⃣ Mở khóa MetaMask</h4>
                              <p className="text-sm text-muted-foreground">Nhập mật khẩu nếu MetaMask bị khóa</p>
                            </div>
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                              <h4 className="font-medium text-foreground mb-2">2️⃣ Chọn tài khoản</h4>
                              <p className="text-sm text-muted-foreground">Chọn tài khoản bạn muốn sử dụng</p>
                            </div>
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                              <h4 className="font-medium text-foreground mb-2">3️⃣ Nhấn "Connect"</h4>
                              <p className="text-sm text-muted-foreground">Xác nhận kết nối với AuroraRent</p>
                            </div>
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                              <h4 className="font-medium text-foreground mb-2">4️⃣ Hoàn tất!</h4>
                              <p className="text-sm text-muted-foreground">Trang sẽ tự động cập nhật</p>
                            </div>
                          </div>

                          <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4">
                            <p className="text-secondary text-sm flex items-start">
                              <span className="mr-2 mt-0.5">💡</span>
                              <span><strong>Mẹo:</strong> Nếu popup không xuất hiện, kiểm tra xem MetaMask có bị chặn popup không. Nhấn vào icon MetaMask ở thanh công cụ trình duyệt.</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: What's Next */}
                    <div className="aurora-glass border border-aurora-green/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-aurora-green text-white rounded-full flex items-center justify-center font-bold">3</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-3">
                            🎉 Sau khi kết nối thành công
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Sau khi kết nối thành công, bạn sẽ có quyền truy cập đầy đủ vào nền tảng thuê xe blockchain:
                          </p>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-aurora-teal/10 border border-aurora-teal/20 rounded-lg p-4">
                              <Car className="w-8 h-8 text-aurora-teal mb-3" />
                              <h4 className="font-medium text-foreground mb-2">Thuê xe ngay lập tức</h4>
                              <p className="text-sm text-muted-foreground">Xem danh sách xe có sẵn và thuê với vài click</p>
                            </div>
                            <div className="bg-aurora-blue/10 border border-aurora-blue/20 rounded-lg p-4">
                              <Shield className="w-8 h-8 text-aurora-blue mb-3" />
                              <h4 className="font-medium text-foreground mb-2">Giao dịch an toàn</h4>
                              <p className="text-sm text-muted-foreground">Mọi giao dịch được bảo vệ bởi smart contract</p>
                            </div>
                            <div className="bg-aurora-green/10 border border-aurora-green/20 rounded-lg p-4">
                              <Clock className="w-8 h-8 text-aurora-green mb-3" />
                              <h4 className="font-medium text-foreground mb-2">Theo dõi real-time</h4>
                              <p className="text-sm text-muted-foreground">Theo dõi trạng thái thuê xe và giao dịch</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Option */}
                    <div className="aurora-glass border border-aurora-purple/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-aurora-purple text-white rounded-full flex items-center justify-center">💡</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Chưa sẵn sàng kết nối?
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Không sao! Bạn có thể khám phá nền tảng bằng chế độ Preview trước khi quyết định kết nối ví.
                          </p>
                          <div className="bg-aurora-purple/10 border border-aurora-purple/20 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <span className="text-aurora-purple text-lg">🔍</span>
                              <div>
                                <p className="text-aurora-purple font-medium mb-1">Chế độ Preview</p>
                                <p className="text-sm text-muted-foreground">
                                  Xem tất cả tính năng, giao diện và cách thức hoạt động mà không cần kết nối ví thật.
                                  Toggle "Preview Mode" ở thanh navigation phía trên để bắt đầu.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Troubleshooting */}
                    <div className="aurora-glass border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <span className="text-orange-500 mr-2">🛠️</span>
                        Gặp sự cố khi kết nối?
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Các lỗi thường gặp:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• MetaMask không mở popup</li>
                            <li>• Không thể chọn tài khoản</li>
                            <li>• Kết nối bị gián đoạn</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Giải pháp:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Tải lại trang và thử lại</li>
                            <li>• Kiểm tra cài đặt popup của trình duyệt</li>
                            <li>• Đảm bảo MetaMask đã được mở khóa</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connection Error Display */}
                {(connectionError || error) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm">!</div>
                      <div>
                        <h4 className="text-red-800 font-medium mb-1">Lỗi kết nối</h4>
                        <p className="text-red-600 text-sm">{connectionError || error}</p>
                        <p className="text-red-600 text-xs mt-2">
                          Vui lòng thử lại hoặc kiểm tra cài đặt MetaMask của bạn.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug button for development */}
                {import.meta.env.DEV && (
                  <div className="text-center mt-6">
                    <button
                      onClick={debugMetaMaskConnection}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Debug MetaMask Connection (Dev Only)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-foreground mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">Simple, secure, and transparent car rental process</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground">Connect your MetaMask wallet to access the platform</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pay Deposit</h3>
                <p className="text-muted-foreground">Pay deposit to secure your rental booking</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Enjoy Your Ride</h3>
                <p className="text-muted-foreground">Use the vehicle for the agreed rental period</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Return & Pay</h3>
                <p className="text-muted-foreground">Return the car and complete final payment</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Homepage with Car List Section
  const cars = getCars();

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Role Detection Notice */}
        <div className="luxury-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div>
                <span className="font-medium text-foreground">
                  {isPreviewMode ? 'Preview Mode' : 'Connected'} as: {effectiveRole === 'admin' ? 'Admin/Owner' : effectiveRole === 'inspector' ? 'Inspector' : 'User'}
                </span>
                {effectiveRole === 'admin' && (
                  <p className="text-sm text-muted-foreground">
                    You have admin access. <a href="/admin" className="text-primary hover:underline">Go to Admin Panel</a>
                  </p>
                )}
                {effectiveRole === 'inspector' && (
                  <p className="text-sm text-muted-foreground">
                    You have inspector access. <a href="/inspector" className="text-primary hover:underline">Go to Inspector Panel</a>
                  </p>
                )}
              </div>
            </div>
            {isPreviewMode && (
              <span className="text-sm text-primary bg-primary/20 px-2 py-1 rounded border border-primary/30">
                Demo Data
              </span>
            )}
          </div>
        </div>

        {/* Platform Overview */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-foreground mb-4">
            Welcome to LuxeRent
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover premium car rentals powered by blockchain technology. 
            Transparent pricing, secure deposits, and instant confirmations.
          </p>
        </div>

        {/* Car List Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {effectiveRole === 'admin' ? 'Your Cars' : 
                 effectiveRole === 'inspector' ? 'Cars for Inspection' : 
                 'Available Cars'}
              </h2>
              <p className="text-muted-foreground">
                {isPreviewMode ? 'Preview: Sample car listings' : 'Real-time car availability from smart contracts'}
              </p>
            </div>
            {effectiveRole === 'admin' && (
              <a href="/lend" className="luxury-button">
                <Plus className="w-4 h-4 mr-2" />
                Add New Car
              </a>
            )}
          </div>

          {cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  userRole={effectiveRole === 'admin' ? 'lessor' : effectiveRole}
                  onRentCar={handleRentCar}
                  onManageCar={handleManageCar}
                  onInspectCar={handleInspectCar}
                  isPreview={isPreviewMode}
                />
              ))}
            </div>
          ) : (
            <div className="luxury-card p-12 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {effectiveRole === 'admin' ? 'No Cars Added' :
                 effectiveRole === 'inspector' ? 'No Cars Awaiting Inspection' :
                 'No Cars Available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {effectiveRole === 'admin' 
                  ? 'Start by adding your first car to the platform.'
                  : effectiveRole === 'inspector'
                  ? 'Check back when cars need inspection.'
                  : 'Check back later for new car listings.'
                }
              </p>
              {effectiveRole === 'admin' && (
                <a href="/lend" className="ferrari-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Car
                </a>
              )}
            </div>
          )}
        </div>

        {/* Platform Information */}
        <div className="luxury-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Platform Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract Address:</span>
              <span className="text-foreground font-mono text-xs">
                {isPreviewMode ? '0x1234...5678 (Demo)' : '0x5FbDB2...80aa3'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="text-foreground">
                {isPreviewMode ? 'Demo Network' : 'Localhost'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode:</span>
              <span className="text-foreground">
                {isPreviewMode ? 'Preview' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="text-foreground capitalize">
                {effectiveRole === 'admin' ? 'Admin/Owner' : effectiveRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

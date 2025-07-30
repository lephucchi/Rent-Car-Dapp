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

              {/* Detailed Connection Guide */}
              <div className="max-w-4xl mx-auto">
                {!isMetaMaskInstalled ? (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Hướng dẫn cài đặt và kết nối ví
                      </h2>
                      <p className="text-muted-foreground">
                        Thực hiện các bước sau để bắt đầu sử dụng dịch vụ thuê xe blockchain
                      </p>
                    </div>

                    {/* Step 1: Install MetaMask */}
                    <div className="aurora-glass border border-red-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Cài đặt MetaMask
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            MetaMask là ví tiền mã hóa cần thiết để kết nối với nền tảng.
                            Đây là bước đầu tiên và quan trọng nhất.
                          </p>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-700 text-sm font-medium">
                              ⚠️ Bạn cần cài đặt MetaMask trước khi tiếp tục
                            </p>
                          </div>
                          <a
                            href="https://metamask.io/download/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aurora-button-secondary w-full text-center"
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Tải xuống và cài đặt MetaMask
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Additional steps preview */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="aurora-glass border border-gray-200 rounded-lg p-6 opacity-60">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Tạo ví mới</h3>
                            <p className="text-muted-foreground text-sm">
                              Sau khi cài đặt, tạo ví mới hoặc import ví hiện có
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="aurora-glass border border-gray-200 rounded-lg p-6 opacity-60">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Kết nối ví</h3>
                            <p className="text-muted-foreground text-sm">
                              Kết nối ví với nền tảng để bắt đầu thuê xe
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Hướng dẫn kết nối ví MetaMask
                      </h2>
                      <p className="text-muted-foreground">
                        Thực hiện các bước sau để kết nối ví và bắt đầu sử dụng dịch vụ
                      </p>
                    </div>

                    {/* Step 1: Connect Wallet */}
                    <div className="aurora-glass border border-primary/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Kết nối ví MetaMask
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Nhấn nút bên dưới để kết nối ví MetaMask với nền tảng.
                            Một popup sẽ xuất hiện yêu cầu bạn xác nhận kết nối.
                          </p>
                          <button
                            onClick={handleConnectWallet}
                            disabled={isLoading}
                            className="aurora-button w-full disabled:opacity-50"
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            {isLoading ? 'Đang kết nối...' : 'Kết nối ví MetaMask'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: After Connection */}
                    <div className="aurora-glass border border-secondary/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Xác nhận trong MetaMask
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Sau khi nhấn "Kết nối ví", một cửa sổ MetaMask sẽ xuất hiện.
                            Chọn tài khoản bạn muốn sử dụng và nhấn "Connect".
                          </p>
                          <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4">
                            <p className="text-secondary text-sm">
                              💡 <strong>Mẹo:</strong> Đảm bảo bạn đã unlock MetaMask và chọn đúng network (nếu cần)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Access Platform */}
                    <div className="aurora-glass border border-aurora-teal/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-aurora-teal text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Truy cập nền tảng
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Sau khi kết nối thành công, bạn sẽ có quyền truy cập vào:
                          </p>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-aurora-teal/10 border border-aurora-teal/20 rounded-lg p-3">
                              <Car className="w-6 h-6 text-aurora-teal mb-2" />
                              <p className="text-sm font-medium text-foreground">Danh sách xe</p>
                              <p className="text-xs text-muted-foreground">Xem và thuê xe có sẵn</p>
                            </div>
                            <div className="bg-aurora-blue/10 border border-aurora-blue/20 rounded-lg p-3">
                              <Shield className="w-6 h-6 text-aurora-blue mb-2" />
                              <p className="text-sm font-medium text-foreground">Giao dịch an toàn</p>
                              <p className="text-xs text-muted-foreground">Thanh toán qua smart contract</p>
                            </div>
                            <div className="bg-aurora-green/10 border border-aurora-green/20 rounded-lg p-3">
                              <Clock className="w-6 h-6 text-aurora-green mb-2" />
                              <p className="text-sm font-medium text-foreground">Theo dõi thuê xe</p>
                              <p className="text-xs text-muted-foreground">Quản lý booking realtime</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alternative: Preview Mode */}
                    <div className="aurora-glass border border-aurora-purple/30 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-aurora-purple text-white rounded-full flex items-center justify-center font-bold text-sm">💡</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Hoặc sử dụng chế độ Preview
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Nếu bạn chưa sẵn sàng kết nối ví, có thể sử dụng chế độ xem trước để khám phá nền tảng.
                          </p>
                          <div className="bg-aurora-purple/10 border border-aurora-purple/20 rounded-lg p-4">
                            <p className="text-aurora-purple text-sm">
                              🔍 <strong>Chế độ Preview:</strong> Xem giao diện và tính năng mà không cần kết nối ví thật.
                              Toggle "Preview Mode" ở thanh navigation phía trên.
                            </p>
                          </div>
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

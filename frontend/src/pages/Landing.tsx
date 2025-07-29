import React, { useState, useEffect } from 'react';
import { Car, Shield, Clock, CreditCard, ChevronRight, Wallet, Plus } from 'lucide-react';
import { useRentalContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { ContractStatus } from '../components/ContractStatus';
import { MetaMaskConnect } from '../components/MetaMaskConnect';
import { PreviewMode, createMockContractData } from '../components/PreviewMode';
import { CarCard } from '../components/CarCard';
import { debugMetaMaskConnection } from '../lib/debugMetaMask';

export default function Landing() {
  const {
    connectWallet,
    refreshContractData,
    rent,
    cancelRental,
    requestReturn,
    confirmReturn,
    setActualUsage,
    reportDamage,
    completeRental
  } = useRentalContractStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { error: transactionError } = useTransactionState();

  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isConnected) {
      refreshContractData();
    }
  }, [isConnected, refreshContractData]);

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setConnectionError(null);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectionError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  // Mock car data for preview mode
  const mockCars = [
    {
      id: '1',
      assetName: 'Tesla Model S',
      rentalFeePerDay: '1000000000000000000', // 1 ETH
      insuranceFee: '500000000000000000', // 0.5 ETH
      durationDays: 7,
      isRented: false,
      lessor: '0x1234567890123456789012345678901234567890',
      status: 'Available' as const,
      depositRequired: '1500000000000000000', // 1.5 ETH
      totalRentalFee: '7000000000000000000', // 7 ETH
    },
    {
      id: '2',
      assetName: 'BMW X5',
      rentalFeePerDay: '800000000000000000', // 0.8 ETH
      insuranceFee: '400000000000000000', // 0.4 ETH
      durationDays: 5,
      isRented: true,
      lessor: '0x1234567890123456789012345678901234567890',
      lessee: '0x0987654321098765432109876543210987654321',
      status: 'Rented' as const,
    },
    {
      id: '3',
      assetName: 'Audi A8',
      rentalFeePerDay: '1200000000000000000', // 1.2 ETH
      insuranceFee: '600000000000000000', // 0.6 ETH
      durationDays: 3,
      isRented: false,
      lessor: '0x1111222233334444555566667777888899990000',
      status: 'Awaiting Return Confirmation' as const,
    }
  ];

  // Get real car data from contract (if connected)
  const getRealCarData = () => {
    if (!contractState) return [];
    
    return [{
      id: contractState.lessor || '1',
      assetName: contractState.assetName,
      rentalFeePerDay: contractState.rentalFeePerDay?.toString() || contractState.rentalFeePerMinute?.toString() || '0',
      insuranceFee: contractState.insuranceFee?.toString() || '0',
      durationDays: contractState.durationDays || contractState.durationMinutes || 0,
      isRented: contractState.isRented,
      lessor: contractState.lessor,
      lessee: contractState.lessee === '0x0000000000000000000000000000000000000000' ? undefined : contractState.lessee,
      status: contractState.isDamaged ? 'Damaged' as const : 
              contractState.isRented ? 'Rented' as const :
              contractState.renterRequestedReturn ? 'Awaiting Return Confirmation' as const :
              'Available' as const,
      depositRequired: feeCalculation?.deposit?.toString(),
      totalRentalFee: feeCalculation?.totalRentalFee?.toString(),
    }];
  };

  const handleRentCar = (carId: string) => {
    if (isConnected) {
      rent();
    }
  };

  const handleManageCar = (carId: string) => {
    // Navigate to admin panel or show management modal
    window.location.href = '/admin';
  };

  const handleInspectCar = (carId: string) => {
    // Navigate to inspector panel
    window.location.href = '/inspector';
  };

  // Show connection interface if not connected and not in preview mode
  if (!isConnected && !previewMode) {
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

              {/* Connect Wallet and Preview Mode Controls */}
              <div className="max-w-md mx-auto space-y-4">
                <MetaMaskConnect
                  onConnect={handleConnectWallet}
                  connecting={connecting}
                  error={connectionError}
                />

                <div className="text-center">
                  <span className="text-muted-foreground text-sm">or</span>
                </div>

                <button
                  onClick={() => setPreviewMode(true)}
                  className="luxury-button-outline w-full"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Preview Platform
                </button>

                {/* Debug button for development */}
                {import.meta.env.DEV && (
                  <button
                    onClick={debugMetaMaskConnection}
                    className="mt-4 text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Debug MetaMask Connection
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-black mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Simple, secure, and transparent car rental process</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-lg font-semibold text-black mb-2">Connect Wallet</h3>
                <p className="text-gray-600">Connect your MetaMask wallet to access the platform</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-lg font-semibold text-black mb-2">Pay Deposit</h3>
                <p className="text-gray-600">Pay deposit to secure your rental booking</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-lg font-semibold text-black mb-2">Enjoy Your Ride</h3>
                <p className="text-gray-600">Use the vehicle for the agreed rental period</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                <h3 className="text-lg font-semibold text-black mb-2">Return & Pay</h3>
                <p className="text-gray-600">Return the car and complete final payment</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show loading state if connected but contract data not loaded
  if (isConnected && !contractState && !previewMode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <h2 className="text-2xl font-light text-black">Loading Contract Data...</h2>
        </div>
      </div>
    );
  }

  // Main Homepage with Car List Section
  const cars = previewMode ? mockCars : getRealCarData();

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Connection Error Display */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{connectionError}</p>
          </div>
        )}

        {/* Role Detection Notice */}
        {isConnected && (
          <div className="luxury-card p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <span className="font-medium text-foreground">
                    Connected as: {userRole === 'lessor' ? 'Admin/Owner' : userRole === 'inspector' ? 'Inspector' : 'User'}
                  </span>
                  {userRole === 'lessor' && (
                    <p className="text-sm text-muted-foreground">
                      You have admin access. <a href="/admin" className="text-primary hover:underline">Go to Admin Panel</a>
                    </p>
                  )}
                  {userRole === 'inspector' && (
                    <p className="text-sm text-muted-foreground">
                      You have inspector access. <a href="/inspector" className="text-primary hover:underline">Go to Inspector Panel</a>
                    </p>
                  )}
                </div>
              </div>
              {previewMode && (
                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Preview Mode
                </span>
              )}
            </div>
          </div>
        )}

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
              <h2 className="text-2xl font-semibold text-foreground mb-2">Available Cars</h2>
              <p className="text-muted-foreground">
                {previewMode ? 'Preview: Sample car listings' : 'Real-time car availability from smart contracts'}
              </p>
            </div>
            {userRole === 'lessor' && (
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
                  userRole={userRole}
                  onRentCar={handleRentCar}
                  onManageCar={handleManageCar}
                  onInspectCar={handleInspectCar}
                  isPreview={previewMode}
                />
              ))}
            </div>
          ) : (
            <div className="luxury-card p-12 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Cars Available</h3>
              <p className="text-muted-foreground mb-6">
                {userRole === 'lessor' 
                  ? 'Start by adding your first car to the platform.'
                  : 'Check back later for new car listings.'
                }
              </p>
              {userRole === 'lessor' && (
                <a href="/lend" className="ferrari-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Car
                </a>
              )}
            </div>
          )}
        </div>

        {/* Contract Status */}
        {isConnected && contractState && (
          <ContractStatus
            isConnected={isConnected}
            userRole={userRole}
            contractAddress={rentalContractService.getContractAddress()}
          />
        )}

        {/* Contract Information */}
        <div className="luxury-card p-6 mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Platform Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract Address:</span>
              <span className="text-foreground font-mono text-xs">
                {rentalContractService.getContractAddress()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="text-foreground">
                {rentalContractService.getNetworkInfo().network}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode:</span>
              <span className="text-foreground">
                {previewMode ? 'Preview' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="text-foreground capitalize">
                {userRole === 'lessor' ? 'Admin/Owner' : userRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

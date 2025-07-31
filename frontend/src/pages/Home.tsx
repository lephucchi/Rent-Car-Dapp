import React, { useState, useEffect } from 'react';
import { Car, Shield, Clock, CreditCard, ChevronRight, Wallet, Plus, Eye, User, Settings, Bell, X } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole, useConnectionState } from '../stores/globalWeb3Store';
import { mockDataService, type MockCar } from '../services/mockDataService';
import { debugMetaMaskConnection } from '../lib/debugMetaMask';
import { isMetaMaskInstalled as checkMetaMaskInstalled } from '../utils/metamaskUtils';

interface CarDetailModalProps {
  car: MockCar;
  isOpen: boolean;
  onClose: () => void;
  onRent: (carId: string) => void;
  onCancel: (carId: string) => void;
  onRequestReturn: (carId: string) => void;
  onCompleteRental: (carId: string) => void;
  onManageCar: (carId: string) => void;
  onInspectCar: (carId: string) => void;
  isPreview: boolean;
  userRole: string;
}

const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  isOpen,
  onClose,
  onRent,
  onCancel,
  onRequestReturn,
  onCompleteRental,
  onManageCar,
  onInspectCar,
  isPreview,
  userRole
}) => {
  if (!isOpen) return null;

  const dailyRate = parseFloat(mockDataService.formatEther(car.rentalFeePerDay));
  const insurance = parseFloat(mockDataService.formatEther(car.insuranceFee));
  const totalRental = dailyRate * car.durationDays;
  const deposit = (totalRental + insurance) * 0.3; // 30% deposit as per user flow
  const remainingPayment = totalRental + insurance - deposit;

  const getActionButtons = () => {
    if (userRole === 'admin' && car.lessor.toLowerCase().includes('admin')) {
      return (
        <div className="space-y-3">
          <button
            onClick={() => onManageCar(car.id)}
            className="luxury-button w-full"
          >
            <Settings className="w-5 h-5 mr-2" />
            Manage Car {isPreview && '(Preview)'}
          </button>
          {car.status === 'Awaiting Return Confirmation' && (
            <button
              onClick={() => onCompleteRental(car.id)}
              className="aurora-button w-full"
            >
              Confirm Return {isPreview && '(Preview)'}
            </button>
          )}
        </div>
      );
    }

    if (userRole === 'inspector' && car.status === 'Awaiting Return Confirmation') {
      return (
        <button
          onClick={() => onInspectCar(car.id)}
          className="luxury-button w-full"
        >
          <Eye className="w-5 h-5 mr-2" />
          Inspect Car {isPreview && '(Preview)'}
        </button>
      );
    }

    // User actions
    if (car.status === 'Available') {
      return (
        <button
          onClick={() => onRent(car.id)}
          className="ferrari-button w-full"
        >
          <Car className="w-5 h-5 mr-2" />
          Rent Car - {deposit.toFixed(3)} ETH Deposit {isPreview && '(Preview)'}
        </button>
      );
    }

    if (car.status === 'Rented' && car.lessee?.toLowerCase().includes('user')) {
      return (
        <div className="space-y-3">
          <button
            onClick={() => onCancel(car.id)}
            className="luxury-button-outline w-full"
          >
            Cancel Rental {isPreview && '(Preview)'}
          </button>
          <button
            onClick={() => onRequestReturn(car.id)}
            className="luxury-button w-full"
          >
            <ChevronRight className="w-5 h-5 mr-2" />
            Request Return {isPreview && '(Preview)'}
          </button>
        </div>
      );
    }

    if (car.status === 'Awaiting Return Confirmation' && car.lessee?.toLowerCase().includes('user')) {
      return (
        <button
          onClick={() => onCompleteRental(car.id)}
          className="ferrari-button w-full"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Complete Rental - {remainingPayment.toFixed(3)} ETH {isPreview && '(Preview)'}
        </button>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-4">
        This car is not available for your current role
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="luxury-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">{car.assetName}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Car Status */}
          <div className="mb-6">
            <div className={`status-indicator inline-block ${
              car.status === 'Available' ? 'status-active' :
              car.status === 'Rented' ? 'status-pending' :
              car.status === 'Awaiting Return Confirmation' ? 'status-pending' :
              'status-error'
            }`}>
              {car.status}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rental Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Rate:</span>
                <span className="font-semibold">{dailyRate.toFixed(3)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{car.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance Fee:</span>
                <span className="font-semibold">{insurance.toFixed(3)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Rental Fee:</span>
                <span className="font-semibold">{(totalRental + insurance).toFixed(3)} ETH</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Deposit Required (30%):</span>
                <span className="font-bold text-primary">{deposit.toFixed(3)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Payment:</span>
                <span className="font-semibold">{remainingPayment.toFixed(3)} ETH</span>
              </div>
            </div>
          </div>

          {/* Owner/Renter Information */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <User className="w-4 h-4 mr-2" />
                Owner:
              </span>
              <span className="font-mono text-sm">
                {car.lessor.slice(0, 8)}...{car.lessor.slice(-6)}
              </span>
            </div>
            {car.lessee && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Current Renter:
                </span>
                <span className="font-mono text-sm">
                  {car.lessee.slice(0, 8)}...{car.lessee.slice(-6)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {getActionButtons()}

          {isPreview && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/30 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                🔍 Preview Mode: All transactions are simulated
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const { isLoading, error } = useConnectionState();
  const globalUserRole = useGlobalUserRole();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<MockCar | null>(null);

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
      mockDataService.updateCarStatus(carId, 'Rented', '0x9876543210987654321098765432109876543210');
      alert('Preview Mode: Car rental initiated successfully! Deposit paid.');
      setSelectedCar(null);
      return;
    }
    // Real rental logic would go here
    console.log('Renting car:', carId);
  };

  const handleManageCar = (carId: string) => {
    if (isPreviewMode) {
      alert('Preview Mode: This would open car management options');
      setSelectedCar(null);
      return;
    }
    // Navigate to admin panel or show management modal
    window.location.href = '/admin';
  };

  const handleInspectCar = (carId: string) => {
    if (isPreviewMode) {
      alert('Preview Mode: This would open inspection interface');
      setSelectedCar(null);
      return;
    }
    // Navigate to inspector panel
    window.location.href = '/inspector';
  };

  const handleCancelRental = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Available');
      alert('Preview Mode: Rental cancelled successfully!');
      setSelectedCar(null);
    }
  };

  const handleRequestReturn = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Awaiting Return Confirmation', '0x9876543210987654321098765432109876543210');
      alert('Preview Mode: Return request submitted!');
      setSelectedCar(null);
    }
  };

  const handleCompleteRental = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Available');
      alert('Preview Mode: Rental completed successfully! Remaining payment processed.');
      setSelectedCar(null);
    }
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
                CarDapp
                <br />
                <span className="gradient-text-aurora">Blockchain Car Rental</span>
              </h1>
              <p className="luxury-subheading max-w-3xl mx-auto mb-12">
                Experience the future of car rental with blockchain security.
                Connect your wallet to rent luxury vehicles with transparent pricing and instant confirmations.
              </p>
              
              <div className="luxury-card p-8 max-w-4xl mx-auto mb-12">
                <div className="luxury-grid-3">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Smart Contract Security</h3>
                    <p className="text-muted-foreground">All transactions secured by Ethereum smart contracts</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Instant Booking</h3>
                    <p className="text-muted-foreground">Pay 30% deposit and start renting immediately</p>
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

              {/* Connection Interface */}
              <div className="max-w-4xl mx-auto">
                {!isMetaMaskInstalled ? (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Setup MetaMask Wallet
                      </h2>
                      <p className="text-muted-foreground">
                        You need MetaMask to interact with CarDapp blockchain features
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <div className="aurora-glass border border-primary/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">1</div>
                        <h3 className="font-semibold text-foreground mb-2">Download MetaMask</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Install the browser extension
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

                      <div className="aurora-glass border border-secondary/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">2</div>
                        <h3 className="font-semibold text-foreground mb-2">Install</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Add extension to your browser
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          1-2 minutes
                        </div>
                      </div>

                      <div className="aurora-glass border border-aurora-green/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-aurora-green text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">3</div>
                        <h3 className="font-semibold text-foreground mb-2">Setup Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create new or import existing wallet
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Secure
                        </div>
                      </div>

                      <div className="aurora-glass border border-aurora-teal/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-aurora-teal text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">4</div>
                        <h3 className="font-semibold text-foreground mb-2">Connect</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ready to connect to CarDapp
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Car className="w-3 h-3 mr-1" />
                          Ready
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-600 text-sm font-medium text-center">
                        ⚠️ MetaMask installation required to continue
                      </p>
                    </div>

                    <div className="text-center">
                      <button
                        disabled={true}
                        className="aurora-button w-full max-w-md mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet (Install MetaMask first)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        MetaMask Ready!
                      </h2>
                      <p className="text-muted-foreground">
                        Great! MetaMask is installed. Connect your wallet to start using CarDapp
                      </p>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleConnectWallet}
                        disabled={isLoading}
                        className="aurora-button w-full max-w-md mx-auto disabled:opacity-50"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        {isLoading ? 'Connecting...' : 'Connect MetaMask Wallet'}
                      </button>
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

        {/* User Flow Explanation */}
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-foreground mb-4">How CarDapp Works</h2>
              <p className="text-xl text-muted-foreground">Complete user flow for all roles</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground">MetaMask detects your role: User, Owner, or Inspector</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pay 30% Deposit</h3>
                <p className="text-muted-foreground">Secure your rental with smart contract deposit</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pickup at Station</h3>
                <p className="text-muted-foreground">Get your car from designated rental station</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Return & Pay</h3>
                <p className="text-muted-foreground">Return car, complete remaining payment</p>
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
        {/* Role Detection and Quick Stats */}
        <div className="luxury-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div>
                <span className="font-medium text-foreground">
                  {isPreviewMode ? 'Preview Mode' : 'Connected'} as: 
                  <span className="ml-1 font-bold text-primary">
                    {effectiveRole === 'admin' ? 'Car Owner/Admin' : effectiveRole === 'inspector' ? 'Damage Inspector' : 'Renter'}
                  </span>
                </span>
                <div className="text-sm text-muted-foreground mt-1">
                  {effectiveRole === 'admin' && 'Manage your cars, confirm returns, report damage'}
                  {effectiveRole === 'inspector' && 'Assess damage on returned cars'}
                  {effectiveRole === 'user' && 'Browse and rent available cars'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {effectiveRole === 'admin' && (
                <a href="/admin" className="text-primary hover:underline text-sm">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Admin Panel
                </a>
              )}
              {effectiveRole === 'inspector' && (
                <a href="/inspector" className="text-primary hover:underline text-sm">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Inspector Panel
                </a>
              )}
              {isPreviewMode && (
                <span className="text-sm text-primary bg-primary/20 px-2 py-1 rounded border border-primary/30">
                  Demo Data
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-foreground mb-4">
            Welcome to <span className="gradient-text-aurora">CarDapp</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Blockchain-powered car rental platform with transparent pricing, secure smart contracts, 
            and role-based access for Renters, Owners, and Inspectors.
          </p>
        </div>

        {/* Car List Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {effectiveRole === 'admin' ? 'Your Cars' : 
                 effectiveRole === 'inspector' ? 'Cars Awaiting Inspection' : 
                 'Available Cars'}
              </h2>
              <p className="text-muted-foreground">
                {isPreviewMode ? 'Preview: Sample car listings' : 'Real-time data from smart contracts'}
              </p>
            </div>
            {effectiveRole === 'admin' && (
              <a href="/lend" className="luxury-button">
                <Plus className="w-4 h-4 mr-2" />
                Register New Car
              </a>
            )}
          </div>

          {cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div 
                  key={car.id} 
                  className="luxury-card p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedCar(car)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 ferrari-gradient rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{car.assetName}</h3>
                        <div className={`status-indicator ${
                          car.status === 'Available' ? 'status-active' :
                          car.status === 'Rented' ? 'status-pending' :
                          car.status === 'Awaiting Return Confirmation' ? 'status-pending' :
                          'status-error'
                        }`}>
                          {car.status}
                        </div>
                      </div>
                    </div>
                    {/* Role-based action indicator */}
                    {effectiveRole === 'admin' && <Settings className="w-5 h-5 text-muted-foreground" />}
                    {effectiveRole === 'inspector' && car.status === 'Awaiting Return Confirmation' && <Eye className="w-5 h-5 text-blue-500" />}
                    {effectiveRole === 'user' && car.status === 'Available' && <Car className="w-5 h-5 text-green-500" />}
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span className="font-semibold">{mockDataService.formatEther(car.rentalFeePerDay)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">{car.durationDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-mono text-xs">{car.lessor.slice(0, 6)}...{car.lessor.slice(-4)}</span>
                    </div>
                    {car.lessee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Renter:</span>
                        <span className="font-mono text-xs">{car.lessee.slice(0, 6)}...{car.lessee.slice(-4)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      Click for {effectiveRole === 'admin' ? 'management' : effectiveRole === 'inspector' ? 'inspection' : 'rental'} options
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="luxury-card p-12 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {effectiveRole === 'admin' ? 'No Cars Registered' :
                 effectiveRole === 'inspector' ? 'No Cars Awaiting Inspection' :
                 'No Cars Available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {effectiveRole === 'admin' 
                  ? 'Start by registering your first car on the platform.'
                  : effectiveRole === 'inspector'
                  ? 'Check back when cars need damage assessment.'
                  : 'Check back later for new car listings or browse other pages.'
                }
              </p>
              {effectiveRole === 'admin' && (
                <a href="/lend" className="ferrari-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Car
                </a>
              )}
            </div>
          )}
        </div>

        {/* Platform Information */}
        <div className="luxury-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">CarDapp Platform Info</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Smart Contract:</span>
              <span className="text-foreground font-mono text-xs">
                {isPreviewMode ? '0x1234...5678 (Demo)' : '0x5FbDB2...80aa3'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="text-foreground">
                {isPreviewMode ? 'Demo Network' : 'Localhost Testnet'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-foreground">
                {isPreviewMode ? 'Preview Mode' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="text-foreground capitalize">
                {effectiveRole === 'admin' ? 'Car Owner/Admin' : effectiveRole === 'inspector' ? 'Inspector' : 'Renter'}
              </span>
            </div>
          </div>
        </div>

        {/* Car Detail Modal */}
        <CarDetailModal
          car={selectedCar!}
          isOpen={!!selectedCar}
          onClose={() => setSelectedCar(null)}
          onRent={handleRentCar}
          onCancel={handleCancelRental}
          onRequestReturn={handleRequestReturn}
          onCompleteRental={handleCompleteRental}
          onManageCar={handleManageCar}
          onInspectCar={handleInspectCar}
          isPreview={isPreviewMode}
          userRole={effectiveRole}
        />
      </div>
    </div>
  );
}

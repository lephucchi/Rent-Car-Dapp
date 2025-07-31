import React, { useState } from 'react';
import { Car, DollarSign, Shield, Clock, User, CreditCard, ChevronRight, X } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';
import { mockDataService, type MockCar } from '../services/mockDataService';
import { ethers } from 'ethers';

interface CarDetailModalProps {
  car: MockCar;
  isOpen: boolean;
  onClose: () => void;
  onRent: (carId: string) => void;
  onCancel: (carId: string) => void;
  onRequestReturn: (carId: string) => void;
  onCompleteRental: (carId: string) => void;
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
  isPreview,
  userRole
}) => {
  if (!isOpen) return null;

  const dailyRate = parseFloat(ethers.formatEther(car.rentalFeePerDay));
  const insurance = parseFloat(ethers.formatEther(car.insuranceFee));
  const totalRental = dailyRate * car.durationDays;
  const totalCost = totalRental + insurance;
  const deposit = totalCost * 0.3; // 30% deposit as per CarDapp user flow
  const remainingPayment = totalCost - deposit;

  const isUserRenter = car.lessee === '0x0987654321098765432109876543210987654321'; // Mock user address

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <span className="font-semibold">{dailyRate} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{car.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance Fee:</span>
                <span className="font-semibold">{insurance} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Rental:</span>
                <span className="font-semibold">{totalRental.toFixed(3)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost (incl. insurance):</span>
                <span className="font-semibold">{totalCost.toFixed(3)} ETH</span>
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

          {/* Owner Information */}
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
          <div className="space-y-3">
            {car.status === 'Available' && (
              <button
                onClick={() => onRent(car.id)}
                className="ferrari-button w-full"
              >
                <Car className="w-5 h-5 mr-2" />
                Rent Car - {deposit} ETH {isPreview && '(Preview)'}
              </button>
            )}

            {car.status === 'Rented' && isUserRenter && (
              <>
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
              </>
            )}

            {car.status === 'Awaiting Return Confirmation' && isUserRenter && (
              <button
                onClick={() => onCompleteRental(car.id)}
                className="ferrari-button w-full"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Complete Rental - {remainingPayment.toFixed(2)} ETH {isPreview && '(Preview)'}
              </button>
            )}

            {car.status === 'Rented' && !isUserRenter && (
              <div className="text-center text-muted-foreground py-4">
                This car is currently rented by another user
              </div>
            )}
          </div>

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

export default function RentCar() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [selectedCar, setSelectedCar] = useState<MockCar | null>(null);

  // Determine effective role and access
  const effectiveRole = isPreviewMode ? simulatedRole : 
    (globalUserRole === 'admin' ? 'admin' : globalUserRole);
  
  const hasAccess = isConnected || isPreviewMode;

  // Show connection prompt if not connected and not in preview mode
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to browse and rent available cars.
          </p>
          <button onClick={connectWallet} className="luxury-button w-full">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const getAvailableCars = (): MockCar[] => {
    if (isPreviewMode) {
      return mockDataService.getAvailableCars();
    }
    // In real implementation, get available cars from contract
    return mockDataService.getAvailableCars();
  };

  const getUserRentals = (): MockCar[] => {
    if (isPreviewMode) {
      // Simulate user having rented some cars
      return mockDataService.getAllCars().filter(car => 
        car.lessee === '0x0987654321098765432109876543210987654321'
      );
    }
    // In real implementation, get user's current rentals
    return mockDataService.getAllCars().filter(car => 
      car.lessee?.toLowerCase() === address?.toLowerCase()
    );
  };

  const handleRent = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Rented', '0x0987654321098765432109876543210987654321');
      alert('Preview Mode: Car rental initiated successfully!');
      setSelectedCar(null);
    } else {
      // Real rental logic
      console.log('Renting car:', carId);
    }
  };

  const handleCancel = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Available');
      alert('Preview Mode: Rental cancelled successfully!');
      setSelectedCar(null);
    } else {
      // Real cancellation logic
      console.log('Cancelling rental:', carId);
    }
  };

  const handleRequestReturn = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Awaiting Return Confirmation', '0x0987654321098765432109876543210987654321');
      alert('Preview Mode: Return request submitted!');
      setSelectedCar(null);
    } else {
      // Real return request logic
      console.log('Requesting return for car:', carId);
    }
  };

  const handleCompleteRental = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Available');
      alert('Preview Mode: Rental completed successfully!');
      setSelectedCar(null);
    } else {
      // Real completion logic
      console.log('Completing rental for car:', carId);
    }
  };

  const availableCars = getAvailableCars();
  const userRentals = getUserRentals();

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">Rent a Car</h1>
          <p className="text-muted-foreground">
            {isPreviewMode ? 'Preview: Browse CarDapp vehicle listings and rental process' : 'Browse available cars and rent with 30% deposit through CarDapp smart contracts'}
          </p>
        </div>

        {/* Preview Mode Notice */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 dark:bg-blue-900/30 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              🔍 Preview Mode: Transactions are disabled. Click on cars to see rental interface.
            </p>
          </div>
        )}

        {/* User's Current Rentals */}
        {userRentals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Your Current Rentals ({userRentals.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRentals.map((car) => (
                <div 
                  key={car.id} 
                  className="luxury-card p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedCar(car)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{car.assetName}</h3>
                      <div className={`status-indicator ${
                        car.status === 'Rented' ? 'status-pending' :
                        car.status === 'Awaiting Return Confirmation' ? 'status-pending' :
                        'status-active'
                      }`}>
                        {car.status}
                      </div>
                    </div>
                    <Car className="w-6 h-6 text-primary" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span>{ethers.formatEther(car.rentalFeePerDay)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{car.durationDays} days</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-xs text-muted-foreground">Click for actions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Cars */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
            <Car className="w-6 h-6 mr-2" />
            Available Cars ({availableCars.length})
          </h2>
          
          {availableCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCars.map((car) => (
                <div 
                  key={car.id} 
                  className="luxury-card p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedCar(car)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{car.assetName}</h3>
                      <div className="status-indicator status-active">
                        Available
                      </div>
                    </div>
                    <Car className="w-6 h-6 text-green-500" />
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span className="font-semibold">{ethers.formatEther(car.rentalFeePerDay)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">{car.durationDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insurance:</span>
                      <span className="font-semibold">{ethers.formatEther(car.insuranceFee)} ETH</span>
                    </div>
                  </div>

                  {/* Quick Pricing Preview */}
                  <div className="bg-muted/30 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Deposit Required:</span>
                      <span className="font-bold text-foreground">
                        {(parseFloat(ethers.formatEther(car.rentalFeePerDay)) * car.durationDays + parseFloat(ethers.formatEther(car.insuranceFee))).toFixed(2)} ETH
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">Click for details & rental</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="luxury-card p-12 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Cars Available</h3>
              <p className="text-muted-foreground">
                Check back later for new car listings or contact car owners directly.
              </p>
            </div>
          )}
        </div>

        {/* Car Detail Modal */}
        <CarDetailModal
          car={selectedCar!}
          isOpen={!!selectedCar}
          onClose={() => setSelectedCar(null)}
          onRent={handleRent}
          onCancel={handleCancel}
          onRequestReturn={handleRequestReturn}
          onCompleteRental={handleCompleteRental}
          isPreview={isPreviewMode}
          userRole={effectiveRole}
        />
      </div>
    </div>
  );
}

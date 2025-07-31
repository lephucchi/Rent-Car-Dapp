import React, { useState } from 'react';
import { Car, Plus, Shield, Settings, Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';
import { mockDataService, type MockCar } from '../services/mockDataService';
import { ethers } from 'ethers';

interface CarFormData {
  carName: string;
  rentalFeePerDay: string;
  duration: string;
  insuranceFee: string;
}

export default function LendCar() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [formData, setFormData] = useState<CarFormData>({
    carName: '',
    rentalFeePerDay: '',
    duration: '',
    insuranceFee: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState<{ type: 'usage' | 'damage' | null; carId: string | null }>({ type: null, carId: null });
  const [modalInput, setModalInput] = useState('');

  // Determine effective role and access
  const effectiveRole = isPreviewMode ? simulatedRole : 
    (globalUserRole === 'admin' ? 'admin' : globalUserRole);
  
  const hasAccess = isConnected || isPreviewMode;
  const isAdmin = effectiveRole === 'admin';

  // Redirect non-admin users
  if (hasAccess && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            This page is only accessible to Admin/Owner accounts.
          </p>
          <a href="/" className="luxury-button">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Show connection prompt if not connected and not in preview mode
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to access the car management interface.
          </p>
          <button onClick={connectWallet} className="luxury-button w-full">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const getOwnedCars = (): MockCar[] => {
    if (isPreviewMode) {
      return mockDataService.getOwnedCars('0x1234567890123456789012345678901234567890');
    }
    // In real implementation, get cars owned by connected address
    return mockDataService.getOwnedCars(address || '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isPreviewMode) {
        // Simulate car addition in preview mode
        mockDataService.addCar({
          assetName: formData.carName,
          rentalFeePerDay: ethers.parseEther(formData.rentalFeePerDay || '0').toString(),
          insuranceFee: ethers.parseEther(formData.insuranceFee || '0').toString(),
          durationDays: parseInt(formData.duration) || 1,
          lessor: '0x1234567890123456789012345678901234567890',
          depositRequired: ethers.parseEther((parseFloat(formData.rentalFeePerDay || '0') * 1.5).toString()).toString(),
          totalRentalFee: ethers.parseEther((parseFloat(formData.rentalFeePerDay || '0') * parseInt(formData.duration || '1')).toString()).toString()
        });
        
        alert('Preview Mode: Car would be deployed to blockchain');
        setFormData({ carName: '', rentalFeePerDay: '', duration: '', insuranceFee: '' });
      } else {
        // Real implementation would deploy contract here
        console.log('Deploying car contract:', formData);
        alert('Real deployment would happen here');
      }
    } catch (error) {
      console.error('Failed to deploy car contract:', error);
      alert('Failed to deploy car contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActualUsage = (carId: string) => {
    if (isPreviewMode) {
      alert(`Preview Mode: Would set actual usage to ${modalInput} days for car ${carId}`);
    } else {
      // Real implementation
      console.log('Setting actual usage:', carId, modalInput);
    }
    setShowModal({ type: null, carId: null });
    setModalInput('');
  };

  const handleConfirmReturn = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Available');
      alert('Preview Mode: Return confirmed, car is now available');
    } else {
      // Real implementation
      console.log('Confirming return for car:', carId);
    }
  };

  const handleReportDamage = (carId: string) => {
    if (isPreviewMode) {
      mockDataService.updateCarStatus(carId, 'Damaged');
      alert('Preview Mode: Damage reported, awaiting inspector assessment');
    } else {
      // Real implementation
      console.log('Reporting damage for car:', carId);
    }
  };

  const ownedCars = getOwnedCars();

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">Lend Your Car</h1>
          <p className="text-muted-foreground">
            {isPreviewMode ? 'Preview: Register and manage cars for rental on CarDapp' : 'Register your car on CarDapp blockchain platform and manage rentals'}
          </p>
        </div>

        {/* Preview Mode Notice */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 dark:bg-blue-900/30 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              🔍 Preview Mode: Transactions are disabled. This interface shows admin functionality.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Car Registration Form */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Car
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="carName" className="block text-sm font-medium text-foreground mb-2">
                  Car Name
                </label>
                <input
                  type="text"
                  id="carName"
                  name="carName"
                  value={formData.carName}
                  onChange={handleInputChange}
                  placeholder="e.g., Tesla Model S"
                  className="luxury-input w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="rentalFeePerDay" className="block text-sm font-medium text-foreground mb-2">
                  Rental Fee Per Day (ETH)
                </label>
                <input
                  type="number"
                  id="rentalFeePerDay"
                  name="rentalFeePerDay"
                  value={formData.rentalFeePerDay}
                  onChange={handleInputChange}
                  placeholder="1.0"
                  step="0.01"
                  min="0"
                  className="luxury-input w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-foreground mb-2">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="7"
                  min="1"
                  className="luxury-input w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="insuranceFee" className="block text-sm font-medium text-foreground mb-2">
                  Insurance Fee (ETH)
                </label>
                <input
                  type="number"
                  id="insuranceFee"
                  name="insuranceFee"
                  value={formData.insuranceFee}
                  onChange={handleInputChange}
                  placeholder="0.5"
                  step="0.01"
                  min="0"
                  className="luxury-input w-full"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ferrari-button w-full disabled:opacity-50"
              >
                {isSubmitting ? 'Deploying...' : 'Deploy Car Contract'}
              </button>
            </form>
          </div>

          {/* Statistics Panel */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Your Statistics
            </h2>
            
            {(() => {
              const stats = mockDataService.getAdminStatistics();
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Cars:</span>
                    <span className="font-semibold text-foreground">{stats.totalCars}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Currently Rented:</span>
                    <span className="font-semibold text-foreground">{stats.activeCars}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-semibold text-foreground">{stats.availableCars}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Awaiting Inspection:</span>
                    <span className="font-semibold text-foreground">{stats.awaitingInspection}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Damaged:</span>
                    <span className="font-semibold text-foreground">{stats.damagedCars}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-semibold text-foreground">{stats.totalRevenue.toFixed(2)} ETH</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Owned Cars List */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
            <Car className="w-6 h-6 mr-2" />
            Your Cars ({ownedCars.length})
          </h2>
          
          {ownedCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedCars.map((car) => (
                <div key={car.id} className="luxury-card p-6">
                  <div className="flex items-start justify-between mb-4">
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

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span>{ethers.formatEther(car.rentalFeePerDay)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{car.durationDays} days</span>
                    </div>
                    {car.lessee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Renter:</span>
                        <span className="font-mono text-xs">{car.lessee.slice(0, 6)}...{car.lessee.slice(-4)}</span>
                      </div>
                    )}
                  </div>

                  {/* Management Actions */}
                  <div className="space-y-2">
                    {car.status === 'Rented' && (
                      <button
                        onClick={() => setShowModal({ type: 'usage', carId: car.id })}
                        className="luxury-button-outline w-full text-sm"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Set Actual Usage
                      </button>
                    )}
                    
                    {car.status === 'Awaiting Return Confirmation' && (
                      <>
                        <button
                          onClick={() => handleConfirmReturn(car.id)}
                          className="luxury-button w-full text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Return
                        </button>
                        <button
                          onClick={() => handleReportDamage(car.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full text-sm transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Report Damage
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="luxury-card p-12 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Cars Added</h3>
              <p className="text-muted-foreground">
                Start by adding your first car to the platform using the form above.
              </p>
            </div>
          )}
        </div>

        {/* Modal for Set Actual Usage */}
        {showModal.type === 'usage' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="luxury-card p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Set Actual Usage</h3>
              <p className="text-muted-foreground mb-4">
                Enter the actual number of days the car was used.
              </p>
              <input
                type="number"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder="Days used"
                min="1"
                className="luxury-input w-full mb-4"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSetActualUsage(showModal.carId!)}
                  className="luxury-button flex-1"
                  disabled={!modalInput}
                >
                  Set Usage
                </button>
                <button
                  onClick={() => setShowModal({ type: null, carId: null })}
                  className="luxury-button-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

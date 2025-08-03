import React, { useState, useEffect } from 'react';
import { Car, Shield, Clock, DollarSign, AlertTriangle, CheckCircle, Loader2, MapPin, Fuel, Calendar, Plus, Grid, List } from 'lucide-react';
import { ethers } from 'ethers';
import { useWalletConnection, useContractState, useContractActions, useUserRole } from '../stores/unifiedWeb3Store';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { factoryService, type VehicleListing, type CreateVehicleParams } from '../services/factoryService';

interface RentalInfoCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

const RentalInfoCard: React.FC<RentalInfoCardProps> = ({ title, value, icon, status = 'info' }) => {
  const statusStyles = {
    success: 'border-green-500 bg-green-500/10',
    warning: 'border-yellow-500 bg-yellow-500/10', 
    danger: 'border-red-500 bg-red-500/10',
    info: 'border-blue-500 bg-blue-500/10'
  };

  return (
    <div className={`luxury-card p-4 ${statusStyles[status]}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-background/20">
          {icon}
        </div>
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface RentalActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const RentalActionButton: React.FC<RentalActionButtonProps> = ({ 
  title, 
  description, 
  onClick, 
  variant, 
  disabled = false,
  loading = false,
  icon 
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full p-4 rounded-xl transition-all ${variants[variant]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}
        flex items-center justify-between group`}
    >
      <div className="text-left">
        <div className="flex items-center space-x-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm opacity-80 mt-1">{description}</p>
      </div>
    </button>
  );
};

export default function RentCar() {
  const { isPreviewMode } = usePreviewMode();
  const { isConnected, address, connectWallet, balance } = useWalletConnection();
  const { contractState, feeCalculations, refresh } = useContractState();
  const { actions, isLoading, error, lastTransactionHash, clearTransaction } = useContractActions();
  const { isLessee, roleType } = useUserRole();
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Format values for display
  const formatEther = (value: bigint) => parseFloat(ethers.formatEther(value)).toFixed(4);
  const formatMinutes = (minutes: bigint) => {
    const mins = Number(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Not started';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Handle rental actions
  const handleRentVehicle = async () => {
    try {
      clearTransaction();
      setShowRentalModal(false);
      const txHash = await actions.rentAsset();
      console.log('Rent transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Rent failed:', error);
    }
  };

  const handleCancelRental = async () => {
    try {
      clearTransaction();
      const txHash = await actions.cancelRental();
      console.log('Cancel rental transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Cancel rental failed:', error);
    }
  };

  const handleRequestReturn = async () => {
    try {
      clearTransaction();
      const txHash = await actions.requestReturn();
      console.log('Request return transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Request return failed:', error);
    }
  };

  const handleCompleteRental = async () => {
    try {
      clearTransaction();
      const txHash = await actions.completeRental();
      console.log('Complete rental transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Complete rental failed:', error);
    }
  };

  // Preview mode fallback
  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="luxury-card p-8 text-center">
            <Car className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Preview Mode</h2>
            <p className="text-muted-foreground mb-6">
              You are in preview mode. Exit preview mode to access real Web3 functionality.
            </p>
            <p className="text-sm text-muted-foreground">
              Or visit <a href="/contract" className="text-blue-500 underline">Contract Dashboard</a> for full Web3 integration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your MetaMask wallet to rent this vehicle.
          </p>
          <button onClick={connectWallet} className="luxury-button w-full">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Show loading state if contract is not loaded
  if (!contractState || !feeCalculations) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Loading Vehicle</h2>
          <p className="text-muted-foreground">
            Fetching vehicle information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Rent Vehicle</h1>
              <p className="text-muted-foreground">
                Connected: {address} • Balance: {balance} ETH • Role: {roleType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Vehicle Status</p>
              <p className={`text-xl font-semibold ${contractState.isRented ? 'text-red-500' : 'text-green-500'}`}>
                {contractState.isRented ? 'Currently Rented' : 'Available'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="luxury-card p-4 border-red-500 bg-red-500/10">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {lastTransactionHash && (
          <div className="luxury-card p-4 border-green-500 bg-green-500/10">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-500">
                Transaction completed: {lastTransactionHash.slice(0, 10)}...
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Vehicle Details
            </h2>
            
            <div className="space-y-4">
              <RentalInfoCard
                title="Vehicle Name"
                value={contractState.assetName}
                icon={<Car className="w-5 h-5 text-blue-500" />}
                status="info"
              />
              
              <RentalInfoCard
                title="Rental Rate"
                value={`${formatEther(contractState.rentalFeePerMinute)} ETH/minute`}
                icon={<DollarSign className="w-5 h-5 text-green-500" />}
                status="success"
              />
              
              <RentalInfoCard
                title="Maximum Duration"
                value={formatMinutes(contractState.durationMinutes)}
                icon={<Clock className="w-5 h-5 text-yellow-500" />}
                status="warning"
              />
              
              <RentalInfoCard
                title="Insurance Fee"
                value={`${formatEther(contractState.insuranceFee)} ETH`}
                icon={<Shield className="w-5 h-5 text-purple-500" />}
                status="info"
              />

              <RentalInfoCard
                title="Insurance Compensation"
                value={`${formatEther(contractState.insuranceCompensation)} ETH`}
                icon={<Shield className="w-5 h-5 text-red-500" />}
                status="danger"
              />

              <RentalInfoCard
                title="Vehicle Owner"
                value={`${contractState.lessor.slice(0, 6)}...${contractState.lessor.slice(-4)}`}
                icon={<MapPin className="w-5 h-5 text-gray-500" />}
                status="info"
              />
            </div>
          </div>

          {/* Rental Actions */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Fuel className="w-5 h-5 mr-2" />
              Rental Actions
            </h2>

            <div className="space-y-4 mb-6">
              {/* Cost Breakdown */}
              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rental Fee:</span>
                    <span>{formatEther(feeCalculations.totalRentalFee)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance Fee:</span>
                    <span>{formatEther(contractState.insuranceFee)} ETH</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Deposit:</span>
                    <span>{formatEther(feeCalculations.deposit)} ETH</span>
                  </div>
                </div>
              </div>

              {/* Current Rental Status */}
              {contractState.isRented && isLessee && (
                <div className="space-y-4">
                  <RentalInfoCard
                    title="Rental Started"
                    value={formatDate(contractState.startTime)}
                    icon={<Calendar className="w-5 h-5 text-green-500" />}
                    status="success"
                  />

                  {contractState.actualMinutes > 0n && (
                    <RentalInfoCard
                      title="Actual Usage"
                      value={formatMinutes(contractState.actualMinutes)}
                      icon={<Clock className="w-5 h-5 text-blue-500" />}
                      status="info"
                    />
                  )}

                  <RentalInfoCard
                    title="Damage Status"
                    value={contractState.isDamaged ? "Damage Reported" : "No Damage"}
                    icon={<Shield className="w-5 h-5" />}
                    status={contractState.isDamaged ? "danger" : "success"}
                  />

                  <RentalInfoCard
                    title="Return Status"
                    value={`Requested: ${contractState.renterRequestedReturn ? 'Yes' : 'No'} | Confirmed: ${contractState.ownerConfirmedReturn ? 'Yes' : 'No'}`}
                    icon={<CheckCircle className="w-5 h-5" />}
                    status={contractState.renterRequestedReturn && contractState.ownerConfirmedReturn ? "success" : "warning"}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Rent Vehicle - Available and not rented */}
              {!contractState.isRented && (
                <RentalActionButton
                  title="Rent This Vehicle"
                  description={`Pay ${formatEther(feeCalculations.deposit)} ETH deposit to start rental`}
                  onClick={() => setShowRentalModal(true)}
                  variant="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<Car className="w-4 h-4" />}
                />
              )}

              {/* Cancel Rental - If user is the renter and rental is active */}
              {contractState.isRented && isLessee && !contractState.renterRequestedReturn && (
                <RentalActionButton
                  title="Cancel Rental"
                  description="Cancel your current rental (may incur fees)"
                  onClick={handleCancelRental}
                  variant="danger"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<AlertTriangle className="w-4 h-4" />}
                />
              )}

              {/* Request Return - If user is the renter and hasn't requested return */}
              {contractState.isRented && isLessee && !contractState.renterRequestedReturn && (
                <RentalActionButton
                  title="Request Return"
                  description="Request to return the vehicle to the owner"
                  onClick={handleRequestReturn}
                  variant="warning"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<CheckCircle className="w-4 h-4" />}
                />
              )}

              {/* Complete Rental - If both parties confirmed return */}
              {contractState.isRented && 
               isLessee && 
               contractState.renterRequestedReturn && 
               contractState.ownerConfirmedReturn && (
                <RentalActionButton
                  title="Complete Rental"
                  description="Make final payment and complete the rental"
                  onClick={handleCompleteRental}
                  variant="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<DollarSign className="w-4 h-4" />}
                />
              )}

              {/* Vehicle already rented by someone else */}
              {contractState.isRented && !isLessee && (
                <div className="luxury-card p-4 border-red-500 bg-red-500/10">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-700">Vehicle Currently Rented</p>
                      <p className="text-sm text-red-600">
                        This vehicle is currently being rented by another user.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Waiting for owner confirmation */}
              {contractState.isRented && 
               isLessee && 
               contractState.renterRequestedReturn && 
               !contractState.ownerConfirmedReturn && (
                <div className="luxury-card p-4 border-yellow-500 bg-yellow-500/10">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-semibold text-yellow-700">Waiting for Owner Confirmation</p>
                      <p className="text-sm text-yellow-600">
                        You have requested to return the vehicle. Waiting for the owner to confirm receipt.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rental Confirmation Modal */}
        {showRentalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="luxury-card max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Confirm Rental</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Vehicle:</strong> {contractState.assetName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Duration:</strong> {formatMinutes(contractState.durationMinutes)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Total Deposit:</strong> {formatEther(feeCalculations.deposit)} ETH
                  </p>
                </div>

                <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> By confirming, you agree to pay the deposit amount. 
                    The final amount will be calculated based on actual usage and any damage fees.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRentalModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRentVehicle}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Confirm Rental'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need to manage your rental? Visit the <a href="/contract" className="text-blue-500 underline">Contract Dashboard</a> for detailed information.
          </p>
        </div>
      </div>
    </div>
  );
}

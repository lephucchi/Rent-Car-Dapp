import React, { useState, useEffect } from 'react';
import { Car, Clock, Shield, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useRentalContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { MetaMaskConnect } from '../components/MetaMaskConnect';

export default function RentCar() {
  const {
    connectWallet,
    refreshContractData,
    rent,
    cancelRental,
    requestReturn,
    completeRental
  } = useRentalContractStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { isTransacting, lastTransactionHash, error: transactionError } = useTransactionState();

  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="luxury-container py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="luxury-heading mb-6">Rent a Luxury Vehicle</h1>
              <p className="luxury-subheading mb-8">
                Experience premium cars with blockchain-secured rentals
              </p>
            </div>

            {/* Features Grid */}
            <div className="luxury-grid-3 mb-12">
              <div className="luxury-card p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
                <p className="text-muted-foreground text-sm">
                  Smart contract ensures secure and transparent transactions
                </p>
              </div>
              <div className="luxury-card p-6 text-center">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Instant Booking</h3>
                <p className="text-muted-foreground text-sm">
                  Book and start your rental immediately with crypto payments
                </p>
              </div>
              <div className="luxury-card p-6 text-center">
                <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-muted-foreground text-sm">
                  All fees calculated on-chain with no hidden costs
                </p>
              </div>
            </div>

            {/* Connect Wallet */}
            <div className="max-w-md mx-auto">
              <MetaMaskConnect
                onConnect={handleConnectWallet}
                connecting={connecting}
                error={connectionError}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contractState || !feeCalculation || !availableActions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="luxury-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="luxury-heading mb-4">Rent Vehicle</h1>
          <p className="luxury-subheading">
            Secure your luxury vehicle rental with cryptocurrency
          </p>
        </div>

        {/* Error Display */}
        {(connectionError || transactionError) && (
          <div className="luxury-card p-4 mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400">
                {connectionError || transactionError}
              </p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {lastTransactionHash && (
          <div className="luxury-card p-4 mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 dark:text-green-400 font-medium">
                Transaction successful!
              </p>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 font-mono break-all">
              {lastTransactionHash}
            </p>
          </div>
        )}

        <div className="luxury-grid-2 gap-8">
          {/* Vehicle Card */}
          <div className="luxury-card overflow-hidden">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/28772164/pexels-photo-28772164.jpeg"
                alt={contractState.assetName}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`status-indicator ${
                  contractState.isRented ? 'status-error' : 'status-active'
                }`}>
                  {contractState.isRented ? 'Currently Rented' : 'Available'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="luxury-title mb-2">{contractState.assetName}</h2>
              <p className="text-muted-foreground mb-4">Premium luxury vehicle</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate per minute:</span>
                  <span className="font-semibold">
                    {rentalContractService.formatEther(contractState.rentalFeePerMinute)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">
                    {contractState.durationMinutes.toString()} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance:</span>
                  <span className="font-semibold">
                    {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total Cost:</span>
                    <span className="font-bold">
                      {rentalContractService.formatEther(feeCalculation.totalRentalFee)} ETH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Actions */}
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <div className="luxury-card p-6">
              <h3 className="luxury-title mb-4">Pricing Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base rental fee:</span>
                  <span>
                    {rentalContractService.formatEther(
                      contractState.rentalFeePerMinute * contractState.durationMinutes
                    )} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance fee:</span>
                  <span>
                    {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Required deposit (50%):</span>
                    <span className="text-primary">
                      {rentalContractService.formatEther(feeCalculation.deposit)} ETH
                    </span>
                  </div>
                </div>
                {contractState.isRented && feeCalculation.remainingPayment > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Remaining payment:</span>
                    <span className="font-semibold">
                      {rentalContractService.formatEther(feeCalculation.remainingPayment)} ETH
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Rental Status */}
            {contractState.isRented && (
              <div className="luxury-card p-6">
                <h3 className="luxury-title mb-4">Rental Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current renter:</span>
                    <span className="font-mono text-sm">
                      {contractState.lessee.slice(0, 6)}...{contractState.lessee.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return requested:</span>
                    <span className={`status-indicator ${
                      contractState.renterRequestedReturn ? 'status-active' : 'status-pending'
                    }`}>
                      {contractState.renterRequestedReturn ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return confirmed:</span>
                    <span className={`status-indicator ${
                      contractState.ownerConfirmedReturn ? 'status-active' : 'status-pending'
                    }`}>
                      {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {contractState.isDamaged && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Damage reported:</span>
                      <span className="status-indicator status-error">Yes</span>
                    </div>
                  )}
                  {contractState.actualMinutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual usage:</span>
                      <span>{contractState.actualMinutes.toString()} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {availableActions.canRent && (
                <button
                  onClick={rent}
                  disabled={isTransacting}
                  className="aurora-button w-full disabled:opacity-50"
                >
                  <Car className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : `Rent Now - ${rentalContractService.formatEther(feeCalculation.deposit)} ETH`}
                </button>
              )}

              {availableActions.canCancel && (
                <button
                  onClick={cancelRental}
                  disabled={isTransacting}
                  className="luxury-button-outline w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Cancel Rental'}
                </button>
              )}

              {availableActions.canRequestReturn && (
                <button
                  onClick={requestReturn}
                  disabled={isTransacting}
                  className="luxury-button w-full disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Request Return'}
                </button>
              )}

              {availableActions.canCompleteRental && (
                <button
                  onClick={completeRental}
                  disabled={isTransacting}
                  className="aurora-button w-full disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : `Complete Rental - ${rentalContractService.formatEther(feeCalculation.finalPaymentAmount)} ETH`}
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="luxury-card p-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Pay 50% deposit to secure your rental</li>
                    <li>• Use the vehicle for the agreed duration</li>
                    <li>• Request return when finished</li>
                    <li>• Complete final payment after owner confirms return</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { PlusCircle, Car, Settings, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { useRentalContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { MetaMaskConnect } from '../components/MetaMaskConnect';

export default function LendCar() {
  const {
    connectWallet,
    refreshContractData,
    confirmReturn,
    setActualUsage,
    reportDamage
  } = useRentalContractStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { isTransacting, lastTransactionHash, error: transactionError } = useTransactionState();

  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [actualMinutesInput, setActualMinutesInput] = useState('');
  const [showDamageReport, setShowDamageReport] = useState(false);

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

  const handleSetActualUsage = async () => {
    const minutes = parseInt(actualMinutesInput);
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes');
      return;
    }
    
    try {
      await setActualUsage(minutes);
      setActualMinutesInput('');
    } catch (error) {
      console.error('Failed to set actual usage:', error);
    }
  };

  const handleReportDamage = async () => {
    if (!window.confirm('Are you sure you want to report damage? This will add compensation charges to the rental.')) {
      return;
    }

    try {
      await reportDamage();
      setShowDamageReport(false);
    } catch (error) {
      console.error('Failed to report damage:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="luxury-container py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="luxury-heading mb-6">Lend Your Vehicle</h1>
              <p className="luxury-subheading mb-8">
                Earn passive income by lending your luxury vehicles on the blockchain
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="luxury-grid-3 mb-12">
              <div className="luxury-card p-6 text-center">
                <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Passive Income</h3>
                <p className="text-muted-foreground text-sm">
                  Earn ETH by renting out your vehicles when not in use
                </p>
              </div>
              <div className="luxury-card p-6 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Contracts</h3>
                <p className="text-muted-foreground text-sm">
                  Smart contracts ensure secure payments and insurance coverage
                </p>
              </div>
              <div className="luxury-card p-6 text-center">
                <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Full Control</h3>
                <p className="text-muted-foreground text-sm">
                  Set your own rates, terms, and manage rental confirmations
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
          <p className="text-muted-foreground">Loading your vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="luxury-heading mb-4">Manage Your Vehicle</h1>
          <p className="luxury-subheading">
            {userRole === 'lessor' ? 'Monitor and manage your rental contract' : 'View available lending opportunities'}
          </p>
        </div>

        {/* Error/Success Display */}
        {(connectionError || transactionError) && (
          <div className="luxury-card p-4 mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400">
                {connectionError || transactionError}
              </p>
            </div>
          </div>
        )}

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
          {/* Vehicle Information */}
          <div className="luxury-card overflow-hidden">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/28772164/pexels-photo-28772164.jpeg"
                alt={contractState.assetName}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`status-indicator ${
                  contractState.isRented ? 'status-active' : 'status-inactive'
                }`}>
                  {contractState.isRented ? 'Currently Rented' : 'Available'}
                </span>
              </div>
              {userRole === 'lessor' && (
                <div className="absolute top-4 right-4">
                  <span className="status-indicator bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Owner
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="luxury-title mb-2">{contractState.assetName}</h2>
              <p className="text-muted-foreground mb-4">
                {userRole === 'lessor' ? 'Your luxury vehicle' : 'Available for rent'}
              </p>
              
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
                  <span className="text-muted-foreground">Insurance fee:</span>
                  <span className="font-semibold">
                    {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Damage compensation:</span>
                  <span className="font-semibold">
                    {rentalContractService.formatEther(contractState.insuranceCompensation)} ETH
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Management Panel */}
          <div className="space-y-6">
            {/* Rental Status */}
            {contractState.isRented && (
              <div className="luxury-card p-6">
                <h3 className="luxury-title mb-4">Current Rental</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renter:</span>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Damage reported:</span>
                    <span className={`status-indicator ${
                      contractState.isDamaged ? 'status-error' : 'status-active'
                    }`}>
                      {contractState.isDamaged ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {contractState.actualMinutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual usage:</span>
                      <span>{contractState.actualMinutes.toString()} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Owner Actions */}
            {userRole === 'lessor' && (
              <div className="luxury-card p-6">
                <h3 className="luxury-title mb-4">Owner Actions</h3>
                
                <div className="space-y-4">
                  {/* Confirm Return */}
                  {availableActions.canConfirmReturn && (
                    <button
                      onClick={confirmReturn}
                      disabled={isTransacting}
                      className="luxury-button w-full disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isTransacting ? 'Processing...' : 'Confirm Return'}
                    </button>
                  )}

                  {/* Set Actual Usage */}
                  {availableActions.canSetActualUsage && (
                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Set Actual Usage</h4>
                      <div className="flex space-x-3">
                        <input
                          type="number"
                          placeholder="Actual minutes used"
                          value={actualMinutesInput}
                          onChange={(e) => setActualMinutesInput(e.target.value)}
                          min="1"
                          className="luxury-input flex-1"
                        />
                        <button
                          onClick={handleSetActualUsage}
                          disabled={isTransacting || !actualMinutesInput}
                          className="luxury-button disabled:opacity-50"
                        >
                          {isTransacting ? 'Setting...' : 'Set'}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Agreed duration: {contractState.durationMinutes.toString()} minutes
                      </p>
                    </div>
                  )}

                  {/* Report Damage */}
                  {availableActions.canReportDamage && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-red-700 dark:text-red-400">Report Damage</h4>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                        Report if the vehicle was returned with damage. This will apply compensation charges.
                      </p>
                      <button
                        onClick={handleReportDamage}
                        disabled={isTransacting}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isTransacting ? 'Processing...' : 'Report Damage'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Earnings Summary */}
            {userRole === 'lessor' && (
              <div className="luxury-card p-6">
                <h3 className="luxury-title mb-4">Earnings Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base rental fee:</span>
                    <span className="font-semibold">
                      {rentalContractService.formatEther(
                        contractState.rentalFeePerMinute * contractState.durationMinutes
                      )} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance fee:</span>
                    <span className="font-semibold">
                      {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                    </span>
                  </div>
                  {contractState.isDamaged && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Damage compensation:</span>
                      <span className="font-semibold">
                        +{rentalContractService.formatEther(contractState.insuranceCompensation)} ETH
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total earnings:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {rentalContractService.formatEther(
                          contractState.rentalFeePerMinute * contractState.durationMinutes + 
                          contractState.insuranceFee +
                          (contractState.isDamaged ? contractState.insuranceCompensation : BigInt(0))
                        )} ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Management Actions for Non-Owners */}
            {userRole !== 'lessor' && !contractState.isRented && (
              <div className="luxury-card p-6 text-center">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="luxury-title mb-2">Vehicle Available</h3>
                <p className="text-muted-foreground mb-4">
                  This vehicle is available for rent. Visit the rent page to book it.
                </p>
                <button className="luxury-button">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Rent This Vehicle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Car, Clock, Shield, CreditCard, AlertCircle, CheckCircle, Settings, Wrench, DollarSign, ArrowLeft } from 'lucide-react';
import { useFixedRentalStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/fixedRentalStore';
import { fixedRentalService } from '../services/fixedRentalService';
import { MetaMaskConnect } from '../components/MetaMaskConnect';

export default function RentCar() {
  const {
    connectWallet,
    refreshContractData,
    rent,
    cancelRental,
    requestReturn,
    confirmReturn,
    setActualUsage,
    reportDamage,
    assessDamage,
    completeRental
  } = useFixedRentalStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { isTransacting, lastTransactionHash, error: transactionError } = useTransactionState();

  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [actualDaysInput, setActualDaysInput] = useState('');
  const [damageAmountInput, setDamageAmountInput] = useState('');
  const [showActualUsageModal, setShowActualUsageModal] = useState(false);
  const [showDamageAssessModal, setShowDamageAssessModal] = useState(false);

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

  const handleRentConfirm = async () => {
    await rent();
    setShowConfirmationModal(false);
  };

  const handleSetActualUsage = async () => {
    const days = parseInt(actualDaysInput);
    if (isNaN(days) || days < 0) {
      setConnectionError('Please enter a valid number of days');
      return;
    }
    
    try {
      await setActualUsage(days);
      setShowActualUsageModal(false);
      setActualDaysInput('');
    } catch (error) {
      console.error('Failed to set actual usage:', error);
    }
  };

  const handleAssessDamage = async () => {
    const amount = parseFloat(damageAmountInput);
    if (isNaN(amount) || amount < 0) {
      setConnectionError('Please enter a valid damage amount');
      return;
    }
    
    try {
      await assessDamage(amount);
      setShowDamageAssessModal(false);
      setDamageAmountInput('');
    } catch (error) {
      console.error('Failed to assess damage:', error);
    }
  };

  const getRentalSteps = () => {
    const steps = [
      {
        id: 1,
        title: 'Connect Wallet',
        description: 'MetaMask wallet connected and ready',
        status: isConnected ? 'completed' as const : 'current' as const
      },
      {
        id: 2,
        title: 'Pay Deposit',
        description: `Pay ${feeCalculation?.deposit ? fixedRentalService.formatEther(feeCalculation.deposit) : '0'} ETH deposit (30% of total)`,
        status: contractState?.isRented ? 'completed' as const :
                availableActions?.canRent ? 'current' as const : 'pending' as const
      },
      {
        id: 3,
        title: 'Use Vehicle',
        description: 'Use the vehicle for the agreed rental period',
        status: contractState?.isRented && !contractState?.renterRequestedReturn ? 'current' as const :
                contractState?.renterRequestedReturn ? 'completed' as const : 'pending' as const
      },
      {
        id: 4,
        title: 'Return Process',
        description: 'Request return and wait for owner confirmation',
        status: contractState?.renterRequestedReturn && contractState?.ownerConfirmedReturn ? 'completed' as const :
                contractState?.renterRequestedReturn ? 'current' as const : 'pending' as const
      },
      {
        id: 5,
        title: 'Final Payment',
        description: 'Complete final payment and finish rental',
        status: !contractState?.isRented && contractState?.ownerConfirmedReturn ? 'completed' as const :
                contractState?.renterRequestedReturn && contractState?.ownerConfirmedReturn ? 'current' as const : 'pending' as const
      }
    ];
    return steps;
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

        {/* Rental Flow Steps */}
        {(isConnected && contractState && feeCalculation && availableActions) && (
          <div className="luxury-card p-6 mb-8">
            <h3 className="luxury-title mb-4">Rental Process</h3>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {getRentalSteps().map((step, index) => (
                <div key={step.id} className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'current' ? 'bg-blue-500 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step.id}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < getRentalSteps().length - 1 && (
                    <div className="hidden md:block w-full h-px bg-border mt-2"></div>
                  )}
                </div>
              ))}
            </div>
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
                  <span className="text-muted-foreground">Rate per day:</span>
                  <span className="font-semibold">
                    {fixedRentalService.formatEther(contractState.rentalFeePerDay)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">
                    {contractState.durationDays.toString()} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance:</span>
                  <span className="font-semibold">
                    {fixedRentalService.formatEther(contractState.insuranceFee)} ETH
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total Cost:</span>
                    <span className="font-bold">
                      {feeCalculation?.totalRentalFee ? fixedRentalService.formatEther(feeCalculation.totalRentalFee) : '0'} ETH
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
                    {fixedRentalService.formatEther(
                      contractState.rentalFeePerDay * contractState.durationDays
                    )} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance fee:</span>
                  <span>
                    {fixedRentalService.formatEther(contractState.insuranceFee)} ETH
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Required deposit (30%):</span>
                    <span className="text-primary">
                      {feeCalculation?.deposit ? fixedRentalService.formatEther(feeCalculation.deposit) : '0'} ETH
                    </span>
                  </div>
                </div>
                {contractState.isRented && feeCalculation?.finalPaymentAmount && feeCalculation.finalPaymentAmount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Final payment needed:</span>
                    <span className="font-semibold">
                      {fixedRentalService.formatEther(feeCalculation.finalPaymentAmount)} ETH
                    </span>
                  </div>
                )}
                {contractState.isDamaged && contractState.assessedDamageAmount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Damage compensation:</span>
                    <span className="font-semibold">
                      {fixedRentalService.formatEther(contractState.assessedDamageAmount * BigInt(10**18))} ETH
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
                  {contractState.actualDays > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual usage:</span>
                      <span>{contractState.actualDays.toString()} days</span>
                    </div>
                  )}
                  {contractState.assessedDamageAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assessed damage:</span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {contractState.assessedDamageAmount.toString()} ETH
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Renter Actions */}
              {availableActions.canRent && (
                <button
                  onClick={() => setShowConfirmationModal(true)}
                  disabled={isTransacting}
                  className="aurora-button w-full disabled:opacity-50"
                >
                  <Car className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : `Rent Now - ${feeCalculation?.deposit ? fixedRentalService.formatEther(feeCalculation.deposit) : '0'} ETH`}
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
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : 'Request Return'}
                </button>
              )}

              {/* Owner/Lessor Actions */}
              {availableActions.canConfirmReturn && (
                <button
                  onClick={confirmReturn}
                  disabled={isTransacting}
                  className="luxury-button w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : 'Confirm Return'}
                </button>
              )}

              {availableActions.canSetActualUsage && (
                <button
                  onClick={() => setShowActualUsageModal(true)}
                  disabled={isTransacting}
                  className="luxury-button w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Set Actual Usage Days
                </button>
              )}

              {availableActions.canReportDamage && (
                <button
                  onClick={reportDamage}
                  disabled={isTransacting}
                  className="luxury-button w-full bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50"
                >
                  <Wrench className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : 'Report Damage'}
                </button>
              )}

              {availableActions.canAssessDamage && (
                <button
                  onClick={() => setShowDamageAssessModal(true)}
                  disabled={isTransacting}
                  className="luxury-button w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Assess Damage Amount
                </button>
              )}

              {availableActions.canCompleteRental && (
                <button
                  onClick={completeRental}
                  disabled={isTransacting}
                  className="aurora-button w-full disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : `Complete Rental - ${feeCalculation?.finalPaymentAmount ? fixedRentalService.formatEther(feeCalculation.finalPaymentAmount) : '0'} ETH`}
                </button>
              )}
            </div>

            {/* Role and Info Box */}
            <div className="space-y-4">
              {/* User Role Display */}
              {userRole && (
                <div className="luxury-card p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <p className="font-medium text-blue-700 dark:text-blue-300">
                      Your role:
                    </p>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {userRole.isLessor && <span className="inline-block bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs mr-2">Vehicle Owner</span>}
                    {userRole.isLessee && <span className="inline-block bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs mr-2">Renter</span>}
                    {!userRole.isLessor && !userRole.isLessee && <span className="inline-block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs mr-2">Visitor</span>}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="luxury-card p-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Pay 30% deposit to secure your rental</li>
                      <li>• Use the vehicle for the agreed duration</li>
                      <li>• Request return when finished</li>
                      <li>• Owner confirms return and sets actual usage</li>
                      <li>• Complete final payment including any overdue or damage fees</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmationModal && contractState && feeCalculation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="luxury-glass rounded-lg p-8 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-6">Confirm Rental</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-semibold">{contractState.assetName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{contractState.durationDays.toString()} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Total cost:</span>
                  <span>{feeCalculation.totalRentalFee ? fixedRentalService.formatEther(feeCalculation.totalRentalFee) : '0'} ETH</span>
                </div>
                <div className="flex justify-between font-semibold text-primary">
                  <span>Deposit (30%):</span>
                  <span>{feeCalculation.deposit ? fixedRentalService.formatEther(feeCalculation.deposit) : '0'} ETH</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  disabled={isTransacting}
                  className="luxury-button-outline flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRentConfirm}
                  disabled={isTransacting}
                  className="aurora-button flex-1 disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Confirm Rental'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actual Usage Modal */}
        {showActualUsageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="luxury-glass rounded-lg p-8 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-6">Set Actual Usage</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Actual days used:</label>
                  <input
                    type="number"
                    value={actualDaysInput}
                    onChange={(e) => setActualDaysInput(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="Enter number of days"
                    min="0"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Enter the actual number of days the vehicle was used. This affects the final payment calculation.</p>
                  {contractState && (
                    <p className="mt-2">Originally planned: {contractState.durationDays.toString()} days</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowActualUsageModal(false)}
                  disabled={isTransacting}
                  className="luxury-button-outline flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetActualUsage}
                  disabled={isTransacting || !actualDaysInput}
                  className="luxury-button flex-1 disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Set Usage'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Damage Assessment Modal */}
        {showDamageAssessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="luxury-glass rounded-lg p-8 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-6">Assess Damage Amount</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Damage compensation (ETH):</label>
                  <input
                    type="number"
                    value={damageAmountInput}
                    onChange={(e) => setDamageAmountInput(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="Enter damage amount in ETH"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Enter the compensation amount for damages in ETH. This will be added to the final payment.</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDamageAssessModal(false)}
                  disabled={isTransacting}
                  className="luxury-button-outline flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssessDamage}
                  disabled={isTransacting || !damageAmountInput}
                  className="luxury-button flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Assess Damage'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

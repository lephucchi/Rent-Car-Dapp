import React, { useEffect, useState } from 'react';
import { Car, Clock, Shield, CreditCard, AlertCircle, CheckCircle, User, DollarSign } from 'lucide-react';
import { useContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/contractStore';
import { contractService } from '../services/contractService';
import { Button } from './Button';
import { Input } from './Input';

export const RentalDashboard: React.FC = () => {
  const {
    connectWallet,
    refreshContractData,
    rent,
    cancelRental,
    requestReturn,
    confirmReturn,
    setActualUsage,
    reportDamage,
    completeRental,
    setError
  } = useContractStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { isTransacting, lastTransactionHash, error } = useTransactionState();

  const [actualMinutesInput, setActualMinutesInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      refreshContractData();
    }
  }, [isConnected, refreshContractData]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleSetActualUsage = async () => {
    const minutes = parseInt(actualMinutesInput);
    if (isNaN(minutes) || minutes <= 0) {
      setError('Please enter a valid number of minutes');
      return;
    }
    
    try {
      await setActualUsage(minutes);
      setActualMinutesInput('');
    } catch (error) {
      console.error('Failed to set actual usage:', error);
    }
  };

  const handleActionWithConfirmation = async (action: string, actionFn: () => Promise<void>) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    setShowConfirmModal(false);
    
    try {
      switch (pendingAction) {
        case 'rent':
          await rent();
          break;
        case 'cancel':
          await cancelRental();
          break;
        case 'requestReturn':
          await requestReturn();
          break;
        case 'confirmReturn':
          await confirmReturn();
          break;
        case 'reportDamage':
          await reportDamage();
          break;
        case 'completeRental':
          await completeRental();
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setPendingAction(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="w-20 h-20 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Car className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Car Rental Smart Contract</h2>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to interact with the rental contract
        </p>
        <Button 
          onClick={handleConnectWallet}
          className="aurora-button"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (!contractState || !feeCalculation || !availableActions || !userRole) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="luxury-spinner w-8 h-8 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-foreground mb-2">Loading Contract Data...</h2>
        <p className="text-muted-foreground">Connecting to blockchain...</p>
      </div>
    );
  }

  const getRoleDisplay = () => {
    if (userRole.isLessor) return { text: 'Vehicle Owner', color: 'text-blue-500' };
    if (userRole.isLessee) return { text: 'Renter', color: 'text-green-500' };
    return { text: 'Visitor', color: 'text-gray-500' };
  };

  const roleDisplay = getRoleDisplay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="luxury-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold gradient-text-aurora">
            {contractState.assetName}
          </h1>
          <div className="flex items-center space-x-2">
            <User className={`w-5 h-5 ${roleDisplay.color}`} />
            <span className={`font-medium ${roleDisplay.color}`}>
              {roleDisplay.text}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="luxury-glass rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Fee per minute</div>
            <div className="text-lg font-semibold text-foreground">
              {contractService.formatEther(contractState.rentalFeePerMinute)} ETH
            </div>
          </div>
          <div className="luxury-glass rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Duration</div>
            <div className="text-lg font-semibold text-foreground">
              {contractState.durationMinutes.toString()} min
            </div>
          </div>
          <div className="luxury-glass rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Insurance</div>
            <div className="text-lg font-semibold text-foreground">
              {contractService.formatEther(contractState.insuranceFee)} ETH
            </div>
          </div>
          <div className="luxury-glass rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
            <div className="text-lg font-semibold gradient-text-aurora">
              {contractService.formatEther(feeCalculation.totalRentalFee)} ETH
            </div>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Rental Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-mono text-sm text-foreground">
                {contractState.lessor.slice(0, 6)}...{contractState.lessor.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renter:</span>
              <span className="font-mono text-sm text-foreground">
                {contractState.lessee === '0x0000000000000000000000000000000000000000' 
                  ? 'None' 
                  : `${contractState.lessee.slice(0, 6)}...${contractState.lessee.slice(-4)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`status-indicator ${contractState.isRented ? 'status-active' : 'status-inactive'}`}>
                {contractState.isRented ? 'Rented' : 'Available'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Return Requested:</span>
              <span className={`status-indicator ${contractState.renterRequestedReturn ? 'status-active' : 'status-pending'}`}>
                {contractState.renterRequestedReturn ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Return Confirmed:</span>
              <span className={`status-indicator ${contractState.ownerConfirmedReturn ? 'status-active' : 'status-pending'}`}>
                {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Damage Status:</span>
              <span className={`status-indicator ${contractState.isDamaged ? 'status-error' : 'status-active'}`}>
                {contractState.isDamaged ? 'Damaged' : 'Good'}
              </span>
            </div>
          </div>
        </div>

        {contractState.actualMinutes > 0 && (
          <div className="mt-4 p-4 notification-info rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-medium">Actual Usage: {contractState.actualMinutes.toString()} minutes</span>
            </div>
          </div>
        )}
      </div>

      {/* Fee Breakdown */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Fee Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base rental fee:</span>
            <span className="text-foreground">
              {contractService.formatEther(contractState.rentalFeePerMinute * contractState.durationMinutes)} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Insurance fee:</span>
            <span className="text-foreground">
              {contractService.formatEther(contractState.insuranceFee)} ETH
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="font-medium">Required deposit (50%):</span>
            <span className="font-bold text-primary">
              {contractService.formatEther(feeCalculation.deposit)} ETH
            </span>
          </div>
          {contractState.isRented && feeCalculation.remainingPayment > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining payment:</span>
              <span className="font-medium text-orange-500">
                {contractService.formatEther(feeCalculation.remainingPayment)} ETH
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableActions.canRent && (
            <button
              onClick={() => handleActionWithConfirmation('rent', rent)}
              disabled={isTransacting}
              className="aurora-button disabled:opacity-50"
            >
              <Car className="w-5 h-5 mr-2" />
              {isTransacting ? 'Processing...' : `Rent for ${contractService.formatEther(feeCalculation.deposit)} ETH`}
            </button>
          )}

          {availableActions.canCancel && (
            <button
              onClick={() => handleActionWithConfirmation('cancel', cancelRental)}
              disabled={isTransacting}
              className="luxury-button-outline text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              {isTransacting ? 'Processing...' : 'Cancel Rental'}
            </button>
          )}

          {availableActions.canRequestReturn && (
            <button
              onClick={() => handleActionWithConfirmation('requestReturn', requestReturn)}
              disabled={isTransacting}
              className="luxury-button disabled:opacity-50"
            >
              {isTransacting ? 'Processing...' : 'Request Return'}
            </button>
          )}

          {availableActions.canConfirmReturn && (
            <button
              onClick={() => handleActionWithConfirmation('confirmReturn', confirmReturn)}
              disabled={isTransacting}
              className="luxury-button bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {isTransacting ? 'Processing...' : 'Confirm Return'}
            </button>
          )}

          {availableActions.canReportDamage && (
            <button
              onClick={() => handleActionWithConfirmation('reportDamage', reportDamage)}
              disabled={isTransacting}
              className="luxury-button-outline text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-50"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {isTransacting ? 'Processing...' : 'Report Damage'}
            </button>
          )}

          {availableActions.canCompleteRental && (
            <button
              onClick={() => handleActionWithConfirmation('completeRental', completeRental)}
              disabled={isTransacting}
              className="aurora-button disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {isTransacting ? 'Processing...' : `Complete Rental - ${contractService.formatEther(feeCalculation.finalPaymentAmount)} ETH`}
            </button>
          )}
        </div>

        {/* Set Actual Usage (Owner Only) */}
        {availableActions.canSetActualUsage && (
          <div className="mt-6 p-4 luxury-glass rounded-lg">
            <h4 className="text-md font-semibold text-foreground mb-3">Set Actual Usage (Owner Only)</h4>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Actual minutes used"
                value={actualMinutesInput}
                onChange={(e) => setActualMinutesInput(e.target.value)}
                className="flex-1"
                min="1"
              />
              <button
                onClick={handleSetActualUsage}
                disabled={isTransacting || !actualMinutesInput}
                className="luxury-button disabled:opacity-50"
              >
                {isTransacting ? 'Setting...' : 'Set Usage'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Agreed duration: {contractState.durationMinutes.toString()} minutes
            </p>
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {(error || lastTransactionHash) && (
        <div className="luxury-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Transaction Status</h3>
          
          {error && (
            <div className="notification-error rounded-lg mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {lastTransactionHash && (
            <div className="notification-success rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">Transaction successful!</p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 font-mono break-all">
                {lastTransactionHash}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-glass-intense rounded-2xl w-full max-w-md mx-auto p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Confirm Action</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to {pendingAction?.replace(/([A-Z])/g, ' $1').toLowerCase()}?
              {pendingAction === 'rent' && ` This will cost ${contractService.formatEther(feeCalculation.deposit)} ETH.`}
              {pendingAction === 'completeRental' && ` This will cost ${contractService.formatEther(feeCalculation.finalPaymentAmount)} ETH.`}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="luxury-button-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="aurora-button flex-1"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contract Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contract Address:</span>
            <span className="text-foreground font-mono text-xs break-all">
              {contractService.getContractAddress()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="text-foreground">
              {contractService.getNetworkInfo().network}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Account:</span>
            <span className="text-foreground font-mono text-xs">
              {userRole.currentAccount.slice(0, 6)}...{userRole.currentAccount.slice(-4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useRentalContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { Button } from './Button';
import { Input } from './Input';

export const RentalContractDashboard: React.FC = () => {
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
  } = useRentalContractStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { isTransacting, lastTransactionHash, error } = useTransactionState();

  const [actualMinutesInput, setActualMinutesInput] = useState('');

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

  if (!isConnected) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Car Rental Smart Contract</h2>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to interact with the rental contract
        </p>
        <Button 
          onClick={handleConnectWallet}
          className="neon-glow-purple"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (!contractState || !feeCalculation || !availableActions) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Loading Contract Data...</h2>
        <div className="animate-pulse-slow">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Information */}
      <div className="glass rounded-lg p-6">
        <h2 className="text-2xl font-bold gradient-text mb-6">
          {contractState.assetName} - Rental Contract
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contract Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asset:</span>
                <span className="text-foreground font-medium">{contractState.assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee per minute:</span>
                <span className="text-foreground font-medium">
                  {rentalContractService.formatEther(contractState.rentalFeePerMinute)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground font-medium">
                  {contractState.durationMinutes.toString()} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance fee:</span>
                <span className="text-foreground font-medium">
                  {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Damage compensation:</span>
                <span className="text-foreground font-medium">
                  {rentalContractService.formatEther(contractState.insuranceCompensation)} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Fee Calculation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Fee Calculation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total rental fee:</span>
                <span className="text-foreground font-medium">
                  {rentalContractService.formatEther(feeCalculation.totalRentalFee)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required deposit:</span>
                <span className="text-neon-cyan font-medium">
                  {rentalContractService.formatEther(feeCalculation.deposit)} ETH
                </span>
              </div>
              {contractState.isRented && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining payment:</span>
                    <span className="text-neon-purple font-medium">
                      {rentalContractService.formatEther(feeCalculation.remainingPayment)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final payment (in wei):</span>
                    <span className="text-foreground font-medium">
                      {rentalContractService.formatEther(feeCalculation.finalPaymentAmount)} ETH
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rental Status */}
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Rental Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner (Lessor):</span>
              <span className="text-foreground font-mono text-xs">
                {contractState.lessor.slice(0, 6)}...{contractState.lessor.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renter (Lessee):</span>
              <span className="text-foreground font-mono text-xs">
                {contractState.lessee === '0x0000000000000000000000000000000000000000' 
                  ? 'None' 
                  : `${contractState.lessee.slice(0, 6)}...${contractState.lessee.slice(-4)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className={`font-medium capitalize ${
                userRole === 'lessor' ? 'text-neon-purple' : 
                userRole === 'lessee' ? 'text-neon-cyan' : 'text-muted-foreground'
              }`}>
                {userRole}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Is Rented:</span>
              <span className={`font-medium ${contractState.isRented ? 'text-green-400' : 'text-red-400'}`}>
                {contractState.isRented ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Is Damaged:</span>
              <span className={`font-medium ${contractState.isDamaged ? 'text-red-400' : 'text-green-400'}`}>
                {contractState.isDamaged ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Return Requested:</span>
              <span className={`font-medium ${contractState.renterRequestedReturn ? 'text-green-400' : 'text-gray-400'}`}>
                {contractState.renterRequestedReturn ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Return Confirmed:</span>
              <span className={`font-medium ${contractState.ownerConfirmedReturn ? 'text-green-400' : 'text-gray-400'}`}>
                {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
              </span>
            </div>
            {contractState.actualMinutes > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual Usage:</span>
                <span className="text-foreground font-medium">
                  {contractState.actualMinutes.toString()} minutes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rent Action */}
          {availableActions.canRent && (
            <Button
              onClick={rent}
              disabled={isTransacting}
              className="neon-glow-cyan"
            >
              {isTransacting ? 'Processing...' : `Rent for ${rentalContractService.formatEther(feeCalculation.deposit)} ETH`}
            </Button>
          )}

          {/* Cancel Rental */}
          {availableActions.canCancel && (
            <Button
              onClick={cancelRental}
              disabled={isTransacting}
              variant="destructive"
            >
              {isTransacting ? 'Processing...' : 'Cancel Rental'}
            </Button>
          )}

          {/* Request Return */}
          {availableActions.canRequestReturn && (
            <Button
              onClick={requestReturn}
              disabled={isTransacting}
              className="neon-glow-purple"
            >
              {isTransacting ? 'Processing...' : 'Request Return'}
            </Button>
          )}

          {/* Confirm Return */}
          {availableActions.canConfirmReturn && (
            <Button
              onClick={confirmReturn}
              disabled={isTransacting}
              className="neon-glow-cyan"
            >
              {isTransacting ? 'Processing...' : 'Confirm Return'}
            </Button>
          )}

          {/* Report Damage */}
          {availableActions.canReportDamage && (
            <Button
              onClick={reportDamage}
              disabled={isTransacting}
              variant="destructive"
            >
              {isTransacting ? 'Processing...' : 'Report Damage'}
            </Button>
          )}

          {/* Complete Rental */}
          {availableActions.canCompleteRental && (
            <Button
              onClick={completeRental}
              disabled={isTransacting}
              className="neon-glow-purple"
            >
              {isTransacting ? 'Processing...' : `Complete Rental (${rentalContractService.formatEther(feeCalculation.finalPaymentAmount)} ETH)`}
            </Button>
          )}
        </div>

        {/* Set Actual Usage */}
        {availableActions.canSetActualUsage && (
          <div className="mt-6 p-4 glass-hover rounded-lg">
            <h4 className="text-md font-semibold text-foreground mb-3">Set Actual Usage (Lessor Only)</h4>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Actual minutes used"
                value={actualMinutesInput}
                onChange={(e) => setActualMinutesInput(e.target.value)}
                className="flex-1"
                min="1"
              />
              <Button
                onClick={handleSetActualUsage}
                disabled={isTransacting || !actualMinutesInput}
                className="neon-glow-cyan"
              >
                {isTransacting ? 'Setting...' : 'Set Usage'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {(error || lastTransactionHash) && (
        <div className="glass rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Transaction Status</h3>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {lastTransactionHash && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-2">Transaction successful!</p>
              <p className="text-muted-foreground text-xs font-mono break-all">
                {lastTransactionHash}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Contract Address */}
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contract Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contract Address:</span>
            <span className="text-foreground font-mono text-xs break-all">
              {rentalContractService.getContractAddress()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="text-foreground">
              {rentalContractService.getNetworkInfo().network}
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          onClick={refreshContractData}
          variant="outline"
          className="focus-ring"
        >
          Refresh Contract Data
        </Button>
      </div>
    </div>
  );
};

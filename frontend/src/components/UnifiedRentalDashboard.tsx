import React from 'react';
import { ethers } from 'ethers';
import { useWalletConnection, useContractState, useContractActions, useUserRole } from '../stores/unifiedWeb3Store';
import { Shield, Car, Clock, DollarSign, User, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const UnifiedRentalDashboard: React.FC = () => {
  const { isConnected, address, connectWallet, balance } = useWalletConnection();
  const { contractState, feeCalculations, refresh } = useContractState();
  const { actions, isLoading, error, lastTransactionHash, clearTransaction } = useContractActions();
  const { isLessor, isLessee, isOther, roleType } = useUserRole();

  // Connect wallet if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your MetaMask wallet to interact with the rental contract.
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">Loading Contract</h2>
          <p className="text-muted-foreground">
            Fetching contract information...
          </p>
        </div>
      </div>
    );
  }

  // Format values for display
  const formatEther = (value: bigint) => parseFloat(ethers.formatEther(value)).toFixed(4);
  const formatMinutes = (minutes: bigint) => {
    const mins = Number(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Not set';
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Handle actions with error handling
  const handleAction = async (action: () => Promise<string>, actionName: string) => {
    try {
      clearTransaction();
      const txHash = await action();
      console.log(`${actionName} transaction:`, txHash);
      // Refresh contract state after successful transaction
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error(`${actionName} failed:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Rental Dashboard</h1>
              <p className="text-muted-foreground">
                Connected as: {address} ({roleType})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-xl font-semibold text-foreground">{balance} ETH</p>
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
          {/* Contract Information */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Contract Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Asset Name</p>
                <p className="font-medium text-foreground">{contractState.assetName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rental Fee per Minute</p>
                <p className="font-medium text-foreground">{formatEther(contractState.rentalFeePerMinute)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{formatMinutes(contractState.durationMinutes)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Insurance Fee</p>
                <p className="font-medium text-foreground">{formatEther(contractState.insuranceFee)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Insurance Compensation</p>
                <p className="font-medium text-foreground">{formatEther(contractState.insuranceCompensation)} ETH</p>
              </div>
            </div>
          </div>

          {/* Rental Status */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Rental Status
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-medium ${contractState.isRented ? 'text-green-500' : 'text-blue-500'}`}>
                  {contractState.isRented ? 'Currently Rented' : 'Available'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessor (Owner)</p>
                <p className="font-mono text-sm text-foreground">{contractState.lessor}</p>
              </div>
              {contractState.lessee !== ethers.ZeroAddress && (
                <div>
                  <p className="text-sm text-muted-foreground">Lessee (Renter)</p>
                  <p className="font-mono text-sm text-foreground">{contractState.lessee}</p>
                </div>
              )}
              {contractState.startTime > 0n && (
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium text-foreground">{formatDate(contractState.startTime)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Damage Status</p>
                <p className={`font-medium ${contractState.isDamaged ? 'text-red-500' : 'text-green-500'}`}>
                  {contractState.isDamaged ? 'Damaged' : 'No Damage'}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Fee Breakdown
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Rental Fee</p>
                <p className="font-medium text-foreground">{formatEther(feeCalculations.totalRentalFee)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required Deposit (50%)</p>
                <p className="font-medium text-foreground">{formatEther(feeCalculations.deposit)} ETH</p>
              </div>
              {contractState.isRented && (
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Payment</p>
                  <p className="font-medium text-foreground">{formatEther(feeCalculations.remainingPayment)} ETH</p>
                </div>
              )}
              {contractState.actualMinutes > 0n && (
                <div>
                  <p className="text-sm text-muted-foreground">Actual Usage</p>
                  <p className="font-medium text-foreground">{formatMinutes(contractState.actualMinutes)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Available Actions
            </h2>
            <div className="space-y-3">
              {/* Rent Asset (for non-lessor when not rented) */}
              {!contractState.isRented && !isLessor && (
                <button
                  onClick={() => handleAction(actions.rentAsset, 'Rent Asset')}
                  disabled={isLoading}
                  className="luxury-button w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : `Rent Asset (${formatEther(feeCalculations.deposit)} ETH)`}
                </button>
              )}

              {/* Cancel Rental (for lessee when rented) */}
              {contractState.isRented && isLessee && (
                <button
                  onClick={() => handleAction(actions.cancelRental, 'Cancel Rental')}
                  disabled={isLoading}
                  className="luxury-button w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Cancel Rental'}
                </button>
              )}

              {/* Request Return (for lessee when rented) */}
              {contractState.isRented && isLessee && !contractState.renterRequestedReturn && (
                <button
                  onClick={() => handleAction(actions.requestReturn, 'Request Return')}
                  disabled={isLoading}
                  className="luxury-button w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Request Return'}
                </button>
              )}

              {/* Confirm Return (for lessor when return requested) */}
              {contractState.isRented && isLessor && contractState.renterRequestedReturn && !contractState.ownerConfirmedReturn && (
                <button
                  onClick={() => handleAction(actions.confirmReturn, 'Confirm Return')}
                  disabled={isLoading}
                  className="luxury-button w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Confirm Return'}
                </button>
              )}

              {/* Report Damage (for lessor when rented) */}
              {contractState.isRented && isLessor && !contractState.isDamaged && (
                <button
                  onClick={() => handleAction(actions.reportDamage, 'Report Damage')}
                  disabled={isLoading}
                  className="luxury-button w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Report Damage'}
                </button>
              )}

              {/* Complete Rental (when both parties agreed and final payment needed) */}
              {contractState.isRented && 
               contractState.renterRequestedReturn && 
               contractState.ownerConfirmedReturn && 
               feeCalculations.remainingPayment > 0n && (
                <button
                  onClick={() => handleAction(actions.completeRental, 'Complete Rental')}
                  disabled={isLoading}
                  className="luxury-button w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : `Complete Rental (${formatEther(feeCalculations.remainingPayment)} ETH)`}
                </button>
              )}
            </div>

            {/* Usage Input (for lessor) */}
            {contractState.isRented && isLessor && (
              <div className="mt-4 p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Set Actual Usage (minutes)</p>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Minutes used"
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    id="actualUsage"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('actualUsage') as HTMLInputElement;
                      const minutes = parseInt(input.value);
                      if (minutes > 0) {
                        handleAction(() => actions.setActualUsage(minutes), 'Set Actual Usage');
                        input.value = '';
                      }
                    }}
                    disabled={isLoading}
                    className="luxury-button bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    Set Usage
                  </button>
                </div>
              </div>
            )}

            {/* Information for other users */}
            {isOther && (
              <div className="text-center text-muted-foreground">
                <p>You are not a participant in this rental contract.</p>
                <p className="text-sm mt-1">Only the lessor or lessee can perform actions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={() => {
              refresh.contractState();
              refresh.feeCalculations();
              refresh.userRole();
            }}
            className="luxury-button bg-gray-600 hover:bg-gray-700"
          >
            <Clock className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

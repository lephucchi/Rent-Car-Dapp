import React, { useState } from 'react';
import { Car, Shield, Settings, Clock, DollarSign, AlertTriangle, CheckCircle, Loader2, User } from 'lucide-react';
import { ethers } from 'ethers';
import { useWalletConnection, useContractState, useContractActions, useUserRole } from '../stores/unifiedWeb3Store';
import { usePreviewMode } from '../contexts/PreviewModeContext';

interface ManagementCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, value, icon, status = 'info' }) => {
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

interface ActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
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
      {!loading && <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />}
    </button>
  );
};

export default function LendCar() {
  const { isPreviewMode } = usePreviewMode();
  const { isConnected, address, connectWallet, balance } = useWalletConnection();
  const { contractState, feeCalculations, refresh } = useContractState();
  const { actions, isLoading, error, lastTransactionHash, clearTransaction } = useContractActions();
  const { isLessor, roleType } = useUserRole();
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageInput, setUsageInput] = useState('');

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

  // Handle actions
  const handleConfirmReturn = async () => {
    try {
      clearTransaction();
      const txHash = await actions.confirmReturn();
      console.log('Confirm return transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Confirm return failed:', error);
    }
  };

  const handleReportDamage = async () => {
    try {
      clearTransaction();
      const txHash = await actions.reportDamage();
      console.log('Report damage transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Report damage failed:', error);
    }
  };

  const handleSetUsage = async () => {
    const minutes = parseInt(usageInput);
    if (minutes <= 0) return;

    try {
      clearTransaction();
      setShowUsageModal(false);
      const txHash = await actions.setActualUsage(minutes);
      console.log('Set usage transaction:', txHash);
      
      setTimeout(() => {
        refresh.contractState();
        refresh.feeCalculations();
        refresh.userRole();
      }, 2000);
    } catch (error: any) {
      console.error('Set usage failed:', error);
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
            Connect your MetaMask wallet to manage your vehicle lending.
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
            Fetching your vehicle information...
          </p>
        </div>
      </div>
    );
  }

  // Access control - only lessor can access this page
  if (!isLessor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            This page is only accessible to vehicle owners. You are currently connected as: {roleType}
          </p>
          <div className="space-y-3">
            <a href="/rent" className="luxury-button w-full block">
              Go to Rent Vehicle
            </a>
            <a href="/contract" className="luxury-button bg-gray-600 hover:bg-gray-700 w-full block">
              View Contract Dashboard
            </a>
          </div>
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Manage Your Vehicle</h1>
              <p className="text-muted-foreground">
                Vehicle Owner: {address} • Balance: {balance} ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Contract Status</p>
              <p className={`text-xl font-semibold ${contractState.isRented ? 'text-green-500' : 'text-blue-500'}`}>
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
              Your Vehicle
            </h2>
            
            <div className="space-y-4">
              <ManagementCard
                title="Vehicle Name"
                value={contractState.assetName}
                icon={<Car className="w-5 h-5 text-blue-500" />}
                status="info"
              />
              
              <ManagementCard
                title="Rental Rate"
                value={`${formatEther(contractState.rentalFeePerMinute)} ETH/min`}
                icon={<DollarSign className="w-5 h-5 text-green-500" />}
                status="success"
              />
              
              <ManagementCard
                title="Max Duration"
                value={formatMinutes(contractState.durationMinutes)}
                icon={<Clock className="w-5 h-5 text-yellow-500" />}
                status="warning"
              />
              
              <ManagementCard
                title="Insurance Settings"
                value={`Fee: ${formatEther(contractState.insuranceFee)} ETH | Compensation: ${formatEther(contractState.insuranceCompensation)} ETH`}
                icon={<Shield className="w-5 h-5 text-purple-500" />}
                status="info"
              />
            </div>
          </div>

          {/* Rental Management */}
          <div className="luxury-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Rental Management
            </h2>

            <div className="space-y-4 mb-6">
              {/* Current Rental Status */}
              {contractState.isRented && (
                <>
                  <ManagementCard
                    title="Renter Address"
                    value={`${contractState.lessee.slice(0, 6)}...${contractState.lessee.slice(-4)}`}
                    icon={<User className="w-5 h-5 text-blue-500" />}
                    status="info"
                  />
                  
                  <ManagementCard
                    title="Rental Started"
                    value={formatDate(contractState.startTime)}
                    icon={<Clock className="w-5 h-5 text-green-500" />}
                    status="success"
                  />

                  {contractState.actualMinutes > 0n && (
                    <ManagementCard
                      title="Actual Usage Set"
                      value={formatMinutes(contractState.actualMinutes)}
                      icon={<Clock className="w-5 h-5 text-blue-500" />}
                      status="info"
                    />
                  )}

                  <ManagementCard
                    title="Damage Status"
                    value={contractState.isDamaged ? "Damage Reported" : "No Damage"}
                    icon={<Shield className="w-5 h-5" />}
                    status={contractState.isDamaged ? "danger" : "success"}
                  />

                  <ManagementCard
                    title="Return Process"
                    value={`Renter Requested: ${contractState.renterRequestedReturn ? 'Yes' : 'No'} | Owner Confirmed: ${contractState.ownerConfirmedReturn ? 'Yes' : 'No'}`}
                    icon={<CheckCircle className="w-5 h-5" />}
                    status={contractState.renterRequestedReturn && contractState.ownerConfirmedReturn ? "success" : "warning"}
                  />
                </>
              )}

              {/* Revenue Information */}
              <ManagementCard
                title="Expected Revenue"
                value={`${formatEther(feeCalculations.totalRentalFee)} ETH`}
                icon={<DollarSign className="w-5 h-5 text-green-500" />}
                status="success"
              />

              <ManagementCard
                title="Deposit Received"
                value={contractState.isRented ? `${formatEther(feeCalculations.deposit)} ETH` : 'None'}
                icon={<DollarSign className="w-5 h-5 text-blue-500" />}
                status={contractState.isRented ? "success" : "info"}
              />
            </div>

            {/* Management Actions */}
            <div className="space-y-3">
              {/* Set Actual Usage */}
              {contractState.isRented && (
                <ActionButton
                  title="Set Actual Usage"
                  description="Record the actual minutes the vehicle was used"
                  onClick={() => setShowUsageModal(true)}
                  variant="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<Clock className="w-4 h-4" />}
                />
              )}

              {/* Report Damage */}
              {contractState.isRented && !contractState.isDamaged && (
                <ActionButton
                  title="Report Damage"
                  description="Report vehicle damage (adds compensation fee)"
                  onClick={handleReportDamage}
                  variant="danger"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<AlertTriangle className="w-4 h-4" />}
                />
              )}

              {/* Confirm Return */}
              {contractState.isRented && contractState.renterRequestedReturn && !contractState.ownerConfirmedReturn && (
                <ActionButton
                  title="Confirm Vehicle Return"
                  description="Confirm that the vehicle has been returned in good condition"
                  onClick={handleConfirmReturn}
                  variant="warning"
                  disabled={isLoading}
                  loading={isLoading}
                  icon={<CheckCircle className="w-4 h-4" />}
                />
              )}

              {/* No active rental */}
              {!contractState.isRented && (
                <div className="luxury-card p-4 border-blue-500 bg-blue-500/10">
                  <div className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-700">Vehicle Available for Rent</p>
                      <p className="text-sm text-blue-600">
                        Your vehicle is ready to be rented. Users can rent it from the 
                        <a href="/rent" className="underline ml-1">Rent Vehicle page</a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rental completion ready */}
              {contractState.isRented && 
               contractState.renterRequestedReturn && 
               contractState.ownerConfirmedReturn && (
                <div className="luxury-card p-4 border-green-500 bg-green-500/10">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700">Ready for Final Payment</p>
                      <p className="text-sm text-green-600">
                        Both parties have confirmed return. The renter can now make final payment to complete the rental.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Set Usage Modal */}
        {showUsageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="luxury-card max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Set Actual Usage</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Actual minutes used
                  </label>
                  <input
                    type="number"
                    value={usageInput}
                    onChange={(e) => setUsageInput(e.target.value)}
                    placeholder="Enter minutes (e.g. 480 for 8 hours)"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    min="1"
                    max={Number(contractState.durationMinutes)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum: {formatMinutes(contractState.durationMinutes)}
                  </p>
                </div>

                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This will affect the final payment calculation. 
                    The renter will pay based on actual usage rather than the full duration.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowUsageModal(false);
                    setUsageInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetUsage}
                  disabled={isLoading || !usageInput || parseInt(usageInput) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Set Usage'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need detailed contract information? Visit the <a href="/contract" className="text-blue-500 underline">Contract Dashboard</a> for complete management options.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Shield, Users, Settings, BarChart3, AlertTriangle, CheckCircle, Clock, Car } from 'lucide-react';
import { useContractStore, useContractState, useFeeCalculation, useUserRole, useIsConnected, useTransactionHistory } from '../stores/contractStore';
import { contractService } from '../services/contractService';
import { Button } from './Button';

export const AdminPanel: React.FC = () => {
  const { refreshContractData, refreshTransactionHistory } = useContractStore();
  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const transactionHistory = useTransactionHistory();

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: '0',
    activeRentals: 0,
    completedRentals: 0
  });

  useEffect(() => {
    if (isConnected) {
      refreshContractData();
      refreshTransactionHistory();
    }
  }, [isConnected, refreshContractData, refreshTransactionHistory]);

  useEffect(() => {
    if (transactionHistory.length > 0) {
      calculateStats();
    }
  }, [transactionHistory, contractState]);

  const calculateStats = () => {
    const totalTransactions = transactionHistory.length;
    
    // Calculate revenue from FundsTransferred events
    const revenueEvents = transactionHistory.filter(tx => tx.type === 'FundsTransferred');
    const totalRevenue = revenueEvents.reduce((sum, event) => {
      const amount = event.data[1] || 0;
      return sum + parseFloat(contractService.formatEther(amount));
    }, 0);

    const activeRentals = contractState?.isRented ? 1 : 0;
    const completedRentals = transactionHistory.filter(tx => tx.type === 'FundsTransferred').length;

    setStats({
      totalTransactions,
      totalRevenue: totalRevenue.toFixed(4),
      activeRentals,
      completedRentals
    });
  };

  if (!isConnected) {
    return (
      <div className="luxury-card p-8 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Admin Panel</h2>
        <p className="text-muted-foreground">
          Connect your wallet to access admin features
        </p>
      </div>
    );
  }

  if (!userRole?.isLessor) {
    return (
      <div className="luxury-card p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only vehicle owners can access the admin panel
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Your role: {userRole?.isLessee ? 'Renter' : 'Visitor'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="luxury-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your car rental contract and monitor platform activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalTransactions}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalRevenue} ETH</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Active Rentals</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeRentals}</p>
            </div>
            <Car className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Completed Rentals</p>
              <p className="text-2xl font-bold text-foreground">{stats.completedRentals}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Contract Information */}
      {contractState && (
        <div className="luxury-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contract Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asset Name:</span>
                <span className="font-medium">{contractState.assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee per Minute:</span>
                <span className="font-medium">
                  {contractService.formatEther(contractState.rentalFeePerMinute)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{contractState.durationMinutes.toString()} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance Fee:</span>
                <span className="font-medium">
                  {contractService.formatEther(contractState.insuranceFee)} ETH
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`status-indicator ${contractState.isRented ? 'status-active' : 'status-inactive'}`}>
                  {contractState.isRented ? 'Currently Rented' : 'Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Damage Status:</span>
                <span className={`status-indicator ${contractState.isDamaged ? 'status-error' : 'status-active'}`}>
                  {contractState.isDamaged ? 'Damaged' : 'Good Condition'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return Process:</span>
                <span className={`status-indicator ${
                  contractState.renterRequestedReturn && contractState.ownerConfirmedReturn ? 'status-active' :
                  contractState.renterRequestedReturn ? 'status-pending' : 'status-inactive'
                }`}>
                  {contractState.renterRequestedReturn && contractState.ownerConfirmedReturn ? 'Completed' :
                   contractState.renterRequestedReturn ? 'In Progress' : 'Not Started'}
                </span>
              </div>
              {contractState.actualMinutes > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual Usage:</span>
                  <span className="font-medium">{contractState.actualMinutes.toString()} min</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current Rental Details */}
      {contractState?.isRented && (
        <div className="luxury-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Current Rental</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Renter Information</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {contractState.lessee}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="font-medium">
                  {contractState.startTime > 0 
                    ? new Date(Number(contractState.startTime) * 1000).toLocaleString()
                    : 'Not started'
                  }
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Return Requested</div>
                <div className={`font-medium ${contractState.renterRequestedReturn ? 'text-green-500' : 'text-gray-500'}`}>
                  {contractState.renterRequestedReturn ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Return Confirmed</div>
                <div className={`font-medium ${contractState.ownerConfirmedReturn ? 'text-green-500' : 'text-gray-500'}`}>
                  {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Damage Status</div>
                <div className={`font-medium ${contractState.isDamaged ? 'text-red-500' : 'text-green-500'}`}>
                  {contractState.isDamaged ? 'Damaged' : 'Good'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        {transactionHistory.length > 0 ? (
          <div className="space-y-3">
            {transactionHistory.slice(0, 5).map((transaction, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  {transaction.type === 'RentalStarted' && <Car className="w-4 h-4 text-green-500" />}
                  {transaction.type === 'RenterRequestedReturn' && <Clock className="w-4 h-4 text-blue-500" />}
                  {transaction.type === 'OwnerConfirmedReturn' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {transaction.type === 'FundsTransferred' && <BarChart3 className="w-4 h-4 text-purple-500" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {transaction.type.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.timestamp.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {transaction.transactionHash.slice(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No recent activity</p>
        )}
      </div>

      {/* Admin Actions */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Admin Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={refreshContractData}
            className="luxury-button"
          >
            <Settings className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button
            onClick={refreshTransactionHistory}
            className="luxury-button-outline"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh History
          </Button>
        </div>
      </div>

      {/* System Information */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract Address:</span>
              <span className="font-mono text-sm">
                {contractService.getContractAddress().slice(0, 10)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">
                {contractService.getNetworkInfo().network}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="status-indicator status-active">Owner</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Access Level:</span>
              <span className="status-indicator status-active">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
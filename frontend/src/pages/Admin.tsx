import React, { useEffect, useState } from 'react';
import { Shield, Users, Activity, AlertTriangle, Settings, Database, TrendingUp } from 'lucide-react';
import { useRentalContractStore, useContractState, useUserRole, useIsConnected } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { PreviewMode, createMockContractData } from '../components/PreviewMode';

interface AdminStats {
  totalRentals: number;
  activeRentals: number;
  totalRevenue: string;
  damageReports: number;
}

export default function Admin() {
  const { connectWallet, refreshContractData } = useRentalContractStore();
  const contractState = useContractState();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: '0',
    damageReports: 0
  });
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isConnected && userRole === 'lessor') {
      refreshContractData();
      loadAdminStats();
    }
  }, [isConnected, userRole, refreshContractData]);

  const loadAdminStats = async () => {
    try {
      // Mock data for demonstration - in real app, this would come from contract events or backend
      setAdminStats({
        totalRentals: 15,
        activeRentals: contractState?.isRented ? 1 : 0,
        totalRevenue: '45.5',
        damageReports: contractState?.isDamaged ? 1 : 0
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  // Access control
  if (!isConnected) {
    return (
      <PreviewMode previewData={createMockContractData()}>
        <div className="min-h-screen bg-background">
          <div className="luxury-container py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="luxury-card p-8">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="luxury-title mb-4">Admin Access Required</h1>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to access the admin dashboard. Only contract owners can access this area.
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="ferrari-button w-full disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PreviewMode>
    );
  }

  if (userRole !== 'lessor') {
    return (
      <PreviewMode previewData={createMockContractData()}>
        <div className="min-h-screen bg-background">
          <div className="luxury-container py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="luxury-card p-8">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="luxury-title mb-4">Access Denied</h1>
                <p className="text-muted-foreground mb-6">
                  Only contract owners (lessors) can access the admin dashboard.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your role: <span className="capitalize font-medium">{userRole}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </PreviewMode>
    );
  }

  return (
    <PreviewMode previewData={createMockContractData()}>
      <div className="min-h-screen bg-background">
        <div className="luxury-container py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="luxury-heading">Admin Dashboard</h1>
            </div>
            <p className="luxury-subheading">
              Manage your car rental contracts and monitor platform activity
            </p>
          </div>

          {/* Stats Grid */}
          <div className="luxury-grid-4 mb-8">
            <div className="luxury-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Rentals</p>
                  <p className="text-3xl font-bold text-foreground">{adminStats.totalRentals}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="luxury-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Rentals</p>
                  <p className="text-3xl font-bold text-foreground">{adminStats.activeRentals}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="luxury-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">{adminStats.totalRevenue} ETH</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="luxury-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Damage Reports</p>
                  <p className="text-3xl font-bold text-foreground">{adminStats.damageReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Contract Information */}
          {contractState && (
            <div className="luxury-grid-2 mb-8">
              <div className="luxury-card p-6">
                <h3 className="luxury-title mb-4">Current Contract</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Name:</span>
                    <span className="font-medium">{contractState.assetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee per Day:</span>
                    <span className="font-medium">
                      {rentalContractService.formatEther(contractState.rentalFeePerDay || contractState.rentalFeePerMinute)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {(contractState.durationDays || contractState.durationMinutes)?.toString()} {contractState.durationDays ? 'days' : 'min'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance Fee:</span>
                    <span className="font-medium">
                      {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`status-indicator ${contractState.isRented ? 'status-active' : 'status-inactive'}`}>
                      {contractState.isRented ? 'Rented' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <h3 className="luxury-title mb-4">Rental Status</h3>
                {contractState.isRented ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Renter:</span>
                      <span className="font-mono text-sm">
                        {contractState.lessee.slice(0, 6)}...{contractState.lessee.slice(-4)}
                      </span>
                    </div>
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
                      <span className="text-muted-foreground">Damage Reported:</span>
                      <span className={`status-indicator ${contractState.isDamaged ? 'status-error' : 'status-active'}`}>
                        {contractState.isDamaged ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {((contractState.actualDays && contractState.actualDays > 0) || (contractState.actualMinutes && contractState.actualMinutes > 0)) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actual Usage:</span>
                        <span className="font-medium">
                          {contractState.actualDays ? `${contractState.actualDays.toString()} days` : `${contractState.actualMinutes.toString()} min`}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active rental</p>
                )}
              </div>
            </div>
          )}

          {/* Contract Actions */}
          <div className="luxury-card p-6">
            <h3 className="luxury-title mb-4">Contract Management</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={refreshContractData}
                className="luxury-button"
              >
                <Database className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
              
              <button className="luxury-button-outline">
                <Settings className="w-4 h-4 mr-2" />
                Contract Settings
              </button>
              
              <button className="luxury-button-outline">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="luxury-card p-6 mt-8">
            <h3 className="luxury-title mb-4">System Information</h3>
            <div className="luxury-grid-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Address:</span>
                  <span className="font-mono text-sm">
                    {rentalContractService.getContractAddress().slice(0, 10)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium">
                    {rentalContractService.getNetworkInfo().network}
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
      </div>
    </PreviewMode>
  );
}

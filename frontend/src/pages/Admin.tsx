import React, { useState } from 'react';
import { Shield, Car, DollarSign, TrendingUp, Users, AlertTriangle, Calendar, Settings } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';
import { mockDataService, type MockCar } from '../services/mockDataService';
import { ethers } from 'ethers';

export default function Admin() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cars' | 'transactions'>('overview');

  // Determine effective role and access
  const effectiveRole = isPreviewMode ? simulatedRole : 
    (globalUserRole === 'admin' ? 'admin' : globalUserRole);
  
  const hasAccess = isConnected || isPreviewMode;
  const isAdmin = effectiveRole === 'admin';

  // Redirect non-admin users
  if (hasAccess && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            This admin panel is only accessible to Admin/Owner accounts.
          </p>
          <a href="/" className="luxury-button">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Show connection prompt if not connected and not in preview mode
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your admin wallet to access the management dashboard.
          </p>
          <button onClick={connectWallet} className="luxury-button w-full">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Get admin statistics and data
  const statistics = mockDataService.getAdminStatistics();
  const ownedCars = mockDataService.getOwnedCars(isPreviewMode ? '0x1234567890123456789012345678901234567890' : address || '');
  const recentTransactions = mockDataService.getTransactionEvents().slice(0, 5);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'transactions', label: 'Recent Activity', icon: Calendar }
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="luxury-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              {isPreviewMode ? 'Preview: Comprehensive management interface' : 'Comprehensive management interface for your car rental business'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="/lend" className="luxury-button">
              <Car className="w-4 h-4 mr-2" />
              Add New Car
            </a>
            <button className="luxury-button-outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Preview Mode Notice */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 dark:bg-blue-900/30 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              🔍 Preview Mode: Showing sample admin dashboard with mock data.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted/30 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  selectedTab === tab.id 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Cars"
                value={statistics.totalCars}
                icon={Car}
                color="bg-blue-600"
                change="+2 this month"
              />
              <StatCard
                title="Active Rentals"
                value={statistics.activeCars}
                icon={Users}
                color="bg-green-600"
              />
              <StatCard
                title="Total Revenue"
                value={`${statistics.totalRevenue.toFixed(2)} ETH`}
                icon={DollarSign}
                color="bg-purple-600"
                change="+15% vs last month"
              />
              <StatCard
                title="Pending Inspections"
                value={statistics.awaitingInspection}
                icon={AlertTriangle}
                color="bg-orange-600"
              />
            </div>

            {/* Charts and Analytics */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Revenue Chart Placeholder */}
              <div className="luxury-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Overview</h3>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Revenue chart would be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="luxury-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a href="/lend" className="w-full luxury-button text-left">
                    <Car className="w-4 h-4 mr-3" />
                    Add New Car
                  </a>
                  <button className="w-full luxury-button-outline text-left">
                    <Shield className="w-4 h-4 mr-3" />
                    View All Transactions
                  </button>
                  <button className="w-full luxury-button-outline text-left">
                    <Settings className="w-4 h-4 mr-3" />
                    Platform Settings
                  </button>
                  <button className="w-full luxury-button-outline text-left">
                    <DollarSign className="w-4 h-4 mr-3" />
                    Withdraw Earnings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {selectedTab === 'cars' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Your Cars ({ownedCars.length})</h2>
              <a href="/lend" className="luxury-button">
                <Car className="w-4 h-4 mr-2" />
                Add New Car
              </a>
            </div>

            {ownedCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedCars.map((car) => (
                  <div key={car.id} className="luxury-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{car.assetName}</h3>
                        <div className={`status-indicator mt-2 ${
                          car.status === 'Available' ? 'status-active' :
                          car.status === 'Rented' ? 'status-pending' :
                          car.status === 'Awaiting Return Confirmation' ? 'status-pending' :
                          'status-error'
                        }`}>
                          {car.status}
                        </div>
                      </div>
                      <Car className="w-6 h-6 text-primary" />
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Rate:</span>
                        <span>{ethers.formatEther(car.rentalFeePerDay)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{car.durationDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurance:</span>
                        <span>{ethers.formatEther(car.insuranceFee)} ETH</span>
                      </div>
                      {car.lessee && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Renter:</span>
                          <span className="font-mono text-xs">{car.lessee.slice(0, 6)}...{car.lessee.slice(-4)}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button className="luxury-button-outline w-full text-sm">
                        View Details
                      </button>
                      {car.status === 'Awaiting Return Confirmation' && (
                        <button className="luxury-button w-full text-sm">
                          Manage Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="luxury-card p-12 text-center">
                <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Cars Added</h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first car to the platform.
                </p>
                <a href="/lend" className="ferrari-button">
                  <Car className="w-4 h-4 mr-2" />
                  Add Your First Car
                </a>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {selectedTab === 'transactions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Recent Activity</h2>
              <a href="/transactions" className="luxury-button">
                View All Transactions
              </a>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="luxury-card">
                <div className="divide-y divide-border">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.eventName === 'RentalStarted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            transaction.eventName === 'FundsTransferred' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {transaction.eventName.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>{transaction.carName}</div>
                              <div>{transaction.timestamp.toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {transaction.amount && (
                            <div className="text-lg font-semibold text-foreground">
                              {ethers.formatEther(transaction.amount)} ETH
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="luxury-card p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground">
                  Transaction activity will appear here as users interact with your cars.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

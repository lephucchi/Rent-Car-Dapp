import { useState } from 'react';
import { Shield, Car, DollarSign, Users, AlertTriangle, Settings } from 'lucide-react';
import { useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';

export default function Admin() {
  const { isConnected } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cars' | 'transactions'>('overview');

  const isAdmin = globalUserRole === 'admin';

  // Redirect non-admin users
  if (isConnected && !isAdmin) {
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

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your admin wallet to access the management dashboard.
          </p>
          <a href="/" className="luxury-button">
            Go Back and Connect
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'cars', label: 'Cars' },
    { id: 'transactions', label: 'Recent Activity' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive management interface for your car rental business
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted/30 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="luxury-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Cars</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-600">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Active Rentals</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-600">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">0 ETH</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-600">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Pending Inspections</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-600">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="luxury-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/lend" className="w-full luxury-button text-left">
                  <Car className="w-4 h-4 mr-3" />
                  Add New Car
                </a>
                <a href="/transactions" className="w-full luxury-button-outline text-left">
                  View All Transactions
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {selectedTab === 'cars' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Your Cars (0)</h2>
              <a href="/lend" className="luxury-button">
                <Car className="w-4 h-4 mr-2" />
                Add New Car
              </a>
            </div>

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

            <div className="luxury-card p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Recent Activity</h3>
              <p className="text-muted-foreground">
                Transaction activity will appear here as users interact with your cars.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

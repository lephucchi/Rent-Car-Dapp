import React, { useState } from 'react';
import { Car, Shield, Clock, CreditCard, Wallet, Plus, Eye, User, Settings } from 'lucide-react';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole, useConnectionState } from '../stores/globalWeb3Store';
import { debugMetaMaskConnection } from '../lib/debugMetaMask';
import { isMetaMaskInstalled as checkMetaMaskInstalled } from '../utils/metamaskUtils';

export default function Home() {
  const { isConnected, address, connectWallet } = useWalletConnection();
  const { isLoading, error } = useConnectionState();
  const globalUserRole = useGlobalUserRole();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const userRole = globalUserRole === 'admin' ? 'admin' : 
    globalUserRole === 'inspector' ? 'inspector' : 'user';

  const handleConnectWallet = async () => {
    try {
      setConnectionError(null);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectionError(errorMessage);
    }
  };

  const isMetaMaskInstalled = checkMetaMaskInstalled();

  // Show connection interface if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="luxury-section">
          <div className="luxury-container">
            <div className="text-center">
              <h1 className="luxury-heading mb-6">
                CarDapp
                <br />
                <span className="gradient-text-aurora">Blockchain Car Rental</span>
              </h1>
              <p className="luxury-subheading max-w-3xl mx-auto mb-12">
                Experience the future of car rental with blockchain security.
                Connect your wallet to rent luxury vehicles with transparent pricing and instant confirmations.
              </p>
              
              <div className="luxury-card p-8 max-w-4xl mx-auto mb-12">
                <div className="luxury-grid-3">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Smart Contract Security</h3>
                    <p className="text-muted-foreground">All transactions secured by Ethereum smart contracts</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Instant Booking</h3>
                    <p className="text-muted-foreground">Pay 30% deposit and start renting immediately</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Transparent Pricing</h3>
                    <p className="text-muted-foreground">All fees calculated on-chain with no hidden costs</p>
                  </div>
                </div>
              </div>

              {/* Connection Error Display */}
              {(connectionError || error) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <p className="text-red-600 text-sm">{connectionError || error}</p>
                </div>
              )}

              {/* Connection Interface */}
              <div className="max-w-4xl mx-auto">
                {!isMetaMaskInstalled ? (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Setup MetaMask Wallet
                      </h2>
                      <p className="text-muted-foreground">
                        You need MetaMask to interact with CarDapp blockchain features
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <div className="aurora-glass border border-primary/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">1</div>
                        <h3 className="font-semibold text-foreground mb-2">Download MetaMask</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Install the browser extension
                        </p>
                        <a
                          href="https://metamask.io/download/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          metamask.io
                        </a>
                      </div>

                      <div className="aurora-glass border border-secondary/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">2</div>
                        <h3 className="font-semibold text-foreground mb-2">Install</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Add extension to your browser
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          1-2 minutes
                        </div>
                      </div>

                      <div className="aurora-glass border border-aurora-green/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-aurora-green text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">3</div>
                        <h3 className="font-semibold text-foreground mb-2">Setup Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create new or import existing wallet
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Secure
                        </div>
                      </div>

                      <div className="aurora-glass border border-aurora-teal/30 rounded-lg p-4 text-center">
                        <div className="w-8 h-8 bg-aurora-teal text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">4</div>
                        <h3 className="font-semibold text-foreground mb-2">Connect</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ready to connect to CarDapp
                        </p>
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Car className="w-3 h-3 mr-1" />
                          Ready
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-600 text-sm font-medium text-center">
                        ⚠️ MetaMask installation required to continue
                      </p>
                    </div>

                    <div className="text-center">
                      <button
                        disabled={true}
                        className="aurora-button w-full max-w-md mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet (Install MetaMask first)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        MetaMask Ready!
                      </h2>
                      <p className="text-muted-foreground">
                        Great! MetaMask is installed. Connect your wallet to start using CarDapp
                      </p>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleConnectWallet}
                        disabled={isLoading}
                        className="aurora-button w-full max-w-md mx-auto disabled:opacity-50"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        {isLoading ? 'Connecting...' : 'Connect MetaMask Wallet'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Debug button for development */}
                {import.meta.env.DEV && (
                  <div className="text-center mt-6">
                    <button
                      onClick={debugMetaMaskConnection}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Debug MetaMask Connection (Dev Only)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* User Flow Explanation */}
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-foreground mb-4">How CarDapp Works</h2>
              <p className="text-xl text-muted-foreground">Complete user flow for all roles</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground">MetaMask detects your role: User, Owner, or Inspector</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pay 30% Deposit</h3>
                <p className="text-muted-foreground">Secure your rental with smart contract deposit</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pickup at Station</h3>
                <p className="text-muted-foreground">Get your car from designated rental station</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Return & Pay</h3>
                <p className="text-muted-foreground">Return car, complete remaining payment</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Homepage - Connected User
  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Role Detection and Quick Stats */}
        <div className="luxury-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <span className="font-medium text-foreground">
                  Connected as: 
                  <span className="ml-1 font-bold text-primary">
                    {userRole === 'admin' ? 'Car Owner/Admin' : userRole === 'inspector' ? 'Damage Inspector' : 'Renter'}
                  </span>
                </span>
                <div className="text-sm text-muted-foreground mt-1">
                  Wallet: {address?.slice(0, 8)}...{address?.slice(-6)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {userRole === 'admin' && 'Manage your cars, confirm returns, report damage'}
                  {userRole === 'inspector' && 'Assess damage on returned cars'}
                  {userRole === 'user' && 'Browse and rent available cars'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === 'admin' && (
                <a href="/admin" className="text-primary hover:underline text-sm">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Admin Panel
                </a>
              )}
              {userRole === 'inspector' && (
                <a href="/inspector" className="text-primary hover:underline text-sm">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Inspector Panel
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-foreground mb-4">
            Welcome to <span className="gradient-text-aurora">CarDapp</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Blockchain-powered car rental platform with transparent pricing, secure smart contracts, 
            and role-based access for Renters, Owners, and Inspectors.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="luxury-card p-6 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            {userRole === 'admin' ? 'Your Cars' : 
             userRole === 'inspector' ? 'Damage Inspection' : 
             'Available Rentals'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Connected to real blockchain data. All information is live from smart contracts and backend API.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Navigation Card 1 */}
            <div className="border border-border rounded-lg p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 ferrari-gradient rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {userRole === 'admin' ? 'Manage Cars' : userRole === 'inspector' ? 'Inspection Queue' : 'Browse Rentals'}
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                {userRole === 'admin' 
                  ? 'Register new cars, manage existing ones, and track their status'
                  : userRole === 'inspector'
                  ? 'Review and assess damage on returned vehicles'
                  : 'Explore available vehicles for rent with real-time pricing'
                }
              </p>
              <a 
                href={userRole === 'admin' ? '/admin' : userRole === 'inspector' ? '/inspector' : '/rent'}
                className="ferrari-button inline-flex items-center"
              >
                <span>Go to {userRole === 'admin' ? 'Dashboard' : userRole === 'inspector' ? 'Inspector Panel' : 'Rentals'}</span>
                <span className="ml-2">→</span>
              </a>
            </div>

            {/* Navigation Card 2 */}
            <div className="border border-border rounded-lg p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 aurora-gradient rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                View all your blockchain transactions, rental history, and payment records
              </p>
              <a href="/transactions" className="aurora-button inline-flex items-center">
                <span>View Transactions</span>
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Platform Information */}
        <div className="luxury-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Platform Status</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-foreground font-semibold">Live</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="text-foreground font-semibold capitalize">
                {userRole === 'admin' ? 'Car Owner/Admin' : userRole === 'inspector' ? 'Inspector' : 'Renter'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connection:</span>
              <span className="text-green-600 font-semibold">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

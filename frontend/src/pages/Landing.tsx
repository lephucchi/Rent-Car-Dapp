import React, { useState, useEffect } from 'react';
import { Car, Shield, Clock, CreditCard, ChevronRight, Wallet, ArrowRight, CheckCircle, Zap, Globe, Users } from 'lucide-react';
import { useRentalContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected, useTransactionState } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { ContractStatus } from '../components/ContractStatus';
import { MetaMaskConnect } from '../components/MetaMaskConnect';
import { TransactionStatus } from '../components/TransactionStatus';
import { debugMetaMaskConnection } from '../lib/debugMetaMask';

export default function Landing() {
  const {
    connectWallet,
    refreshContractData,
    rent,
    cancelRental,
    requestReturn,
    confirmReturn,
    setActualUsage,
    reportDamage,
    completeRental
  } = useRentalContractStore();

  const contractState = useContractState();
  const feeCalculation = useFeeCalculation();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { isTransacting, lastTransactionHash, error: transactionError } = useTransactionState();

  const [actualMinutesInput, setActualMinutesInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  useEffect(() => {
    if (isConnected) {
      refreshContractData();
    }
  }, [isConnected, refreshContractData]);

  useEffect(() => {
    if (lastTransactionHash || transactionError) {
      setShowTransactionStatus(true);
    }
  }, [lastTransactionHash, transactionError]);

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

  const handleSetActualUsage = async () => {
    const minutes = parseInt(actualMinutesInput);
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes');
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden section-padding">
          {/* Background Effects */}
          <div className="absolute inset-0 aurora-gradient-subtle opacity-30"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full aurora-gradient opacity-15 blur-3xl float-animation"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full cyan-gradient opacity-12 blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full ice-gradient opacity-8 blur-3xl float-animation" style={{ animationDelay: '4s' }}></div>
          
          <div className="luxury-container relative">
            <div className="text-center max-w-5xl mx-auto">
              <div className="fade-in">
                <h1 className="luxury-heading mb-8">
                  The Future of
                  <br />
                  <span className="gradient-text-aurora">Arctic Luxury Rental</span>
                </h1>
                <p className="luxury-subheading max-w-3xl mx-auto mb-12">
                  Experience premium vehicles with blockchain security, transparent pricing, 
                  and instant confirmations. No paperwork, no hidden fees, just pure luxury.
                </p>
              </div>

              {/* Key Stats */}
              <div className="fade-in-delayed">
                <div className="luxury-grid-3 max-w-4xl mx-auto mb-16">
                  <div className="text-center">
                    <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold gradient-text-aurora mb-2">100%</div>
                    <div className="text-muted-foreground">Secure Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 cyan-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold gradient-text-ice mb-2">&lt;30s</div>
                    <div className="text-muted-foreground">Average Booking Time</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold gradient-text-aurora mb-2">24/7</div>
                    <div className="text-muted-foreground">Global Availability</div>
                  </div>
                </div>
              </div>

              {/* Connect Wallet Card */}
              <div className="max-w-2xl mx-auto slide-up">
                <MetaMaskConnect
                  onConnect={handleConnectWallet}
                  connecting={connecting}
                  error={connectionError}
                />
              </div>

              {/* Debug button for development */}
              {import.meta.env.DEV && (
                <button
                  onClick={debugMetaMaskConnection}
                  className="mt-6 text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Debug MetaMask Connection
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-muted/30">
          <div className="luxury-container">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl font-light text-foreground mb-4">
                Why Choose <span className="gradient-text-aurora">ArcticRent</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the perfect blend of luxury, technology, and trust
              </p>
            </div>
            
            <div className="luxury-grid-3 gap-8">
              <div className="luxury-card-elevated p-8 text-center fade-in">
                <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Blockchain Security</h3>
                <p className="text-muted-foreground mb-6">
                  Smart contracts ensure transparent, secure, and immutable transactions with automatic escrow protection.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Automated deposit protection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Transparent fee calculation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Immutable rental history
                  </li>
                </ul>
              </div>

              <div className="luxury-card-elevated p-8 text-center fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 cyan-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Instant Rental</h3>
                <p className="text-muted-foreground mb-6">
                  Skip the paperwork. Book and drive luxury vehicles instantly with cryptocurrency payments.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    No credit checks required
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Instant payment processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Global accessibility
                  </li>
                </ul>
              </div>

              <div className="luxury-card-elevated p-8 text-center fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 ice-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Transparent Pricing</h3>
                <p className="text-muted-foreground mb-6">
                  All fees calculated on-chain with no hidden costs. Pay exactly what you see.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    No hidden fees
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Real-time fee calculation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Automatic refunds
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section-padding">
          <div className="luxury-container">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl font-light text-foreground mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">
                Simple, secure, and transparent rental process
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  {
                    step: '01',
                    icon: <Wallet className="w-8 h-8" />,
                    title: 'Connect Wallet',
                    description: 'Connect your MetaMask wallet to access the platform securely'
                  },
                  {
                    step: '02',
                    icon: <Car className="w-8 h-8" />,
                    title: 'Choose Vehicle',
                    description: 'Browse our luxury fleet and select your perfect ride'
                  },
                  {
                    step: '03',
                    icon: <CreditCard className="w-8 h-8" />,
                    title: 'Pay Deposit',
                    description: 'Pay 50% deposit to secure your rental booking instantly'
                  },
                  {
                    step: '04',
                    icon: <CheckCircle className="w-8 h-8" />,
                    title: 'Enjoy & Return',
                    description: 'Use the vehicle and complete payment upon return'
                  }
                ].map((item, index) => (
                  <div key={index} className="text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative mb-8">
                      <div className="w-20 h-20 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                        <div className="text-white">{item.icon}</div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="hidden md:block absolute top-10 left-full w-full">
                          <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-muted/30">
          <div className="luxury-container">
            <div className="luxury-card-elevated p-12 text-center aurora-gradient-subtle">
              <div className="max-w-3xl mx-auto fade-in">
                <h2 className="text-4xl font-light text-foreground mb-6">
                  Ready to Experience the Future?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of users who trust our blockchain-powered platform for their luxury car rentals.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>5,000+ Happy Customers</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2" />
                    <span>Premium Fleet</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>100% Secure</span>
                  </div>
                </div>
                <button
                  onClick={() => document.querySelector('.luxury-glass-intense')?.scrollIntoView({ behavior: 'smooth' })}
                  className="aurora-button"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet to Start
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Connected state - show rental interface
  if (!contractState || !feeCalculation || !availableActions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="luxury-spinner w-16 h-16 mx-auto mb-6"></div>
          <h2 className="text-2xl font-light text-foreground mb-2">Loading Contract Data...</h2>
          <p className="text-muted-foreground">Connecting to blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-12">
        {/* Transaction Status */}
        {showTransactionStatus && (lastTransactionHash || transactionError) && (
          <div className="mb-8 fade-in">
            <TransactionStatus
              transactionHash={lastTransactionHash || undefined}
              status={transactionError ? 'error' : isTransacting ? 'pending' : 'success'}
              error={transactionError || undefined}
              onClose={() => setShowTransactionStatus(false)}
              networkName={rentalContractService.getNetworkInfo().network}
            />
          </div>
        )}

        {/* Welcome Header */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl font-light text-foreground mb-4">
            Welcome to <span className="gradient-text-aurora">ArcticRent</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Your premium vehicle is ready. Manage your rental below.
          </p>
        </div>

        {/* Vehicle Card */}
        <div className="luxury-card-elevated overflow-hidden mb-8 slide-up">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/28772164/pexels-photo-28772164.jpeg"
              alt={contractState.assetName}
              className="w-full h-80 object-cover"
            />
            <div className="absolute top-6 left-6">
              <span className={`status-indicator ${
                contractState.isRented ? 'status-active' : 'status-inactive'
              }`}>
                {contractState.isRented ? 'Currently Rented' : 'Available'}
              </span>
            </div>
            <div className="absolute top-6 right-6">
              <div className="luxury-glass-intense rounded-lg px-4 py-2">
                <div className="text-white font-bold text-lg">
                  {rentalContractService.formatEther(contractState.rentalFeePerMinute)} ETH
                </div>
                <div className="text-white/80 text-sm">per minute</div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-light text-foreground mb-2">{contractState.assetName}</h1>
                <p className="text-muted-foreground">Premium luxury vehicle rental</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
                <div className="text-2xl font-bold gradient-text-aurora">
                  {rentalContractService.formatEther(feeCalculation.totalRentalFee)} ETH
                </div>
              </div>
            </div>

            {/* Rental Details Grid */}
            <div className="luxury-grid-4 gap-6 mb-8">
              <div className="luxury-glass rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">Duration</div>
                <div className="text-lg font-semibold text-foreground">
                  {contractState.durationMinutes.toString()} min
                </div>
              </div>
              <div className="luxury-glass rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">Insurance</div>
                <div className="text-lg font-semibold text-foreground">
                  {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                </div>
              </div>
              <div className="luxury-glass rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">Deposit Required</div>
                <div className="text-lg font-semibold text-foreground">
                  {rentalContractService.formatEther(feeCalculation.deposit)} ETH
                </div>
              </div>
              <div className="luxury-glass rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">Your Role</div>
                <div className="text-lg font-semibold text-foreground capitalize">
                  {userRole === 'lessor' ? 'Owner' : userRole === 'lessee' ? 'Renter' : userRole}
                </div>
              </div>
            </div>

            {/* Rental Status */}
            {contractState.isRented && (
              <div className="luxury-glass rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Current Rental Status</h3>
                <div className="luxury-grid-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renter:</span>
                      <span className="font-mono text-sm text-foreground">
                        {contractState.lessee.slice(0, 8)}...{contractState.lessee.slice(-6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-mono text-sm text-foreground">
                        {contractState.lessor.slice(0, 8)}...{contractState.lessor.slice(-6)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return Requested:</span>
                      <span className={`status-indicator ${
                        contractState.renterRequestedReturn ? 'status-active' : 'status-pending'
                      }`}>
                        {contractState.renterRequestedReturn ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return Confirmed:</span>
                      <span className={`status-indicator ${
                        contractState.ownerConfirmedReturn ? 'status-active' : 'status-pending'
                      }`}>
                        {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {contractState.isDamaged && (
                  <div className="mt-4 p-4 notification-error rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-red-500 mr-2" />
                      <span className="font-medium text-red-700 dark:text-red-400">Damage Reported</span>
                    </div>
                  </div>
                )}
                
                {contractState.actualMinutes > 0 && (
                  <div className="mt-4 p-4 notification-info rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="font-medium">Actual Usage: {contractState.actualMinutes.toString()} minutes</span>
                      </div>
                      {contractState.isRented && (
                        <span className="text-sm text-muted-foreground">
                          Remaining: {rentalContractService.formatEther(feeCalculation.remainingPayment)} ETH
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {availableActions.canRent && (
                <button
                  onClick={rent}
                  disabled={isTransacting}
                  className="aurora-button w-full disabled:opacity-50"
                >
                  <Car className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : `Rent Now - ${rentalContractService.formatEther(feeCalculation.deposit)} ETH`}
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
                  {isTransacting ? 'Processing...' : 'Request Return'}
                </button>
              )}

              {availableActions.canConfirmReturn && (
                <button
                  onClick={confirmReturn}
                  disabled={isTransacting}
                  className="luxury-button w-full disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Confirm Return (Owner)'}
                </button>
              )}

              {availableActions.canReportDamage && (
                <button
                  onClick={reportDamage}
                  disabled={isTransacting}
                  className="luxury-button-outline w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {isTransacting ? 'Processing...' : 'Report Damage (Owner)'}
                </button>
              )}

              {availableActions.canCompleteRental && (
                <button
                  onClick={completeRental}
                  disabled={isTransacting}
                  className="aurora-button w-full disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isTransacting ? 'Processing...' : `Complete Rental - ${rentalContractService.formatEther(feeCalculation.finalPaymentAmount)} ETH`}
                </button>
              )}

              {/* Set Actual Usage (Owner Only) */}
              {availableActions.canSetActualUsage && (
                <div className="luxury-glass rounded-xl p-6">
                  <h4 className="text-lg font-medium text-foreground mb-4">Set Actual Usage (Owner Only)</h4>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      placeholder="Actual minutes used"
                      value={actualMinutesInput}
                      onChange={(e) => setActualMinutesInput(e.target.value)}
                      className="luxury-input flex-1"
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
          </div>
        </div>

        {/* Contract Status */}
        <ContractStatus
          isConnected={isConnected}
          userRole={userRole}
          contractAddress={rentalContractService.getContractAddress()}
        />
      </div>
    </div>
  );
}

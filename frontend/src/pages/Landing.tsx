import React, { useState, useEffect } from 'react';
import { Car, Shield, Clock, CreditCard, ChevronRight, Wallet } from 'lucide-react';
import { useRentalContractStore, useContractState, useFeeCalculation, useAvailableActions, useUserRole, useIsConnected } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';

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

  const [actualMinutesInput, setActualMinutesInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (isConnected) {
      refreshContractData();
    }
  }, [isConnected, refreshContractData]);

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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Car className="w-8 h-8 text-black" />
                <span className="text-2xl font-bold text-black">LuxeRent</span>
              </div>
              <button
                onClick={handleConnectWallet}
                disabled={connecting}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-light text-black mb-6">
                Luxury Car Rental
                <br />
                <span className="font-bold">Reimagined</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Experience premium car rental with blockchain security. 
                Connect your wallet to rent luxury vehicles with transparent pricing and instant confirmations.
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-black mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Blockchain Security</h3>
                    <p className="text-gray-600">Smart contracts ensure transparent and secure transactions</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-black mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Instant Rental</h3>
                    <p className="text-gray-600">Rent immediately with cryptocurrency payments</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-black mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600">All fees calculated on-chain with no hidden costs</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="bg-black text-white px-12 py-4 rounded-lg text-lg hover:bg-gray-800 transition-colors inline-flex items-center space-x-3"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{connecting ? 'Connecting to MetaMask...' : 'Connect Wallet to Start'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-black mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Simple, secure, and transparent car rental process</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-lg font-semibold text-black mb-2">Connect Wallet</h3>
                <p className="text-gray-600">Connect your MetaMask wallet to access the platform</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-lg font-semibold text-black mb-2">Pay Deposit</h3>
                <p className="text-gray-600">Pay 50% deposit to secure your rental booking</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-lg font-semibold text-black mb-2">Enjoy Your Ride</h3>
                <p className="text-gray-600">Use the vehicle for the agreed rental period</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                <h3 className="text-lg font-semibold text-black mb-2">Return & Pay</h3>
                <p className="text-gray-600">Return the car and complete final payment</p>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <h2 className="text-2xl font-light text-black">Loading Contract Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-black" />
              <span className="text-2xl font-bold text-black">LuxeRent</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connected as {userRole}
              </span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vehicle Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/28772164/pexels-photo-28772164.jpeg"
              alt={contractState.assetName}
              className="w-full h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                contractState.isRented 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {contractState.isRented ? 'Currently Rented' : 'Available'}
              </span>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-light text-black mb-2">{contractState.assetName}</h1>
                <p className="text-gray-600">Premium luxury vehicle rental</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-black">
                  {rentalContractService.formatEther(contractState.rentalFeePerMinute)} ETH
                </div>
                <div className="text-gray-600">per minute</div>
              </div>
            </div>

            {/* Rental Details Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="text-lg font-semibold text-black">
                  {contractState.durationMinutes.toString()} minutes
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Insurance Fee</div>
                <div className="text-lg font-semibold text-black">
                  {rentalContractService.formatEther(contractState.insuranceFee)} ETH
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Required Deposit</div>
                <div className="text-lg font-semibold text-black">
                  {rentalContractService.formatEther(feeCalculation.deposit)} ETH
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Rental Fee</div>
                <div className="text-lg font-semibold text-black">
                  {rentalContractService.formatEther(feeCalculation.totalRentalFee)} ETH
                </div>
              </div>
            </div>

            {/* Rental Status */}
            {contractState.isRented && (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-black mb-4">Rental Status</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Renter:</span>
                    <span className="text-black font-mono">
                      {contractState.lessee.slice(0, 6)}...{contractState.lessee.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="text-black font-mono">
                      {contractState.lessor.slice(0, 6)}...{contractState.lessor.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Requested:</span>
                    <span className={contractState.renterRequestedReturn ? 'text-green-600' : 'text-gray-400'}>
                      {contractState.renterRequestedReturn ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Confirmed:</span>
                    <span className={contractState.ownerConfirmedReturn ? 'text-green-600' : 'text-gray-400'}>
                      {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {contractState.isDamaged && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Damage Reported:</span>
                      <span className="text-red-600">Yes</span>
                    </div>
                  )}
                  {contractState.actualMinutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Usage:</span>
                      <span className="text-black">{contractState.actualMinutes.toString()} minutes</span>
                    </div>
                  )}
                  {contractState.isRented && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining Payment:</span>
                      <span className="text-black font-semibold">
                        {rentalContractService.formatEther(feeCalculation.remainingPayment)} ETH
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Rent Button */}
              {availableActions.canRent && (
                <button
                  onClick={rent}
                  className="w-full bg-black text-white py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Rent Now - Pay {rentalContractService.formatEther(feeCalculation.deposit)} ETH Deposit
                </button>
              )}

              {/* Cancel Rental */}
              {availableActions.canCancel && (
                <button
                  onClick={cancelRental}
                  className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Rental
                </button>
              )}

              {/* Request Return */}
              {availableActions.canRequestReturn && (
                <button
                  onClick={requestReturn}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Request Return
                </button>
              )}

              {/* Confirm Return */}
              {availableActions.canConfirmReturn && (
                <button
                  onClick={confirmReturn}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Confirm Return (Owner)
                </button>
              )}

              {/* Report Damage */}
              {availableActions.canReportDamage && (
                <button
                  onClick={reportDamage}
                  className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Report Damage (Owner)
                </button>
              )}

              {/* Complete Rental */}
              {availableActions.canCompleteRental && (
                <button
                  onClick={completeRental}
                  className="w-full bg-black text-white py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Complete Rental - Pay {rentalContractService.formatEther(feeCalculation.finalPaymentAmount)} ETH
                </button>
              )}

              {/* Set Actual Usage (Owner Only) */}
              {availableActions.canSetActualUsage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-black mb-3">Set Actual Usage (Owner Only)</h4>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      placeholder="Actual minutes used"
                      value={actualMinutesInput}
                      onChange={(e) => setActualMinutesInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      min="1"
                    />
                    <button
                      onClick={handleSetActualUsage}
                      disabled={!actualMinutesInput}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                      Set Usage
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-black mb-4">Contract Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Address:</span>
              <span className="text-black font-mono text-xs">
                {rentalContractService.getContractAddress()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="text-black">
                {rentalContractService.getNetworkInfo().network}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

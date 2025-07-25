import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertTriangle, CheckCircle, XCircle, Camera, DollarSign } from 'lucide-react';
import { useRentalContractStore, useContractState, useAvailableActions, useUserRole, useIsConnected } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { MetaMaskConnect } from '../components/MetaMaskConnect';

// Hardcoded inspector address (in real app, this would be configured)
const INSPECTOR_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

interface DamageAssessment {
  isDamaged: boolean;
  damageDescription: string;
  compensationAmount: string;
  photos: string[];
}

export default function Inspector() {
  const { connectWallet, reportDamage, setActualUsage } = useRentalContractStore();
  const contractState = useContractState();
  const availableActions = useAvailableActions();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<DamageAssessment>({
    isDamaged: false,
    damageDescription: '',
    compensationAmount: '0',
    photos: []
  });
  const [actualMinutesInput, setActualMinutesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if connected wallet is the designated inspector
    if (isConnected && contractState) {
      const currentAccount = rentalContractService.getCurrentAccount();
      // In a real app, you'd check if the current account matches the inspector address
    }
  }, [isConnected, contractState]);

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

  const handleSubmitInspection = async () => {
    if (!assessment.isDamaged && !actualMinutesInput) {
      alert('Please provide actual usage minutes and/or damage assessment');
      return;
    }

    try {
      setSubmitting(true);

      // Set actual usage if provided
      if (actualMinutesInput) {
        const minutes = parseInt(actualMinutesInput);
        if (!isNaN(minutes) && minutes > 0) {
          await setActualUsage(minutes);
        }
      }

      // Report damage if assessed
      if (assessment.isDamaged) {
        await reportDamage();
      }

      // Reset form
      setAssessment({
        isDamaged: false,
        damageDescription: '',
        compensationAmount: '0',
        photos: []
      });
      setActualMinutesInput('');

      alert('Inspection completed successfully!');
    } catch (error) {
      console.error('Failed to submit inspection:', error);
      alert('Failed to submit inspection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Access control for non-connected users
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="luxury-container py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="luxury-title mb-4">Vehicle Inspector Dashboard</h1>
              <p className="text-muted-foreground">
                Connect your wallet to access the vehicle inspection interface.
              </p>
            </div>
            
            <MetaMaskConnect
              onConnect={handleConnectWallet}
              connecting={connecting}
              error={connectionError}
              requiredAddress={INSPECTOR_ADDRESS}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show contract loading state
  if (!contractState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="luxury-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contract data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            <h1 className="luxury-heading">Vehicle Inspector</h1>
          </div>
          <p className="luxury-subheading">
            Inspect returned vehicles and assess any damage
          </p>
        </div>

        {/* Inspector Status */}
        <div className="luxury-card p-6 mb-8">
          <h3 className="luxury-title mb-4">Inspector Status</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Authorized Inspector</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Connected as Inspector
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="luxury-card p-6 mb-8">
          <h3 className="luxury-title mb-4">Contract Information</h3>
          <div className="luxury-grid-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">{contractState.assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rental Status:</span>
                <span className={`status-indicator ${contractState.isRented ? 'status-active' : 'status-inactive'}`}>
                  {contractState.isRented ? 'Currently Rented' : 'Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return Requested:</span>
                <span className={`status-indicator ${contractState.renterRequestedReturn ? 'status-active' : 'status-pending'}`}>
                  {contractState.renterRequestedReturn ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-mono text-sm">
                  {contractState.lessor.slice(0, 6)}...{contractState.lessor.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Renter:</span>
                <span className="font-mono text-sm">
                  {contractState.lessee === '0x0000000000000000000000000000000000000000' 
                    ? 'None' 
                    : `${contractState.lessee.slice(0, 6)}...${contractState.lessee.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return Confirmed:</span>
                <span className={`status-indicator ${contractState.ownerConfirmedReturn ? 'status-active' : 'status-pending'}`}>
                  {contractState.ownerConfirmedReturn ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Form */}
        {contractState.isRented && (contractState.renterRequestedReturn || contractState.ownerConfirmedReturn) && (
          <div className="luxury-card p-6 mb-8">
            <h3 className="luxury-title mb-6">Vehicle Inspection</h3>
            
            {/* Actual Usage Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Actual Usage (Minutes)
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={actualMinutesInput}
                  onChange={(e) => setActualMinutesInput(e.target.value)}
                  placeholder="Enter actual minutes used"
                  min="1"
                  className="luxury-input flex-1"
                />
                <div className="text-sm text-muted-foreground flex items-center">
                  Agreed: {contractState.durationMinutes.toString()} min
                </div>
              </div>
            </div>

            {/* Damage Assessment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-4">
                Damage Assessment
              </label>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setAssessment(prev => ({ ...prev, isDamaged: false }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      !assessment.isDamaged 
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>No Damage</span>
                  </button>
                  
                  <button
                    onClick={() => setAssessment(prev => ({ ...prev, isDamaged: true }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      assessment.isDamaged 
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Damage Found</span>
                  </button>
                </div>

                {assessment.isDamaged && (
                  <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-900/10 dark:border-red-800">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Damage Description
                      </label>
                      <textarea
                        value={assessment.damageDescription}
                        onChange={(e) => setAssessment(prev => ({ ...prev, damageDescription: e.target.value }))}
                        placeholder="Describe the damage in detail..."
                        rows={3}
                        className="luxury-input w-full resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Compensation Amount (ETH)
                      </label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          value={assessment.compensationAmount}
                          onChange={(e) => setAssessment(prev => ({ ...prev, compensationAmount: e.target.value }))}
                          placeholder="0.0"
                          step="0.001"
                          min="0"
                          className="luxury-input flex-1"
                        />
                        <span className="text-sm text-muted-foreground">
                          Max: {rentalContractService.formatEther(contractState.insuranceCompensation)} ETH
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Damage Photos
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload photos of the damage (Feature coming soon)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmitInspection}
                disabled={submitting || (!actualMinutesInput && !assessment.isDamaged)}
                className="ferrari-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Complete Inspection'}
              </button>
            </div>
          </div>
        )}

        {/* No Inspection Needed */}
        {!contractState.isRented && (
          <div className="luxury-card p-8 text-center">
            <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="luxury-title mb-2">No Active Rentals</h3>
            <p className="text-muted-foreground">
              There are currently no vehicles that require inspection.
            </p>
          </div>
        )}

        {/* Previous Inspections */}
        {contractState.isDamaged && (
          <div className="luxury-card p-6">
            <h3 className="luxury-title mb-4">Previous Inspections</h3>
            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-600 dark:text-red-400">Damage Reported</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vehicle damage has been reported and compensation applied.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

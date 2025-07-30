import React, { useState } from 'react';
import { Eye, Shield, AlertTriangle, CheckCircle, Clock, DollarSign, Car, User, Calendar } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';
import { mockDataService, type MockCar, type MockTransactionEvent } from '../services/mockDataService';
import { ethers } from 'ethers';

interface DamageAssessmentForm {
  carId: string;
  damageFee: string;
  notes: string;
}

export default function Inspector() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [assessmentForm, setAssessmentForm] = useState<DamageAssessmentForm>({
    carId: '',
    damageFee: '',
    notes: ''
  });
  const [selectedCar, setSelectedCar] = useState<MockCar | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine effective role and access
  const effectiveRole = isPreviewMode ? simulatedRole : 
    (globalUserRole === 'inspector' ? 'inspector' : globalUserRole);
  
  const hasAccess = isConnected || isPreviewMode;
  const isInspector = effectiveRole === 'inspector';

  // Redirect non-inspector users
  if (hasAccess && !isInspector) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            This page is only accessible to Inspector accounts.
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
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to access the damage inspection interface.
          </p>
          <button onClick={connectWallet} className="luxury-button w-full">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const getCarsForInspection = (): MockCar[] => {
    return mockDataService.getCarsForInspection();
  };

  const getInspectionHistory = (): MockTransactionEvent[] => {
    return mockDataService.getTransactionEvents().filter(tx => 
      tx.eventName === 'DamageAssessed'
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAssessmentForm({
      ...assessmentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStartAssessment = (car: MockCar) => {
    setSelectedCar(car);
    setAssessmentForm({
      carId: car.id,
      damageFee: '',
      notes: ''
    });
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);

    try {
      if (isPreviewMode) {
        // Simulate damage assessment in preview mode
        const damageFee = parseFloat(assessmentForm.damageFee) || 0;
        
        if (damageFee > 0) {
          // Mark as damaged with fee
          mockDataService.updateCarStatus(assessmentForm.carId, 'Damaged');
          mockDataService.addTransactionEvent({
            eventName: 'DamageAssessed',
            carId: assessmentForm.carId,
            carName: selectedCar?.assetName || 'Unknown Car',
            from: '0x1111222233334444555566667777888899990000', // Inspector address
            amount: ethers.parseEther(assessmentForm.damageFee).toString()
          });
          
          alert(`Preview Mode: Damage assessment submitted with ${damageFee} ETH fee`);
        } else {
          // No damage found
          mockDataService.updateCarStatus(assessmentForm.carId, 'Available');
          mockDataService.addTransactionEvent({
            eventName: 'DamageAssessed',
            carId: assessmentForm.carId,
            carName: selectedCar?.assetName || 'Unknown Car',
            from: '0x1111222233334444555566667777888899990000', // Inspector address
            amount: '0'
          });
          
          alert('Preview Mode: No damage found, car returned to available status');
        }
        
        setSelectedCar(null);
        setAssessmentForm({ carId: '', damageFee: '', notes: '' });
      } else {
        // Real implementation would call smart contract
        console.log('Submitting damage assessment:', assessmentForm);
        alert('Real damage assessment would be submitted to blockchain');
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit damage assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const carsForInspection = getCarsForInspection();
  const inspectionHistory = getInspectionHistory();

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">Damage Inspector</h1>
          <p className="text-muted-foreground">
            {isPreviewMode ? 'Preview: Damage assessment interface for returned vehicles' : 'Assess damage for returned vehicles and set compensation fees'}
          </p>
        </div>

        {/* Preview Mode Notice */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 dark:bg-blue-900/30 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              🔍 Preview Mode: Damage assessments are simulated. This interface shows inspector functionality.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Inspection Queue */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Cars Awaiting Inspection ({carsForInspection.length})
            </h2>
            
            {carsForInspection.length > 0 ? (
              <div className="space-y-6">
                {carsForInspection.map((car) => (
                  <div key={car.id} className="luxury-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{car.assetName}</h3>
                        <div className={`status-indicator ${
                          car.status === 'Awaiting Return Confirmation' ? 'status-pending' :
                          car.status === 'Damaged' ? 'status-error' : 'status-inactive'
                        }`}>
                          {car.status}
                        </div>
                      </div>
                      <Car className="w-8 h-8 text-primary" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Daily Rate:</span>
                          <span>{ethers.formatEther(car.rentalFeePerDay)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{car.durationDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="font-mono text-xs">{car.lessor.slice(0, 6)}...{car.lessor.slice(-4)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {car.lessee && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Renter:</span>
                            <span className="font-mono text-xs">{car.lessee.slice(0, 6)}...{car.lessee.slice(-4)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Insurance:</span>
                          <span>{ethers.formatEther(car.insuranceFee)} ETH</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleStartAssessment(car)}
                        className="luxury-button flex-1"
                        disabled={selectedCar?.id === car.id}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {selectedCar?.id === car.id ? 'Assessing...' : 'Start Assessment'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="luxury-card p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Cars Awaiting Inspection</h3>
                <p className="text-muted-foreground">
                  All returned cars have been inspected. Check back when new cars are returned.
                </p>
              </div>
            )}
          </div>

          {/* Assessment Form */}
          <div>
            {selectedCar ? (
              <div className="luxury-card p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Assess: {selectedCar.assetName}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="damageFee" className="block text-sm font-medium text-foreground mb-2">
                      Damage Fee (ETH)
                    </label>
                    <input
                      type="number"
                      id="damageFee"
                      name="damageFee"
                      value={assessmentForm.damageFee}
                      onChange={handleInputChange}
                      placeholder="0.0 (enter 0 for no damage)"
                      step="0.01"
                      min="0"
                      className="luxury-input w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter 0 if no damage is found
                    </p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                      Assessment Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={assessmentForm.notes}
                      onChange={handleInputChange}
                      placeholder="Optional notes about the inspection..."
                      rows={4}
                      className="luxury-input w-full resize-none"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={isSubmitting}
                      className="ferrari-button flex-1 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                    <button
                      onClick={() => setSelectedCar(null)}
                      className="luxury-button-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="luxury-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Assessment Form
                </h3>
                <p className="text-muted-foreground text-center py-8">
                  Select a car from the inspection queue to begin assessment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Inspection History */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2" />
            Assessment History ({inspectionHistory.length})
          </h2>
          
          {inspectionHistory.length > 0 ? (
            <div className="luxury-card">
              <div className="divide-y divide-border">
                {inspectionHistory.map((assessment) => (
                  <div key={assessment.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          assessment.amount && parseFloat(ethers.formatEther(assessment.amount)) > 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {assessment.amount && parseFloat(ethers.formatEther(assessment.amount)) > 0 ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {assessment.carName}
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {assessment.timestamp.toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                Inspector: {assessment.from.slice(0, 8)}...{assessment.from.slice(-6)}
                              </span>
                            </div>
                            <div className="font-mono text-xs">
                              Tx: {assessment.transactionHash.slice(0, 16)}...{assessment.transactionHash.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-foreground">
                          {assessment.amount ? ethers.formatEther(assessment.amount) : '0'} ETH
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.amount && parseFloat(ethers.formatEther(assessment.amount)) > 0 ? 'Damage Fee' : 'No Damage'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="luxury-card p-12 text-center">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Assessment History</h3>
              <p className="text-muted-foreground">
                Your completed damage assessments will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

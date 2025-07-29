import React, { useState } from 'react';
import { X, Clock, CreditCard, Shield, AlertTriangle, CheckCircle, Car } from 'lucide-react';

interface RentalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  vehicleName: string;
  depositAmount: string;
  totalCost: string;
  duration: string;
  insuranceFee: string;
  processing?: boolean;
}

export const RentalConfirmationModal: React.FC<RentalConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vehicleName,
  depositAmount,
  totalCost,
  duration,
  insuranceFee,
  processing = false
}) => {
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<'confirmation' | 'processing' | 'success'>('confirmation');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setStep('processing');
      await onConfirm();
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('confirmation');
        setAgreed(false);
      }, 3000);
    } catch (error) {
      setStep('confirmation');
      console.error('Rental confirmation failed:', error);
    }
  };

  const renderConfirmationStep = () => (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text-aurora mb-2">
          Confirm Your Rental
        </h2>
        <p className="text-muted-foreground">
          Review the details before proceeding with payment
        </p>
      </div>

      {/* Vehicle Info */}
      <div className="luxury-glass rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">{vehicleName}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Insurance:</span>
            <span className="font-medium">{insuranceFee} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deposit (50%):</span>
            <span className="font-medium">{depositAmount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Cost:</span>
            <span className="font-bold gradient-text-aurora">{totalCost} ETH</span>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="notification-info rounded-xl mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-blue-700 dark:text-blue-400 mb-2">
              Smart Contract Protection
            </div>
            <ul className="space-y-1 text-blue-600 dark:text-blue-500">
              <li>• Deposit held securely in smart contract</li>
              <li>• Automatic refund for unused time</li>
              <li>• Transparent damage compensation process</li>
              <li>• No hidden fees or charges</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="mb-6">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-muted-foreground">
            I agree to the rental terms and understand that the deposit will be charged immediately. 
            The remaining payment will be processed upon vehicle return.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="luxury-button-outline flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!agreed || processing}
          className="aurora-button flex-1 disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {processing ? 'Processing...' : `Pay ${depositAmount} ETH`}
        </button>
      </div>
    </>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Clock className="w-8 h-8 text-white animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Processing Your Rental
      </h2>
      <p className="text-muted-foreground mb-6">
        Please wait while we process your payment and set up the rental contract...
      </p>
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div className="aurora-gradient h-2 rounded-full transition-all duration-1000 w-3/4"></div>
      </div>
      <p className="text-xs text-muted-foreground">
        This usually takes 15-30 seconds on the blockchain
      </p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Rental Confirmed!
      </h2>
      <p className="text-muted-foreground mb-6">
        Your rental has been successfully set up. You can now enjoy your vehicle!
      </p>
      <div className="notification-success rounded-xl">
        <div className="text-sm text-green-700 dark:text-green-400">
          <strong>Next Steps:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Vehicle is now reserved for you</li>
            <li>• Complete remaining payment upon return</li>
            <li>• Contact support if you need assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="luxury-glass-intense rounded-2xl w-full max-w-md mx-auto slide-up">
        <div className="p-6">
          {/* Close Button */}
          {step === 'confirmation' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Content */}
          {step === 'confirmation' && renderConfirmationStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default RentalConfirmationModal;

import React from 'react';
import { Check, Clock, Car, CreditCard, Shield, AlertCircle } from 'lucide-react';

interface RentalFlowStepperProps {
  currentStep: number;
  steps: Array<{
    id: number;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'pending' | 'error';
  }>;
  userRole?: 'lessor' | 'lessee' | 'other';
}

export const RentalFlowStepper: React.FC<RentalFlowStepperProps> = ({
  currentStep,
  steps,
  userRole = 'other'
}) => {
  const getStepIcon = (step: typeof steps[0], index: number) => {
    if (step.status === 'completed') {
      return <Check className="w-5 h-5 text-white" />;
    }
    if (step.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-white" />;
    }
    if (step.status === 'current') {
      switch (step.id) {
        case 1:
          return <Shield className="w-5 h-5 text-white" />;
        case 2:
          return <Car className="w-5 h-5 text-white" />;
        case 3:
          return <Clock className="w-5 h-5 text-white" />;
        case 4:
          return <CreditCard className="w-5 h-5 text-white" />;
        default:
          return <div className="w-5 h-5 text-white font-bold">{step.id}</div>;
      }
    }
    return <div className="w-5 h-5 text-white/60 font-bold">{step.id}</div>;
  };

  const getStepStyle = (step: typeof steps[0]) => {
    switch (step.status) {
      case 'completed':
        return 'aurora-gradient';
      case 'current':
        return 'cyan-gradient pulse-gentle';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const getStepTextStyle = (step: typeof steps[0]) => {
    switch (step.status) {
      case 'completed':
        return 'text-foreground';
      case 'current':
        return 'text-foreground gradient-text-aurora';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="luxury-card p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold gradient-text-aurora mb-2">
          Rental Process
        </h3>
        <p className="text-sm text-muted-foreground">
          {userRole === 'lessor' ? 'Monitor your rental progress as the owner' : 
           userRole === 'lessee' ? 'Track your rental journey' : 
           'Follow the rental process steps'}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getStepStyle(step)}`}>
                {getStepIcon(step, index)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium transition-colors duration-200 ${getStepTextStyle(step)}`}>
                  {step.title}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </div>
                
                {/* Step Status Badge */}
                {step.status !== 'pending' && (
                  <div className="mt-2">
                    <span className={`status-indicator ${
                      step.status === 'completed' ? 'status-active' :
                      step.status === 'current' ? 'status-pending' :
                      step.status === 'error' ? 'status-error' : 'status-inactive'
                    }`}>
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'current' ? 'In Progress' :
                       step.status === 'error' ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-8 bg-border"></div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="aurora-gradient h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RentalFlowStepper;

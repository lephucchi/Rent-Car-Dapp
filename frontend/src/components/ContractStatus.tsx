import React from 'react';
import { CheckCircle, AlertCircle, Clock, Car } from 'lucide-react';
import { rentalContractService } from '../services/rentalContractService';

interface ContractStatusProps {
  isConnected: boolean;
  userRole: 'lessor' | 'lessee' | 'other';
  contractAddress: string;
}

export const ContractStatus: React.FC<ContractStatusProps> = ({
  isConnected,
  userRole,
  contractAddress
}) => {
  const getRoleIcon = () => {
    switch (userRole) {
      case 'lessor':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'lessee':
        return <Clock className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'lessor':
        return 'Vehicle Owner';
      case 'lessee':
        return 'Renter';
      default:
        return 'Visitor';
    }
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'lessor':
        return 'You can manage rentals and confirm returns';
      case 'lessee':
        return 'You can rent vehicles and request returns';
      default:
        return 'Connect your wallet to rent this vehicle';
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {getRoleIcon()}
            <h4 className="text-sm font-semibold text-black">{getRoleLabel()}</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {getRoleDescription()}
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Connection Status:</span>
              <span className={isConnected ? 'text-green-600' : 'text-gray-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="text-gray-700">
                {rentalContractService.getNetworkInfo().network}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Contract:</span>
              <span className="text-gray-700 font-mono text-xs">
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

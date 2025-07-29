import React, { useEffect } from 'react';
import { useContractStore } from '../stores/contractStore';

interface ContractDetailsProps {
  contractAddress?: string;
}

const getStatusText = (state: string): string => {
  return state || 'Unknown';
};

export const ContractDisplay: React.FC<ContractDetailsProps> = ({ contractAddress }) => {
  const { 
    contractStatus, 
    accounts,
    loadContractStatus, 
    loadAccounts,
    startRental,
    endRental,
    isLoading, 
    error
  } = useContractStore();

  useEffect(() => {
    loadContractStatus();
    loadAccounts();
  }, [loadContractStatus, loadAccounts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading contract details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading contract</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!contractStatus) {
    return (
      <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
        <p>No contract details available</p>
      </div>
    );
  }

  const handleStartRental = async () => {
    if (!accounts || accounts.length < 2) return;
    
    const renterAccount = accounts[1]; // Use second account as renter
    try {
      await startRental(renterAccount.address, renterAccount.private_key);
    } catch (error) {
      console.error('Failed to start rental:', error);
    }
  };

  const handleEndRental = async () => {
    if (!accounts || accounts.length < 1) return;
    
    const ownerAccount = accounts[0]; // Use first account as owner
    try {
      await endRental(ownerAccount.address, ownerAccount.private_key);
    } catch (error) {
      console.error('Failed to end rental:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Contract Status</h3>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {getStatusText(contractStatus.rental_state)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Owner:</span>
            <p className="text-gray-600 break-all">{contractStatus.owner}</p>
          </div>
          <div>
            <span className="font-medium">Current Renter:</span>
            <p className="text-gray-600 break-all">{contractStatus.current_renter || 'Not assigned'}</p>
          </div>
          <div>
            <span className="font-medium">Contract Address:</span>
            <p className="text-gray-600 break-all">{contractStatus.contract_address}</p>
          </div>
        </div>
      </div>

      {/* Car Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Car Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Car Model:</span>
            <p className="text-gray-600">{contractStatus.car_model}</p>
          </div>
          <div>
            <span className="font-medium">Rental Fee:</span>
            <p className="text-gray-600">{contractStatus.rental_fee_per_minute} wei/minute</p>
          </div>
          <div>
            <span className="font-medium">Duration:</span>
            <p className="text-gray-600">{contractStatus.rental_duration_minutes} minutes</p>
          </div>
        </div>
      </div>

      {/* Rental Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Rental Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Insurance Deposit:</span>
            <p className="text-gray-600">{contractStatus.insurance_deposit} wei</p>
          </div>
          <div>
            <span className="font-medium">Total Cost:</span>
            <p className="text-gray-600">{contractStatus.total_cost_eth} ETH</p>
          </div>
        </div>
      </div>

      {/* Available Accounts */}
      {accounts && accounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Available Test Accounts</h3>
          <div className="space-y-2">
            {accounts.slice(0, 3).map((account, index) => (
              <div key={account.address} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{account.role}:</span>
                  <span className="font-mono text-sm ml-2">{account.address}</span>
                </div>
                <span className="text-sm text-gray-600">{account.balance_eth} ETH</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {/* Start Rental - Available when status is Available */}
          {contractStatus.rental_state === 'Available' && (
            <button
              onClick={handleStartRental}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Start Rental ({contractStatus.total_cost_eth} ETH)
            </button>
          )}

          {/* End Rental - Available when status is Rented */}
          {contractStatus.rental_state === 'Rented' && (
            <button
              onClick={handleEndRental}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              End Rental
            </button>
          )}

          {/* Refresh Status */}
          <button
            onClick={() => {
              loadContractStatus();
              loadAccounts();
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Refresh Status
          </button>

          {contractStatus.rental_state === 'Damaged' && (
            <button
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Vehicle Damaged - Contact Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

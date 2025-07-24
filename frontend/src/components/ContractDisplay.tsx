import React, { useEffect } from 'react';
import { useWeb3Store } from '../stores/web3Store';
import type { ContractStatus } from '../types';

interface ContractDetailsProps {
  contractAddress?: string;
}

const getStatusText = (status: ContractStatus): string => {
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Active';
    case 2: return 'Returned';
    case 3: return 'Completed';
    case 4: return 'Canceled';
    default: return 'Unknown';
  }
};

const getStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case 0: return 'bg-yellow-100 text-yellow-800';
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-blue-100 text-blue-800';
    case 3: return 'bg-purple-100 text-purple-800';
    case 4: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ContractDisplay: React.FC<ContractDetailsProps> = ({ contractAddress }) => {
  const { 
    contractDetails, 
    loadContractDetails, 
    activateContract,
    returnCar,
    inspectCar,
    finalizeContract,
    cancelContract,
    isLoading, 
    error,
    address 
  } = useWeb3Store();

  useEffect(() => {
    loadContractDetails(contractAddress);
  }, [contractAddress, loadContractDetails]);

  const handleActivateContract = async () => {
    if (!contractDetails || !contractAddress) return;
    
    try {
      await activateContract(contractAddress, contractDetails.rental.depositAmount);
    } catch (error) {
      console.error('Failed to activate contract:', error);
    }
  };

  const handleReturnCar = async () => {
    if (!contractAddress) return;
    
    try {
      await returnCar(contractAddress);
    } catch (error) {
      console.error('Failed to return car:', error);
    }
  };

  const handleInspectCar = async (isDamaged: boolean) => {
    if (!contractAddress) return;
    
    const compensationAmount = isDamaged ? '0.01' : '0'; // You might want to make this configurable
    
    try {
      await inspectCar(contractAddress, isDamaged, compensationAmount);
    } catch (error) {
      console.error('Failed to inspect car:', error);
    }
  };

  const handleFinalizeContract = async () => {
    if (!contractAddress) return;
    
    try {
      await finalizeContract(contractAddress);
    } catch (error) {
      console.error('Failed to finalize contract:', error);
    }
  };

  const handleCancelContract = async () => {
    if (!contractAddress) return;
    
    try {
      await cancelContract(contractAddress);
    } catch (error) {
      console.error('Failed to cancel contract:', error);
    }
  };

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

  if (!contractDetails) {
    return (
      <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
        <p>No contract details available</p>
      </div>
    );
  }

  const isLessor = address?.toLowerCase() === contractDetails.lessor.toLowerCase();
  const isLessee = address?.toLowerCase() === contractDetails.lessee.toLowerCase();
  const isInspector = address?.toLowerCase() === contractDetails.inspector.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Contract Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Contract Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contractDetails.status)}`}>
            {getStatusText(contractDetails.status)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Lessor:</span>
            <p className="text-gray-600 break-all">{contractDetails.lessor}</p>
          </div>
          <div>
            <span className="font-medium">Lessee:</span>
            <p className="text-gray-600 break-all">{contractDetails.lessee || 'Not assigned'}</p>
          </div>
          <div>
            <span className="font-medium">Inspector:</span>
            <p className="text-gray-600 break-all">{contractDetails.inspector}</p>
          </div>
        </div>
      </div>

      {/* Car Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Car Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Make:</span>
            <p className="text-gray-600">{contractDetails.car.make}</p>
          </div>
          <div>
            <span className="font-medium">Model:</span>
            <p className="text-gray-600">{contractDetails.car.model}</p>
          </div>
          <div>
            <span className="font-medium">Year:</span>
            <p className="text-gray-600">{contractDetails.car.year}</p>
          </div>
        </div>
      </div>

      {/* Rental Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Rental Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Price per Day:</span>
            <p className="text-gray-600">{contractDetails.rental.pricePerDay} ETH</p>
          </div>
          <div>
            <span className="font-medium">Duration:</span>
            <p className="text-gray-600">{contractDetails.rental.rentalDuration} days</p>
          </div>
          <div>
            <span className="font-medium">Deposit Amount:</span>
            <p className="text-gray-600">{contractDetails.rental.depositAmount} ETH</p>
          </div>
          <div>
            <span className="font-medium">Contract Balance:</span>
            <p className="text-gray-600">{contractDetails.balance} ETH</p>
          </div>
        </div>
      </div>

      {/* Time Information */}
      {contractDetails.timeInfo.startTime > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Start Time:</span>
              <p className="text-gray-600">
                {new Date(contractDetails.timeInfo.startTime * 1000).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-medium">Due Time:</span>
              <p className="text-gray-600">
                {new Date(contractDetails.timeInfo.dueTime * 1000).toLocaleString()}
              </p>
            </div>
            {contractDetails.timeInfo.returnTime > 0 && (
              <div>
                <span className="font-medium">Return Time:</span>
                <p className="text-gray-600">
                  {new Date(contractDetails.timeInfo.returnTime * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspection Information */}
      {contractDetails.status >= 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Inspection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Damaged:</span>
              <p className="text-gray-600">{contractDetails.inspectionInfo.isDamaged ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="font-medium">Compensation:</span>
              <p className="text-gray-600">{contractDetails.inspectionInfo.compensationAmount} ETH</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {/* Activate Contract - Available for any user when status is Pending */}
          {contractDetails.status === 0 && (
            <button
              onClick={handleActivateContract}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Activate Contract ({contractDetails.rental.depositAmount} ETH)
            </button>
          )}

          {/* Return Car - Available for lessee when status is Active */}
          {contractDetails.status === 1 && isLessee && (
            <button
              onClick={handleReturnCar}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Return Car
            </button>
          )}

          {/* Inspection - Available for inspector when status is Returned */}
          {contractDetails.status === 2 && isInspector && (
            <>
              <button
                onClick={() => handleInspectCar(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Mark as No Damage
              </button>
              <button
                onClick={() => handleInspectCar(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Mark as Damaged
              </button>
            </>
          )}

          {/* Finalize Contract - Available for lessor when status is Completed */}
          {contractDetails.status === 3 && isLessor && (
            <button
              onClick={handleFinalizeContract}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Finalize Contract
            </button>
          )}

          {/* Cancel Contract - Available for lessor/lessee when status is Pending */}
          {contractDetails.status === 0 && (isLessor || isLessee) && (
            <button
              onClick={handleCancelContract}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Cancel Contract
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

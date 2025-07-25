import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Calendar, Clock, User, AlertTriangle } from "lucide-react";
import Button from "./Button";
import { useContractStore } from "../stores/contractStore";
import { useAuthStore } from "../stores/authStore";

interface RentalData {
  id: string;
  carName: string;
  status: string;
  startTime?: number;
  endTime?: number;
  renter?: string;
  owner?: string;
  totalCost?: string;
}

export default function RentalManagement() {
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const { contractStatus, accounts, loadContractStatus, loadAccounts } = useContractStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadContractStatus();
    loadAccounts();
  }, [loadContractStatus, loadAccounts]);

  useEffect(() => {
    if (contractStatus) {
      // Convert contract status to rental data format
      const rental: RentalData = {
        id: contractStatus.contract_address || '1',
        carName: contractStatus.car_model || 'Unknown Vehicle',
        status: contractStatus.rental_state || 'Unknown',
        renter: contractStatus.current_renter,
        owner: contractStatus.owner,
        totalCost: contractStatus.total_cost_eth
      };
      setRentals([rental]);
    }
  }, [contractStatus]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <Car className="w-5 h-5 text-green-600" />;
      case 'rented':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'damaged':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Car className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Rental Management</h2>
          <p className="text-gray-400">Monitor and manage your car rental contracts</p>
        </div>
        <Button 
          onClick={() => {
            loadContractStatus();
            loadAccounts();
          }}
          variant="outline"
        >
          Refresh Data
        </Button>
      </div>

      {/* Current Contract Status */}
      {contractStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Current Contract</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contractStatus.rental_state)}`}>
              {contractStatus.rental_state}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Vehicle</p>
              <p className="text-white font-medium">{contractStatus.car_model}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Owner</p>
              <p className="text-white font-mono text-sm">
                {contractStatus.owner ? `${contractStatus.owner.slice(0, 6)}...${contractStatus.owner.slice(-4)}` : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Current Renter</p>
              <p className="text-white font-mono text-sm">
                {contractStatus.current_renter ? `${contractStatus.current_renter.slice(0, 6)}...${contractStatus.current_renter.slice(-4)}` : 'None'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Cost</p>
              <p className="text-neon-cyan font-bold">{contractStatus.total_cost_eth} ETH</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Fee per minute:</span>
                <span className="text-white ml-2">{contractStatus.rental_fee_per_minute} wei</span>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="text-white ml-2">{contractStatus.rental_duration_minutes} minutes</span>
              </div>
              <div>
                <span className="text-gray-400">Insurance:</span>
                <span className="text-white ml-2">{contractStatus.insurance_deposit} wei</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Accounts */}
      {accounts && accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Available Test Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.slice(0, 3).map((account, index) => (
              <div key={account.address} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-5 h-5 text-neon-cyan" />
                  <span className="text-white font-medium capitalize">{account.role}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">Address:</p>
                  <p className="text-white font-mono break-all">{account.address}</p>
                  <p className="text-gray-400">Balance:</p>
                  <p className="text-neon-cyan font-bold">{account.balance_eth} ETH</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rental History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Rental History</h3>
        
        {rentals.length > 0 ? (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div key={rental.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(rental.status)}
                    <div>
                      <h4 className="text-white font-medium">{rental.carName}</h4>
                      <p className="text-gray-400 text-sm">Contract ID: {rental.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
                    {rental.status}
                  </span>
                </div>
                
                {rental.totalCost && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="text-neon-cyan font-bold">{rental.totalCost} ETH</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No rental history available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
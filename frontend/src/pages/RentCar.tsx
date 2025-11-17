import { useState, useEffect } from 'react';
import { Car, Calendar, DollarSign, Loader, CheckCircle } from 'lucide-react';
import { useWalletConnection } from '../stores/globalWeb3Store';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import carService, { type Car as CarType } from '../services/carService';
import { contractService, type Contract } from '../services/contractService';
import web3ContractService from '../services/web3ContractService';

export default function RentCar() {
  const { isConnected, address } = useWalletConnection();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [availableCars, setAvailableCars] = useState<CarType[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableRentals();
  }, []);

  const loadAvailableRentals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load available cars
      const carsResponse = await carService.getAvailableCars(1, 20);
      if (carsResponse.success) {
        setAvailableCars(carsResponse.data.cars);
      }

      // Load active contracts
      const contractsResponse = await contractService.getActiveContracts();
      if (contractsResponse.success) {
        setActiveContracts(contractsResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async (contractId: string) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setRenting(contractId);
    setError(null);
    setSuccess(null);

    try {
      // Find the contract to get contract_address
      const contract = activeContracts.find(c => c.id === contractId);
      if (!contract?.contract_address) {
        throw new Error('Contract address not found');
      }

      // Step 1: Call smart contract via MetaMask
      console.log('🔗 Starting rental on blockchain...');
      await web3ContractService.startRental(contract.contract_address);
      
      // Step 2: Update database via backend
      console.log('💾 Updating database...');
      const response = await contractService.rentCar(contractId, {
        wallet_address: address
      });

      if (response.success) {
        setSuccess('✅ Rental started successfully!');
        setTimeout(() => {
          loadAvailableRentals();
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Rental failed:', err);
      setError(err.message || 'Failed to start rental');
    } finally {
      setRenting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to browse and rent vehicles.
          </p>
          <button onClick={() => navigate('/auth')} className="luxury-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to browse and rent vehicles.
          </p>
          <button onClick={() => navigate('/')} className="luxury-button">
            Go Back and Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-foreground mb-4">
            Rent a <span className="gradient-text-aurora">Vehicle</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure your rental with blockchain technology
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="luxury-card p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deposit Required</p>
                <p className="text-lg font-semibold text-foreground">50% of total</p>
              </div>
            </div>
          </div>

          <div className="luxury-card p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Contracts</p>
                <p className="text-lg font-semibold text-foreground">{activeContracts.length}</p>
              </div>
            </div>
          </div>

          <div className="luxury-card p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Cars</p>
                <p className="text-lg font-semibold text-foreground">{availableCars.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Available Rentals */}
        {loading ? (
          <div className="luxury-card p-12 text-center">
            <Loader className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading available rentals...</p>
          </div>
        ) : activeContracts.length === 0 ? (
          <div className="luxury-card p-12 text-center">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Contracts</h3>
            <p className="text-muted-foreground">
              There are currently no rental contracts available. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeContracts.map((contract) => {
              const car = availableCars.find(c => c.id === contract.car_id);
              
              return (
                <div key={contract.id} className="luxury-card p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {car?.model || 'Car'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{car?.location}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span className="font-semibold text-foreground">${contract.rental_fee_per_day}/day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold text-foreground">{contract.duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Insurance:</span>
                      <span className="font-semibold text-foreground">${contract.insurance_fee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold text-foreground">
                        ${(contract.rental_fee_per_day * contract.duration_days + contract.insurance_fee).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full inline-block">
                      {contract.status}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRent(contract.id)}
                    disabled={renting === contract.id || contract.status !== 'pending'}
                    className="w-full aurora-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {renting === contract.id ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Rent Now'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

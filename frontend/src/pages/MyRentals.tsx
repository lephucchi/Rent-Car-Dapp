import { useState, useEffect } from 'react';
import { Car, Clock, CheckCircle, AlertCircle, Loader, ExternalLink, DollarSign } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { contractService, type Contract } from '../services/contractService';
import web3ContractService from '../services/web3ContractService';

export default function MyRentals() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadRentals();
  }, [isAuthenticated]);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const response = await contractService.getMyRentals(50, 0);
      if (response.success) {
        setRentals(response.data);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async (contract: Contract) => {
    if (!contract.contract_address) {
      alert('Contract address not found');
      return;
    }

    if (!confirm('Are you sure you want to request return? The lessor will need to confirm.')) {
      return;
    }

    setActionLoading(contract.id);
    try {
      // Step 1: Call smart contract via MetaMask
      await web3ContractService.requestReturn(contract.contract_address);

      // Step 2: Update database
      await contractService.requestReturn(contract.id);

      alert('Return requested successfully! Waiting for lessor confirmation.');
      loadRentals();
    } catch (err: any) {
      console.error('Failed to request return:', err);
      alert(`Failed to request return: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRental = async (contract: Contract) => {
    if (!contract.contract_address) {
      alert('Contract address not found');
      return;
    }

    if (!confirm('This will pay the remaining rental fee and complete the contract. Continue?')) {
      return;
    }

    setActionLoading(contract.id);
    try {
      // Step 1: Call smart contract via MetaMask (pay remaining amount)
      await web3ContractService.completeRental(contract.contract_address);

      // Step 2: Update database
      await contractService.completeRental(contract.id);

      alert('Rental completed successfully!');
      loadRentals();
    } catch (err: any) {
      console.error('Failed to complete rental:', err);
      alert(`Failed to complete rental: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'active': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'active': return <Car className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const calculateRemainingDays = (endTime: string | null) => {
    if (!endTime) return null;
    const end = new Date(endTime);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">My Rentals</h1>
          <p className="text-muted-foreground">
            Manage your rented cars and rental history
          </p>
        </div>

        {/* Rentals List */}
        {rentals.length === 0 ? (
          <div className="aurora-card p-12 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Rentals</h3>
            <p className="text-muted-foreground mb-6">
              You haven't rented any cars yet.
            </p>
            <button
              onClick={() => navigate('/rent')}
              className="aurora-button"
            >
              Browse Cars
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => {
              const remainingDays = calculateRemainingDays(rental.end_time);
              const isActive = rental.status === 'active';
              
              return (
                <div key={rental.id} className="aurora-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {rental.car?.model || 'Car'}
                        </h3>
                        <div className={`flex items-center gap-1 ${getStatusColor(rental.status)}`}>
                          {getStatusIcon(rental.status)}
                          <span className="text-sm font-medium capitalize">{rental.status}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-1">
                        License: {rental.car?.license_plate}
                      </p>
                      {rental.lessor && (
                        <p className="text-muted-foreground text-sm">
                          Owner: {rental.lessor.wallet_address?.slice(0, 6)}...{rental.lessor.wallet_address?.slice(-4)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {rental.rental_fee} ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rental.duration_days} days
                      </p>
                      {isActive && remainingDays !== null && (
                        <p className="text-xs text-primary mt-1">
                          {remainingDays} days remaining
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="text-foreground">
                        {rental.start_time ? new Date(rental.start_time).toLocaleDateString() : 'Not started'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="text-foreground">
                        {rental.end_time ? new Date(rental.end_time).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deposit Paid</p>
                      <p className="text-foreground">{rental.deposit} ETH</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Insurance</p>
                      <p className="text-foreground">{rental.insurance_fee} ETH</p>
                    </div>
                  </div>

                  {/* Contract Address */}
                  {rental.contract_address && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-foreground font-mono">
                          {rental.contract_address}
                        </code>
                        <a
                          href={`https://etherscan.io/address/${rental.contract_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {isActive && !rental.renter_requested_return && (
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => handleRequestReturn(rental)}
                        disabled={actionLoading === rental.id}
                        className="luxury-button-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === rental.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Request Return</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCompleteRental(rental)}
                        disabled={actionLoading === rental.id}
                        className="luxury-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === rental.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            <span>Complete & Pay</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {isActive && rental.renter_requested_return && !rental.owner_confirmed_return && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-center gap-2 text-yellow-600">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <p className="text-sm font-medium">Waiting for owner to confirm return</p>
                      </div>
                    </div>
                  )}

                  {rental.status === 'pending' && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground text-center">
                        Contract created but rental not started yet
                      </p>
                    </div>
                  )}

                  {rental.status === 'completed' && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">Rental completed successfully</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

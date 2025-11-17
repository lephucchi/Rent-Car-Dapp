import { useState, useEffect } from 'react';
import { Car, Clock, CheckCircle, AlertCircle, ChevronRight, Loader, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { contractService, type Contract } from '../services/contractService';
import web3ContractService from '../services/web3ContractService';

export default function MyContracts() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadContracts();
  }, [isAuthenticated]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await contractService.getMyContracts(50, 0);
      if (response.success) {
        setContracts(response.data);
      }
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async (contract: Contract) => {
    if (!contract.contract_address) {
      alert('Contract address not found');
      return;
    }

    setActionLoading(contract.id);
    try {
      // Step 1: Call smart contract via MetaMask
      await web3ContractService.confirmReturn(contract.contract_address);

      // Step 2: Update database
      await contractService.confirmReturn(contract.id);

      alert('Return confirmed successfully!');
      loadContracts();
    } catch (err: any) {
      console.error('Failed to confirm return:', err);
      alert(`Failed to confirm return: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportDamage = async (contract: Contract) => {
    if (!contract.contract_address) {
      alert('Contract address not found');
      return;
    }

    const description = prompt('Enter damage description:');
    if (!description) return;

    setActionLoading(contract.id);
    try {
      // Step 1: Call smart contract via MetaMask
      await web3ContractService.reportDamage(contract.contract_address);

      // Step 2: Update database
      await contractService.reportDamage(contract.id, description);

      alert('Damage reported successfully!');
      loadContracts();
    } catch (err: any) {
      console.error('Failed to report damage:', err);
      alert(`Failed to report damage: ${err.message}`);
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
          <h1 className="text-3xl font-light text-foreground mb-2">My Contracts</h1>
          <p className="text-muted-foreground">
            Manage your rental contracts and cars
          </p>
        </div>

        {/* Contracts List */}
        {contracts.length === 0 ? (
          <div className="aurora-card p-12 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Contracts</h3>
            <p className="text-muted-foreground mb-6">
              You haven't created any rental contracts yet.
            </p>
            <button
              onClick={() => navigate('/lend')}
              className="aurora-button"
            >
              List Your Car
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="aurora-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {contract.car?.model || 'Car'}
                      </h3>
                      <div className={`flex items-center gap-1 ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        <span className="text-sm font-medium capitalize">{contract.status}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">
                      License: {contract.car?.license_plate}
                    </p>
                    {contract.lessee && (
                      <p className="text-muted-foreground text-sm">
                        Renter: {contract.lessee.wallet_address?.slice(0, 6)}...{contract.lessee.wallet_address?.slice(-4)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {contract.rental_fee} ETH
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contract.duration_days} days
                    </p>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="text-foreground">
                      {contract.start_time ? new Date(contract.start_time).toLocaleDateString() : 'Not started'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="text-foreground">
                      {contract.end_time ? new Date(contract.end_time).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deposit</p>
                    <p className="text-foreground">{contract.deposit} ETH</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Insurance</p>
                    <p className="text-foreground">{contract.insurance_fee} ETH</p>
                  </div>
                </div>

                {/* Contract Address */}
                {contract.contract_address && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-foreground font-mono">
                        {contract.contract_address}
                      </code>
                      <a
                        href={`https://etherscan.io/address/${contract.contract_address}`}
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
                {contract.status === 'active' && contract.renter_requested_return && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => handleConfirmReturn(contract)}
                      disabled={actionLoading === contract.id}
                      className="luxury-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === contract.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm Return</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReportDamage(contract)}
                      disabled={actionLoading === contract.id}
                      className="luxury-button-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === contract.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>Report Damage</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {contract.status === 'active' && !contract.renter_requested_return && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Waiting for renter to request return
                    </p>
                  </div>
                )}

                {contract.status === 'pending' && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Waiting for renter to start the rental
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

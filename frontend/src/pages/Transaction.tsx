import { useState, useEffect } from 'react';
import { Calendar, Search, ChevronDown, Loader, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useWalletConnection } from '../stores/globalWeb3Store';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { contractService, type Contract, type ContractEvent } from '../services/contractService';

export default function Transaction() {
  const { isConnected } = useWalletConnection();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTransactions();
    }
  }, [isAuthenticated, user]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Load both lessor and lessee contracts
      const [lessorContracts, lesseeContracts] = await Promise.all([
        contractService.getMyContracts(50, 0),
        contractService.getMyRentals(50, 0)
      ]);

      const allContracts = [
        ...(lessorContracts.success ? lessorContracts.data : []),
        ...(lesseeContracts.success ? lesseeContracts.data : [])
      ];

      // Remove duplicates by ID
      const uniqueContracts = Array.from(
        new Map(allContracts.map(c => [c.id, c])).values()
      );

      setContracts(uniqueContracts);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContractEvents = async (contractId: string) => {
    try {
      const response = await contractService.getContractEvents(contractId);
      if (response.success) {
        setEvents(response.data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleContractClick = async (contract: Contract) => {
    setSelectedContract(contract);
    await loadContractEvents(contract.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (filterType !== 'all' && contract.status !== filterType) return false;
    if (searchTerm && !contract.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to view your transaction history.
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
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your transaction history.
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
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">Transaction History</h1>
          <p className="text-muted-foreground">
            View all your blockchain transactions and rental history
          </p>
        </div>

        {/* Filters */}
        <div className="luxury-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by contract ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Filter by Status */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between px-4 py-2 border border-border rounded-lg bg-muted/20">
              <span className="text-sm text-muted-foreground">Total Contracts:</span>
              <span className="font-semibold text-foreground">{contracts.length}</span>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        {loading ? (
          <div className="luxury-card p-12 text-center">
            <Loader className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="luxury-card p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Transactions</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'No transactions match your filters.'
                : 'Your transaction history will appear here once you start renting or managing cars on CarDapp.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contracts List */}
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => handleContractClick(contract)}
                  className={`luxury-card p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedContract?.id === contract.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contract ID</p>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {contract.id.slice(0, 8)}...{contract.id.slice(-8)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      <span className="text-xs font-semibold">{contract.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily Rate</p>
                      <p className="font-semibold text-foreground">${contract.rental_fee_per_day}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{contract.duration_days} days</p>
                    </div>
                  </div>

                  {contract.contract_address && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <a
                        href={`https://etherscan.io/address/${contract.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Blockchain
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contract Details & Events */}
            <div className="luxury-card p-6">
              {selectedContract ? (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Contract Events</h3>
                  {events.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No events recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-foreground">{event.event_type}</span>
                            <span className="text-xs text-muted-foreground">
                              Block #{event.block_number}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                          <a
                            href={`https://etherscan.io/tx/${event.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center"
                          >
                            {event.transaction_hash.slice(0, 10)}...{event.transaction_hash.slice(-8)}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a contract to view events</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

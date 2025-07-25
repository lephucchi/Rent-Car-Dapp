import React, { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useRentalContractStore, useContractState, useUserRole, useIsConnected } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';
import { MetaMaskConnect } from '../components/MetaMaskConnect';

interface Transaction {
  id: string;
  type: 'deposit' | 'payment' | 'refund' | 'damage_compensation';
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  from: string;
  to: string;
  gasUsed?: string;
  gasPrice?: string;
}

// Mock transaction data - in a real app, this would come from blockchain events or backend
const generateMockTransactions = (contractState: any, userRole: string): Transaction[] => {
  const transactions: Transaction[] = [];
  
  if (contractState?.isRented) {
    // Rental started transaction
    transactions.push({
      id: '1',
      type: 'deposit',
      amount: rentalContractService.formatEther(contractState.insuranceFee + (contractState.rentalFeePerMinute * contractState.durationMinutes / BigInt(2))),
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'confirmed',
      hash: '0x1234567890abcdef1234567890abcdef12345678',
      from: contractState.lessee,
      to: contractState.lessor,
      gasUsed: '21000',
      gasPrice: '20'
    });
  }

  if (contractState?.isDamaged) {
    // Damage compensation transaction
    transactions.push({
      id: '2',
      type: 'damage_compensation',
      amount: rentalContractService.formatEther(contractState.insuranceCompensation),
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'confirmed',
      hash: '0xabcdef1234567890abcdef1234567890abcdef12',
      from: contractState.lessee,
      to: contractState.lessor,
      gasUsed: '25000',
      gasPrice: '22'
    });
  }

  // Add some historical transactions
  transactions.push(
    {
      id: '3',
      type: 'payment',
      amount: '2.5',
      timestamp: Date.now() - 172800000, // 2 days ago
      status: 'confirmed',
      hash: '0x9876543210fedcba9876543210fedcba98765432',
      from: '0x742d35Cc6644C3532C8FD2FE0c3e1234567890ab',
      to: '0x8ba1f109551bD432803012645Hac189451c35',
      gasUsed: '21000',
      gasPrice: '18'
    },
    {
      id: '4',
      type: 'refund',
      amount: '1.2',
      timestamp: Date.now() - 259200000, // 3 days ago
      status: 'confirmed',
      hash: '0xfedcba9876543210fedcba9876543210fedcba98',
      from: '0x8ba1f109551bD432803012645Hac189451c35',
      to: '0x742d35Cc6644C3532C8FD2FE0c3e1234567890ab',
      gasUsed: '21000',
      gasPrice: '15'
    }
  );

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

export default function Transaction() {
  const { connectWallet } = useRentalContractStore();
  const contractState = useContractState();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isConnected && contractState) {
      const mockTransactions = generateMockTransactions(contractState, userRole);
      setTransactions(mockTransactions);
    }
  }, [isConnected, contractState, userRole]);

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setConnectionError(null);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectionError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'refund':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'damage_compensation':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <History className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Rental Deposit';
      case 'payment':
        return 'Rental Payment';
      case 'refund':
        return 'Refund';
      case 'damage_compensation':
        return 'Damage Compensation';
      default:
        return 'Transaction';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="luxury-container py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="luxury-title mb-4">Transaction History</h1>
              <p className="text-muted-foreground">
                Connect your wallet to view your rental transaction history and ensure complete transparency.
              </p>
            </div>
            
            <MetaMaskConnect
              onConnect={handleConnectWallet}
              connecting={connecting}
              error={connectionError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <History className="w-8 h-8 text-primary" />
            <h1 className="luxury-heading">Transaction History</h1>
          </div>
          <p className="luxury-subheading">
            Complete transparency of all your rental transactions on the blockchain
          </p>
        </div>

        {/* Stats Cards */}
        <div className="luxury-grid-4 mb-8">
          <div className="luxury-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
              </div>
              <History className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="luxury-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  {transactions
                    .filter(tx => ['deposit', 'payment', 'damage_compensation'].includes(tx.type))
                    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                    .toFixed(2)} ETH
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="luxury-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Received</p>
                <p className="text-2xl font-bold text-foreground">
                  {transactions
                    .filter(tx => tx.type === 'refund')
                    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                    .toFixed(2)} ETH
                </p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="luxury-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {transactions.length > 0 
                    ? Math.round((transactions.filter(tx => tx.status === 'confirmed').length / transactions.length) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="luxury-card p-6 mb-8">
          <h3 className="luxury-title mb-4">Filter Transactions</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Transactions' },
              { value: 'deposit', label: 'Deposits' },
              { value: 'payment', label: 'Payments' },
              { value: 'refund', label: 'Refunds' },
              { value: 'damage_compensation', label: 'Damage Compensation' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="luxury-card">
          <div className="p-6 border-b border-border">
            <h3 className="luxury-title">Recent Transactions</h3>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'You haven\'t made any transactions yet.' 
                  : `No ${filter} transactions found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-foreground">
                            {getTransactionTypeLabel(transaction.type)}
                          </h4>
                          {getStatusIcon(transaction.status)}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                          <span className="font-mono">
                            {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          ['deposit', 'payment', 'damage_compensation'].includes(transaction.type)
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {['deposit', 'payment', 'damage_compensation'].includes(transaction.type) ? '-' : '+'}
                          {transaction.amount} ETH
                        </div>
                        
                        {transaction.gasUsed && (
                          <div className="text-xs text-muted-foreground">
                            Gas: {transaction.gasUsed} @ {transaction.gasPrice} gwei
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => window.open(`https://etherscan.io/tx/${transaction.hash}`, '_blank')}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transparency Note */}
        <div className="luxury-card p-6 mt-8 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Blockchain Transparency
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                All transactions are recorded on the blockchain and can be independently verified. 
                This ensures complete transparency and immutable records of all rental activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

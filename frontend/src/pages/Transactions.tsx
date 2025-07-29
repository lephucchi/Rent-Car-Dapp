import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink, RefreshCw, Filter, Activity, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { useFixedRentalStore, useTransactionHistory, useIsConnected } from '../stores/fixedRentalStore';
import { type TransactionEvent } from '../services/fixedRentalService';

export default function Transactions() {
  const { refreshTransactionHistory, connectWallet } = useFixedRentalStore();
  const transactionHistory = useTransactionHistory();
  const isConnected = useIsConnected();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isConnected) {
      refreshTransactionHistory();
    }
  }, [isConnected, refreshTransactionHistory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactionHistory();
    } catch (error) {
      console.error('Failed to refresh transaction history:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getEventIcon = (eventType: TransactionEvent['type']) => {
    switch (eventType) {
      case 'RentalStarted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'RentalCancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RenterRequestedReturn':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'OwnerConfirmedReturn':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ActualUsageSet':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'DamageReported':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'DamageAssessed':
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      case 'FundsTransferred':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventTitle = (eventType: TransactionEvent['type']) => {
    switch (eventType) {
      case 'RentalStarted':
        return 'Rental Started';
      case 'RentalCancelled':
        return 'Rental Cancelled';
      case 'RenterRequestedReturn':
        return 'Return Requested';
      case 'OwnerConfirmedReturn':
        return 'Return Confirmed';
      case 'ActualUsageSet':
        return 'Actual Usage Set';
      case 'DamageReported':
        return 'Damage Reported';
      case 'DamageAssessed':
        return 'Damage Assessed';
      case 'FundsTransferred':
        return 'Funds Transferred';
      default:
        return eventType;
    }
  };

  const getEventDescription = (event: TransactionEvent) => {
    switch (event.type) {
      case 'RentalStarted':
        return `Rental started by ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)} with deposit of ${event.data?.[1]?.toString()} ETH`;
      case 'RentalCancelled':
        return `Rental cancelled by ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)}`;
      case 'RenterRequestedReturn':
        return `Return requested by ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)}`;
      case 'OwnerConfirmedReturn':
        return `Return confirmed by owner ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)}`;
      case 'ActualUsageSet':
        return `Actual usage set to ${event.data?.[0]?.toString()} days`;
      case 'DamageReported':
        return `Damage reported by ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)}`;
      case 'DamageAssessed':
        return `Damage assessed at ${event.data?.[1]?.toString()} ETH by ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)}`;
      case 'FundsTransferred':
        return `${event.data?.[1]?.toString()} ETH transferred to ${event.data?.[0]?.slice(0, 6)}...${event.data?.[0]?.slice(-4)}`;
      default:
        return 'Transaction processed';
    }
  };

  const getEventColor = (eventType: TransactionEvent['type']) => {
    switch (eventType) {
      case 'RentalStarted':
      case 'OwnerConfirmedReturn':
      case 'FundsTransferred':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'RentalCancelled':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'RenterRequestedReturn':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'ActualUsageSet':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
      case 'DamageReported':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'DamageAssessed':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const filteredTransactions = transactionHistory.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const eventTypes = [...new Set(transactionHistory.map(tx => tx.type))];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="luxury-container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="luxury-heading mb-6">Transaction History</h1>
            <p className="luxury-subheading mb-8">
              View all your rental contract transactions
            </p>
            <button
              onClick={connectWallet}
              className="aurora-button"
            >
              Connect Wallet to View Transactions
            </button>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="luxury-heading mb-2">Transaction History</h1>
              <p className="luxury-subheading">
                Complete history of all rental contract events
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="luxury-input pr-8 text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Events</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {getEventTitle(type)}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="luxury-button px-4 py-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="luxury-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {filteredTransactions.length} {filter === 'all' ? 'Total' : getEventTitle(filter as any)} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </span>
            </div>
            {transactionHistory.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Latest: {transactionHistory[0]?.timestamp.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="luxury-card p-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'No rental transactions have been recorded yet.' 
                  : `No ${getEventTitle(filter as any).toLowerCase()} transactions found.`
                }
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div
                key={`${transaction.transactionHash}-${index}`}
                className={`luxury-card p-6 ${getEventColor(transaction.type)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getEventIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {getEventTitle(transaction.type)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getEventDescription(transaction)}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span>Block #{transaction.blockNumber}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <a
                          href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          View on Explorer
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    
                    {/* Transaction Hash */}
                    <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Transaction Hash:</span>
                        <span className="font-mono text-foreground break-all">
                          {transaction.transactionHash}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Section */}
        {transactionHistory.length > 0 && (
          <div className="luxury-card p-6 mt-8 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <Activity className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-2">About Transaction History</p>
                <ul className="space-y-1 text-xs">
                  <li>• All events are recorded on the blockchain and cannot be modified</li>
                  <li>• Transaction hashes can be verified on blockchain explorers</li>
                  <li>• Events are automatically captured when contract functions are called</li>
                  <li>• History includes all events related to the rental contract</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

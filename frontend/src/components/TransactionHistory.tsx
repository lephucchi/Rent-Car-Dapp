import React, { useEffect } from 'react';
import { History, Clock, ExternalLink, RefreshCw, CheckCircle, XCircle, AlertTriangle, DollarSign, Car } from 'lucide-react';
import { useContractStore, useTransactionHistory, useIsConnected } from '../stores/contractStore';
import { contractService } from '../services/contractService';

export const TransactionHistory: React.FC = () => {
  const { refreshTransactionHistory } = useContractStore();
  const transactionHistory = useTransactionHistory();
  const isConnected = useIsConnected();

  useEffect(() => {
    if (isConnected) {
      refreshTransactionHistory();
    }
  }, [isConnected, refreshTransactionHistory]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'RentalStarted':
        return <Car className="w-5 h-5 text-green-500" />;
      case 'RentalCancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RenterRequestedReturn':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'OwnerConfirmedReturn':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ActualUsageSet':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'DamageReported':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'FundsTransferred':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEventTitle = (eventType: string) => {
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
      case 'FundsTransferred':
        return 'Funds Transferred';
      default:
        return eventType;
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.type) {
      case 'RentalStarted':
        return `Rental started by ${event.data[0]?.slice(0, 6)}...${event.data[0]?.slice(-4)} with deposit of ${contractService.formatEther(event.data[1] || 0)} ETH`;
      case 'RentalCancelled':
        return `Rental cancelled by ${event.data[0]?.slice(0, 6)}...${event.data[0]?.slice(-4)}`;
      case 'RenterRequestedReturn':
        return `Return requested by ${event.data[0]?.slice(0, 6)}...${event.data[0]?.slice(-4)}`;
      case 'OwnerConfirmedReturn':
        return `Return confirmed by owner ${event.data[0]?.slice(0, 6)}...${event.data[0]?.slice(-4)}`;
      case 'ActualUsageSet':
        return `Actual usage set to ${event.data[0]?.toString()} minutes`;
      case 'DamageReported':
        return `Damage reported by ${event.data[0]?.slice(0, 6)}...${event.data[0]?.slice(-4)}`;
      case 'FundsTransferred':
        return `${contractService.formatEther(event.data[1] || 0)} ETH transferred to ${event.data[0]?.slice(0, 6)}...${event.data[0]?.slice(-4)}`;
      default:
        return 'Transaction processed';
    }
  };

  const getEventColor = (eventType: string) => {
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
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="luxury-card p-8 text-center">
        <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Transaction History</h2>
        <p className="text-muted-foreground">
          Connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="luxury-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Transaction History</h2>
          </div>
          <button
            onClick={refreshTransactionHistory}
            className="luxury-button-outline px-4 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <p className="text-muted-foreground mt-2">
          Complete history of all rental contract events ({transactionHistory.length} transactions)
        </p>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {transactionHistory.length === 0 ? (
          <div className="luxury-card p-12 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Transactions Found</h3>
            <p className="text-muted-foreground">
              No rental transactions have been recorded yet.
            </p>
          </div>
        ) : (
          transactionHistory.map((transaction, index) => (
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
        <div className="luxury-card p-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
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
  );
};
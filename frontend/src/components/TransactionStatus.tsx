import React from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, Clock, X } from 'lucide-react';

interface TransactionStatusProps {
  transactionHash?: string;
  status: 'pending' | 'success' | 'error' | 'loading';
  error?: string;
  onClose?: () => void;
  networkName?: string;
  title?: string;
  description?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  transactionHash,
  status,
  error,
  onClose,
  networkName = 'sepolia',
  title,
  description
}) => {
  const getEtherscanUrl = (hash: string) => {
    const baseUrls: Record<string, string> = {
      mainnet: 'https://etherscan.io',
      sepolia: 'https://sepolia.etherscan.io',
      goerli: 'https://goerli.etherscan.io',
      polygon: 'https://polygonscan.com',
      mumbai: 'https://mumbai.polygonscan.com',
    };
    
    const baseUrl = baseUrls[networkName] || baseUrls.sepolia;
    return `${baseUrl}/tx/${hash}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
      case 'pending':
        return 'notification-warning';
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      default:
        return 'notification-info';
    }
  };

  const getStatusTitle = () => {
    if (title) return title;
    
    switch (status) {
      case 'loading':
        return 'Processing Transaction';
      case 'pending':
        return 'Transaction Pending';
      case 'success':
        return 'Transaction Successful';
      case 'error':
        return 'Transaction Failed';
      default:
        return 'Transaction Status';
    }
  };

  const getStatusDescription = () => {
    if (description) return description;
    
    switch (status) {
      case 'loading':
        return 'Please wait while your transaction is being processed...';
      case 'pending':
        return 'Your transaction has been submitted and is waiting for confirmation';
      case 'success':
        return 'Your transaction has been confirmed on the blockchain';
      case 'error':
        return error || 'An error occurred while processing your transaction';
      default:
        return '';
    }
  };

  const formatTransactionHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div className={`${getStatusColor()} rounded-xl fade-in relative`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground">
              {getStatusTitle()}
            </h3>
            {status === 'loading' && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {getStatusDescription()}
          </p>

          {transactionHash && (
            <div className="space-y-3">
              <div className="bg-background/60 rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                    <div className="font-mono text-sm text-foreground">
                      {formatTransactionHash(transactionHash)}
                    </div>
                  </div>
                  <a
                    href={getEtherscanUrl(transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 ml-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
                  >
                    View on Etherscan
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              {status === 'pending' && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Usually takes 15-30 seconds on {networkName}</span>
                </div>
              )}
            </div>
          )}

          {status === 'error' && !transactionHash && (
            <div className="bg-red-50/80 dark:bg-red-900/20 rounded-lg p-3 border border-red-200/50 dark:border-red-700/50">
              <div className="text-sm text-red-700 dark:text-red-400">
                {error || 'Transaction failed. Please try again.'}
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Transaction confirmed and recorded on blockchain</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;

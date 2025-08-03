import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3Store, useWalletConnection } from '../stores/unifiedWeb3Store';

interface Web3ContextType {
  // Connection status
  isConnected: boolean;
  isInitialized: boolean;
  
  // Auto-connection on page load
  autoConnect: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, connectWallet } = useWalletConnection();
  const { setError, isInitialized } = useWeb3Store();
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);

  // Auto-connect on page load if previously connected
  const autoConnect = async () => {
    if (hasAttemptedAutoConnect) return;
    
    setHasAttemptedAutoConnect(true);
    
    try {
      // Check if MetaMask is available and has connected accounts
      if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          await connectWallet();
        }
      }
    } catch (error) {
      console.log('Auto-connect failed:', error);
      // Don't show error for auto-connect failures
    }
  };

  // Clear error handler
  const clearError = () => {
    setError(null);
  };

  // Auto-connect on mount
  useEffect(() => {
    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          useWeb3Store.getState().disconnectWallet();
        } else if (isConnected) {
          // Account changed, reconnect
          connectWallet().catch(console.error);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isConnected, connectWallet]);

  const contextValue: Web3ContextType = {
    isConnected,
    isInitialized,
    autoConnect,
    clearError
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
};

import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWeb3Store } from '../stores/web3Store';

export const WalletConnection: React.FC = () => {
  const { user, connectMetamask } = useAuthStore();
  const { 
    isConnected, 
    address, 
    balance, 
    network, 
    isMetaMaskInstalled, 
    connectWallet, 
    disconnectWallet,
    isLoading,
    error 
  } = useWeb3Store();

  const handleConnectWallet = async () => {
    if (!user) {
      alert('Please login first before connecting your wallet');
      return;
    }

    try {
      await connectWallet();
      
      // If wallet connected successfully and user doesn't have metamask ID, save it
      if (!user.metamaskId && address) {
        await connectMetamask(address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p className="font-medium">MetaMask Not Found</p>
        <p className="text-sm">
          Please install MetaMask to connect your wallet.{' '}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Download MetaMask
          </a>
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <button
          onClick={handleConnectWallet}
          disabled={isLoading || !user}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        
        {!user && (
          <p className="text-sm text-gray-600 text-center">
            Please login to your account first
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p className="font-medium">Wallet Connected</p>
        <div className="text-sm space-y-1 mt-2">
          <p><span className="font-medium">Address:</span> {address}</p>
          <p><span className="font-medium">Balance:</span> {balance} ETH</p>
          <p><span className="font-medium">Network:</span> {network}</p>
        </div>
      </div>

      <button
        onClick={disconnectWallet}
        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Disconnect Wallet
      </button>
    </div>
  );
};

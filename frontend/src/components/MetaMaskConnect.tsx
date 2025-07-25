import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { checkMetaMaskStatus, getMetaMaskErrorMessage } from '../lib/metamaskDetection';

interface MetaMaskConnectProps {
  onConnect: () => Promise<void>;
  connecting: boolean;
  error: string | null;
  requiredAddress?: string;
  className?: string;
}

export const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({
  onConnect,
  connecting,
  error,
  requiredAddress,
  className = ''
}) => {
  const [metaMaskStatus, setMetaMaskStatus] = useState(checkMetaMaskStatus());

  useEffect(() => {
    // Check MetaMask status periodically
    const interval = setInterval(() => {
      setMetaMaskStatus(checkMetaMaskStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/', '_blank');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`glass rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text mb-4">
          Connect to MetaMask
        </h2>

        {/* MetaMask Status */}
        <div className="mb-6">
          {metaMaskStatus.isAvailable ? (
            <div className="flex items-center justify-center text-green-400 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              MetaMask detected and ready
            </div>
          ) : (
            <div className="flex items-center justify-center text-red-400 mb-4">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
              MetaMask not available
            </div>
          )}
        </div>

        {/* Required Address Info */}
        {requiredAddress && (
          <div className="glass-hover rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Required Account
            </h3>
            <p className="text-muted-foreground text-sm mb-2">
              Only the following account can access this page:
            </p>
            <p className="text-neon-cyan font-mono text-sm break-all">
              {requiredAddress}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* MetaMask Status Error */}
        {!metaMaskStatus.isAvailable && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              {getMetaMaskErrorMessage(metaMaskStatus)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {metaMaskStatus.isAvailable ? (
            <Button
              onClick={onConnect}
              disabled={connecting}
              className="w-full neon-glow-purple"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : metaMaskStatus.isInstalled ? (
            <Button
              onClick={handleRefresh}
              className="w-full neon-glow-cyan"
            >
              Refresh Page
            </Button>
          ) : (
            <Button
              onClick={handleInstallMetaMask}
              className="w-full neon-glow-purple"
            >
              Install MetaMask
            </Button>
          )}

          {metaMaskStatus.isInstalled && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-muted-foreground">
          <p>
            Having trouble? Try refreshing the page or restarting your browser.
          </p>
          {!metaMaskStatus.isInstalled && (
            <p className="mt-2">
              MetaMask is a browser extension that allows you to interact with blockchain applications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

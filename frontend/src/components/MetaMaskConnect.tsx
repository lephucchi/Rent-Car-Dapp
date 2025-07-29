import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { MetaMaskDiagnostic } from './MetaMaskDiagnostic';
import { checkMetaMaskStatus, getMetaMaskErrorMessage } from '../lib/metamaskDetection';
import { Wallet, ExternalLink, CheckCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';

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
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    // Check MetaMask status periodically
    const interval = setInterval(() => {
      const newStatus = checkMetaMaskStatus();
      setMetaMaskStatus(newStatus);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleConnect = async () => {
    try {
      setConnectionAttempts(prev => prev + 1);
      await onConnect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const getStatusIcon = () => {
    if (metaMaskStatus.isAvailable) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (metaMaskStatus.isInstalled) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <Download className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    if (metaMaskStatus.isAvailable) {
      return "MetaMask is ready to connect";
    } else if (metaMaskStatus.isInstalled) {
      return "MetaMask detected but not available";
    } else {
      return "MetaMask not installed";
    }
  };

  const getStatusColor = () => {
    if (metaMaskStatus.isAvailable) return "text-green-600 dark:text-green-400";
    if (metaMaskStatus.isInstalled) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className={`luxury-glass-intense rounded-2xl p-8 fade-in ${className}`}>
      <div className="text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 aurora-gradient rounded-2xl flex items-center justify-center float-animation">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text-aurora mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Secure blockchain transactions with MetaMask
          </p>
        </div>

        {/* MetaMask Status */}
        <div className="mb-8">
          <div className={`notification-${metaMaskStatus.isAvailable ? 'success' : metaMaskStatus.isInstalled ? 'warning' : 'error'} rounded-xl`}>
            <div className="flex items-center justify-center space-x-3">
              {getStatusIcon()}
              <div className="text-left">
                <div className={`font-medium ${getStatusColor()}`}>
                  {getStatusMessage()}
                </div>
                {!metaMaskStatus.isAvailable && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {getMetaMaskErrorMessage(metaMaskStatus)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Required Address Info */}
        {requiredAddress && (
          <div className="notification-info rounded-xl mb-8">
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2 flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                Required Wallet Address
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Only the following account can access this resource:
              </p>
              <div className="bg-background/50 rounded-lg p-3 font-mono text-sm break-all border">
                {requiredAddress}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="notification-error rounded-xl mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-red-700 dark:text-red-400 mb-1">
                  Connection Failed
                </div>
                <div className="text-sm text-red-600 dark:text-red-500">
                  {error}
                </div>
                {connectionAttempts > 2 && (
                  <div className="text-xs text-red-500 mt-2">
                    Multiple failed attempts. Try refreshing the page or restarting MetaMask.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {metaMaskStatus.isAvailable ? (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="ferrari-button w-full disabled:opacity-50 relative overflow-hidden"
            >
              <div className="flex items-center justify-center">
                {connecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting to MetaMask...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect MetaMask Wallet
                  </>
                )}
              </div>
            </button>
          ) : metaMaskStatus.isInstalled ? (
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="luxury-button w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </button>
              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="luxury-button-outline w-full"
              >
                {showDiagnostic ? 'Hide' : 'Show'} Diagnostic
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleInstallMetaMask}
                className="ferrari-button w-full"
              >
                <Download className="w-5 h-5 mr-2" />
                Install MetaMask
              </button>
              <div className="text-xs text-muted-foreground">
                <p className="mb-2">
                  MetaMask is a secure wallet for Ethereum and Web3 applications.
                </p>
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Learn more about MetaMask
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          )}

          {/* Secondary Actions */}
          {metaMaskStatus.isInstalled && (
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="luxury-button-outline flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="luxury-button-outline flex-1"
              >
                Diagnostic
              </button>
            </div>
          )}
        </div>

        {/* Diagnostic Tool */}
        {showDiagnostic && (
          <div className="mt-8 slide-up">
            <MetaMaskDiagnostic />
          </div>
        )}

        {/* Connection Steps */}
        <div className="mt-8 notification-info rounded-xl">
          <div className="text-left">
            <h4 className="font-medium mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
              How to Connect
            </h4>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium mr-3 mt-0.5 flex items-center justify-center">1</span>
                {!metaMaskStatus.isInstalled ? 'Install MetaMask browser extension' : 'Ensure MetaMask is unlocked'}
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium mr-3 mt-0.5 flex items-center justify-center">2</span>
                {!metaMaskStatus.isInstalled ? 'Create or import your wallet' : 'Click "Connect MetaMask Wallet"'}
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium mr-3 mt-0.5 flex items-center justify-center">3</span>
                {!metaMaskStatus.isInstalled ? 'Return here and connect' : 'Approve the connection request'}
              </li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting */}
        {connectionAttempts > 1 && (
          <div className="mt-6 notification-warning rounded-xl">
            <div className="text-left">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                Having trouble connecting?
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Make sure MetaMask is unlocked</li>
                <li>• Try refreshing the page</li>
                <li>• Check if MetaMask is on the correct network</li>
                <li>• Disable other wallet extensions temporarily</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

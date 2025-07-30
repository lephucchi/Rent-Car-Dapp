import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useConnectionState } from '../stores/globalWeb3Store';

export const GlobalErrorDisplay: React.FC = () => {
  const { error, setError } = useConnectionState();

  if (!error) return null;

  const isMetaMaskError = error.includes('MetaMask is not installed');

  return (
    <div className={`fixed top-4 right-4 max-w-md z-50 ${
      isMetaMaskError ? 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' 
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
    } border rounded-lg p-4 shadow-lg`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">
            {isMetaMaskError ? 'MetaMask Required' : 'Connection Error'}
          </p>
          <p className="text-sm">{error}</p>
          {isMetaMaskError && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm underline hover:no-underline"
            >
              Download MetaMask
            </a>
          )}
        </div>
        <button
          onClick={() => setError(null)}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

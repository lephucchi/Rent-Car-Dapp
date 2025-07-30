import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useConnectionState } from '../stores/globalWeb3Store';

export const GlobalErrorDisplay: React.FC = () => {
  const { error, setError } = useConnectionState();

  if (!error) return null;

  const isMetaMaskError = error.includes('MetaMask is not installed');

  return (
    <div className={`fixed top-20 right-4 max-w-md z-50 border rounded-xl p-4 shadow-xl aurora-glass ${
      isMetaMaskError
        ? 'border-secondary/30 bg-secondary/10'
        : 'border-destructive/30 bg-destructive/10'
    }`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          isMetaMaskError ? 'text-secondary' : 'text-destructive'
        }`} />
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-foreground">
            {isMetaMaskError ? 'MetaMask Required' : 'Connection Error'}
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          {isMetaMaskError && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-secondary hover:text-secondary/80 underline hover:no-underline transition-colors"
            >
              Download MetaMask
            </a>
          )}
        </div>
        <button
          onClick={() => setError(null)}
          className="flex-shrink-0 p-1 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

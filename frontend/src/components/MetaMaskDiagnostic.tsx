import React, { useState, useEffect } from 'react';
import { checkMetaMaskStatus } from '../lib/metamaskDetection';
import { Button } from './Button';

export const MetaMaskDiagnostic: React.FC = () => {
  const [status, setStatus] = useState(checkMetaMaskStatus());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(checkMetaMaskStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const runDiagnostic = () => {
    setExpanded(true);
    setStatus(checkMetaMaskStatus());
  };

  return (
    <div className="glass rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            status.isAvailable ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium text-foreground">
            MetaMask Status: {status.isAvailable ? 'Ready' : 'Not Available'}
          </span>
        </div>
        <Button 
          onClick={runDiagnostic}
          variant="outline"
          size="sm"
        >
          Diagnostic
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <h4 className="text-sm font-semibold text-foreground mb-3">MetaMask Diagnostic Results</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Browser Environment:</span>
              <span className={typeof window !== "undefined" ? "text-green-400" : "text-red-400"}>
                {typeof window !== "undefined" ? "✓ Available" : "✗ Not Available"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ethereum Object:</span>
              <span className={window.ethereum ? "text-green-400" : "text-red-400"}>
                {window.ethereum ? "✓ Present" : "✗ Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MetaMask Detection:</span>
              <span className={window.ethereum?.isMetaMask ? "text-green-400" : "text-red-400"}>
                {window.ethereum?.isMetaMask ? "✓ Detected" : "✗ Not Detected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Request Method:</span>
              <span className={window.ethereum?.request ? "text-green-400" : "text-red-400"}>
                {window.ethereum?.request ? "✓ Available" : "✗ Not Available"}
              </span>
            </div>
          </div>
          
          {status.error && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
              <strong>Error:</strong> {status.error}
            </div>
          )}
          
          {status.suggestion && (
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
              <strong>Suggestion:</strong> {status.suggestion}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={() => window.open('https://metamask.io/', '_blank')}
              variant="outline"
              size="sm"
            >
              Get MetaMask
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

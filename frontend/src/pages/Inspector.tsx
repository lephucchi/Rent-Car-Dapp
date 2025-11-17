import { useState } from 'react';
import { Eye, AlertTriangle } from 'lucide-react';
import { useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';

export default function Inspector() {
  const { isConnected } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [selectedTab, setSelectedTab] = useState<'inspection' | 'history'>('inspection');

  const isInspector = globalUserRole === 'inspector';

  // Redirect non-inspector users
  if (isConnected && !isInspector) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            This panel is only accessible to Damage Inspectors.
          </p>
          <a href="/" className="luxury-button">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your inspector wallet to access the inspection panel.
          </p>
          <a href="/" className="luxury-button">
            Go Back and Connect
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'inspection', label: 'Pending Inspections' },
    { id: 'history', label: 'Inspection History' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2">Damage Inspector Panel</h1>
          <p className="text-muted-foreground">
            Review and assess damage on returned vehicles
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted/30 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Pending Inspections Tab */}
        {selectedTab === 'inspection' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Pending Inspections (0)</h2>
            </div>

            <div className="luxury-card p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Inspections</h3>
              <p className="text-muted-foreground">
                Check back when cars are returned and need damage assessment.
              </p>
            </div>
          </div>
        )}

        {/* Inspection History Tab */}
        {selectedTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Inspection History</h2>
            </div>

            <div className="luxury-card p-12 text-center">
              <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Inspection History</h3>
              <p className="text-muted-foreground">
                Your inspection history will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { RentalContractDashboard } from './components/RentalContractDashboard';
import { ContractDeployment } from './components/ContractDeployment';
import './global.css';

type AuthMode = 'login' | 'register';

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showAuth, setShowAuth] = useState(true);
  
  const { isAuthenticated, user, logout, loadProfile } = useAuthStore();

  console.log('App: Current state:', { 
    isAuthenticated, 
    showAuth, 
    authMode, 
    userDisplayName: user?.display_name 
  });

  useEffect(() => {
    // Try to load user profile on app start
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    // Show/hide auth modal based on authentication status
    if (isAuthenticated) {
      setShowAuth(false);
    } else {
      setShowAuth(true);
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleLogout = () => {
    logout();
    setShowAuth(true);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-border/20">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold gradient-text">
              Web3 Car Rental DApp
            </h1>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.display_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1 rounded focus-ring"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-responsive py-8">
        {showAuth ? (
          /* Authentication Modal */
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="glass rounded-lg p-8 w-full max-w-md mx-4 neon-glow">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  Web3 Car Rental
                </h2>
                <p className="text-muted-foreground text-sm">
                  Secure, decentralized car rentals on the blockchain
                </p>
              </div>
              
              {authMode === 'login' ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => setAuthMode('register')}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setAuthMode('login')}
                />
              )}
            </div>
          </div>
        ) : (
          /* Main Application */
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold gradient-text mb-4">
                Smart Contract Car Rental
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the future of car rentals with our blockchain-powered platform. 
                Secure deposits, transparent pricing, and decentralized ownership verification.
              </p>
            </div>

            {/* User Information Card */}
            {user && (
              <div className="glass rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">User Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="text-foreground font-medium">{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground font-medium">{user.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Display Name:</span>
                      <span className="text-foreground font-medium">{user.display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="text-foreground font-medium capitalize">{user.role}</span>
                    </div>
                    {user.metamask_address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wallet:</span>
                        <span className="text-foreground font-mono text-xs">
                          {user.metamask_address.slice(0, 6)}...{user.metamask_address.slice(-4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rental Contract Dashboard */}
            <RentalContractDashboard />

            {/* Contract Deployment Helper */}
            <ContractDeployment />

            {/* Footer Information */}
            <div className="glass rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-neon-cyan font-bold text-lg">1</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Connect Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect your MetaMask wallet to interact with the smart contract
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-neon-purple font-bold text-lg">2</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Rent or Lend</h4>
                  <p className="text-sm text-muted-foreground">
                    Rent a car by paying the deposit, or manage your rental as the owner
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-neon-pink font-bold text-lg">3</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Complete Safely</h4>
                  <p className="text-sm text-muted-foreground">
                    Return process with confirmation from both parties and automatic payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

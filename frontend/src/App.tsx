import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useWeb3Store } from './stores/web3Store';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { WalletConnection } from './components/WalletConnection';
import { ContractDisplay } from './components/ContractDisplay';
import './global.css';

type AuthMode = 'login' | 'register';

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showAuth, setShowAuth] = useState(true);
  
  const { isAuthenticated, user, logout, loadProfile } = useAuthStore();
  const { contractAddress } = useWeb3Store();

  useEffect(() => {
    // Try to load user profile on app start
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    // Hide auth modal when user is authenticated
    if (isAuthenticated) {
      setShowAuth(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Car Rental DApp
            </h1>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.display_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showAuth ? (
          /* Authentication Modal */
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar - User Info & Wallet */}
              <div className="lg:col-span-1 space-y-6">
                {/* User Information */}
                {user && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        User Information
                      </h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <p><span className="font-medium">Username:</span> {user.username}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Display Name:</span> {user.display_name}</p>
                        <p><span className="font-medium">Role:</span> {user.role}</p>
                        {user.metamask_address && (
                          <p><span className="font-medium">Wallet:</span> {user.metamask_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Wallet Connection */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Wallet Connection
                    </h3>
                    <WalletConnection />
                  </div>
                </div>

                {/* Contract Address Info */}
                {contractAddress && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Contract Address
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 break-all">
                        {contractAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content - Contract Display */}
              <div className="lg:col-span-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                      Car Rental Contract
                    </h3>
                    
                    {contractAddress ? (
                      <ContractDisplay contractAddress={contractAddress} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          No contract deployed yet. Please deploy a contract first.
                        </p>
                      </div>
                    )}
                  </div>
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
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  Home,
  Wallet,
  Sun,
  Moon,
  Menu,
  X,
  PlusCircle,
  History,
  LogOut,
  User,
  LogIn
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWalletConnection, useUserRole as useGlobalUserRole, useGlobalWeb3Store } from '../stores/globalWeb3Store';
import { useAuthStore } from '../stores/authStore';
import { isMetaMaskInstalled as checkMetaMaskInstalled } from '../utils/metamaskUtils';
import { authService } from '../services/authService';

export const LuxuryNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isLightMode } = useTheme();
  const { isConnected, address, connectWallet, disconnectWallet } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectiveRole = globalUserRole === 'admin' ? 'admin' :
    globalUserRole === 'inspector' ? 'inspector' : 'user';

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      
      console.log('🔍 Debug - isAuthenticated:', isAuthenticated);
      console.log('🔍 Debug - user:', user);
      
      // Wait a bit for store to update with address
      setTimeout(async () => {
        // Get fresh address from store
        const currentAddress = useGlobalWeb3Store.getState().address;
        console.log('🔍 Debug - currentAddress:', currentAddress);
        console.log('🔍 Debug - user.wallet_address:', user?.wallet_address);
        
        // Auto-link wallet to user account if authenticated and wallet not linked
        if (isAuthenticated && currentAddress && (!user?.wallet_address || user.wallet_address !== currentAddress.toLowerCase())) {
          try {
            console.log('Attempting to link wallet:', currentAddress);
            const response = await authService.linkWallet(currentAddress);
            if (response.success) {
              console.log('✅ Wallet linked successfully');
              // Refresh user data
              window.location.reload();
            } else {
              console.error('❌ Failed to link wallet:', response.message);
            }
          } catch (linkError) {
            console.error('❌ Failed to link wallet:', linkError);
          }
        } else {
          console.log('⚠️ Skipped wallet linking - isAuth:', isAuthenticated, 'hasAddress:', !!currentAddress, 'alreadyLinked:', user?.wallet_address === currentAddress?.toLowerCase());
        }
      }, 500);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const isMetaMaskInstalled = checkMetaMaskInstalled();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 ferrari-gradient rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-aurora hidden sm:inline">CarDapp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-4 h-4 inline mr-1" />
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/rent"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/rent') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Car className="w-4 h-4 inline mr-1" />
                  Rent Car
                </Link>

                <Link
                  to="/lend"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/lend') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 inline mr-1" />
                  Lend Car
                </Link>

                <Link
                  to="/my-rentals"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-rentals') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Car className="w-4 h-4 inline mr-1" />
                  My Rentals
                </Link>

                <Link
                  to="/my-contracts"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-contracts') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 inline mr-1" />
                  My Contracts
                </Link>

                {effectiveRole === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Admin
                  </Link>
                )}

                {effectiveRole === 'inspector' && (
                  <Link
                    to="/inspector"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/inspector') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Inspector
                  </Link>
                )}

                <Link
                  to="/transactions"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/transactions') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <History className="w-4 h-4 inline mr-1" />
                  Transactions
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Toggle theme"
            >
              {isLightMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Auth Buttons / User Profile */}
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Login
              </Link>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm">
                  <div className="font-semibold text-foreground">
                    {user.full_name || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ) : null}

            {/* Wallet Connection */}
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={!isMetaMaskInstalled}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMetaMaskInstalled
                    ? 'aurora-button'
                    : 'opacity-50 cursor-not-allowed aurora-button'
                }`}
              >
                <Wallet className="w-4 h-4 inline mr-2" />
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm">
                  <div className="font-mono text-xs text-muted-foreground">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <div className="text-xs text-green-600">
                    Connected
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Disconnect wallet"
                >
                  <Wallet className="w-5 h-5 text-orange-600" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link
              to="/"
              className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/rent"
                  className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rent Car
                </Link>

                <Link
                  to="/lend"
                  className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lend Car
                </Link>

                <Link
                  to="/my-rentals"
                  className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Rentals
                </Link>

                <Link
                  to="/my-contracts"
                  className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Contracts
                </Link>

                {effectiveRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {effectiveRole === 'inspector' && (
                  <Link
                    to="/inspector"
                    className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inspector
                  </Link>
                )}

                <Link
                  to="/transactions"
                  className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

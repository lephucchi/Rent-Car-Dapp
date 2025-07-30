import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Eye,
  EyeOff,
  Palette,
  Snowflake
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole, useConnectionState } from '../stores/globalWeb3Store';
import { isMetaMaskInstalled as checkMetaMaskInstalled } from '../utils/metamaskUtils';

export const LuxuryNavigation: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme, isLightMode, isDarkMode } = useTheme();
  const {
    isPreviewMode,
    simulatedRole,
    setShowPreviewPanel,
    exitPreviewMode
  } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const { isLoading, error } = useConnectionState();
  const globalUserRole = useGlobalUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine effective role (preview role when in preview mode, otherwise actual role)
  const effectiveRole = isPreviewMode ? simulatedRole :
    (globalUserRole === 'admin' ? 'admin' :
     globalUserRole === 'inspector' ? 'inspector' : 'user');

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Error is already handled in the store, just log it here
    }
  };

  const handlePreviewClick = () => {
    if (isPreviewMode) {
      exitPreviewMode();
    } else {
      setShowPreviewPanel(true);
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = checkMetaMaskInstalled();

  // Navigation items - NO Admin/Inspector links as per specification
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/rent', label: 'Rent Car', icon: Car },
    { href: '/lend', label: 'Lend Car', icon: PlusCircle },
    { href: '/transactions', label: 'Transactions', icon: History },
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="sticky top-0 z-50 aurora-glass border-b border-border/50">
      <div className="luxury-container">
        <div className="flex justify-between items-center h-16">
          {/* Aurora Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 aurora-gradient rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 relative overflow-hidden">
              <Car className="w-6 h-6 text-white relative z-10" />
              <Snowflake className="w-4 h-4 text-white/30 absolute top-1 right-1" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Aurora<span className="text-primary">Rent</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`nav-link ${isActive ? 'active' : ''} flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Aurora Controls - Theme Toggle + Preview Mode */}
          <div className="flex items-center space-x-4">
            {/* Aurora Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200"
              aria-label="Toggle Aurora theme"
              title={isLightMode ? 'Switch to Dark Aurora' : 'Switch to Light Aurora'}
            >
              {isLightMode ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
              <Palette className="w-4 h-4 text-primary" />
            </button>

            {/* Enhanced Preview Mode */}
            <button
              onClick={handlePreviewClick}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isPreviewMode
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-accent border border-transparent'
              }`}
              title={isPreviewMode ? 'Exit Preview Mode' : 'Enter Preview Mode'}
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit Preview</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </>
              )}
            </button>

            {/* Connection Status & Wallet */}
            {isConnected ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-sm">
                  <div className="text-foreground font-medium">
                    {effectiveRole === 'admin' ? 'Admin' : effectiveRole === 'inspector' ? 'Inspector' : 'User'}
                    {isPreviewMode && <span className="text-blue-600 ml-1">(Preview)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <>
                {!isMetaMaskInstalled ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-button text-sm"
                    title="Install MetaMask to connect your wallet"
                  >
                    Install MetaMask
                  </a>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isLoading}
                    className="luxury-button disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`nav-link ${isActive ? 'active' : ''} flex items-center space-x-3 w-full`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Preview Mode Toggle */}
            <button
              onClick={handlePreviewClick}
              className={`nav-link flex items-center space-x-3 w-full ${
                isPreviewMode ? 'bg-primary/20 text-primary' : ''
              }`}
            >
              {isPreviewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{isPreviewMode ? 'Exit Preview' : 'Preview Mode'}</span>
            </button>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="nav-link flex items-center space-x-3 w-full"
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{isLightMode ? 'Dark Aurora' : 'Light Aurora'}</span>
              <Palette className="w-4 h-4 text-primary ml-auto" />
            </button>

            {/* Mobile connection status */}
            {isConnected ? (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm">
                  <div className="text-foreground font-medium">
                    {effectiveRole === 'admin' ? 'Admin' : effectiveRole === 'inspector' ? 'Inspector' : 'User'}
                    {isPreviewMode && <span className="text-blue-600 ml-1">(Preview)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <>
                {!isMetaMaskInstalled ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-button w-full mt-4"
                  >
                    Install MetaMask
                  </a>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isLoading}
                    className="luxury-button w-full mt-4 disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Aurora Preview Mode Indicator */}
      {isPreviewMode && (
        <button
          onClick={exitPreviewMode}
          className="bg-primary/20 border-b border-primary/30 text-primary px-4 py-2 text-center text-sm hover:bg-primary/30 transition-colors w-full"
        >
          <Eye className="w-4 h-4 inline mr-2" />
          <strong>Preview Mode Active</strong> - {effectiveRole === 'admin' ? 'Admin/Owner' : effectiveRole === 'inspector' ? 'Inspector' : 'User'} role | Click to exit
        </button>
      )}
    </nav>
  );
};

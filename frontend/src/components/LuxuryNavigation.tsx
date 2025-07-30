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
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole, useConnectionState } from '../stores/globalWeb3Store';

export const LuxuryNavigation: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isPreviewMode, simulatedRole, setSimulatedRole, togglePreviewMode } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const { isLoading, error } = useConnectionState();
  const globalUserRole = useGlobalUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Determine effective role (preview role when in preview mode, otherwise actual role)
  const effectiveRole = isPreviewMode ? simulatedRole :
    (globalUserRole === 'admin' ? 'admin' :
     globalUserRole === 'inspector' ? 'inspector' : 'user');

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

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
    <nav className="sticky top-0 z-50 luxury-glass border-b border-border/50">
      <div className="luxury-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 ferrari-gradient rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Luxe<span className="text-primary">Rent</span>
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

          {/* Right side controls - Connect Wallet + Preview Mode Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Preview Mode Toggle */}
            <div className="relative">
              <button
                onClick={togglePreviewMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isPreviewMode
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'hover:bg-accent'
                }`}
                title={isPreviewMode ? 'Exit Preview Mode' : 'Enter Preview Mode'}
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </button>

              {/* Role Selection Dropdown for Preview Mode */}
              {isPreviewMode && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">Simulate Role:</div>
                    {['user', 'admin', 'inspector'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setSimulatedRole(role as any)}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                          simulatedRole === role
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        {role === 'admin' ? 'Admin/Owner' : role === 'inspector' ? 'Inspector' : 'User'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="luxury-button disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
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
              onClick={() => setPreviewMode(!previewMode)}
              className={`nav-link flex items-center space-x-3 w-full ${
                previewMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''
              }`}
            >
              {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{previewMode ? 'Exit Preview' : 'Preview Mode'}</span>
            </button>

            {/* Mobile connection status */}
            {isConnected ? (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm">
                  <div className="text-foreground font-medium capitalize">
                    {userRole === 'lessor' ? 'Admin' : userRole === 'inspector' ? 'Inspector' : 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connected
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={connecting}
                className="luxury-button w-full mt-4 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Global Preview Mode Indicator */}
      {previewMode && (
        <div className="bg-blue-100 border-b border-blue-300 text-blue-800 px-4 py-2 text-center text-sm">
          🔍 <strong>Preview Mode Active</strong> - Viewing demo UI without blockchain interaction
        </div>
      )}
    </nav>
  );
};

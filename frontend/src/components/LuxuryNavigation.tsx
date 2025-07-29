import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Car, 
  Home, 
  BarChart3, 
  User, 
  Wallet, 
  ClipboardCheck, 
  Shield, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  CreditCard,
  PlusCircle,
  History
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useRentalContractStore, useUserRole, useIsConnected } from '../stores/rentalContractStore';
import { rentalContractService } from '../services/rentalContractService';

export const LuxuryNavigation: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const userRole = useUserRole();
  const isConnected = useIsConnected();
  const { connectWallet } = useRentalContractStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home, roles: ['all'] },
    { href: '/rent', label: 'Rent Car', icon: Car, roles: ['all'] },
    { href: '/lend', label: 'Lend Car', icon: PlusCircle, roles: ['lessor', 'other'] },
    { href: '/transactions', label: 'Transactions', icon: History, roles: ['all'] },
    { href: '/admin', label: 'Admin', icon: Shield, roles: ['lessor'] },
    { href: '/inspector', label: 'Inspector', icon: ClipboardCheck, roles: ['inspector'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.roles.includes('all')) return true;
    if (!isConnected && item.roles.includes('other')) return true;
    return item.roles.includes(userRole);
  });

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="sticky top-0 z-50 luxury-glass border-b border-border/50">
      <div className="luxury-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 aurora-gradient rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text-aurora">
              Arctic<span className="gradient-text-ice">Rent</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => {
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

          {/* Right side controls */}
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

            {/* Connection Status & Wallet */}
            {isConnected ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-sm">
                  <div className="text-foreground font-medium capitalize">
                    {userRole === 'lessor' ? 'Owner' : userRole === 'lessee' ? 'Renter' : userRole}
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
                className="luxury-button disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {connecting ? 'Connecting...' : 'Connect'}
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
            {filteredNavItems.map((item) => {
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

            {/* Mobile connection status */}
            {isConnected ? (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm">
                  <div className="text-foreground font-medium capitalize">
                    {userRole === 'lessor' ? 'Owner' : userRole === 'lessee' ? 'Renter' : userRole}
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
    </nav>
  );
};

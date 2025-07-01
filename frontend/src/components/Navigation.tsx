import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Home, BarChart3, User, Wallet } from "lucide-react";
import { useWeb3Store } from "../stores/web3Store";
import { formatAddress, cn } from "../lib/utils";

export function Navigation() {
  const location = useLocation();
  const {
    isConnected,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
  } = useWeb3Store();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Car },
    { href: "/lend", label: "Lend Car", icon: User },
    { href: "/active-rentals", label: "Active Rentals", icon: BarChart3 },
    { href: "/transactions", label: "Transactions", icon: BarChart3 },
  ];

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      if (!isMetaMaskInstalled) {
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      try {
        await connectWallet();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              RentDApp
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "text-neon-cyan neon-glow"
                      : "text-gray-300 hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-3 glass px-3 py-2 rounded-lg">
                <div className="text-sm">
                  <div className="text-neon-cyan font-mono">
                    {formatAddress(address!)}
                  </div>
                  <div className="text-xs text-gray-400">{balance} ETH</div>
                </div>
              </div>
            )}

            <button
              onClick={handleWalletAction}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                isConnected
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gradient-to-r from-neon-purple to-neon-cyan hover:shadow-lg hover:shadow-neon-purple/25 text-white",
              )}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isConnected
                  ? "Disconnect"
                  : !isMetaMaskInstalled
                    ? "Install MetaMask"
                    : "Connect Wallet"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/10">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-neon-cyan bg-neon-cyan/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation;

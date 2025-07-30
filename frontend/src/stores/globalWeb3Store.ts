import { create } from "zustand";
import { ethers } from "ethers";
import { isMetaMaskInstalled, getMetaMaskError, connectToMetaMask } from "../utils/metamaskUtils";

export type UserRole = 'admin' | 'inspector' | 'user';

interface Web3State {
  // Connection state
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: string;
  isMetaMaskInstalled: boolean;

  // Role detection
  userRole: UserRole;
  adminAddress: string | null; // Contract deployer
  inspectorAddress: string | null; // Damage assessor

  // Contract info
  contractAddress: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  detectUserRole: (address: string) => UserRole;
  setContractInfo: (contractAddress: string, adminAddress: string, inspectorAddress: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useGlobalWeb3Store = create<Web3State>((set, get) => ({
  // Initial state
  isConnected: false,
  address: null,
  balance: "0",
  network: "Unknown",
  isMetaMaskInstalled: typeof window !== "undefined" && !!window.ethereum && !!window.ethereum.isMetaMask,
  userRole: 'user',
  adminAddress: null,
  inspectorAddress: null,
  contractAddress: null,
  isLoading: false,
  error: null,

  // Connect wallet and detect role
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check for MetaMask availability first
      const metamaskError = getMetaMaskError();
      if (metamaskError) {
        set({
          error: metamaskError,
          isLoading: false,
          isMetaMaskInstalled: isMetaMaskInstalled()
        });
        return; // Don't throw, just return gracefully
      }

      // Connect to MetaMask
      await connectToMetaMask();

      // Setup provider and get account info
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      // Load contract info to detect role
      await loadContractInfo();

      const userRole = get().detectUserRole(address);

      set({
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        network: getNetworkName(Number(network.chainId)),
        userRole,
        isLoading: false,
        isMetaMaskInstalled: true
      });

    } catch (error) {
      console.error("Error connecting wallet:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      set({
        error: errorMessage,
        isLoading: false,
        isConnected: false,
        address: null,
        balance: "0",
        network: "Unknown",
        userRole: 'user',
        isMetaMaskInstalled: isMetaMaskInstalled()
      });
      // Only throw if it's not a MetaMask related error
      if (!errorMessage.toLowerCase().includes("metamask")) {
        throw error;
      }
    }
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      address: null,
      balance: "0",
      network: "Unknown",
      userRole: 'user',
      error: null
    });
  },

  // Detect user role based on contract addresses
  detectUserRole: (address: string): UserRole => {
    const { adminAddress, inspectorAddress } = get();
    
    if (adminAddress && address.toLowerCase() === adminAddress.toLowerCase()) {
      return 'admin';
    }
    
    if (inspectorAddress && address.toLowerCase() === inspectorAddress.toLowerCase()) {
      return 'inspector';
    }
    
    return 'user';
  },

  setContractInfo: (contractAddress: string, adminAddress: string, inspectorAddress: string) => {
    set({ 
      contractAddress, 
      adminAddress, 
      inspectorAddress 
    });

    // Re-detect role if connected
    const { address } = get();
    if (address) {
      const userRole = get().detectUserRole(address);
      set({ userRole });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  }
}));

// Helper function to get network name
function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1: return "Ethereum Mainnet";
    case 5: return "Goerli Testnet";
    case 11155111: return "Sepolia Testnet";
    case 80001: return "Mumbai Testnet";
    case 1337: return "Localhost";
    default: return `Chain ID: ${chainId}`;
  }
}

// Load contract information
async function loadContractInfo(): Promise<void> {
  try {
    const response = await fetch("/contract-address.json");
    const contractData = await response.json();
    
    // Set contract info in store
    const store = useGlobalWeb3Store.getState();
    store.setContractInfo(
      contractData.address,
      contractData.deployer || contractData.lessor,
      contractData.inspector || contractData.damageAssessor
    );
  } catch (error) {
    console.warn("Could not load contract info:", error);
  }
}

// Selector hooks for easier access
export const useWalletConnection = () => useGlobalWeb3Store((state) => ({
  isConnected: state.isConnected,
  address: state.address,
  balance: state.balance,
  network: state.network,
  connectWallet: state.connectWallet,
  disconnectWallet: state.disconnectWallet
}));

export const useUserRole = () => useGlobalWeb3Store((state) => state.userRole);

export const useConnectionState = () => useGlobalWeb3Store((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  setError: state.setError
}));

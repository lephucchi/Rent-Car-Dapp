import { create } from "zustand";
import { ethers } from "ethers";

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
  isMetaMaskInstalled: typeof window !== "undefined" && !!window.ethereum,
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

      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        throw new Error("Browser environment required for wallet connection.");
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        set({
          error: "MetaMask is not installed. Please install MetaMask and refresh the page.",
          isLoading: false
        });
        return; // Don't throw, just return gracefully
      }

      // Check if MetaMask is the provider
      if (!window.ethereum.isMetaMask) {
        console.warn("MetaMask not detected, but ethereum provider found");
      }

      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found. Please connect your wallet.");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
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

      } catch (providerError: any) {
        // Handle specific MetaMask errors
        if (providerError.code === 4001) {
          throw new Error("Connection rejected. Please approve the connection request.");
        } else if (providerError.code === -32002) {
          throw new Error("Connection request already pending. Please check MetaMask.");
        } else {
          throw providerError;
        }
      }

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
        userRole: 'user'
      });
      // Only throw if it's not a MetaMask not installed error
      if (!errorMessage.includes("MetaMask is not installed")) {
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

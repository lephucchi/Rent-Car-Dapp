import { create } from "zustand";
import { web3Service, type ContractDetails } from "../lib/web3";

interface Web3State {
  // Connection
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: string;
  isMetaMaskInstalled: boolean;

  // Contract data
  contractAddress: string | null;
  contractDetails: ContractDetails | null;

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loadContractDetails: (contractAddress?: string) => Promise<void>;
  activateContract: (contractAddress: string, depositAmount: string) => Promise<void>;
  returnCar: (contractAddress: string) => Promise<void>;
  inspectCar: (contractAddress: string, isDamaged: boolean, compensationAmount: string) => Promise<void>;
  finalizeContract: (contractAddress: string) => Promise<void>;
  cancelContract: (contractAddress: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
  // Initial state
  isConnected: false,
  address: null,
  balance: "0",
  network: "Unknown",
  isMetaMaskInstalled: typeof window !== "undefined" && !!window.ethereum,
  contractAddress: null,
  contractDetails: null,
  isLoading: false,
  error: null,

  // Actions
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const walletInfo = await web3Service.connectWallet();
      const contractAddress = await web3Service.getContractAddress();
      
      set({
        isConnected: true,
        address: walletInfo.address,
        balance: walletInfo.balance,
        network: walletInfo.network,
        contractAddress,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      set({ 
        error: errorMessage, 
        isLoading: false,
        isConnected: false,
        address: null,
        balance: "0",
        network: "Unknown"
      });
      throw error;
    }
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      address: null,
      balance: "0",
      network: "Unknown",
      contractAddress: null,
      contractDetails: null,
      error: null
    });
  },

  loadContractDetails: async (contractAddress?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const details = await web3Service.getContractDetails(contractAddress);
      
      set({
        contractDetails: details,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contract details';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  activateContract: async (contractAddress: string, depositAmount: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await web3Service.activateContract(contractAddress, depositAmount);
      
      // Reload contract details after successful transaction
      await get().loadContractDetails(contractAddress);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate contract';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  returnCar: async (contractAddress: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await web3Service.returnCar(contractAddress);
      
      // Reload contract details after successful transaction
      await get().loadContractDetails(contractAddress);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to return car';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  inspectCar: async (contractAddress: string, isDamaged: boolean, compensationAmount: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await web3Service.inspectCar(contractAddress, isDamaged, compensationAmount);
      
      // Reload contract details after successful transaction
      await get().loadContractDetails(contractAddress);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to inspect car';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  finalizeContract: async (contractAddress: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await web3Service.finalizeContract(contractAddress);
      
      // Reload contract details after successful transaction
      await get().loadContractDetails(contractAddress);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to finalize contract';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  cancelContract: async (contractAddress: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await web3Service.cancelContract(contractAddress);
      
      // Reload contract details after successful transaction
      await get().loadContractDetails(contractAddress);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel contract';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  }
}));

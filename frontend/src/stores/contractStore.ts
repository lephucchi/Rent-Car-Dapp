import { create } from "zustand";
import { apiService } from "../services/api";

interface ContractState {
  // Contract data
  contractStatus: any | null;
  accounts: any[] | null;

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  loadContractStatus: () => Promise<void>;
  loadAccounts: () => Promise<void>;
  startRental: (renterAddress: string, privateKey: string) => Promise<void>;
  endRental: (ownerAddress: string, privateKey: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useContractStore = create<ContractState>((set, get) => ({
  // Initial state
  contractStatus: null,
  accounts: null,
  isLoading: false,
  error: null,

  // Actions
  loadContractStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const status = await apiService.getContractStatus();
      
      set({
        contractStatus: status,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contract status';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadAccounts: async () => {
    try {
      set({ error: null });
      
      const response = await apiService.getHardhatAccounts();
      
      set({
        accounts: response.accounts
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load accounts';
      set({ error: errorMessage });
    }
  },

  startRental: async (renterAddress: string, privateKey: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await apiService.startRental(renterAddress, privateKey);
      
      // Reload contract status after successful transaction
      await get().loadContractStatus();
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start rental';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  endRental: async (ownerAddress: string, privateKey: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await apiService.endRental(ownerAddress, privateKey);
      
      // Reload contract status after successful transaction
      await get().loadContractStatus();
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end rental';
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
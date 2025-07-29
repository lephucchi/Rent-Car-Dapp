import { create } from "zustand";
import { contractService, type ContractState, type FeeCalculation, type UserRole, type AvailableActions, type TransactionEvent } from "../services/contractService";

interface ContractStoreState {
  // Connection state
  isConnected: boolean;
  currentAccount: string | null;
  
  // Contract data
  contractState: ContractState | null;
  feeCalculation: FeeCalculation | null;
  userRole: UserRole | null;
  availableActions: AvailableActions | null;
  transactionHistory: TransactionEvent[];
  
  // UI state
  isLoading: boolean;
  isTransacting: boolean;
  error: string | null;
  lastTransactionHash: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  refreshContractData: () => Promise<void>;
  refreshTransactionHistory: () => Promise<void>;
  
  // Contract interactions
  rent: () => Promise<void>;
  cancelRental: () => Promise<void>;
  requestReturn: () => Promise<void>;
  confirmReturn: () => Promise<void>;
  setActualUsage: (minutes: number) => Promise<void>;
  reportDamage: () => Promise<void>;
  completeRental: () => Promise<void>;
  
  // Utility functions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearTransaction: () => void;
}

export const useContractStore = create<ContractStoreState>((set, get) => ({
  // Initial state
  isConnected: false,
  currentAccount: null,
  contractState: null,
  feeCalculation: null,
  userRole: null,
  availableActions: null,
  transactionHistory: [],
  isLoading: false,
  isTransacting: false,
  error: null,
  lastTransactionHash: null,

  // Connect wallet and initialize contract
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const account = await contractService.connectWallet();
      
      set({ 
        isConnected: true, 
        currentAccount: account,
        isLoading: false 
      });
      
      // Refresh contract data after connection
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      set({ 
        error: errorMessage, 
        isLoading: false,
        isConnected: false,
        currentAccount: null 
      });
      throw error;
    }
  },

  // Refresh all contract data
  refreshContractData: async () => {
    if (!get().isConnected) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const [contractState, feeCalculation, userRole] = await Promise.all([
        contractService.getContractState(),
        contractService.getFeeCalculation(),
        contractService.getUserRole()
      ]);
      
      const availableActions = await contractService.getAvailableActions(contractState, userRole);
      
      set({
        contractState,
        feeCalculation,
        userRole,
        availableActions,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Failed to refresh contract data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh contract data';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Refresh transaction history
  refreshTransactionHistory: async () => {
    if (!get().isConnected) return;
    
    try {
      const transactionHistory = await contractService.getTransactionHistory();
      set({ transactionHistory });
    } catch (error) {
      console.error('Failed to refresh transaction history:', error);
    }
  },

  // Contract interaction functions
  rent: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.rent();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to rent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to rent';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  cancelRental: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.cancelRental();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to cancel rental:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel rental';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  requestReturn: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.requestReturn();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to request return:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to request return';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  confirmReturn: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.confirmReturn();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to confirm return:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm return';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  setActualUsage: async (minutes: number) => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.setActualUsage(minutes);
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to set actual usage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to set actual usage';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  reportDamage: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.reportDamage();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to report damage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to report damage';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  completeRental: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await contractService.completeRental();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      console.error('Failed to complete rental:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete rental';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  // Utility functions
  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  clearTransaction: () => {
    set({ lastTransactionHash: null, error: null });
  }
}));

// Selector hooks for easier component usage
export const useContractState = () => useContractStore((state) => state.contractState);
export const useFeeCalculation = () => useContractStore((state) => state.feeCalculation);
export const useAvailableActions = () => useContractStore((state) => state.availableActions);
export const useUserRole = () => useContractStore((state) => state.userRole);
export const useIsConnected = () => useContractStore((state) => state.isConnected);
export const useTransactionState = () => useContractStore((state) => ({
  isTransacting: state.isTransacting,
  lastTransactionHash: state.lastTransactionHash,
  error: state.error
}));
export const useTransactionHistory = () => useContractStore((state) => state.transactionHistory);
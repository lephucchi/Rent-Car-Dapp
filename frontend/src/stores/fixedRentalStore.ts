import { create } from "zustand";
import { 
  fixedRentalService, 
  type FixedRentalContractState, 
  type UserRole, 
  type AvailableActions,
  type TransactionEvent
} from "../services/fixedRentalService";

interface FixedRentalState {
  // Connection state
  isConnected: boolean;
  currentAccount: string | null;
  
  // Contract data
  contractState: FixedRentalContractState | null;
  userRole: UserRole | null;
  availableActions: AvailableActions | null;
  
  // Calculated values
  totalRentalFee: bigint | null;
  deposit: bigint | null;
  finalPaymentAmount: bigint | null;
  
  // Transaction state
  isTransacting: boolean;
  lastTransactionHash: string | null;
  transactionHistory: TransactionEvent[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshContractData: () => Promise<void>;
  refreshTransactionHistory: () => Promise<void>;
  
  // Contract interactions
  rent: () => Promise<void>;
  cancelRental: () => Promise<void>;
  requestReturn: () => Promise<void>;
  confirmReturn: () => Promise<void>;
  setActualUsage: (days: number) => Promise<void>;
  reportDamage: () => Promise<void>;
  assessDamage: (amountInEther: number) => Promise<void>;
  completeRental: () => Promise<void>;
  
  // Utility functions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearTransactionHash: () => void;
}

export const useFixedRentalStore = create<FixedRentalState>((set, get) => ({
  // Initial state
  isConnected: false,
  currentAccount: null,
  contractState: null,
  userRole: null,
  availableActions: null,
  totalRentalFee: null,
  deposit: null,
  finalPaymentAmount: null,
  isTransacting: false,
  lastTransactionHash: null,
  transactionHistory: [],
  isLoading: false,
  error: null,

  // Actions
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const account = await fixedRentalService.connectWallet();
      
      set({
        isConnected: true,
        currentAccount: account,
        isLoading: false
      });
      
      // Load contract data after connection
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
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

  disconnectWallet: () => {
    fixedRentalService.removeAllListeners();
    set({
      isConnected: false,
      currentAccount: null,
      contractState: null,
      userRole: null,
      availableActions: null,
      totalRentalFee: null,
      deposit: null,
      finalPaymentAmount: null,
      lastTransactionHash: null,
      transactionHistory: [],
      error: null
    });
  },

  refreshContractData: async () => {
    if (!get().isConnected) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const [contractState, userRole, totalRentalFee, deposit] = await Promise.all([
        fixedRentalService.getContractState(),
        fixedRentalService.getUserRole(),
        fixedRentalService.getTotalRentalFee(),
        fixedRentalService.getDeposit()
      ]);
      
      const availableActions = await fixedRentalService.getAvailableActions(contractState, userRole);
      
      // Get final payment amount if rental is in completion phase
      let finalPaymentAmount: bigint | null = null;
      if (contractState.isRented && contractState.renterRequestedReturn && contractState.ownerConfirmedReturn) {
        try {
          finalPaymentAmount = await fixedRentalService.getFinalPaymentAmount();
        } catch (error) {
          console.warn('Could not get final payment amount:', error);
        }
      }
      
      set({
        contractState,
        userRole,
        availableActions,
        totalRentalFee,
        deposit,
        finalPaymentAmount,
        isLoading: false
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh contract data';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  refreshTransactionHistory: async () => {
    if (!get().isConnected) return;
    
    try {
      const transactionHistory = await fixedRentalService.getTransactionHistory();
      set({ transactionHistory });
    } catch (error) {
      console.error('Failed to refresh transaction history:', error);
      // Don't throw here as this is not critical
    }
  },

  // Contract interactions
  rent: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.rent();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rent vehicle';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  cancelRental: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.cancelRental();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel rental';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  requestReturn: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.requestReturn();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request return';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  confirmReturn: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.confirmReturn();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm return';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  setActualUsage: async (days: number) => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.setActualUsage(days);
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set actual usage';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  reportDamage: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.reportDamage();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to report damage';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  assessDamage: async (amountInEther: number) => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.assessDamage(amountInEther);
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assess damage';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
      throw error;
    }
  },

  completeRental: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await fixedRentalService.completeRental();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      await get().refreshContractData();
      await get().refreshTransactionHistory();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete rental';
      set({ 
        error: errorMessage, 
        isTransacting: false 
      });
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

  clearTransactionHash: () => {
    set({ lastTransactionHash: null });
  }
}));

// Selector hooks for easier component usage
export const useContractState = () => useFixedRentalStore((state) => state.contractState);
export const useUserRole = () => useFixedRentalStore((state) => state.userRole);
export const useAvailableActions = () => useFixedRentalStore((state) => state.availableActions);
export const useIsConnected = () => useFixedRentalStore((state) => state.isConnected);
export const useCurrentAccount = () => useFixedRentalStore((state) => state.currentAccount);
export const useTransactionState = () => useFixedRentalStore((state) => ({
  isTransacting: state.isTransacting,
  lastTransactionHash: state.lastTransactionHash,
  error: state.error
}));
export const useTransactionHistory = () => useFixedRentalStore((state) => state.transactionHistory);
export const useFeeCalculation = () => useFixedRentalStore((state) => ({
  totalRentalFee: state.totalRentalFee,
  deposit: state.deposit,
  finalPaymentAmount: state.finalPaymentAmount
}));

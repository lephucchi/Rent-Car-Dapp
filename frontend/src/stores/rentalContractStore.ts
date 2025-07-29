import { create } from "zustand";
import { rentalContractService, type RentalContractState, type FeeCalculation, type RentalActions } from "../services/rentalContractService";

interface RentalContractStore {
  // State
  isConnected: boolean;
  currentAccount: string | null;
  contractState: RentalContractState | null;
  feeCalculation: FeeCalculation | null;
  availableActions: RentalActions | null;
  userRole: 'lessor' | 'lessee' | 'other';
  
  // Loading states
  isLoading: boolean;
  isTransacting: boolean;
  error: string | null;
  
  // Last transaction hash
  lastTransactionHash: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  refreshContractData: () => Promise<void>;
  
  // Contract interaction actions
  rent: () => Promise<void>;
  cancelRental: () => Promise<void>;
  requestReturn: () => Promise<void>;
  confirmReturn: () => Promise<void>;
  setActualUsage: (days: number) => Promise<void>;
  reportDamage: () => Promise<void>;
  completeRental: () => Promise<void>;
  
  // Utility actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setTransacting: (transacting: boolean) => void;
  clearTransaction: () => void;
}

export const useRentalContractStore = create<RentalContractStore>((set, get) => ({
  // Initial state
  isConnected: false,
  currentAccount: null,
  contractState: null,
  feeCalculation: null,
  availableActions: null,
  userRole: 'other',
  isLoading: false,
  isTransacting: false,
  error: null,
  lastTransactionHash: null,

  // Connect wallet and initialize contract
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const account = await rentalContractService.connectWallet();
      
      set({ 
        isConnected: true, 
        currentAccount: account,
        isLoading: false 
      });
      
      // Refresh contract data after connection
      await get().refreshContractData();
      
      // Set up event listeners
      setupEventListeners();
      
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
    try {
      set({ isLoading: true, error: null });
      
      if (!rentalContractService.isConnected()) {
        throw new Error('Wallet not connected');
      }
      
      const [contractState, feeCalculation, availableActions] = await Promise.all([
        rentalContractService.getContractState(),
        rentalContractService.getFeeCalculation(),
        rentalContractService.getAvailableActions()
      ]);
      
      const userRole = rentalContractService.getUserRole(contractState);
      
      set({
        contractState,
        feeCalculation,
        availableActions,
        userRole,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Failed to refresh contract data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh contract data';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Contract interaction functions
  rent: async () => {
    try {
      set({ isTransacting: true, error: null });
      
      const txHash = await rentalContractService.rent();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
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
      
      const txHash = await rentalContractService.cancelRental();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
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
      
      const txHash = await rentalContractService.requestReturn();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
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
      
      const txHash = await rentalContractService.confirmReturn();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
    } catch (error) {
      console.error('Failed to confirm return:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm return';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  setActualUsage: async (days: number) => {
    try {
      set({ isTransacting: true, error: null });

      const txHash = await rentalContractService.setActualUsage(days);
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
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
      
      const txHash = await rentalContractService.reportDamage();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
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
      
      const txHash = await rentalContractService.completeRental();
      
      set({ 
        lastTransactionHash: txHash,
        isTransacting: false 
      });
      
      // Refresh data after successful transaction
      await get().refreshContractData();
      
    } catch (error) {
      console.error('Failed to complete rental:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete rental';
      set({ error: errorMessage, isTransacting: false });
      throw error;
    }
  },

  // Utility actions
  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setTransacting: (isTransacting: boolean) => {
    set({ isTransacting });
  },

  clearTransaction: () => {
    set({ lastTransactionHash: null, error: null });
  }
}));

// Setup event listeners for real-time updates
function setupEventListeners() {
  const refreshData = () => {
    // Use timeout to avoid immediate refresh during transaction
    setTimeout(() => {
      useRentalContractStore.getState().refreshContractData();
    }, 1000);
  };

  rentalContractService.onRentalStarted((lessee, deposit) => {
    console.log('Rental started:', { lessee, deposit });
    refreshData();
  });

  rentalContractService.onRentalCancelled((lessee) => {
    console.log('Rental cancelled:', { lessee });
    refreshData();
  });

  rentalContractService.onRenterRequestedReturn((lessee) => {
    console.log('Return requested:', { lessee });
    refreshData();
  });

  rentalContractService.onOwnerConfirmedReturn((lessor) => {
    console.log('Return confirmed:', { lessor });
    refreshData();
  });

  rentalContractService.onActualUsageSet((actualMinutes) => {
    console.log('Actual usage set:', { actualMinutes });
    refreshData();
  });

  rentalContractService.onDamageReported((lessor) => {
    console.log('Damage reported:', { lessor });
    refreshData();
  });

  rentalContractService.onFundsTransferred((to, amount) => {
    console.log('Funds transferred:', { to, amount });
    refreshData();
  });
}

// Selector hooks for easier state access
export const useContractState = () => useRentalContractStore((state) => state.contractState);
export const useFeeCalculation = () => useRentalContractStore((state) => state.feeCalculation);
export const useAvailableActions = () => useRentalContractStore((state) => state.availableActions);
export const useUserRole = () => useRentalContractStore((state) => state.userRole);
export const useIsConnected = () => useRentalContractStore((state) => state.isConnected);
export const useTransactionState = () => useRentalContractStore((state) => ({
  isTransacting: state.isTransacting,
  lastTransactionHash: state.lastTransactionHash,
  error: state.error
}));

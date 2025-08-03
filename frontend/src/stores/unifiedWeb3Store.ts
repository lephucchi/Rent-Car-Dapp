import { create } from "zustand";
import { web3Integration, type WalletInfo, type ContractState, type FeeCalculation, type UserRole } from "../lib/web3-integration";

export type UserRoleType = 'lessor' | 'lessee' | 'other';

interface Web3State {
  // Connection state
  isConnected: boolean;
  isInitialized: boolean;
  walletInfo: WalletInfo | null;
  
  // Contract state
  contractState: ContractState | null;
  feeCalculations: FeeCalculation | null;
  userRole: UserRole | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  lastTransactionHash: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshContractState: () => Promise<void>;
  refreshFeeCalculations: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  
  // Contract actions
  rentAsset: () => Promise<string>;
  cancelRental: () => Promise<string>;
  requestReturn: () => Promise<string>;
  confirmReturn: () => Promise<string>;
  setActualUsage: (minutes: number) => Promise<string>;
  reportDamage: () => Promise<string>;
  completeRental: () => Promise<string>;
  
  // Utility actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearTransaction: () => void;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
  // Initial state
  isConnected: false,
  isInitialized: false,
  walletInfo: null,
  contractState: null,
  feeCalculations: null,
  userRole: null,
  isLoading: false,
  error: null,
  lastTransactionHash: null,

  // Connect wallet and initialize
  connectWallet: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const walletInfo = await web3Integration.connectWallet();
      
      set({ 
        isConnected: true, 
        isInitialized: true,
        walletInfo,
        isLoading: false 
      });

      // Load initial contract data
      await get().refreshContractState();
      await get().refreshFeeCalculations();
      await get().refreshUserRole();
      
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to connect wallet',
        isLoading: false 
      });
      throw error;
    }
  },

  // Disconnect wallet
  disconnectWallet: () => {
    set({
      isConnected: false,
      isInitialized: false,
      walletInfo: null,
      contractState: null,
      feeCalculations: null,
      userRole: null,
      error: null,
      lastTransactionHash: null
    });
  },

  // Refresh contract state
  refreshContractState: async () => {
    if (!get().isInitialized) return;
    
    try {
      const contractState = await web3Integration.getContractState();
      set({ contractState });
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh contract state' });
    }
  },

  // Refresh fee calculations
  refreshFeeCalculations: async () => {
    if (!get().isInitialized) return;
    
    try {
      const feeCalculations = await web3Integration.getFeeCalculations();
      set({ feeCalculations });
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh fee calculations' });
    }
  },

  // Refresh user role
  refreshUserRole: async () => {
    if (!get().isInitialized) return;
    
    try {
      const userRole = await web3Integration.getUserRole();
      set({ userRole });
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh user role' });
    }
  },

  // Contract Actions
  rentAsset: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.rent();
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      await get().refreshFeeCalculations();
      await get().refreshUserRole();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to rent asset',
        isLoading: false 
      });
      throw error;
    }
  },

  cancelRental: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.cancelRental();
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      await get().refreshFeeCalculations();
      await get().refreshUserRole();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to cancel rental',
        isLoading: false 
      });
      throw error;
    }
  },

  requestReturn: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.requestReturn();
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to request return',
        isLoading: false 
      });
      throw error;
    }
  },

  confirmReturn: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.confirmReturn();
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to confirm return',
        isLoading: false 
      });
      throw error;
    }
  },

  setActualUsage: async (minutes: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.setActualUsage(minutes);
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      await get().refreshFeeCalculations();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to set actual usage',
        isLoading: false 
      });
      throw error;
    }
  },

  reportDamage: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.reportDamage();
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      await get().refreshFeeCalculations();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to report damage',
        isLoading: false 
      });
      throw error;
    }
  },

  completeRental: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const txHash = await web3Integration.completeRental();
      set({ 
        lastTransactionHash: txHash,
        isLoading: false 
      });
      
      // Refresh state after transaction
      await get().refreshContractState();
      await get().refreshFeeCalculations();
      await get().refreshUserRole();
      
      return txHash;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to complete rental',
        isLoading: false 
      });
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

  clearTransaction: () => {
    set({ lastTransactionHash: null });
  }
}));

// Convenience hooks
export const useWalletConnection = () => {
  const { isConnected, walletInfo, connectWallet, disconnectWallet, isLoading, error } = useWeb3Store();
  return {
    isConnected,
    address: walletInfo?.address || null,
    balance: walletInfo?.balance || '0',
    network: walletInfo?.network || 'Unknown',
    chainId: walletInfo?.chainId || 0,
    connectWallet,
    disconnectWallet,
    isLoading,
    error
  };
};

export const useContractState = () => {
  const { 
    contractState, 
    feeCalculations, 
    userRole, 
    refreshContractState, 
    refreshFeeCalculations, 
    refreshUserRole 
  } = useWeb3Store();
  
  return {
    contractState,
    feeCalculations,
    userRole,
    refresh: {
      contractState: refreshContractState,
      feeCalculations: refreshFeeCalculations,
      userRole: refreshUserRole
    }
  };
};

export const useContractActions = () => {
  const {
    rentAsset,
    cancelRental,
    requestReturn,
    confirmReturn,
    setActualUsage,
    reportDamage,
    completeRental,
    isLoading,
    error,
    lastTransactionHash,
    clearTransaction
  } = useWeb3Store();

  return {
    actions: {
      rentAsset,
      cancelRental,
      requestReturn,
      confirmReturn,
      setActualUsage,
      reportDamage,
      completeRental
    },
    isLoading,
    error,
    lastTransactionHash,
    clearTransaction
  };
};

export const useUserRole = () => {
  const { userRole } = useWeb3Store();
  
  if (!userRole) {
    return {
      isLessor: false,
      isLessee: false,
      isOther: true,
      address: null,
      roleType: 'other' as UserRoleType
    };
  }

  return {
    ...userRole,
    roleType: userRole.isLessor ? 'lessor' : userRole.isLessee ? 'lessee' : 'other' as UserRoleType
  };
};

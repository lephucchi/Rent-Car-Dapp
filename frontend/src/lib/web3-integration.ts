/**
 * Web3 Integration Service for FixedRentalContract
 * This file provides a unified interface for interacting with the deployed contract
 */

import { ethers } from 'ethers';
import { contractConfig } from './contractConfig';

// Network configuration for Hardhat local network
export const HARDHAT_NETWORK = {
  chainId: 1337,
  rpcUrl: 'http://127.0.0.1:8545',
  name: 'Hardhat Local'
};

export interface ContractState {
  assetName: string;
  rentalFeePerMinute: bigint;
  durationMinutes: bigint;
  insuranceFee: bigint;
  insuranceCompensation: bigint;
  lessor: string;
  lessee: string;
  isRented: boolean;
  isDamaged: boolean;
  renterRequestedReturn: boolean;
  ownerConfirmedReturn: boolean;
  actualMinutes: bigint;
  startTime: bigint;
}

export interface FeeCalculation {
  totalRentalFee: bigint;
  deposit: bigint;
  remainingPayment: bigint;
}

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  chainId: number;
}

export interface UserRole {
  isLessor: boolean;
  isLessee: boolean;
  isOther: boolean;
  address: string;
}

class Web3IntegrationService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private currentAccount: string | null = null;

  /**
   * Initialize Web3 connection and contract
   */
  async initialize(): Promise<void> {
    try {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask is not installed');
      }

      // Create provider and connect to Hardhat network
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== HARDHAT_NETWORK.chainId) {
        await this.switchToHardhatNetwork();
      }

      // Get signer
      this.signer = await this.provider.getSigner();
      this.currentAccount = await this.signer.getAddress();

      // Initialize contract
      this.contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        this.signer
      );

      console.log('Web3 initialized successfully');
      console.log('Connected account:', this.currentAccount);
      console.log('Contract address:', contractConfig.address);
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      throw error;
    }
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<WalletInfo> {
    try {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      await this.initialize();

      if (!this.signer || !this.currentAccount) {
        throw new Error('Failed to get signer or account');
      }

      const balance = await this.provider!.getBalance(this.currentAccount);
      const network = await this.provider!.getNetwork();

      return {
        address: this.currentAccount,
        balance: ethers.formatEther(balance),
        network: network.name,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Switch to Hardhat local network
   */
  async switchToHardhatNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${HARDHAT_NETWORK.chainId.toString(16)}` }]
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${HARDHAT_NETWORK.chainId.toString(16)}`,
            chainName: HARDHAT_NETWORK.name,
            rpcUrls: [HARDHAT_NETWORK.rpcUrl],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }
          }]
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get current contract state
   */
  async getContractState(): Promise<ContractState> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [
        assetName,
        rentalFeePerMinute,
        durationMinutes,
        insuranceFee,
        insuranceCompensation,
        lessor,
        lessee,
        isRented,
        isDamaged,
        renterRequestedReturn,
        ownerConfirmedReturn,
        actualMinutes,
        startTime
      ] = await Promise.all([
        this.contract.assetName(),
        this.contract.rentalFeePerMinute(),
        this.contract.durationMinutes(),
        this.contract.insuranceFee(),
        this.contract.insuranceCompensation(),
        this.contract.lessor(),
        this.contract.lessee(),
        this.contract.isRented(),
        this.contract.isDamaged(),
        this.contract.renterRequestedReturn(),
        this.contract.ownerConfirmedReturn(),
        this.contract.actualMinutes(),
        this.contract.startTime()
      ]);

      return {
        assetName,
        rentalFeePerMinute,
        durationMinutes,
        insuranceFee,
        insuranceCompensation,
        lessor,
        lessee,
        isRented,
        isDamaged,
        renterRequestedReturn,
        ownerConfirmedReturn,
        actualMinutes,
        startTime
      };
    } catch (error) {
      console.error('Failed to get contract state:', error);
      throw error;
    }
  }

  /**
   * Get fee calculations
   */
  async getFeeCalculations(): Promise<FeeCalculation> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalRentalFee, deposit] = await Promise.all([
        this.contract.getTotalRentalFee(),
        this.contract.getDeposit()
      ]);

      let remainingPayment = BigInt(0);
      const state = await this.getContractState();
      if (state.isRented) {
        remainingPayment = await this.contract.getFinalPaymentAmount();
      }

      return {
        totalRentalFee,
        deposit,
        remainingPayment
      };
    } catch (error) {
      console.error('Failed to get fee calculations:', error);
      throw error;
    }
  }

  /**
   * Get user role in the contract
   */
  async getUserRole(address?: string): Promise<UserRole> {
    const userAddress = address || this.currentAccount;
    if (!userAddress) {
      throw new Error('No address provided');
    }

    const state = await this.getContractState();
    
    return {
      isLessor: state.lessor.toLowerCase() === userAddress.toLowerCase(),
      isLessee: state.lessee.toLowerCase() === userAddress.toLowerCase(),
      isOther: state.lessor.toLowerCase() !== userAddress.toLowerCase() && 
               state.lessee.toLowerCase() !== userAddress.toLowerCase(),
      address: userAddress
    };
  }

  /**
   * Rent the asset
   */
  async rent(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const deposit = await this.contract.getDeposit();
      const tx = await this.contract.rent({ value: deposit });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to rent asset:', error);
      throw error;
    }
  }

  /**
   * Cancel rental
   */
  async cancelRental(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.cancelRental();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to cancel rental:', error);
      throw error;
    }
  }

  /**
   * Request return (by lessee)
   */
  async requestReturn(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.requestReturn();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to request return:', error);
      throw error;
    }
  }

  /**
   * Confirm return (by lessor)
   */
  async confirmReturn(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.confirmReturn();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to confirm return:', error);
      throw error;
    }
  }

  /**
   * Set actual usage (by lessor)
   */
  async setActualUsage(minutes: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.setActualUsage(minutes);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to set actual usage:', error);
      throw error;
    }
  }

  /**
   * Report damage (by lessor)
   */
  async reportDamage(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.reportDamage();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to report damage:', error);
      throw error;
    }
  }

  /**
   * Complete rental (final payment)
   */
  async completeRental(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const remainingPayment = await this.contract.getFinalPaymentAmount();
      const tx = await this.contract.completeRental({ value: remainingPayment });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to complete rental:', error);
      throw error;
    }
  }

  /**
   * Check if MetaMask is available
   */
  private isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  }

  /**
   * Get current account
   */
  getCurrentAccount(): string | null {
    return this.currentAccount;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.contract !== null && this.signer !== null;
  }
}

// Export singleton instance
export const web3Integration = new Web3IntegrationService();

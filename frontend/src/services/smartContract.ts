import { ethers } from 'ethers';
import { contractConfig } from '../lib/contractConfig';

export interface ContractInfo {
  address: string;
  abi: any[];
  network: string;
  chainId: number;
}

export interface RentalContractState {
  assetName: string;
  rentalFeePerMinute: bigint;
  durationMinutes: bigint;
  insuranceFee: bigint;
  insuranceCompensation: bigint;
  lessor: string;
  lessee: string;
  state: number; // 0: Created, 1: Active, 2: Completed, 3: Disputed, 4: Cancelled
  startTime: bigint;
  endTime: bigint;
  actualMinutes: bigint;
  isDamaged: boolean;
}

class SmartContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  
  async connectWallet(): Promise<string> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();
      
      // Switch to the correct network if needed
      await this.switchToCorrectNetwork();
      
      // Initialize contract
      this.initializeContract();
      
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  private async switchToCorrectNetwork(): Promise<void> {
    const ethereum = (window as any).ethereum;
    if (!ethereum || !ethereum.request) {
      throw new Error('MetaMask is not available');
    }

    const targetChainId = `0x${contractConfig.chainId.toString(16)}`;
    
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'Hardhat Local',
                rpcUrls: ['http://localhost:8545'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  private initializeContract(): void {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    this.contract = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      this.signer
    );
  }

  async getContractState(): Promise<RentalContractState> {
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
        state,
        startTime,
        endTime,
        actualMinutes,
        isDamaged
      ] = await this.contract.getContractDetails();

      return {
        assetName,
        rentalFeePerMinute,
        durationMinutes,
        insuranceFee,
        insuranceCompensation,
        lessor,
        lessee,
        state,
        startTime,
        endTime,
        actualMinutes,
        isDamaged
      };
    } catch (error) {
      console.error('Failed to get contract state:', error);
      throw error;
    }
  }

  async rent(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const state = await this.getContractState();
      const totalFee = state.rentalFeePerMinute * state.durationMinutes + state.insuranceFee;
      
      const tx = await this.contract.rent({
        value: totalFee
      });
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to rent:', error);
      throw error;
    }
  }

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

  async setActualUsage(actualDays: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.setActualUsage(actualDays);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to set actual usage:', error);
      throw error;
    }
  }

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

  async completeRental(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const remainingPayment = await this.contract.getRemainingPayment();
      
      const tx = await this.contract.completeRental({
        value: remainingPayment
      });
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to complete rental:', error);
      throw error;
    }
  }

  async getRemainingPayment(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.getRemainingPayment();
    } catch (error) {
      console.error('Failed to get remaining payment:', error);
      throw error;
    }
  }

  async withdrawFunds(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.withdrawFunds();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to withdraw funds:', error);
      throw error;
    }
  }

  getContractAddress(): string {
    return contractConfig.address;
  }

  getNetworkInfo(): { network: string; chainId: number } {
    return {
      network: contractConfig.network,
      chainId: contractConfig.chainId
    };
  }

  // Listen to contract events
  onRentalStarted(callback: (lessee: string, startTime: bigint) => void): void {
    if (!this.contract) return;
    
    this.contract.on('RentalStarted', callback);
  }

  onRenterRequestedReturn(callback: () => void): void {
    if (!this.contract) return;
    
    this.contract.on('RenterRequestedReturn', callback);
  }

  onOwnerConfirmedReturn(callback: () => void): void {
    if (!this.contract) return;
    
    this.contract.on('OwnerConfirmedReturn', callback);
  }

  onActualUsageSet(callback: (actualMinutes: bigint) => void): void {
    if (!this.contract) return;
    
    this.contract.on('ActualUsageSet', callback);
  }

  onDamageReported(callback: () => void): void {
    if (!this.contract) return;
    
    this.contract.on('DamageReported', callback);
  }

  onFundsTransferred(callback: (to: string, amount: bigint) => void): void {
    if (!this.contract) return;
    
    this.contract.on('FundsTransferred', callback);
  }

  // Remove all event listeners
  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  isConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  async getCurrentAccount(): Promise<string | null> {
    if (!this.signer) return null;
    
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }
}

export const smartContractService = new SmartContractService();

import { ethers } from 'ethers';
import { contractConfig } from '../lib/contractConfig';

export interface FixedRentalContractState {
  assetName: string;
  rentalFeePerDay: bigint;
  durationDays: bigint;
  insuranceFee: bigint;
  lessor: string;
  lessee: string;
  isRented: boolean;
  isDamaged: boolean;
  renterRequestedReturn: boolean;
  ownerConfirmedReturn: boolean;
  actualDays: bigint;
  assessedDamageAmount: bigint;
  startTime: bigint;
}

export interface UserRole {
  isLessor: boolean;
  isLessee: boolean;
  isDamageAssessor: boolean;
  currentAccount: string;
}

export interface AvailableActions {
  canRent: boolean;
  canCancel: boolean;
  canRequestReturn: boolean;
  canConfirmReturn: boolean;
  canSetActualUsage: boolean;
  canReportDamage: boolean;
  canAssessDamage: boolean;
  canCompleteRental: boolean;
}

export interface TransactionEvent {
  type: 'RentalStarted' | 'RentalCancelled' | 'RenterRequestedReturn' | 'OwnerConfirmedReturn' | 'ActualUsageSet' | 'DamageReported' | 'DamageAssessed' | 'FundsTransferred';
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
  data: any;
}

class FixedRentalService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private currentAccount: string | null = null;
  
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
      this.currentAccount = accounts[0];
      
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

  async getContractState(): Promise<FixedRentalContractState> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [
        assetName,
        rentalFeePerDay,
        durationDays,
        insuranceFee,
        lessor,
        lessee,
        isRented,
        isDamaged,
        renterRequestedReturn,
        ownerConfirmedReturn,
        actualDays,
        assessedDamageAmount
      ] = await Promise.all([
        this.contract.assetName(),
        this.contract.rentalFeePerDay(),
        this.contract.durationDays(),
        this.contract.insuranceFee(),
        this.contract.lessor(),
        this.contract.lessee(),
        this.contract.isRented(),
        this.contract.isDamaged(),
        this.contract.renterRequestedReturn(),
        this.contract.ownerConfirmedReturn(),
        this.contract.actualDays(),
        this.contract.assessedDamageAmount()
      ]);

      // Get start time from rental started event if rented
      let startTime = BigInt(0);
      if (isRented) {
        const filter = this.contract.filters.RentalStarted();
        const events = await this.contract.queryFilter(filter);
        if (events.length > 0) {
          const block = await this.provider!.getBlock(events[events.length - 1].blockNumber);
          startTime = BigInt(block!.timestamp);
        }
      }

      return {
        assetName,
        rentalFeePerDay,
        durationDays,
        insuranceFee,
        lessor,
        lessee,
        isRented,
        isDamaged,
        renterRequestedReturn,
        ownerConfirmedReturn,
        actualDays,
        assessedDamageAmount,
        startTime
      };
    } catch (error) {
      console.error('Failed to get contract state:', error);
      throw error;
    }
  }

  async getUserRole(): Promise<UserRole> {
    if (!this.contract || !this.currentAccount) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      const [lessor, lessee] = await Promise.all([
        this.contract.lessor(),
        this.contract.lessee()
      ]);

      return {
        isLessor: this.currentAccount.toLowerCase() === lessor.toLowerCase(),
        isLessee: this.currentAccount.toLowerCase() === lessee.toLowerCase(),
        isDamageAssessor: false, // Would need to get from contract if needed
        currentAccount: this.currentAccount
      };
    } catch (error) {
      console.error('Failed to get user role:', error);
      throw error;
    }
  }

  async getAvailableActions(contractState: FixedRentalContractState, userRole: UserRole): Promise<AvailableActions> {
    return {
      canRent: !contractState.isRented && !userRole.isLessor,
      canCancel: contractState.isRented && userRole.isLessee,
      canRequestReturn: contractState.isRented && userRole.isLessee && !contractState.renterRequestedReturn,
      canConfirmReturn: contractState.isRented && userRole.isLessor && contractState.renterRequestedReturn && !contractState.ownerConfirmedReturn,
      canSetActualUsage: contractState.isRented && userRole.isLessor,
      canReportDamage: contractState.isRented && userRole.isLessor && !contractState.isDamaged,
      canAssessDamage: contractState.isRented && userRole.isDamageAssessor && contractState.isDamaged && contractState.renterRequestedReturn && contractState.ownerConfirmedReturn,
      canCompleteRental: contractState.isRented && contractState.renterRequestedReturn && contractState.ownerConfirmedReturn && (userRole.isLessee || userRole.isLessor)
    };
  }

  async getTotalRentalFee(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getTotalRentalFee();
  }

  async getDeposit(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getDeposit();
  }

  async getFinalPaymentAmount(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getFinalPaymentAmount();
  }

  // Transaction functions
  async rent(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const depositAmount = await this.getDeposit();
      const value = depositAmount * BigInt(10 ** 18); // Convert to wei
      
      const tx = await this.contract.rent({ value });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to rent:', error);
      throw error;
    }
  }

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

  async assessDamage(amountInEther: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.assessDamage(amountInEther);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to assess damage:', error);
      throw error;
    }
  }

  async completeRental(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const finalPaymentAmount = await this.getFinalPaymentAmount();
      
      const tx = await this.contract.completeRental({
        value: finalPaymentAmount
      });
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to complete rental:', error);
      throw error;
    }
  }

  // Event listening for transaction history
  async getTransactionHistory(): Promise<TransactionEvent[]> {
    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized');
    }

    try {
      const events: TransactionEvent[] = [];
      const fromBlock = 0;
      const toBlock = 'latest';

      // Get all relevant events
      const eventTypes = [
        'RentalStarted',
        'RentalCancelled', 
        'RenterRequestedReturn',
        'OwnerConfirmedReturn',
        'ActualUsageSet',
        'DamageReported',
        'DamageAssessed',
        'FundsTransferred'
      ];

      for (const eventType of eventTypes) {
        try {
          const filter = this.contract.filters[eventType]();
          const eventLogs = await this.contract.queryFilter(filter, fromBlock, toBlock);
          
          for (const log of eventLogs) {
            const block = await this.provider.getBlock(log.blockNumber);
            events.push({
              type: eventType as any,
              timestamp: new Date(block!.timestamp * 1000),
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              data: log.args
            });
          }
        } catch (error) {
          console.warn(`Failed to get ${eventType} events:`, error);
        }
      }

      // Sort by timestamp
      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  // Event listeners for real-time updates
  onRentalStarted(callback: (lessee: string, deposit: bigint) => void): void {
    if (!this.contract) return;
    this.contract.on('RentalStarted', callback);
  }

  onRentalCancelled(callback: (lessee: string) => void): void {
    if (!this.contract) return;
    this.contract.on('RentalCancelled', callback);
  }

  onRenterRequestedReturn(callback: (lessee: string) => void): void {
    if (!this.contract) return;
    this.contract.on('RenterRequestedReturn', callback);
  }

  onOwnerConfirmedReturn(callback: (lessor: string) => void): void {
    if (!this.contract) return;
    this.contract.on('OwnerConfirmedReturn', callback);
  }

  onActualUsageSet(callback: (daysUsed: bigint) => void): void {
    if (!this.contract) return;
    this.contract.on('ActualUsageSet', callback);
  }

  onDamageReported(callback: (lessor: string) => void): void {
    if (!this.contract) return;
    this.contract.on('DamageReported', callback);
  }

  onDamageAssessed(callback: (assessor: string, amount: bigint) => void): void {
    if (!this.contract) return;
    this.contract.on('DamageAssessed', callback);
  }

  onFundsTransferred(callback: (to: string, amount: bigint) => void): void {
    if (!this.contract) return;
    this.contract.on('FundsTransferred', callback);
  }

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

  formatEther(value: bigint): string {
    return ethers.formatEther(value);
  }

  parseEther(value: string): bigint {
    return ethers.parseEther(value);
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
}

export const fixedRentalService = new FixedRentalService();

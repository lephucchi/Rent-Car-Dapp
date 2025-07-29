import { ethers } from 'ethers';
import { contractConfig } from '../lib/contractConfig';

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
  finalPaymentAmount: bigint;
}

export interface UserRole {
  isLessor: boolean;
  isLessee: boolean;
  isOther: boolean;
  currentAccount: string;
}

export interface AvailableActions {
  canRent: boolean;
  canCancel: boolean;
  canRequestReturn: boolean;
  canConfirmReturn: boolean;
  canSetActualUsage: boolean;
  canReportDamage: boolean;
  canCompleteRental: boolean;
}

export interface TransactionEvent {
  type: string;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
  data: any[];
}

class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private currentAccount: string | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.currentAccount = accounts[0];

      // Switch to correct network
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
    if (!window.ethereum) return;

    const targetChainId = `0x${contractConfig.chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
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
          throw new Error('Failed to add network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch network');
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

  async getFeeCalculation(): Promise<FeeCalculation> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalRentalFee, deposit] = await Promise.all([
        this.contract.getTotalRentalFee(),
        this.contract.getDeposit()
      ]);

      let remainingPayment = BigInt(0);
      let finalPaymentAmount = BigInt(0);

      try {
        remainingPayment = await this.contract.getRemainingPayment();
        finalPaymentAmount = await this.contract.getFinalPaymentAmount();
      } catch (error) {
        // These functions may fail if not rented
        console.warn('Could not get remaining payment:', error);
      }

      return {
        totalRentalFee,
        deposit,
        remainingPayment,
        finalPaymentAmount
      };
    } catch (error) {
      console.error('Failed to get fee calculation:', error);
      throw error;
    }
  }

  async getUserRole(): Promise<UserRole> {
    if (!this.contract || !this.currentAccount) {
      return {
        isLessor: false,
        isLessee: false,
        isOther: true,
        currentAccount: this.currentAccount || ''
      };
    }

    try {
      const [lessor, lessee] = await Promise.all([
        this.contract.lessor(),
        this.contract.lessee()
      ]);

      const account = this.currentAccount.toLowerCase();
      const isLessor = lessor.toLowerCase() === account;
      const isLessee = lessee.toLowerCase() === account;

      return {
        isLessor,
        isLessee,
        isOther: !isLessor && !isLessee,
        currentAccount: this.currentAccount
      };
    } catch (error) {
      console.error('Failed to get user role:', error);
      return {
        isLessor: false,
        isLessee: false,
        isOther: true,
        currentAccount: this.currentAccount || ''
      };
    }
  }

  async getAvailableActions(contractState: ContractState, userRole: UserRole): Promise<AvailableActions> {
    return {
      canRent: !contractState.isRented && !userRole.isLessor && userRole.isOther,
      canCancel: contractState.isRented && userRole.isLessee,
      canRequestReturn: contractState.isRented && userRole.isLessee && !contractState.renterRequestedReturn,
      canConfirmReturn: contractState.isRented && userRole.isLessor && contractState.renterRequestedReturn && !contractState.ownerConfirmedReturn,
      canSetActualUsage: contractState.isRented && userRole.isLessor,
      canReportDamage: contractState.isRented && userRole.isLessor && !contractState.isDamaged,
      canCompleteRental: contractState.isRented && contractState.renterRequestedReturn && contractState.ownerConfirmedReturn && (userRole.isLessee || userRole.isLessor)
    };
  }

  // Contract interaction functions
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

  async setActualUsage(actualMinutes: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.setActualUsage(actualMinutes);
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
      const finalPaymentAmount = await this.contract.getFinalPaymentAmount();
      const tx = await this.contract.completeRental({ value: finalPaymentAmount });
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

      const eventTypes = [
        'RentalStarted',
        'RentalCancelled',
        'RenterRequestedReturn',
        'OwnerConfirmedReturn',
        'ActualUsageSet',
        'DamageReported',
        'FundsTransferred'
      ];

      for (const eventType of eventTypes) {
        try {
          const filter = this.contract.filters[eventType]();
          const eventLogs = await this.contract.queryFilter(filter, fromBlock, toBlock);

          for (const log of eventLogs) {
            const block = await this.provider.getBlock(log.blockNumber);
            events.push({
              type: eventType,
              timestamp: new Date(block!.timestamp * 1000),
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              data: log.args ? Array.from(log.args) : []
            });
          }
        } catch (error) {
          console.warn(`Failed to get ${eventType} events:`, error);
        }
      }

      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  // Utility functions
  isConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  getCurrentAccount(): string | null {
    return this.currentAccount;
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

  formatEther(value: bigint): string {
    return ethers.formatEther(value);
  }

  parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }
}

export const contractService = new ContractService();
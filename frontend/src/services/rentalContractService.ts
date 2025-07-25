import { ethers } from 'ethers';
import { contractConfig } from '../lib/contractConfig';
import { checkMetaMaskStatus, getMetaMaskErrorMessage, waitForMetaMask } from '../lib/metamaskDetection';

export interface RentalContractState {
  // Core parameters
  assetName: string;
  rentalFeePerMinute: bigint;
  durationMinutes: bigint;
  insuranceFee: bigint;
  insuranceCompensation: bigint;
  
  // Addresses
  lessor: string;
  lessee: string;
  
  // Status flags
  isRented: boolean;
  isDamaged: boolean;
  renterRequestedReturn: boolean;
  ownerConfirmedReturn: boolean;
  
  // Timing
  startTime: bigint;
  actualMinutes: bigint;
}

export interface FeeCalculation {
  totalRentalFee: bigint;
  deposit: bigint;
  remainingPayment: bigint;
  finalPaymentAmount: bigint;
}

export interface RentalActions {
  canRent: boolean;
  canCancel: boolean;
  canRequestReturn: boolean;
  canConfirmReturn: boolean;
  canSetActualUsage: boolean;
  canReportDamage: boolean;
  canCompleteRental: boolean;
}

class RentalContractService {
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
      [
        // Constructor
        {
          "type": "constructor",
          "inputs": [
            {"type": "string", "name": "_assetName"},
            {"type": "uint256", "name": "_rentalFeePerMinute"},
            {"type": "uint256", "name": "_durationMinutes"},
            {"type": "uint256", "name": "_insuranceFee"},
            {"type": "uint256", "name": "_insuranceCompensation"}
          ]
        },
        // State variables (public getters)
        {"type": "function", "name": "lessor", "constant": true, "inputs": [], "outputs": [{"type": "address"}]},
        {"type": "function", "name": "lessee", "constant": true, "inputs": [], "outputs": [{"type": "address"}]},
        {"type": "function", "name": "assetName", "constant": true, "inputs": [], "outputs": [{"type": "string"}]},
        {"type": "function", "name": "rentalFeePerMinute", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "durationMinutes", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "insuranceFee", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "insuranceCompensation", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "startTime", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "isRented", "constant": true, "inputs": [], "outputs": [{"type": "bool"}]},
        {"type": "function", "name": "isDamaged", "constant": true, "inputs": [], "outputs": [{"type": "bool"}]},
        {"type": "function", "name": "renterRequestedReturn", "constant": true, "inputs": [], "outputs": [{"type": "bool"}]},
        {"type": "function", "name": "ownerConfirmedReturn", "constant": true, "inputs": [], "outputs": [{"type": "bool"}]},
        {"type": "function", "name": "actualMinutes", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        
        // View functions
        {"type": "function", "name": "getTotalRentalFee", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "getDeposit", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "getRemainingPayment", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        {"type": "function", "name": "getFinalPaymentAmount", "constant": true, "inputs": [], "outputs": [{"type": "uint256"}]},
        
        // State-changing functions
        {"type": "function", "name": "rent", "constant": false, "payable": true, "inputs": [], "outputs": []},
        {"type": "function", "name": "cancelRental", "constant": false, "inputs": [], "outputs": []},
        {"type": "function", "name": "requestReturn", "constant": false, "inputs": [], "outputs": []},
        {"type": "function", "name": "confirmReturn", "constant": false, "inputs": [], "outputs": []},
        {"type": "function", "name": "setActualUsage", "constant": false, "inputs": [{"type": "uint256", "name": "_actualMinutes"}], "outputs": []},
        {"type": "function", "name": "reportDamage", "constant": false, "inputs": [], "outputs": []},
        {"type": "function", "name": "completeRental", "constant": false, "payable": true, "inputs": [], "outputs": []},
        
        // Events
        {"type": "event", "name": "RentalStarted", "inputs": [{"type": "address", "name": "lessee", "indexed": true}, {"type": "uint256", "name": "deposit", "indexed": false}]},
        {"type": "event", "name": "RentalCancelled", "inputs": [{"type": "address", "name": "lessee", "indexed": true}]},
        {"type": "event", "name": "RenterRequestedReturn", "inputs": [{"type": "address", "name": "lessee", "indexed": true}]},
        {"type": "event", "name": "OwnerConfirmedReturn", "inputs": [{"type": "address", "name": "lessor", "indexed": true}]},
        {"type": "event", "name": "ActualUsageSet", "inputs": [{"type": "uint256", "name": "minutesUsed", "indexed": false}]},
        {"type": "event", "name": "DamageReported", "inputs": [{"type": "address", "name": "lessor", "indexed": true}]},
        {"type": "event", "name": "FundsTransferred", "inputs": [{"type": "address", "name": "to", "indexed": true}, {"type": "uint256", "name": "amount", "indexed": false}]}
      ],
      this.signer
    );
  }

  // Get complete contract state
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
        isRented,
        isDamaged,
        renterRequestedReturn,
        ownerConfirmedReturn,
        startTime,
        actualMinutes
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
        this.contract.startTime(),
        this.contract.actualMinutes()
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
        startTime,
        actualMinutes
      };
    } catch (error) {
      console.error('Failed to get contract state:', error);
      throw error;
    }
  }

  // Get fee calculations
  async getFeeCalculation(): Promise<FeeCalculation> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalRentalFee, deposit, remainingPayment, finalPaymentAmount] = await Promise.all([
        this.contract.getTotalRentalFee(),
        this.contract.getDeposit(),
        this.contract.getRemainingPayment().catch(() => BigInt(0)), // May fail if not rented
        this.contract.getFinalPaymentAmount().catch(() => BigInt(0)) // May fail if not rented
      ]);

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

  // Determine what actions the current user can perform
  async getAvailableActions(): Promise<RentalActions> {
    if (!this.currentAccount || !this.contract) {
      return {
        canRent: false,
        canCancel: false,
        canRequestReturn: false,
        canConfirmReturn: false,
        canSetActualUsage: false,
        canReportDamage: false,
        canCompleteRental: false
      };
    }

    try {
      const state = await this.getContractState();
      const isLessor = state.lessor.toLowerCase() === this.currentAccount.toLowerCase();
      const isLessee = state.lessee.toLowerCase() === this.currentAccount.toLowerCase();

      return {
        canRent: !isLessor && !state.isRented,
        canCancel: isLessee && state.isRented,
        canRequestReturn: isLessee && state.isRented && !state.renterRequestedReturn,
        canConfirmReturn: isLessor && state.isRented && !state.ownerConfirmedReturn,
        canSetActualUsage: isLessor && state.isRented,
        canReportDamage: isLessor && state.isRented && !state.isDamaged,
        canCompleteRental: (isLessee || isLessor) && state.isRented && state.renterRequestedReturn && state.ownerConfirmedReturn
      };
    } catch (error) {
      console.error('Failed to get available actions:', error);
      return {
        canRent: false,
        canCancel: false,
        canRequestReturn: false,
        canConfirmReturn: false,
        canSetActualUsage: false,
        canReportDamage: false,
        canCompleteRental: false
      };
    }
  }

  // Contract interaction functions
  async rent(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const deposit = await this.contract.getDeposit();
      const depositInWei = deposit * BigInt(10**18); // Convert to wei
      
      const tx = await this.contract.rent({
        value: depositInWei
      });
      
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

  // Event listeners
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

  onActualUsageSet(callback: (actualMinutes: bigint) => void): void {
    if (!this.contract) return;
    this.contract.on('ActualUsageSet', callback);
  }

  onDamageReported(callback: (lessor: string) => void): void {
    if (!this.contract) return;
    this.contract.on('DamageReported', callback);
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

  // Utility functions
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

  getUserRole(state: RentalContractState): 'lessor' | 'lessee' | 'other' {
    if (!this.currentAccount) return 'other';
    
    const account = this.currentAccount.toLowerCase();
    if (state.lessor.toLowerCase() === account) return 'lessor';
    if (state.lessee.toLowerCase() === account) return 'lessee';
    return 'other';
  }

  getContractAddress(): string {
    return contractConfig.address;
  }

  // Format ETH values for display
  formatEther(value: bigint): string {
    return ethers.formatEther(value);
  }

  parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }
}

export const rentalContractService = new RentalContractService();

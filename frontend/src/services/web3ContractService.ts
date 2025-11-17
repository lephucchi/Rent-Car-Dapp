import { ethers } from 'ethers';

// Load contract ABI
import contractArtifact from '../../../smartcontract/artifacts/contracts/FixedRentalContract.sol/FixedRentalContract.json';

export class Web3ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum as any);
    this.signer = await this.provider.getSigner();
  }

  getContract(contractAddress: string) {
    if (!this.signer) {
      throw new Error('Web3 not initialized. Call initialize() first.');
    }
    return new ethers.Contract(contractAddress, contractArtifact.abi, this.signer);
  }

  /**
   * Start rental - pay deposit and call rent()
   */
  async startRental(contractAddress: string) {
    try {
      await this.initialize();
      const contract = this.getContract(contractAddress);

      // Get deposit amount
      const deposit = await contract.getDeposit();
      
      console.log('💰 Deposit required:', ethers.formatEther(deposit), 'ETH');

      // Call rent() with deposit value
      const tx = await contract.rent({ value: deposit });
      console.log('📤 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Rental started! Block:', receipt.blockNumber);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      console.error('❌ Rental failed:', error);
      throw new Error(error.message || 'Failed to start rental');
    }
  }

  /**
   * Request return
   */
  async requestReturn(contractAddress: string) {
    try {
      await this.initialize();
      const contract = this.getContract(contractAddress);

      const tx = await contract.requestReturn();
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to request return');
    }
  }

  /**
   * Confirm return (lessor only)
   */
  async confirmReturn(contractAddress: string) {
    try {
      await this.initialize();
      const contract = this.getContract(contractAddress);

      const tx = await contract.confirmReturn();
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to confirm return');
    }
  }

  /**
   * Complete rental - pay remaining amount
   */
  async completeRental(contractAddress: string) {
    try {
      await this.initialize();
      const contract = this.getContract(contractAddress);

      // Get final payment amount
      const finalPayment = await contract.getFinalPaymentAmount();
      
      console.log('💰 Final payment:', ethers.formatEther(finalPayment), 'ETH');

      const tx = await contract.completeRental({ value: finalPayment });
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete rental');
    }
  }

  /**
   * Report damage (lessor only)
   */
  async reportDamage(contractAddress: string) {
    try {
      await this.initialize();
      const contract = this.getContract(contractAddress);

      const tx = await contract.reportDamage();
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to report damage');
    }
  }

  /**
   * Get contract state
   */
  async getContractState(contractAddress: string) {
    try {
      await this.initialize();
      const contract = this.getContract(contractAddress);

      const [
        lessor,
        lessee,
        assetName,
        rentalFeePerMinute,
        durationMinutes,
        insuranceFee,
        isRented,
        isDamaged,
        startTime,
        actualMinutes
      ] = await Promise.all([
        contract.lessor(),
        contract.lessee(),
        contract.assetName(),
        contract.rentalFeePerMinute(),
        contract.durationMinutes(),
        contract.insuranceFee(),
        contract.isRented(),
        contract.isDamaged(),
        contract.startTime(),
        contract.actualMinutes()
      ]);

      return {
        lessor,
        lessee,
        assetName,
        rentalFeePerMinute: ethers.formatEther(rentalFeePerMinute),
        durationMinutes: Number(durationMinutes),
        insuranceFee: ethers.formatEther(insuranceFee),
        isRented,
        isDamaged,
        startTime: Number(startTime),
        actualMinutes: Number(actualMinutes)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get contract state');
    }
  }
}

export const web3ContractService = new Web3ContractService();
export default web3ContractService;

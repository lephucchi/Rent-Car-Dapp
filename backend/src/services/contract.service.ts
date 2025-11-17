import { ContractModel } from '../models/contract.model';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import BlockchainService from './blockchain.service';
import { Contract, CreateContractDto, ContractEvent } from '../types/contract.types';
import { NOT_FOUND, FORBIDDEN } from '../utils/constants';

export class ContractService {
  private static blockchainService = new BlockchainService();

  /**
   * Create and deploy a new rental contract
   */
  static async createContract(
    lessorId: string,
    contractData: CreateContractDto
  ): Promise<{
    contract: Contract;
    deployment: {
      contractAddress: string;
      transactionHash: string;
    };
  }> {
    // Check if car exists and belongs to lessor
    const car = await CarModel.findById(contractData.car_id);
    if (!car) {
      throw new Error('Car not found');
    }

    const belongsToLessor = await CarModel.belongsToLessor(contractData.car_id, lessorId);
    if (!belongsToLessor) {
      throw new Error(FORBIDDEN + ': Car does not belong to you');
    }

    // Check if car is available
    if (car.status !== 'available') {
      throw new Error('Car is not available for rental');
    }

    // Create contract in database
    const contract = await ContractModel.create({
      ...contractData,
      lessor_id: lessorId
    });

    try {
      // Deploy smart contract to blockchain
      const deployment = await this.blockchainService.deployRentalContract(
        `${car.model} - ${car.license_plate}`,
        contractData.rental_fee_per_day,
        contractData.duration_days,
        contractData.insurance_fee
      );

      // Update contract with blockchain details
      const updatedContract = await ContractModel.updateBlockchainDetails(
        contract.id,
        deployment.contractAddress,
        deployment.transactionHash
      );

      // Update car status to pending rental
      await CarModel.updateStatus(contractData.car_id, 'rented');

      return {
        contract: updatedContract,
        deployment: {
          contractAddress: deployment.contractAddress,
          transactionHash: deployment.transactionHash
        }
      };
    } catch (error: any) {
      // Rollback: Delete contract if blockchain deployment fails
      await ContractModel.cancel(contract.id);
      throw new Error(`Contract deployment failed: ${error.message}`);
    }
  }

  /**
   * Rent a car (start rental)
   */
  static async rentCar(
    contractId: string,
    lesseeId: string,
    lesseeWalletAddress: string
  ): Promise<{
    contract: Contract;
  }> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    if (contract.status !== 'pending') {
      throw new Error('Contract is not available for rental');
    }

    if (!contract.contract_address) {
      throw new Error('Blockchain contract not deployed');
    }

    // NOTE: Blockchain transaction is now handled by frontend via MetaMask
    // Backend just updates database state
    
    // Update contract in database
    const updatedContract = await ContractModel.startRental(contractId, lesseeId);

    console.log('✅ Contract rental started in database:', contractId);

    return {
      contract: updatedContract
    };
  }

  /**
   * Request return of car
   */
  static async requestReturn(contractId: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    if (contract.status !== 'active') {
      throw new Error('Contract is not active');
    }

    // Blockchain transaction is now handled by frontend via MetaMask
    // Backend only updates database
    const updatedContract = await ContractModel.requestReturn(contractId);
    return updatedContract;
  }

  /**
   * Confirm return of car (lessor)
   */
  static async confirmReturn(contractId: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    if (contract.status !== 'active') {
      throw new Error('Contract is not active');
    }

    // Blockchain transaction is now handled by frontend via MetaMask
    // Backend updates database: mark as confirmed AND complete the contract
    await ContractModel.confirmReturn(contractId);
    const updatedContract = await ContractModel.completeRental(contractId);
    
    // Update car status back to available
    await CarModel.updateStatus(contract.car_id, 'available');
    
    return updatedContract;
  }

  /**
   * Report damage
   */
  static async reportDamage(contractId: string, description?: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    // Blockchain transaction is now handled by frontend via MetaMask
    // Backend only updates database
    const updatedContract = await ContractModel.reportDamage(contractId, description);
    return updatedContract;
  }

  /**
   * Set actual usage days
   */
  static async setActualUsage(
    contractId: string,
    actualDays: number
  ): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    // Blockchain transaction is now handled by frontend via MetaMask
    // Backend only updates database
    const updatedContract = await ContractModel.setActualUsage(contractId, actualDays);
    return updatedContract;
  }

  /**
   * Complete rental
   */
  static async completeRental(
    contractId: string,
    userId: string,
    paymentAmount?: string
  ): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    if (contract.lessor_id !== userId && contract.lessee_id !== userId) {
      throw new Error(FORBIDDEN);
    }

    // Blockchain transaction is now handled by frontend via MetaMask
    // Backend only updates database
    const updatedContract = await ContractModel.completeRental(contractId);

    // Update car status back to available
    await CarModel.updateStatus(contract.car_id, 'available');

    return updatedContract;
  }

  /**
   * Cancel contract
   */
  static async cancelContract(contractId: string, userId: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    if (contract.lessor_id !== userId && contract.lessee_id !== userId) {
      throw new Error(FORBIDDEN);
    }

    if (contract.status === 'completed' || contract.status === 'cancelled') {
      throw new Error('Contract already finalized');
    }

    if (contract.contract_address && contract.status === 'active') {
      // Cancel on blockchain
      const result = await this.blockchainService.cancelRental(contract.contract_address);
      
      if (!result.success) {
        throw new Error(result.error || 'Cancel rental failed');
      }

      if (result.transactionHash) {
        await ContractModel.createEvent({
          contract_id: contractId,
          event_type: 'RentalCancelled',
          event_data: { cancelled_by: userId },
          transaction_hash: result.transactionHash,
          block_number: 0
        });
      }
    }

    // Update database
    const updatedContract = await ContractModel.cancel(contractId);

    // Update car status back to available
    await CarModel.updateStatus(contract.car_id, 'available');

    return updatedContract;
  }

  /**
   * Get contract by ID with details
   */
  static async getContractById(contractId: string): Promise<any> {
    const contract: any = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    // Get blockchain status if contract address exists
    if (contract.contract_address) {
      try {
        const blockchainStatus = await this.blockchainService.getContractStatus(
          contract.contract_address
        );
        contract.blockchainStatus = blockchainStatus;
      } catch (error) {
        console.error('Failed to get blockchain status:', error);
      }
    }

    // Get events
    contract.events = await ContractModel.getEventsByContract(contractId);

    return contract;
  }

  /**
   * Get contracts for lessor
   */
  static async getContractsByLessor(
    lessorId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Contract[]> {
    return await ContractModel.findByLessor(lessorId, limit, offset);
  }

  /**
   * Get contracts for lessee
   */
  static async getContractsByLessee(
    lesseeId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Contract[]> {
    return await ContractModel.findByLessee(lesseeId, limit, offset);
  }

  /**
   * Get contract events
   */
  static async getContractEvents(contractId: string): Promise<ContractEvent[]> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new Error(NOT_FOUND);
    }

    return await ContractModel.getEventsByContract(contractId);
  }

  /**
   * Get all active contracts
   */
  static async getActiveContracts(): Promise<Contract[]> {
    return await ContractModel.findActive();
  }
}

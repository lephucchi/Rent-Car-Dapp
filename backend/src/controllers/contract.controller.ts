import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ContractService } from '../services/contract.service';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import { SUCCESS_MESSAGES } from '../utils/constants';

export class ContractController {
  /**
   * Create a new contract
   */
  static async createContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const lessorId = req.user!.userId;
      const contractData = req.body;

      const result = await ContractService.createContract(lessorId, contractData);

      res.status(201).json(createSuccessResponse(
        result,
        'Contract created and deployed successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rent a car (start rental)
   */
  static async rentCar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;
      const lesseeId = req.user!.userId;
      const { wallet_address } = req.body;

      if (!wallet_address) {
        res.status(400).json(createErrorResponse(
          'Wallet address is required',
          'Validation failed'
        ));
        return;
      }

      const result = await ContractService.rentCar(contractId, lesseeId, wallet_address);

      res.status(200).json(createSuccessResponse(
        result,
        'Rental started successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request return
   */
  static async requestReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;

      const contract = await ContractService.requestReturn(contractId);

      res.status(200).json(createSuccessResponse(
        contract,
        'Return requested successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm return
   */
  static async confirmReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;

      const contract = await ContractService.confirmReturn(contractId);

      res.status(200).json(createSuccessResponse(
        contract,
        'Return confirmed successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Report damage
   */
  static async reportDamage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;
      const { description } = req.body;

      const contract = await ContractService.reportDamage(contractId, description);

      res.status(200).json(createSuccessResponse(
        contract,
        'Damage reported successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set actual usage
   */
  static async setActualUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;
      const { actual_days } = req.body;

      if (!actual_days || actual_days < 0) {
        res.status(400).json(createErrorResponse(
          'Invalid actual days',
          'Validation failed'
        ));
        return;
      }

      const contract = await ContractService.setActualUsage(contractId, actual_days);

      res.status(200).json(createSuccessResponse(
        contract,
        'Actual usage set successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete rental
   */
  static async completeRental(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;
      const userId = req.user!.userId;
      const { payment_amount } = req.body;

      const contract = await ContractService.completeRental(contractId, userId, payment_amount);

      res.status(200).json(createSuccessResponse(
        contract,
        'Rental completed successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel contract
   */
  static async cancelContract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;
      const userId = req.user!.userId;

      const contract = await ContractService.cancelContract(contractId, userId);

      res.status(200).json(createSuccessResponse(
        contract,
        'Contract cancelled successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contract by ID
   */
  static async getContractById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;

      const contract = await ContractService.getContractById(contractId);

      res.status(200).json(createSuccessResponse(contract));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my contracts (lessor)
   */
  static async getMyContracts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lessorId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const contracts = await ContractService.getContractsByLessor(lessorId, limit, offset);

      res.status(200).json(createSuccessResponse(contracts));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my rentals (lessee)
   */
  static async getMyRentals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lesseeId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const contracts = await ContractService.getContractsByLessee(lesseeId, limit, offset);

      res.status(200).json(createSuccessResponse(contracts));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contract events
   */
  static async getContractEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contractId } = req.params;

      const events = await ContractService.getContractEvents(contractId);

      res.status(200).json(createSuccessResponse(events));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all active contracts
   */
  static async getActiveContracts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contracts = await ContractService.getActiveContracts();

      res.status(200).json(createSuccessResponse(contracts));
    } catch (error) {
      next(error);
    }
  }
}

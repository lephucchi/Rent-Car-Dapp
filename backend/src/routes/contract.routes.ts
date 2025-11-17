import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticateToken, requireLessor } from '../middleware/auth.middleware';
import { validateUUID } from '../utils/validators';

const router = Router();

// ============ PUBLIC CONTRACT ROUTES ============

/**
 * @route GET /api/contracts/active
 * @desc Get all active contracts
 * @access Public
 */
router.get('/active', ContractController.getActiveContracts);

/**
 * @route GET /api/contracts/:contractId
 * @desc Get contract by ID
 * @access Authenticated
 */
router.get('/:contractId', authenticateToken, validateUUID, ContractController.getContractById);

/**
 * @route GET /api/contracts/:contractId/events
 * @desc Get contract events
 * @access Authenticated
 */
router.get('/:contractId/events', authenticateToken, validateUUID, ContractController.getContractEvents);

// ============ LESSOR ROUTES ============

/**
 * @route POST /api/contracts
 * @desc Create new contract
 * @access Lessor
 */
router.post('/', authenticateToken, requireLessor, ContractController.createContract);

/**
 * @route GET /api/contracts/my/contracts
 * @desc Get lessor's contracts (returns empty array if user is not a lessor)
 * @access Authenticated
 */
router.get('/my/contracts', authenticateToken, ContractController.getMyContracts);

/**
 * @route POST /api/contracts/:contractId/confirm-return
 * @desc Confirm return of car
 * @access Lessor
 */
router.post('/:contractId/confirm-return', authenticateToken, requireLessor, validateUUID, ContractController.confirmReturn);

/**
 * @route POST /api/contracts/:contractId/report-damage
 * @desc Report damage
 * @access Lessor
 */
router.post('/:contractId/report-damage', authenticateToken, requireLessor, validateUUID, ContractController.reportDamage);

/**
 * @route POST /api/contracts/:contractId/set-usage
 * @desc Set actual usage days
 * @access Lessor
 */
router.post('/:contractId/set-usage', authenticateToken, requireLessor, validateUUID, ContractController.setActualUsage);

// ============ RENTER ROUTES ============

/**
 * @route GET /api/contracts/my/rentals
 * @desc Get renter's contracts
 * @access Authenticated
 */
router.get('/my/rentals', authenticateToken, ContractController.getMyRentals);

/**
 * @route POST /api/contracts/:contractId/rent
 * @desc Start rental (rent a car)
 * @access Authenticated
 */
router.post('/:contractId/rent', authenticateToken, validateUUID, ContractController.rentCar);

/**
 * @route POST /api/contracts/:contractId/request-return
 * @desc Request return of car
 * @access Authenticated
 */
router.post('/:contractId/request-return', authenticateToken, validateUUID, ContractController.requestReturn);

// ============ SHARED ROUTES ============

/**
 * @route POST /api/contracts/:contractId/complete
 * @desc Complete rental
 * @access Authenticated (Lessor or Lessee)
 */
router.post('/:contractId/complete', authenticateToken, validateUUID, ContractController.completeRental);

/**
 * @route POST /api/contracts/:contractId/cancel
 * @desc Cancel contract
 * @access Authenticated (Lessor or Lessee)
 */
router.post('/:contractId/cancel', authenticateToken, validateUUID, ContractController.cancelContract);

export default router;

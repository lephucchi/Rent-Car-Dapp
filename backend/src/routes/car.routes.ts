import { Router } from 'express';
import { CarController } from '../controllers/car.controller';
import { authenticateToken, requireLessor, optionalAuth } from '../middleware/auth.middleware';
import {
  validateCreateCar,
  validateUpdateCar,
  validateUUID,
  validateCarSearch
} from '../utils/validators';

const router = Router();

// ============ PUBLIC CAR ROUTES ============

/**
 * @route GET /api/cars
 * @desc Get all available cars
 * @access Public
 */
router.get('/', CarController.getAvailableCars);

/**
 * @route GET /api/cars/search
 * @desc Search cars with filters
 * @access Public
 */
router.get('/search', validateCarSearch, CarController.searchCars);

/**
 * @route GET /api/cars/popular
 * @desc Get popular cars
 * @access Public
 */
router.get('/popular', CarController.getPopularCars);

/**
 * @route GET /api/cars/:id
 * @desc Get car by ID
 * @access Public
 */
router.get('/:id', validateUUID, CarController.getCarById);

/**
 * @route GET /api/cars/:id/availability
 * @desc Check car availability
 * @access Public
 */
router.get('/:id/availability', validateUUID, CarController.checkAvailability);

/**
 * @route GET /api/cars/lessor/:lessorId
 * @desc Get cars by lessor ID
 * @access Public
 */
router.get('/lessor/:lessorId', validateUUID, CarController.getCarsByLessor);

// ============ LESSOR CAR ROUTES ============

/**
 * @route POST /api/cars
 * @desc Create new car
 * @access Lessor
 */
router.post('/', authenticateToken, requireLessor, validateCreateCar, CarController.createCar);

/**
 * @route GET /api/cars/my/cars
 * @desc Get current lessor's cars
 * @access Lessor
 */
router.get('/my/cars', authenticateToken, requireLessor, CarController.getMyCars);

/**
 * @route GET /api/cars/my/stats
 * @desc Get car statistics for current lessor
 * @access Lessor
 */
router.get('/my/stats', authenticateToken, requireLessor, CarController.getCarStats);

/**
 * @route PUT /api/cars/:id
 * @desc Update car
 * @access Lessor (owner only)
 */
router.put('/:id', authenticateToken, requireLessor, validateUUID, validateUpdateCar, CarController.updateCar);

/**
 * @route DELETE /api/cars/:id
 * @desc Delete car
 * @access Lessor (owner only)
 */
router.delete('/:id', authenticateToken, requireLessor, validateUUID, CarController.deleteCar);

/**
 * @route PATCH /api/cars/:id/status
 * @desc Update car status
 * @access Lessor (owner only)
 */
router.patch('/:id/status', authenticateToken, requireLessor, validateUUID, CarController.updateCarStatus);

/**
 * @route POST /api/cars/:id/images
 * @desc Upload car images
 * @access Lessor (owner only)
 */
router.post('/:id/images', authenticateToken, requireLessor, validateUUID, CarController.uploadImages);

export default router;

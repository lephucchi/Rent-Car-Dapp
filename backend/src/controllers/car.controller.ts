import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CarService } from '../services/car.service';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import { SUCCESS_MESSAGES } from '../utils/constants';

export class CarController {
  /**
   * Create new car
   */
  static async createCar(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const carData = req.body;

      // Validate car data
      const validationErrors = CarService.validateCarData(carData);
      if (validationErrors.length > 0) {
        res.status(400).json(createErrorResponse(
          validationErrors.join(', '),
          'Car data validation failed'
        ));
        return;
      }

      const car = await CarService.createCar(lessorId, carData);

      res.status(201).json(createSuccessResponse(
        car,
        SUCCESS_MESSAGES.CAR_CREATED
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get car by ID
   */
  static async getCarById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const car = await CarService.getCarById(id);

      res.status(200).json(createSuccessResponse(car));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update car
   */
  static async updateCar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const { id } = req.params;
      const lessorId = req.user!.userId;
      const updateData = req.body;

      // Validate car data
      const validationErrors = CarService.validateCarData(updateData);
      if (validationErrors.length > 0) {
        res.status(400).json(createErrorResponse(
          validationErrors.join(', '),
          'Car data validation failed'
        ));
        return;
      }

      const updatedCar = await CarService.updateCar(id, lessorId, updateData);

      res.status(200).json(createSuccessResponse(
        updatedCar,
        SUCCESS_MESSAGES.CAR_UPDATED
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete car
   */
  static async deleteCar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lessorId = req.user!.userId;

      await CarService.deleteCar(id, lessorId);

      res.status(200).json(createSuccessResponse(
        null,
        'Car deleted successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cars by current lessor
   */
  static async getMyCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lessorId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CarService.getCarsByLessor(lessorId, page, limit);

      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available cars
   */
  static async getAvailableCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CarService.getAvailableCars(page, limit);

      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search cars with filters
   */
  static async searchCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const searchQuery = {
        location: req.query.location as string,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        model: req.query.model as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort_by: req.query.sort_by as any
      };

      const result = await CarService.searchCars(searchQuery);

      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update car status
   */
  static async updateCarStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const lessorId = req.user!.userId;

      if (!['available', 'rented', 'maintenance'].includes(status)) {
        res.status(400).json(createErrorResponse(
          'Invalid status. Must be: available, rented, or maintenance',
          'Validation failed'
        ));
        return;
      }

      const updatedCar = await CarService.updateCarStatus(id, status, lessorId);

      res.status(200).json(createSuccessResponse(
        updatedCar,
        'Car status updated successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload car images
   */
  static async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lessorId = req.user!.userId;

      // TODO: Implement file upload handling
      // For now, expecting image URLs in request body
      const { images } = req.body;

      if (!Array.isArray(images)) {
        res.status(400).json(createErrorResponse(
          'Images must be an array of URLs',
          'Validation failed'
        ));
        return;
      }

      const updatedCar = await CarService.updateCarImages(id, lessorId, images);

      res.status(200).json(createSuccessResponse(
        updatedCar,
        'Car images updated successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check car availability
   */
  static async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const availability = await CarService.checkAvailability(id);

      res.status(200).json(createSuccessResponse(availability));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular cars
   */
  static async getPopularCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const cars = await CarService.getPopularCars(limit);

      res.status(200).json(createSuccessResponse(cars));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get car statistics for lessor
   */
  static async getCarStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lessorId = req.user!.userId;
      
      const stats = await CarService.getCarStats(lessorId);

      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cars by lessor ID (public)
   */
  static async getCarsByLessor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CarService.getCarsByLessor(lessorId, page, limit);

      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

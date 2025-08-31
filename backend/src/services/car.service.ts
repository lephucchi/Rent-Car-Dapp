import { CarModel, CreateCarData, CarSearchParams } from '../models/car.model';
import { Car, CreateCarDto, UpdateCarDto, CarSearchQuery } from '../types/car.types';
import { calculatePagination } from '../utils/helpers';
import { CAR_NOT_AVAILABLE, NOT_FOUND, FORBIDDEN } from '../utils/constants';

export class CarService {
  /**
   * Create new car
   */
  static async createCar(lessorId: string, carData: CreateCarDto): Promise<Car> {
    // Check if license plate already exists
    const licensePlateExists = await CarModel.licensePlateExists(carData.license_plate);
    if (licensePlateExists) {
      throw new Error('License plate already exists');
    }

    const createCarData: CreateCarData = {
      ...carData,
      lessor_id: lessorId
    };

    return await CarModel.create(createCarData);
  }

  /**
   * Get car by ID
   */
  static async getCarById(id: string): Promise<Car> {
    const car = await CarModel.findById(id);
    if (!car) {
      throw new Error(NOT_FOUND);
    }
    return car;
  }

  /**
   * Update car
   */
  static async updateCar(carId: string, lessorId: string, updateData: UpdateCarDto): Promise<Car> {
    // Check if car belongs to lessor
    const belongsToLessor = await CarModel.belongsToLessor(carId, lessorId);
    if (!belongsToLessor) {
      throw new Error(FORBIDDEN);
    }

    // Check license plate uniqueness if being updated
    if (updateData.license_plate) {
      const licensePlateExists = await CarModel.licensePlateExists(updateData.license_plate, carId);
      if (licensePlateExists) {
        throw new Error('License plate already exists');
      }
    }

    return await CarModel.updateById(carId, updateData);
  }

  /**
   * Delete car
   */
  static async deleteCar(carId: string, lessorId: string): Promise<void> {
    // Check if car belongs to lessor
    const belongsToLessor = await CarModel.belongsToLessor(carId, lessorId);
    if (!belongsToLessor) {
      throw new Error(FORBIDDEN);
    }

    // Check if car is currently rented
    const car = await CarModel.findById(carId);
    if (car?.status === 'rented') {
      throw new Error('Cannot delete car that is currently rented');
    }

    await CarModel.deleteById(carId);
  }

  /**
   * Get cars by lessor
   */
  static async getCarsByLessor(
    lessorId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    cars: Car[],
    total: number,
    totalPages: number,
    currentPage: number
  }> {
    const { offset } = calculatePagination(page, limit);
    const cars = await CarModel.findByLessorId(lessorId, limit, offset);
    const total = await CarModel.countByLessor(lessorId);

    return {
      cars,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  /**
   * Get available cars
   */
  static async getAvailableCars(
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    cars: Car[],
    total: number,
    totalPages: number,
    currentPage: number
  }> {
    const { offset } = calculatePagination(page, limit);
    const cars = await CarModel.findAvailable(limit, offset);
    
    // Get total count of available cars
    const { total } = await CarModel.search({ 
      limit: 1, 
      offset: 0 
    });

    return {
      cars,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  /**
   * Search cars with filters
   */
  static async searchCars(searchQuery: CarSearchQuery): Promise<{
    cars: Car[],
    total: number,
    totalPages: number,
    currentPage: number,
    filters: CarSearchQuery
  }> {
    const page = searchQuery.page || 1;
    const limit = Math.min(searchQuery.limit || 10, 100); // Max 100 items
    const { offset } = calculatePagination(page, limit);

    const searchParams: CarSearchParams = {
      ...searchQuery,
      limit,
      offset,
      sort_order: searchQuery.sort_by?.includes('desc') ? 'desc' : 'asc'
    };

    const { cars, total } = await CarModel.search(searchParams);

    return {
      cars,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      filters: searchQuery
    };
  }

  /**
   * Update car status
   */
  static async updateCarStatus(
    carId: string, 
    status: 'available' | 'rented' | 'maintenance',
    lessorId?: string
  ): Promise<Car> {
    // If lessorId provided, check ownership
    if (lessorId) {
      const belongsToLessor = await CarModel.belongsToLessor(carId, lessorId);
      if (!belongsToLessor) {
        throw new Error(FORBIDDEN);
      }
    }

    return await CarModel.updateStatus(carId, status);
  }

  /**
   * Update car images
   */
  static async updateCarImages(
    carId: string, 
    lessorId: string, 
    images: string[]
  ): Promise<Car> {
    // Check if car belongs to lessor
    const belongsToLessor = await CarModel.belongsToLessor(carId, lessorId);
    if (!belongsToLessor) {
      throw new Error(FORBIDDEN);
    }

    return await CarModel.updateImages(carId, images);
  }

  /**
   * Check car availability for rental
   */
  static async checkAvailability(carId: string): Promise<{
    available: boolean,
    car: Car | null,
    reason?: string
  }> {
    const car = await CarModel.findById(carId);
    
    if (!car) {
      return {
        available: false,
        car: null,
        reason: 'Car not found'
      };
    }

    if (car.status !== 'available') {
      return {
        available: false,
        car,
        reason: `Car is currently ${car.status}`
      };
    }

    return {
      available: true,
      car
    };
  }

  /**
   * Get popular cars
   */
  static async getPopularCars(limit: number = 10): Promise<Car[]> {
    return await CarModel.getPopular(limit);
  }

  /**
   * Get car statistics for lessor
   */
  static async getCarStats(lessorId: string): Promise<{
    total: number,
    available: number,
    rented: number,
    maintenance: number
  }> {
    const cars = await CarModel.findByLessorId(lessorId, 1000, 0); // Get all cars
    
    const stats = {
      total: cars.length,
      available: 0,
      rented: 0,
      maintenance: 0
    };

    cars.forEach(car => {
      switch (car.status) {
        case 'available':
          stats.available++;
          break;
        case 'rented':
          stats.rented++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
      }
    });

    return stats;
  }

  /**
   * Validate car data
   */
  static validateCarData(carData: CreateCarDto | UpdateCarDto): string[] {
    const errors: string[] = [];

    if ('year' in carData && carData.year) {
      const currentYear = new Date().getFullYear();
      if (carData.year < 1900 || carData.year > currentYear + 2) {
        errors.push('Invalid car year');
      }
    }

    if ('rental_fee_per_day' in carData && carData.rental_fee_per_day !== undefined) {
      if (carData.rental_fee_per_day <= 0) {
        errors.push('Rental fee must be positive');
      }
    }

    if ('insurance_fee' in carData && carData.insurance_fee !== undefined) {
      if (carData.insurance_fee < 0) {
        errors.push('Insurance fee cannot be negative');
      }
    }

    return errors;
  }
}

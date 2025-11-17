const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface Car {
  id: string;
  lessor_id: string;
  model: string;
  year: number;
  license_plate: string;
  location: string;
  rental_fee_per_day: number;
  insurance_fee: number;
  status: 'available' | 'rented' | 'maintenance';
  description?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCarData {
  model: string;
  year: number;
  license_plate: string;
  location: string;
  rental_fee_per_day: number;
  insurance_fee: number;
  description?: string;
  images?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class CarService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }
    
    return data;
  }

  private getAuthHeaders(): HeadersInit {
    // Always get fresh token from localStorage
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Get all available cars
   */
  async getAvailableCars(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    cars: Car[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/cars?page=${page}&limit=${limit}`);
    return this.handleResponse(response);
  }

  /**
   * Get car by ID
   */
  async getCar(carId: string): Promise<ApiResponse<Car>> {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`);
    return this.handleResponse(response);
  }

  /**
   * Create new car
   */
  async createCar(carData: CreateCarData): Promise<ApiResponse<Car>> {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(carData),
    });

    return this.handleResponse(response);
  }

  /**
   * Update car
   */
  async updateCar(carId: string, carData: Partial<CreateCarData>): Promise<ApiResponse<Car>> {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(carData),
    });

    return this.handleResponse(response);
  }

  /**
   * Delete car
   */
  async deleteCar(carId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get my cars
   */
  async getMyCars(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    cars: Car[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    const response = await fetch(
      `${API_BASE_URL}/cars/my/cars?page=${page}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );

    return this.handleResponse(response);
  }

  /**
   * Search cars
   */
  async searchCars(params: {
    location?: string;
    min_price?: number;
    max_price?: number;
    year?: number;
    model?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    cars: Car[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/cars/search?${queryParams}`);
    return this.handleResponse(response);
  }

  /**
   * Check car availability
   */
  async checkAvailability(carId: string): Promise<ApiResponse<{
    available: boolean;
    car: Car | null;
    reason?: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/availability`);
    return this.handleResponse(response);
  }

  /**
   * Update car status
   */
  async updateCarStatus(
    carId: string,
    status: 'available' | 'rented' | 'maintenance'
  ): Promise<ApiResponse<Car>> {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse(response);
  }

  /**
   * Get popular cars
   */
  async getPopularCars(limit: number = 10): Promise<ApiResponse<Car[]>> {
    const response = await fetch(`${API_BASE_URL}/cars/popular?limit=${limit}`);
    return this.handleResponse(response);
  }

  /**
   * Get car stats (for lessor)
   */
  async getCarStats(): Promise<ApiResponse<{
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/cars/my/stats`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }
}

export const carService = new CarService();
export default carService;

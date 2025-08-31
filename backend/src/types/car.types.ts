export type CarStatus = 'available' | 'rented' | 'maintenance';

export interface Car {
  id: string;
  lessor_id: string;
  name: string;
  model: string;
  year: number;
  license_plate: string;
  rental_fee_per_day: number;
  insurance_fee: number;
  description?: string;
  images: string[];
  status: CarStatus;
  location?: string;
  features: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateCarDto {
  name: string;
  model: string;
  year: number;
  license_plate: string;
  rental_fee_per_day: number;
  insurance_fee: number;
  description?: string;
  location?: string;
  features?: Record<string, any>;
}

export interface UpdateCarDto {
  name?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  rental_fee_per_day?: number;
  insurance_fee?: number;
  description?: string;
  location?: string;
  features?: Record<string, any>;
  status?: CarStatus;
}

export interface CarSearchQuery {
  location?: string;
  min_price?: number;
  max_price?: number;
  year?: number;
  model?: string;
  page?: number;
  limit?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'year_desc' | 'created_desc';
}

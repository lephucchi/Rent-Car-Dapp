import { supabaseAdmin } from '../config/database';
import { Car, CreateCarDto, UpdateCarDto, CarSearchQuery } from '../types/car.types';

// Database-specific types
export interface CreateCarData extends CreateCarDto {
  lessor_id: string;
}

export interface UpdateCarData extends Partial<UpdateCarDto> {
  updated_at?: string;
}

export interface CarSearchParams extends CarSearchQuery {
  limit: number;
  offset: number;
  name?: string;
  sort_order?: 'asc' | 'desc';
}

export class CarModel {
  /**
   * Create new car
   */
  static async create(carData: CreateCarData): Promise<Car> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .insert([{
        ...carData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create car: ${error.message}`);
    }

    return data;
  }

  /**
   * Find car by ID
   */
  static async findById(id: string): Promise<Car | null> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select(`
        *,
        lessor:lessor_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find car: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Find cars by lessor ID
   */
  static async findByLessorId(lessorId: string, limit: number = 10, offset: number = 0): Promise<Car[]> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('*')
      .eq('lessor_id', lessorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch cars: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find available cars
   */
  static async findAvailable(limit: number = 10, offset: number = 0): Promise<Car[]> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select(`
        *,
        lessor:lessor_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch available cars: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Search cars with filters
   */
  static async search(params: CarSearchParams): Promise<{ cars: Car[], total: number }> {
    let query = supabaseAdmin
      .from('cars')
      .select(`
        *,
        lessor:lessor_id (
          id,
          full_name,
          email,
          phone
        )
      `, { count: 'exact' })
      .eq('status', 'available');

    // Apply filters
    if (params.location) {
      query = query.ilike('location', `%${params.location}%`);
    }

    if (params.min_price !== undefined) {
      query = query.gte('rental_fee_per_day', params.min_price);
    }

    if (params.max_price !== undefined) {
      query = query.lte('rental_fee_per_day', params.max_price);
    }

    if (params.year) {
      query = query.eq('year', params.year);
    }

    if (params.model) {
      query = query.ilike('model', `%${params.model}%`);
    }

    if (params.name) {
      query = query.ilike('name', `%${params.name}%`);
    }

    // Apply sorting
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortBy, sortOrder);

    // Apply pagination
    query = query.range(params.offset, params.offset + params.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to search cars: ${error.message}`);
    }

    return {
      cars: data || [],
      total: count || 0
    };
  }

  /**
   * Update car by ID
   */
  static async updateById(id: string, updateData: UpdateCarData): Promise<Car> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update car: ${error.message}`);
    }

    return data;
  }

  /**
   * Update car status
   */
  static async updateStatus(id: string, status: 'available' | 'rented' | 'maintenance'): Promise<Car> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update car status: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete car by ID
   */
  static async deleteById(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete car: ${error.message}`);
    }
  }

  /**
   * Check if car belongs to lessor
   */
  static async belongsToLessor(carId: string, lessorId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('id')
      .eq('id', carId)
      .eq('lessor_id', lessorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check car ownership: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Check if car is available for rent
   */
  static async isAvailable(id: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('status')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to check car availability: ${error.message}`);
    }

    return data?.status === 'available';
  }

  /**
   * Check if license plate exists
   */
  static async licensePlateExists(licensePlate: string, excludeId?: string): Promise<boolean> {
    let query = supabaseAdmin
      .from('cars')
      .select('id')
      .eq('license_plate', licensePlate);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check license plate: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Get cars count by lessor
   */
  static async countByLessor(lessorId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('lessor_id', lessorId);

    if (error) {
      throw new Error(`Failed to count cars: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get popular cars (most rented)
   */
  static async getPopular(limit: number = 10): Promise<Car[]> {
    // This would require joining with contracts table to count rentals
    // For now, return recent cars
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select(`
        *,
        lessor:lessor_id (
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch popular cars: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update car images
   */
  static async updateImages(id: string, images: string[]): Promise<Car> {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .update({
        images,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update car images: ${error.message}`);
    }

    return data;
  }
}

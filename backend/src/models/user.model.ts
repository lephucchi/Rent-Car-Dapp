import { supabaseAdmin, supabaseAnon } from '../config/database';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

// Database-specific types
export interface CreateUserData extends Omit<CreateUserDto, 'password'> {
  password_hash: string;
  verification_token?: string;
}

export interface UpdateUserData extends UpdateUserDto {
  password_hash?: string;
  is_verified?: boolean;
  verification_token?: string | null;
}

// Partial User type for limited selection
export interface UserSummary {
  id: string;
  full_name: string;
  email: string;
}

export class UserModel {
  /**
   * Create new user
   */
  static async create(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Find user by verification token
   */
  static async findByVerificationToken(token: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Find user by wallet address
   */
  static async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Update user by ID
   */
  static async updateById(id: string, updateData: UpdateUserData): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  /**
   * Verify user email
   */
  static async verifyEmail(id: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to verify user: ${error.message}`);
    }

    return data;
  }

  /**
   * Update password
   */
  static async updatePassword(id: string, passwordHash: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }

    return data;
  }

  /**
   * Link wallet address
   */
  static async linkWallet(id: string, walletAddress: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        wallet_address: walletAddress.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to link wallet: ${error.message}`);
    }

    return data;
  }

  /**
   * Get users by type
   */
  static async findByType(userType: string, limit: number = 10, offset: number = 0): Promise<Partial<User>[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, user_type, is_verified, created_at')
      .eq('user_type', userType)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get available damage assessors
   */
  static async getAvailableDamageAssessors(): Promise<UserSummary[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('user_type', 'insurance')
      .eq('is_verified', true)
      .order('full_name');

    if (error) {
      throw new Error(`Failed to fetch damage assessors: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get user count by type
   */
  static async countByType(userType: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', userType)
      .eq('is_verified', true);

    if (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  static async softDelete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: false,
        email: `deleted_${Date.now()}_${Math.random().toString(36).substring(2)}@deleted.com`,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check email: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Check if wallet address exists
   */
  static async walletExists(walletAddress: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check wallet: ${error.message}`);
    }

    return !!data;
  }
}

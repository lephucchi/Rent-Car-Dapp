export type UserType = 'renter' | 'lessor' | 'insurance' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  phone?: string;
  address?: string;
  wallet_address?: string;
  user_type: UserType;
  is_verified: boolean;
  verification_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  wallet_address?: string;
  user_type: UserType;
}

export interface UpdateUserDto {
  full_name?: string;
  phone?: string;
  address?: string;
  wallet_address?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { APP_CONFIG } from './constants';

export const createSuccessResponse = <T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  error: string,
  message: string = 'Error occurred'
): ApiResponse<null> => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString(),
});

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): PaginatedResponse<T> => ({
  success: true,
  message,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
  timestamp: new Date().toISOString(),
});

export const calculatePagination = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: Math.min(limit, 100) }; // Max 100 items per page
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Generate random token for verification/reset
 */
export const generateRandomToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Vietnamese phone number
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ============ AUTHENTICATION UTILITIES ============

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, APP_CONFIG.BCRYPT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: object, expiresIn: string = APP_CONFIG.JWT_EXPIRY): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, process.env.JWT_SECRET as string, { 
    expiresIn: expiresIn as any,
    algorithm: 'HS256'
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

// ============ BLOCKCHAIN UTILITIES ============

/**
 * Format ethereum address
 */
export const formatEthAddress = (address: string): string => {
  if (!address) return '';
  return address.toLowerCase();
};

/**
 * Validate ethereum address format
 */
export const isValidEthAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Convert Wei to Ether (for display purposes)
 */
export const weiToEther = (wei: bigint): number => {
  return Number(wei) / Math.pow(10, 18);
};

/**
 * Convert Ether to Wei
 */
export const etherToWei = (ether: number): bigint => {
  return BigInt(Math.floor(ether * Math.pow(10, 18)));
};

// ============ RENTAL CALCULATION UTILITIES ============

/**
 * Calculate rental deposit (30% of total cost)
 */
export const calculateDeposit = (rentalFeePerDay: number, durationDays: number, insuranceFee: number): number => {
  const totalCost = (rentalFeePerDay * durationDays) + insuranceFee;
  return totalCost * 0.30;
};

/**
 * Calculate total rental cost
 */
export const calculateTotalCost = (rentalFeePerDay: number, durationDays: number, insuranceFee: number): number => {
  return (rentalFeePerDay * durationDays) + insuranceFee;
};

/**
 * Format currency to 2 decimal places
 */
export const formatCurrency = (amount: number): string => {
  return Number(amount).toFixed(2);
};

/**
 * Generate contract deployment transaction data
 */
export const generateContractParams = (
  assetName: string,
  rentalFeePerDay: number,
  durationDays: number,
  insuranceFee: number,
  damageAssessorAddress: string
) => {
  return {
    assetName,
    rentalFeePerDay: Math.floor(rentalFeePerDay * 100), // Convert to wei-like format
    durationDays,
    insuranceFee: Math.floor(insuranceFee * 100),
    damageAssessorAddress
  };
};

// ============ FILE UPLOAD UTILITIES ============

/**
 * Validate file type for uploads
 */
export const isValidImageType = (mimetype: string): boolean => {
  return APP_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimetype);
};

/**
 * Generate unique filename for uploads
 */
export const generateUniqueFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2);
  const extension = originalname.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

// ============ AUTHORIZATION UTILITIES ============

/**
 * Check if user has required role
 */
export const hasRole = (userType: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userType);
};

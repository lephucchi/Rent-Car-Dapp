// Application Constants
export const APP_CONFIG = {
  JWT_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  BCRYPT_ROUNDS: 12,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

export const USER_TYPES = {
  RENTER: 'renter',
  LESSOR: 'lessor',
  INSURANCE: 'insurance',
  ADMIN: 'admin',
} as const;

export const CAR_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
} as const;

export const CONTRACT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CONTRACT_EVENTS = {
  RENTAL_STARTED: 'RentalStarted',
  RENTAL_CANCELLED: 'RentalCancelled',
  DAMAGE_REPORTED: 'DamageReported',
  FUNDS_TRANSFERRED: 'FundsTransferred',
  RENTER_REQUESTED_RETURN: 'RenterRequestedReturn',
  OWNER_CONFIRMED_RETURN: 'OwnerConfirmedReturn',
  ACTUAL_USAGE_SET: 'ActualUsageSet',
  DAMAGE_ASSESSED: 'DamageAssessed',
} as const;

export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  CARS: '/api/cars',
  CONTRACTS: '/api/contracts',
  BLOCKCHAIN: '/api/blockchain',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  CAR_NOT_AVAILABLE: 'Car is not available for rent',
  CONTRACT_NOT_FOUND: 'Contract not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
} as const;

// Export individual constants for easier importing
export const { 
  EMAIL_EXISTS, 
  INVALID_CREDENTIALS, 
  UNAUTHORIZED, 
  FORBIDDEN, 
  NOT_FOUND, 
  VALIDATION_ERROR, 
  INTERNAL_ERROR,
  CAR_NOT_AVAILABLE,
  CONTRACT_NOT_FOUND,
  INSUFFICIENT_PERMISSIONS
} = ERROR_MESSAGES;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_VERIFIED: 'User verified successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  CAR_CREATED: 'Car created successfully',
  CAR_UPDATED: 'Car updated successfully',
  CONTRACT_CREATED: 'Contract created successfully',
  CONTRACT_UPDATED: 'Contract updated successfully',
} as const;

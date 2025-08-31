import { body, param, query, ValidationChain } from 'express-validator';
import { USER_TYPES, CAR_STATUS, CONTRACT_STATUS } from './constants';

// ============ AUTH VALIDATORS ============

export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Please provide a valid Vietnamese phone number'),
  
  body('user_type')
    .isIn(Object.values(USER_TYPES))
    .withMessage('Invalid user type'),
  
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must be less than 255 characters'),
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateForgotPassword: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

export const validateResetPassword: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// ============ USER VALIDATORS ============

export const validateUpdateProfile: ValidationChain[] = [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Please provide a valid Vietnamese phone number'),
  
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must be less than 255 characters'),
];

export const validateLinkWallet: ValidationChain[] = [
  body('wallet_address')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Please provide a valid Ethereum wallet address'),
];

// ============ CAR VALIDATORS ============

export const validateCreateCar: ValidationChain[] = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Car name must be between 2 and 100 characters'),
  
  body('model')
    .isLength({ min: 2, max: 50 })
    .withMessage('Car model must be between 2 and 50 characters'),
  
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Please provide a valid car year'),
  
  body('license_plate')
    .matches(/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/)
    .withMessage('Please provide a valid Vietnamese license plate (e.g., 30A-12345)'),
  
  body('rental_fee_per_day')
    .isFloat({ min: 0.01 })
    .withMessage('Rental fee per day must be a positive number'),
  
  body('insurance_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Insurance fee must be a non-negative number'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('location')
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),
  
  body('features')
    .optional()
    .isJSON()
    .withMessage('Features must be a valid JSON object'),
];

export const validateUpdateCar: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid car ID'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Car name must be between 2 and 100 characters'),
  
  body('model')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Car model must be between 2 and 50 characters'),
  
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Please provide a valid car year'),
  
  body('rental_fee_per_day')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Rental fee per day must be a positive number'),
  
  body('insurance_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Insurance fee must be a non-negative number'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('location')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(CAR_STATUS))
    .withMessage('Invalid car status'),
];

// ============ CONTRACT VALIDATORS ============

export const validateCreateContract: ValidationChain[] = [
  body('car_id')
    .isUUID()
    .withMessage('Invalid car ID'),
  
  body('damage_assessor_id')
    .optional()
    .isUUID()
    .withMessage('Invalid damage assessor ID'),
  
  body('duration_days')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

export const validateUpdateContract: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid contract ID'),
  
  body('actual_days')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Actual days must be a non-negative integer'),
  
  body('assessed_damage_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Damage amount must be a non-negative number'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

// ============ COMMON VALIDATORS ============

export const validateUUID: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateCarSearch: ValidationChain[] = [
  ...validatePagination,
  
  query('location')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),
  
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),
  
  query('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Please provide a valid year'),
  
  query('model')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters'),
];

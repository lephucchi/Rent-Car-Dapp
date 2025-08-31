import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../utils/helpers';
import { VALIDATION_ERROR, INTERNAL_ERROR } from '../utils/constants';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Determine error type and status code
  let statusCode = 500;
  let message = error.message || INTERNAL_ERROR;

  // Handle specific error types
  if (error.message?.includes('User not found') || 
      error.message?.includes('Car not found') ||
      error.message?.includes('Contract not found')) {
    statusCode = 404;
  } else if (error.message?.includes('Email already exists') ||
             error.message?.includes('Wallet address already linked') ||
             error.message?.includes('License plate already exists')) {
    statusCode = 409; // Conflict
  } else if (error.message?.includes('Invalid credentials') ||
             error.message?.includes('Unauthorized') ||
             error.message?.includes('Invalid token')) {
    statusCode = 401;
  } else if (error.message?.includes('Forbidden') ||
             error.message?.includes('Access denied') ||
             error.message?.includes('Insufficient permissions')) {
    statusCode = 403;
  } else if (error.message?.includes('validation') ||
             error.message?.includes('Invalid') ||
             error.message?.includes('required')) {
    statusCode = 400;
  }

  res.status(statusCode).json(createErrorResponse(
    message,
    statusCode >= 500 ? INTERNAL_ERROR : 'Request failed'
  ));
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(createErrorResponse(
    `Route ${req.method} ${req.url} not found`,
    'Not Found'
  ));
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * CORS configuration middleware
 */
export const corsHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

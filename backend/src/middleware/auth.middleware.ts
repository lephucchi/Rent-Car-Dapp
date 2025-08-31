import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/helpers';
import { createErrorResponse } from '../utils/helpers';
import { UNAUTHORIZED, FORBIDDEN } from '../utils/constants';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
  };
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json(createErrorResponse(UNAUTHORIZED, 'Access token required'));
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      userType: decoded.userType
    };
    next();
  } catch (error) {
    res.status(401).json(createErrorResponse(UNAUTHORIZED, 'Invalid or expired token'));
    return;
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse(UNAUTHORIZED, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.userType)) {
      res.status(403).json(createErrorResponse(
        FORBIDDEN, 
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      ));
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is lessor
 */
export const requireLessor = requireRole(['lessor', 'admin']);

/**
 * Middleware to check if user is insurance
 */
export const requireInsurance = requireRole(['insurance', 'admin']);

/**
 * Middleware to check if user is renter
 */
export const requireRenter = requireRole(['renter', 'admin']);

/**
 * Middleware for lessor or admin access
 */
export const requireLessorOrAdmin = requireRole(['lessor', 'admin']);

/**
 * Middleware for any authenticated user
 */
export const requireAuth = authenticateToken;

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType
      };
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
};

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService, UserService } from '../services/auth.service';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';
import { SUCCESS_MESSAGES } from '../utils/constants';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        userType: string;
      };
    }
  }
}

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const { email, password, full_name, phone, address, wallet_address, user_type } = req.body;

      const result = await AuthService.register({
        email,
        password,
        full_name,
        phone,
        address,
        wallet_address,
        user_type
      });

      // TODO: Send verification email with result.verificationToken

      res.status(201).json(createSuccessResponse(
        { 
          user: {
            id: result.user.id,
            email: result.user.email,
            full_name: result.user.full_name,
            user_type: result.user.user_type,
            is_verified: result.user.is_verified
          }
        },
        SUCCESS_MESSAGES.USER_CREATED
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const { email, password } = req.body;
      const authResponse = await AuthService.login(email, password);

      res.status(200).json(createSuccessResponse(
        authResponse,
        SUCCESS_MESSAGES.LOGIN_SUCCESS
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      
      await AuthService.verifyEmail(token);

      res.status(200).json(createSuccessResponse(
        null,
        SUCCESS_MESSAGES.USER_VERIFIED
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const { email } = req.body;
      const resetToken = await AuthService.forgotPassword(email);

      // TODO: Send reset email with resetToken

      res.status(200).json(createSuccessResponse(
        null,
        'Password reset email sent'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);

      res.status(200).json(createSuccessResponse(
        null,
        'Password reset successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password (authenticated)
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user!.userId;

      await AuthService.changePassword(userId, current_password, new_password);

      res.status(200).json(createSuccessResponse(
        null,
        'Password changed successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await AuthService.refreshToken(userId);

      res.status(200).json(createSuccessResponse(
        result,
        'Token refreshed successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (client-side token removal)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json(createSuccessResponse(
      null,
      SUCCESS_MESSAGES.LOGOUT_SUCCESS
    ));
  }
}

export class UserController {
  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.getProfile(userId);

      res.status(200).json(createSuccessResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const userId = req.user!.userId;
      const updateData = req.body;

      const updatedUser = await UserService.updateProfile(userId, updateData);

      res.status(200).json(createSuccessResponse(
        updatedUser,
        'Profile updated successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Link wallet address
   */
  static async linkWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(
          errors.array().map(err => err.msg).join(', '),
          'Validation failed'
        ));
        return;
      }

      const userId = req.user!.userId;
      const { wallet_address } = req.body;

      const updatedUser = await UserService.linkWallet(userId, wallet_address);

      res.status(200).json(createSuccessResponse(
        updatedUser,
        'Wallet linked successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user dashboard data
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userType = req.user!.userType;

      // Get user profile
      const profile = await UserService.getProfile(userId);

      let dashboardData: any = {
        profile,
        user_type: userType
      };

      // Add type-specific data
      if (userType === 'insurance') {
        // TODO: Add insurance-specific dashboard data
        dashboardData.pending_assessments = [];
      }

      res.status(200).json(createSuccessResponse(dashboardData));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users by type (admin only)
   */
  static async getUsersByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await UserService.getUsersByType(type, page, limit);

      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available damage assessors
   */
  static async getDamageAssessors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessors = await UserService.getDamageAssessors();

      res.status(200).json(createSuccessResponse(assessors));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify user (admin only)
   */
  static async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      const verifiedUser = await UserService.verifyUser(userId);

      res.status(200).json(createSuccessResponse(
        verifiedUser,
        'User verified successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await UserService.getUserStats();

      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      await UserService.deleteAccount(userId);

      res.status(200).json(createSuccessResponse(
        null,
        'Account deleted successfully'
      ));
    } catch (error) {
      next(error);
    }
  }
}

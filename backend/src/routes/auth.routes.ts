import { Router } from 'express';
import { AuthController, UserController } from '../controllers/auth.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateLinkWallet,
  validateUUID
} from '../utils/validators';

const router = Router();

// ============ AUTH ROUTES ============

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route GET /api/auth/verify/:token
 * @desc Verify email address
 * @access Public
 */
router.get('/verify/:token', AuthController.verifyEmail);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', validateResetPassword, AuthController.resetPassword);

/**
 * @route POST /api/auth/change-password
 * @desc Change password (authenticated)
 * @access Private
 */
router.post('/change-password', authenticateToken, AuthController.changePassword);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh-token', authenticateToken, AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

// ============ USER ROUTES ============

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticateToken, UserController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticateToken, validateUpdateProfile, UserController.updateProfile);

/**
 * @route POST /api/auth/link-wallet
 * @desc Link wallet address to user account
 * @access Private
 */
router.post('/link-wallet', authenticateToken, validateLinkWallet, UserController.linkWallet);

/**
 * @route GET /api/auth/dashboard
 * @desc Get user dashboard data
 * @access Private
 */
router.get('/dashboard', authenticateToken, UserController.getDashboard);

/**
 * @route DELETE /api/auth/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', authenticateToken, UserController.deleteAccount);

// ============ ADMIN ROUTES ============

/**
 * @route GET /api/auth/users/:type
 * @desc Get users by type (admin only)
 * @access Admin
 */
router.get('/users/:type', authenticateToken, requireAdmin, UserController.getUsersByType);

/**
 * @route PUT /api/auth/users/:userId/verify
 * @desc Verify user (admin only)
 * @access Admin
 */
router.put('/users/:userId/verify', authenticateToken, requireAdmin, validateUUID, UserController.verifyUser);

/**
 * @route GET /api/auth/stats
 * @desc Get user statistics (admin only)
 * @access Admin
 */
router.get('/stats', authenticateToken, requireAdmin, UserController.getUserStats);

// ============ UTILITY ROUTES ============

/**
 * @route GET /api/auth/damage-assessors
 * @desc Get available damage assessors
 * @access Private
 */
router.get('/damage-assessors', authenticateToken, UserController.getDamageAssessors);

export default router;

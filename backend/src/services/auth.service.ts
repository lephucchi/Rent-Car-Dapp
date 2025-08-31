import { UserModel, CreateUserData, UpdateUserData } from '../models/user.model';
import { User, CreateUserDto, UpdateUserDto, AuthResponse, JwtPayload } from '../types/user.types';
import { hashPassword, comparePassword, generateToken, generateRandomToken } from '../utils/helpers';
import { EMAIL_EXISTS, INVALID_CREDENTIALS, USER_TYPES } from '../utils/constants';

export class AuthService {
  /**
   * Register new user
   */
  static async register(userData: CreateUserDto): Promise<{ user: User, verificationToken: string }> {
    // Check if email already exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(EMAIL_EXISTS);
    }

    // Check if wallet address already exists (if provided)
    if (userData.wallet_address) {
      const existingWallet = await UserModel.findByWalletAddress(userData.wallet_address);
      if (existingWallet) {
        throw new Error('Wallet address already linked to another account');
      }
    }

    // Hash password and generate verification token
    const passwordHash = await hashPassword(userData.password);
    const verificationToken = generateRandomToken();

    // Prepare user data for database
    const createUserData: CreateUserData = {
      email: userData.email,
      password_hash: passwordHash,
      full_name: userData.full_name,
      phone: userData.phone,
      address: userData.address,
      wallet_address: userData.wallet_address?.toLowerCase(),
      user_type: userData.user_type,
      verification_token: verificationToken
    };

    // Create user
    const user = await UserModel.create(createUserData);

    return { user, verificationToken };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error(INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash!);
    if (!isPasswordValid) {
      throw new Error(INVALID_CREDENTIALS);
    }

    // Check if user is verified
    if (!user.is_verified) {
      throw new Error('Please verify your email before logging in');
    }

    // Generate JWT token
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type
    };

    const token = generateToken(tokenPayload);

    // Remove password from response
    const { password_hash, verification_token, ...userResponse } = user;

    return {
      user: userResponse,
      token
    };
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<User> {
    const user = await UserModel.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    if (user.is_verified) {
      throw new Error('Email already verified');
    }

    return await UserModel.verifyEmail(user.id);
  }

  /**
   * Forgot password - send reset token
   */
  static async forgotPassword(email: string): Promise<string> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = generateRandomToken();
    
    // Update user with reset token (reusing verification_token field)
    await UserModel.updateById(user.id, {
      verification_token: resetToken
    });

    return resetToken;
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await UserModel.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(newPassword);
    
    // Update password and clear reset token
    return await UserModel.updateById(user.id, {
      password_hash: passwordHash,
      verification_token: null
    });
  }

  /**
   * Change password (authenticated user)
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash!);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    return await UserModel.updatePassword(user.id, passwordHash);
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(userId: string): Promise<{ token: string }> {
    const user = await UserModel.findById(userId);
    if (!user || !user.is_verified) {
      throw new Error('Invalid user or user not verified');
    }

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type
    };

    const token = generateToken(tokenPayload);

    return { token };
  }
}

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password_hash, verification_token, ...userProfile } = user;
    return userProfile;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: UpdateUserDto): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await UserModel.updateById(userId, updateData);
  }

  /**
   * Link wallet address
   */
  static async linkWallet(userId: string, walletAddress: string): Promise<User> {
    // Check if wallet address is already linked
    const existingUser = await UserModel.findByWalletAddress(walletAddress);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Wallet address already linked to another account');
    }

    return await UserModel.linkWallet(userId, walletAddress);
  }

  /**
   * Get users by type (admin only)
   */
  static async getUsersByType(userType: string, page: number = 1, limit: number = 10): Promise<{
    users: Partial<User>[],
    total: number,
    totalPages: number
  }> {
    const offset = (page - 1) * limit;
    const users = await UserModel.findByType(userType, limit, offset);
    const total = await UserModel.countByType(userType);
    
    return {
      users,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get available damage assessors
   */
  static async getDamageAssessors(): Promise<{ id: string, full_name: string, email: string }[]> {
    return await UserModel.getAvailableDamageAssessors();
  }

  /**
   * Verify user (admin only)
   */
  static async verifyUser(userId: string): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.is_verified) {
      throw new Error('User already verified');
    }

    return await UserModel.verifyEmail(userId);
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(): Promise<{
    total: number,
    verified: number,
    byType: Record<string, number>
  }> {
    const stats = {
      total: 0,
      verified: 0,
      byType: {} as Record<string, number>
    };

    // Get counts for each user type
    for (const userType of Object.values(USER_TYPES)) {
      const count = await UserModel.countByType(userType);
      stats.byType[userType] = count;
      stats.total += count;
    }

    return stats;
  }

  /**
   * Delete user account (soft delete)
   */
  static async deleteAccount(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await UserModel.softDelete(userId);
  }
}

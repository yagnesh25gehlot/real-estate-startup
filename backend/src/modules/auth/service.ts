import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, User } from '@prisma/client';
import { GoogleAuthPayload, LoginResponse, DealerSignupRequest, LoginRequest, Role } from './types';
import { createError } from '../../utils/errorHandler';
import { sendDealerApprovalEmail } from '../../mail/notifications';
import { NotificationService } from '../notification/service';
import { WhatsAppService } from '../../services/whatsappService';
import { TelegramService } from '../../services/telegramService';

const prisma = new PrismaClient();

export class AuthService {
  static generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      iat: Math.floor(Date.now() / 1000),
    };
    
    console.log('🔍 generateToken - Payload:', payload);
    console.log('🔍 generateToken - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { 
        expiresIn: process.env.NODE_ENV === 'production' ? '1h' : '7d', // 1 hour in production, 7 days in development
        issuer: 'property-platform',
        audience: 'property-platform-users'
      }
    );
    
    console.log('✅ generateToken - Token generated successfully');
    return token;
  }

  static generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: '7d',
        issuer: 'property-platform',
        audience: 'property-platform-users'
      }
    );
  }

  static verifyToken(token: string): any {
    try {
      console.log('🔍 verifyToken - JWT_SECRET exists:', !!process.env.JWT_SECRET);
      console.log('🔍 verifyToken - JWT_SECRET length:', process.env.JWT_SECRET?.length);
      console.log('🔍 verifyToken - Token length:', token.length);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: 'property-platform',
        audience: 'property-platform-users'
      });
      console.log('✅ verifyToken - Decoded payload:', decoded);
      console.log('✅ verifyToken - Decoded type:', typeof decoded);
      console.log('✅ verifyToken - Decoded keys:', Object.keys(decoded));
      return decoded;
    } catch (error) {
      console.log('❌ verifyToken - Error:', error);
      throw createError('Invalid or expired token', 401);
    }
  }

  // Validate password strength
  private static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character (@$!%*?&)' };
    }
    
    return { isValid: true };
  }

  // Regular user signup with email/password
  static async signup(request: { 
    email: string; 
    name: string; 
    password: string; 
    mobile?: string; 
    aadhaar?: string; 
    aadhaarImage?: string; 
  }): Promise<{ user: any }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.email)) {
        throw createError('Invalid email format', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: request.email.toLowerCase() },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 400);
      }

      // Validate password
      const passwordValidation = this.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        throw createError(passwordValidation.error!, 400);
      }

      // Hash password with higher salt rounds for production
      const saltRounds = process.env.NODE_ENV === 'production' ? 14 : 12;
      const hashedPassword = await bcrypt.hash(request.password, saltRounds);

      // Create user with USER role
      const newUser = await prisma.user.create({
        data: {
          email: request.email.toLowerCase(),
          name: request.name.trim(),
          mobile: request.mobile?.trim() || null,
          aadhaar: request.aadhaar?.trim() || null,
          aadhaarImage: request.aadhaarImage || null,
          role: 'USER',
          password: hashedPassword,
        },
      });

      // Send notification to admin about new user signup
      try {
        await NotificationService.createNotification({
          userId: 'admin',
          type: 'USER_SIGNUP',
          title: 'New User Registration',
          message: `${newUser.name} (${newUser.email}) has registered as a new user`
        });

        // Send WhatsApp notification
        await WhatsAppService.sendUserSignupNotification(newUser);

        // Send Telegram notification
        await TelegramService.sendUserNotification(newUser);
      } catch (notificationError) {
        // Log error but don't fail the signup
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to send user signup notification:', notificationError);
        }
      }

      // Return user data only (no token)
      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          mobile: newUser.mobile,
          aadhaar: newUser.aadhaar,
          aadhaarImage: newUser.aadhaarImage,
          profilePic: newUser.profilePic,
          role: newUser.role as Role,
          createdAt: newUser.createdAt,
          dealer: null, // New users don't have dealer data
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Regular user login with email/password
  static async login(request: LoginRequest): Promise<{ token: string; user: any }> {
    try {
      console.log('🔍 AuthService.login - Looking for email:', request.email.toLowerCase());
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: request.email.toLowerCase() },
        include: { dealer: true },
      });

      if (!user) {
        console.log('❌ AuthService.login - User not found');
        throw createError('Invalid email or password', 401);
      }
      
      console.log('✅ AuthService.login - User found:', user.email, user.name, user.role);

      // Check if user is blocked
      if (user.status === 'BLOCKED') {
        throw createError('Your account has been blocked. Please contact support.', 403);
      }

      // Check if user has password (for OAuth users)
      if (!user.password) {
        throw createError('Please sign in with Google or reset your password', 401);
      }

      // Verify password
      console.log('🔍 Password verification - Input password length:', request.password.length);
      console.log('🔍 Password verification - Stored hash length:', user.password.length);
      console.log('🔍 Password verification - Stored hash starts with:', user.password.substring(0, 10) + '...');
      
      const isPasswordValid = await bcrypt.compare(request.password, user.password);
      console.log('🔍 Password verification - Result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ Password verification failed');
        throw createError('Invalid email or password', 401);
      }
      
      console.log('✅ Password verification successful');

      // Check if user is a dealer and if their approval status
      if (user.role === 'DEALER' && user.dealer) {
        if (user.dealer.status === 'PENDING') {
          throw createError('Your dealer account is pending approval. Please wait for admin approval.', 403);
        }
        if (user.dealer.status === 'REJECTED') {
          throw createError('Your dealer account has been rejected. Please contact support.', 403);
        }
      }

      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          mobile: user.mobile,
          aadhaar: user.aadhaar,
          aadhaarImage: user.aadhaarImage,
          profilePic: user.profilePic,
          role: user.role as Role,
          createdAt: user.createdAt,
          dealer: user.dealer ? {
            id: user.dealer.id,
            referralCode: user.dealer.referralCode,
            status: user.dealer.status,
          } : null,
        },
      };
    } catch (error) {
      console.log('❌ Login error details:', error);
      
      if (error instanceof Error && error.message.includes('Invalid email or password')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('pending approval')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('rejected')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('blocked')) {
        throw error;
      }
      
      // Log the actual error for debugging
      console.log('❌ Unexpected login error:', error);
      throw createError(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  // Google OAuth authentication
  static async googleAuth(payload: GoogleAuthPayload): Promise<LoginResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw createError('Invalid email format', 400);
      }

      let user = await prisma.user.findUnique({
        where: { email: payload.email.toLowerCase() },
        include: { dealer: true },
      });

      if (!user) {
        // Create new user with Google OAuth
        user = await prisma.user.create({
          data: {
            email: payload.email.toLowerCase(),
            name: payload.name.trim(),
            role: payload.role || 'USER',
            // No password for OAuth users
          },
          include: { dealer: true },
        });
      } else {
        // Update user name if it changed
        if (user.name !== payload.name.trim()) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: payload.name.trim() },
            include: { dealer: true },
          });
        }
      }

      // Check if user is a dealer and if their approval status
      if (user.role === 'DEALER' && user.dealer) {
        if (user.dealer.status === 'PENDING') {
          throw createError('Your dealer account is pending approval. Please wait for admin approval.', 403);
        }
        if (user.dealer.status === 'REJECTED') {
          throw createError('Your dealer account has been rejected. Please contact support.', 403);
        }
      }

      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          mobile: user.mobile,
          aadhaar: user.aadhaar,
          aadhaarImage: user.aadhaarImage,
          profilePic: user.profilePic,
          role: user.role as Role,
          createdAt: user.createdAt,
          dealer: user.dealer ? {
            id: user.dealer.id,
            referralCode: user.dealer.referralCode,
            status: user.dealer.status,
          } : null,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('pending approval')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('rejected')) {
        throw error;
      }
      throw createError('Google authentication failed', 500);
    }
  }

  // Dealer signup (creates user with pending dealer status)
  static async dealerSignup(request: DealerSignupRequest & { 
    password: string; 
    mobile?: string; 
    aadhaar?: string; 
    aadhaarImage?: string; 
  }): Promise<{ message: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.email)) {
        throw createError('Invalid email format', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: request.email.toLowerCase() },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 400);
      }

      // Validate password
      const passwordValidation = this.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        throw createError(passwordValidation.error!, 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(request.password, 12);

      // Find parent dealer by referral code if provided
      let parentId = null;
      if (request.referralCode && request.referralCode.trim()) {
        const parentDealer = await prisma.dealer.findUnique({
          where: { referralCode: request.referralCode.trim().toUpperCase() },
        });
        
        if (!parentDealer) {
          throw createError('Invalid referral code', 400);
        }
        
        if (parentDealer.status !== 'APPROVED') {
          throw createError('Referral code belongs to a dealer who is not yet approved', 400);
        }
        
        parentId = parentDealer.id;
      }

      // Create user with USER role initially (will be upgraded to DEALER after approval)
      const user = await prisma.user.create({
        data: {
          email: request.email.toLowerCase(),
          name: request.name.trim(),
          mobile: request.mobile?.trim() || null,
          aadhaar: request.aadhaar?.trim() || null,
          aadhaarImage: request.aadhaarImage || null,
          role: 'USER', // Start as USER, will be upgraded to DEALER after approval
          password: hashedPassword,
        },
      });

      // Create dealer record with PENDING status
      const dealer = await prisma.dealer.create({
        data: {
          userId: user.id,
          referralCode: this.generateReferralCode(),
          parentId: parentId,
          status: 'PENDING',
        },
      });

      // Send approval email to admin
      try {
        await sendDealerApprovalEmail({
          dealerId: dealer.id,
          dealerName: request.name,
          dealerEmail: request.email,
        });
      } catch (emailError) {
        console.error('Failed to send dealer approval email:', emailError);
        // Don't fail the signup if email fails
      }

      // Send notification to admin about new dealer signup
      try {
        await NotificationService.createNotification({
          userId: 'admin',
          type: 'DEALER_SIGNUP',
          title: 'New Dealer Registration',
          message: `${request.name} (${request.email}) has applied to become a dealer`
        });
      } catch (notificationError) {
        console.error('Failed to send dealer signup notification:', notificationError);
        // Don't fail the signup if notification fails
      }

      return {
        message: 'Dealer registration submitted successfully. Awaiting admin approval. You can sign in as a regular user while waiting.',
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError('Dealer registration failed', 500);
    }
  }

  // Apply for dealer (existing users)
  static async applyForDealer(userId: string, request: { referralCode?: string }): Promise<{ message: string }> {
    try {
      // Check if user exists and is a regular user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { dealer: true },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role === 'DEALER') {
        throw createError('User is already a dealer', 400);
      }

      if (user.role === 'ADMIN') {
        throw createError('Admins cannot apply for dealer status', 400);
      }

      // Check if user already has a pending dealer application
      if (user.dealer) {
        if (user.dealer.status === 'PENDING') {
          throw createError('You already have a pending dealer application', 400);
        }
        if (user.dealer.status === 'APPROVED') {
          throw createError('You are already an approved dealer', 400);
        }
        if (user.dealer.status === 'REJECTED') {
          throw createError('Your previous dealer application was rejected', 400);
        }
      }

      // Find parent dealer by referral code if provided
      let parentId = null;
      if (request.referralCode && request.referralCode.trim()) {
        const parentDealer = await prisma.dealer.findUnique({
          where: { referralCode: request.referralCode.trim().toUpperCase() },
        });
        
        if (!parentDealer) {
          throw createError('Invalid referral code', 400);
        }
        
        if (parentDealer.status !== 'APPROVED') {
          throw createError('Referral code belongs to a dealer who is not yet approved', 400);
        }
        
        parentId = parentDealer.id;
      }

      // Create or update dealer record
      if (user.dealer) {
        // Update existing dealer record
        await prisma.dealer.update({
          where: { id: user.dealer.id },
          data: {
            status: 'PENDING',
            parentId: parentId,
          },
        });
      } else {
        // Create new dealer record
        await prisma.dealer.create({
          data: {
            userId: user.id,
            referralCode: this.generateReferralCode(),
            parentId: parentId,
            status: 'PENDING',
          },
        });
      }

      // Send approval email to admin
      try {
        await sendDealerApprovalEmail({
          dealerId: user.dealer?.id || 'new',
          dealerName: user.name || 'Unknown',
          dealerEmail: user.email,
        });
      } catch (emailError) {
        console.error('Failed to send dealer approval email:', emailError);
        // Don't fail the application if email fails
      }

      return {
        message: 'Dealer application submitted successfully. Awaiting admin approval.',
      };
    } catch (error: any) {
      // If it's already a custom error, re-throw it
      if (error.message && error.message !== 'Failed to submit dealer application') {
        throw error;
      }
      // Otherwise, throw a generic error
      throw createError('Failed to submit dealer application', 500);
    }
  }

  // Update profile
  static async updateProfile(userId: string, data: { 
    name: string; 
    mobile?: string; 
    aadhaar?: string; 
    profilePic?: string; 
  }): Promise<{ user: any }> {
    try {
      // Update user profile (email cannot be changed)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name.trim(),
          mobile: data.mobile?.trim() || null,
          aadhaar: data.aadhaar?.trim() || null,
          profilePic: data.profilePic || null,
        },
      });

      // Get dealer information if user is a dealer
      let dealerInfo = null;
      if (updatedUser.role === 'DEALER') {
        const dealer = await prisma.dealer.findUnique({
          where: { userId: updatedUser.id },
          select: {
            id: true,
            referralCode: true,
            status: true,
          },
        });
        dealerInfo = dealer;
      }

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          aadhaar: updatedUser.aadhaar,
          aadhaarImage: updatedUser.aadhaarImage,
          profilePic: updatedUser.profilePic,
          role: updatedUser.role as Role,
          createdAt: updatedUser.createdAt,
          dealer: dealerInfo,
        },
      };
    } catch (error) {
      throw createError('Failed to update profile', 500);
    }
  }

  // Update profile picture
  static async updateProfilePicture(userId: string, profilePicUrl: string): Promise<{ message: string }> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { profilePic: profilePicUrl },
      });

      return {
        message: 'Profile picture updated successfully',
      };
    } catch (error) {
      throw createError('Failed to update profile picture', 500);
    }
  }

  // Update aadhaar image
  static async updateAadhaarImage(userId: string, aadhaarImageUrl: string): Promise<{ message: string }> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { aadhaarImage: aadhaarImageUrl },
      });

      return {
        message: 'Aadhaar image updated successfully',
      };
    } catch (error) {
      throw createError('Failed to update aadhaar image', 500);
    }
  }

  static async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        aadhaar: user.aadhaar,
        aadhaarImage: user.aadhaarImage,
        profilePic: user.profilePic,
        role: user.role as Role,
        status: user.status,
        createdAt: user.createdAt,
        dealer: user.dealer,
      };
    } catch (error) {
      throw createError('Failed to get user profile', 500);
    }
  }

  // Change password
  static async changePassword(userId: string, data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.password) {
        throw createError('Password change not allowed for OAuth users', 400);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400);
      }

      // Validate new password
      const passwordValidation = this.validatePassword(data.newPassword);
      if (!passwordValidation.isValid) {
        throw createError(passwordValidation.error!, 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw createError('Failed to change password', 500);
    }
  }

  // Approve dealer (admin only)
  static async approveDealer(dealerId: string): Promise<{ message: string }> {
    try {
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      });

      if (!dealer) {
        throw createError('Dealer not found', 404);
      }

      if (dealer.status === 'APPROVED') {
        throw createError('Dealer is already approved', 400);
      }

      // Update dealer status to APPROVED
      await prisma.dealer.update({
        where: { id: dealerId },
        data: { status: 'APPROVED' },
      });

      // Update user role to DEALER
      await prisma.user.update({
        where: { id: dealer.userId },
        data: { role: 'DEALER' },
      });

      return {
        message: 'Dealer approved successfully',
      };
    } catch (error) {
      throw createError('Failed to approve dealer', 500);
    }
  }

  // Reject dealer (admin only)
  static async rejectDealer(dealerId: string): Promise<{ message: string }> {
    try {
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      });

      if (!dealer) {
        throw createError('Dealer not found', 404);
      }

      if (dealer.status === 'REJECTED') {
        throw createError('Dealer is already rejected', 400);
      }

      // Update dealer status to REJECTED
      await prisma.dealer.update({
        where: { id: dealerId },
        data: { status: 'REJECTED' },
      });

      // Keep user role as USER (don't change it)

      return {
        message: 'Dealer rejected successfully',
      };
    } catch (error) {
      throw createError('Failed to reject dealer', 500);
    }
  }

  // Get dealer hierarchy
  static async getDealerHierarchy(dealerId: string): Promise<any> {
    try {
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: {
          user: true,
          children: {
            include: {
              user: true,
            },
          },
          parent: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!dealer) {
        throw createError('Dealer not found', 404);
      }

      return dealer;
    } catch (error) {
      throw createError('Failed to get dealer hierarchy', 500);
    }
  }



  // Check if user can access dealer features
  static async checkDealerAccess(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { dealer: true },
      });

      if (!user || user.role !== 'DEALER') {
        return false;
      }

      if (!user.dealer || user.dealer.status !== 'APPROVED') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  private static generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Update profile picture with cleanup of old image
  static async updateProfilePicture(userId: string, newProfilePicUrl: string): Promise<User> {
    try {
      // Get current user to check if they have an existing profile picture
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePic: true }
      });

      if (!currentUser) {
        throw createError('User not found', 404);
      }

      // Update the profile picture
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePic: newProfilePicUrl },
      });

      // Clean up old profile picture if it exists and is different
      if (currentUser.profilePic && currentUser.profilePic !== newProfilePicUrl) {
        try {
          const { S3Uploader } = await import('../../utils/s3Uploader');
          const oldKey = S3Uploader.extractKeyFromUrl(currentUser.profilePic);
          if (oldKey) {
            await S3Uploader.deleteFile(oldKey);
            console.log(`🗑️ Cleaned up old profile picture: ${oldKey}`);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up old profile picture:', cleanupError);
          // Don't fail the update if cleanup fails
        }
      }

      return updatedUser;
    } catch (error) {
      throw createError('Failed to update profile picture', 500);
    }
  }

  // Update Aadhaar image with cleanup of old image
  static async updateAadhaarImage(userId: string, newAadhaarImageUrl: string): Promise<User> {
    try {
      // Get current user to check if they have an existing Aadhaar image
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { aadhaarImage: true }
      });

      if (!currentUser) {
        throw createError('User not found', 404);
      }

      // Update the Aadhaar image
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { aadhaarImage: newAadhaarImageUrl },
      });

      // Clean up old Aadhaar image if it exists and is different
      if (currentUser.aadhaarImage && currentUser.aadhaarImage !== newAadhaarImageUrl) {
        try {
          const { S3Uploader } = await import('../../utils/s3Uploader');
          const oldKey = S3Uploader.extractKeyFromUrl(currentUser.aadhaarImage);
          if (oldKey) {
            await S3Uploader.deleteFile(oldKey);
            console.log(`🗑️ Cleaned up old Aadhaar image: ${oldKey}`);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up old Aadhaar image:', cleanupError);
          // Don't fail the update if cleanup fails
        }
      }

      return updatedUser;
    } catch (error) {
      throw createError('Failed to update Aadhaar image', 500);
    }
  }
} 
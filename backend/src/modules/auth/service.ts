import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, User, Role } from '@prisma/client';
import { GoogleAuthPayload, LoginResponse, DealerSignupRequest, LoginRequest } from './types';
import { createError } from '../../utils/errorHandler';
import { sendDealerApprovalEmail } from '../../mail/notifications';
import { NotificationService } from '../notification/service';

const prisma = new PrismaClient();

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
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
  static async signup(request: { email: string; name: string; password: string }): Promise<{ message: string }> {
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

      // Create user with USER role
      const newUser = await prisma.user.create({
        data: {
          email: request.email.toLowerCase(),
          name: request.name.trim(),
          role: 'USER',
          password: hashedPassword,
        },
      });

      // Send notification to admin about new user signup
      try {
        await NotificationService.notifyUserSignup(newUser);
      } catch (notificationError) {
        console.error('Failed to send user signup notification:', notificationError);
        // Don't fail the signup if notification fails
      }

      return {
        message: 'Account created successfully. Please sign in.',
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError('Registration failed', 500);
    }
  }

  // Regular user login with email/password
  static async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: request.email.toLowerCase() },
        include: { dealer: true },
      });

      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Check if user has password (for OAuth users)
      if (!user.password) {
        throw createError('Please sign in with Google or reset your password', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(request.password, user.password);
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
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
          profilePic: user.profilePic,
          role: user.role,
          createdAt: user.createdAt,
          dealer: user.dealer ? {
            id: user.dealer.id,
            referralCode: user.dealer.referralCode,
            status: user.dealer.status,
          } : null,
        },
        token,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid email or password')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('pending approval')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('rejected')) {
        throw error;
      }
      throw createError('Login failed', 500);
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
          profilePic: user.profilePic,
          role: user.role,
          createdAt: user.createdAt,
          dealer: user.dealer ? {
            id: user.dealer.id,
            referralCode: user.dealer.referralCode,
            status: user.dealer.status,
          } : null,
        },
        token,
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
  static async dealerSignup(request: DealerSignupRequest & { password: string }): Promise<{ message: string }> {
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
    } catch (error) {
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
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          aadhaar: updatedUser.aadhaar,
          profilePic: updatedUser.profilePic,
          role: updatedUser.role,
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

  // Verify token and get user
  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw createError('User not found', 401);
      }

      return user;
    } catch (error) {
      throw createError('Invalid token', 401);
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
} 
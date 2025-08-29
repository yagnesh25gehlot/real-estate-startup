import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, JwtPayload } from './types';
import { createError } from '../../utils/errorHandler';
import { AuthService } from './service';

const prisma = new PrismaClient();

export const authMiddleware = (allowedRoles?: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // For MVP testing - allow all requests without token verification
      console.log('🔍 Auth middleware - MVP mode: allowing all requests');
      
      // For MVP testing, try to get the actual user from the request headers
      // This allows the frontend to specify which user is making the request
      const userEmail = req.header('X-User-Email');
      console.log('🔍 Auth middleware - User email from header:', userEmail);
      
      let realUser;
      if (userEmail) {
        // Try to find the user by email from the header
        realUser = await prisma.user.findFirst({
          where: { email: userEmail },
          include: { dealer: true }
        });
        console.log('🔍 Auth middleware - Found user by email:', realUser?.email, realUser?.id);
      }
      
      // If no user found from header, fallback to admin user
      if (!realUser) {
        console.log('🔍 Auth middleware - No user found from header, using admin user');
        realUser = await prisma.user.findFirst({
          where: { 
            email: 'bussiness.startup.work@gmail.com' // Use the admin user for MVP testing
          },
          include: {
            dealer: true
          }
        });
        console.log('🔍 Auth middleware - Using admin user:', realUser?.email, realUser?.id);
      }
      
      if (realUser) {
        req.user = realUser;
      } else {
        // Fallback to mock user if real user not found
        req.user = {
          id: 'mock-user-id-for-mvp',
          email: 'mvp-test@example.com',
          name: 'MVP Test User',
          password: null,
          mobile: '+91-9876543210',
          aadhaar: '123456789012',
          aadhaarImage: null,
          profilePic: null,
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date()
        };
      }
      
      // If you want to add basic role checking later, you can uncomment this:
      /*
      const userEmail = req.header('X-User-Email');
      if (userEmail) {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
          include: { dealer: true },
        });
        
        if (user && allowedRoles && !allowedRoles.includes(user.role)) {
          return res.status(403).json({ 
            success: false, 
            error: 'Access denied. Insufficient permissions.' 
          });
        }
        
        req.user = user;
      }
      */
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      next(createError('Authentication failed', 401));
    }
  };
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // For MVP testing - allow all requests without token verification
    console.log('🔍 OptionalAuth middleware - MVP mode: allowing all requests');
    
    // For MVP testing, try to get the actual user from the request headers
    const userEmail = req.header('X-User-Email');
    
    let realUser;
    if (userEmail) {
      // Try to find the user by email from the header
      realUser = await prisma.user.findFirst({
        where: { email: userEmail },
        include: { dealer: true }
      });
    }
    
    // If no user found from header, fallback to admin user
    if (!realUser) {
      realUser = await prisma.user.findFirst({
        where: { 
          email: 'bussiness.startup.work@gmail.com' // Use the admin user for MVP testing
        },
        include: {
          dealer: true
        }
      });
    }
    
    if (realUser) {
      req.user = realUser;
    } else {
      // Fallback to mock user if real user not found
      req.user = {
        id: 'mock-user-id-for-mvp',
        email: 'mvp-test@example.com',
        name: 'MVP Test User',
        password: null,
        mobile: '+91-9876543210',
        aadhaar: '123456789012',
        aadhaarImage: null,
        profilePic: null,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date()
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 
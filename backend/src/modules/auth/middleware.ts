import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, JwtPayload } from './types';
import { createError } from '../../utils/errorHandler';

const prisma = new PrismaClient();

export const authMiddleware = (allowedRoles?: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          error: 'Access denied. No token provided.' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          dealer: true,
        },
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid token. User not found.' 
        });
      }

      // Check if user's role is allowed
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. Insufficient permissions.' 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid token.' 
        });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          success: false, 
          error: 'Token expired.' 
        });
      }
      next(createError('Authentication failed', 401));
    }
  };
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        dealer: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (but not in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = createError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = createError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = createError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = createError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = createError(message, 401);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      const message = 'Duplicate field value entered';
      error = createError(message, 400);
    } else if (prismaError.code === 'P2025') {
      const message = 'Resource not found';
      error = createError(message, 404);
    } else {
      const message = 'Database operation failed';
      error = createError(message, 500);
    }
  }

  // File upload errors
  if (err.message.includes('File too large')) {
    error = createError(err.message, 400);
  }

  if (err.message.includes('Invalid file type')) {
    error = createError(err.message, 400);
  }

  // Rate limiting errors
  if (err.message.includes('Too many requests')) {
    error = createError(err.message, 429);
  }

  // CORS errors
  if (err.message.includes('Not allowed by CORS')) {
    error = createError('Cross-origin request not allowed', 403);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // In production, don't expose internal error details
  const errorResponse: any = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    }),
  };

  res.status(statusCode).json(errorResponse);
}; 
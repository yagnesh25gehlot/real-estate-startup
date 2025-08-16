import { Request } from 'express';
import { createError } from './errorHandler';

// Input validation and sanitization utilities
export class SecurityUtils {
  // Validate and sanitize email
  static validateEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw createError('Email is required', 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
      throw createError('Invalid email format', 400);
    }

    if (sanitizedEmail.length > 254) {
      throw createError('Email too long', 400);
    }

    return sanitizedEmail;
  }

  // Validate and sanitize password
  static validatePassword(password: string): string {
    if (!password || typeof password !== 'string') {
      throw createError('Password is required', 400);
    }

    if (password.length < 8) {
      throw createError('Password must be at least 8 characters long', 400);
    }

    if (password.length > 128) {
      throw createError('Password too long', 400);
    }

    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin123', 'letmein', 'welcome', 'monkey'
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
      throw createError('Password is too common, please choose a stronger password', 400);
    }

    return password;
  }

  // Validate and sanitize name
  static validateName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw createError('Name is required', 400);
    }

    const sanitizedName = name.trim();
    
    if (sanitizedName.length < 2) {
      throw createError('Name must be at least 2 characters long', 400);
    }

    if (sanitizedName.length > 100) {
      throw createError('Name too long', 400);
    }

    // Remove potentially dangerous characters
    const cleanName = sanitizedName.replace(/[<>\"'&]/g, '');
    
    if (cleanName !== sanitizedName) {
      throw createError('Name contains invalid characters', 400);
    }

    return cleanName;
  }

  // Validate and sanitize mobile number
  static validateMobile(mobile: string): string {
    if (!mobile || typeof mobile !== 'string') {
      throw createError('Mobile number is required', 400);
    }

    const sanitizedMobile = mobile.trim();
    
    // Basic mobile validation (adjust regex for your region)
    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (!mobileRegex.test(sanitizedMobile)) {
      throw createError('Invalid mobile number format', 400);
    }

    return sanitizedMobile;
  }

  // Validate and sanitize Aadhaar number
  static validateAadhaar(aadhaar: string): string {
    if (!aadhaar || typeof aadhaar !== 'string') {
      throw createError('Aadhaar number is required', 400);
    }

    const sanitizedAadhaar = aadhaar.trim();
    
    // Aadhaar validation (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    
    if (!aadhaarRegex.test(sanitizedAadhaar)) {
      throw createError('Invalid Aadhaar number format (must be 12 digits)', 400);
    }

    return sanitizedAadhaar;
  }

  // Validate and sanitize property data
  static validatePropertyData(data: any): any {
    const sanitized: any = {};

    if (data.title) {
      sanitized.title = this.validateName(data.title);
    }

    if (data.description) {
      const desc = data.description.trim();
      if (desc.length > 2000) {
        throw createError('Description too long (max 2000 characters)', 400);
      }
      sanitized.description = desc;
    }

    if (data.location) {
      const location = data.location.trim();
      if (location.length > 100) {
        throw createError('Location too long', 400);
      }
      sanitized.location = location;
    }

    if (data.price) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price <= 0) {
        throw createError('Invalid price', 400);
      }
      sanitized.price = price;
    }

    return sanitized;
  }

  // Sanitize request body
  static sanitizeRequestBody(req: Request): void {
    if (req.body) {
      // Remove potentially dangerous fields
      delete req.body.__proto__;
      delete req.body.constructor;
      
      // Limit object depth
      const maxDepth = 10;
      const sanitizeObject = (obj: any, depth: number = 0): any => {
        if (depth > maxDepth) {
          throw createError('Request too complex', 400);
        }
        
        if (typeof obj === 'object' && obj !== null) {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (typeof key === 'string' && key.length < 100) {
              sanitized[key] = sanitizeObject(value, depth + 1);
            }
          }
          return sanitized;
        }
        
        return obj;
      };
      
      req.body = sanitizeObject(req.body);
    }
  }

  // Validate file upload
  static validateFileUpload(file: Express.Multer.File, maxSize: number = 10 * 1024 * 1024): void {
    if (!file) {
      throw createError('No file provided', 400);
    }

    if (file.size > maxSize) {
      throw createError(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400);
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw createError('Invalid file type', 400);
    }

    // Check for potentially dangerous filenames
    const dangerousPatterns = /\.\.|\.\/|\.\\|\/|\|/;
    if (dangerousPatterns.test(file.originalname)) {
      throw createError('Invalid filename', 400);
    }
  }

  // Rate limiting helper
  static getClientIP(req: Request): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.connection as any).socket?.remoteAddress || 
           'unknown';
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  // Validate URL
  static validateURL(url: string): string {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw createError('Invalid URL protocol', 400);
      }
      return url;
    } catch {
      throw createError('Invalid URL format', 400);
    }
  }
}

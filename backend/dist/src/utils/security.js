"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = void 0;
const errorHandler_1 = require("./errorHandler");
class SecurityUtils {
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw (0, errorHandler_1.createError)('Email is required', 400);
        }
        const sanitizedEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            throw (0, errorHandler_1.createError)('Invalid email format', 400);
        }
        if (sanitizedEmail.length > 254) {
            throw (0, errorHandler_1.createError)('Email too long', 400);
        }
        return sanitizedEmail;
    }
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw (0, errorHandler_1.createError)('Password is required', 400);
        }
        if (password.length < 8) {
            throw (0, errorHandler_1.createError)('Password must be at least 8 characters long', 400);
        }
        if (password.length > 128) {
            throw (0, errorHandler_1.createError)('Password too long', 400);
        }
        const weakPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin123', 'letmein', 'welcome', 'monkey'
        ];
        if (weakPasswords.includes(password.toLowerCase())) {
            throw (0, errorHandler_1.createError)('Password is too common, please choose a stronger password', 400);
        }
        return password;
    }
    static validateName(name) {
        if (!name || typeof name !== 'string') {
            throw (0, errorHandler_1.createError)('Name is required', 400);
        }
        const sanitizedName = name.trim();
        if (sanitizedName.length < 2) {
            throw (0, errorHandler_1.createError)('Name must be at least 2 characters long', 400);
        }
        if (sanitizedName.length > 100) {
            throw (0, errorHandler_1.createError)('Name too long', 400);
        }
        const cleanName = sanitizedName.replace(/[<>\"'&]/g, '');
        if (cleanName !== sanitizedName) {
            throw (0, errorHandler_1.createError)('Name contains invalid characters', 400);
        }
        return cleanName;
    }
    static validateMobile(mobile) {
        if (!mobile || typeof mobile !== 'string') {
            throw (0, errorHandler_1.createError)('Mobile number is required', 400);
        }
        const sanitizedMobile = mobile.trim();
        const mobileRegex = /^\+?[1-9]\d{1,14}$/;
        if (!mobileRegex.test(sanitizedMobile)) {
            throw (0, errorHandler_1.createError)('Invalid mobile number format', 400);
        }
        return sanitizedMobile;
    }
    static validateAadhaar(aadhaar) {
        if (!aadhaar || typeof aadhaar !== 'string') {
            throw (0, errorHandler_1.createError)('Aadhaar number is required', 400);
        }
        const sanitizedAadhaar = aadhaar.trim();
        const aadhaarRegex = /^\d{12}$/;
        if (!aadhaarRegex.test(sanitizedAadhaar)) {
            throw (0, errorHandler_1.createError)('Invalid Aadhaar number format (must be 12 digits)', 400);
        }
        return sanitizedAadhaar;
    }
    static validatePropertyData(data) {
        const sanitized = {};
        if (data.title) {
            sanitized.title = this.validateName(data.title);
        }
        if (data.description) {
            const desc = data.description.trim();
            if (desc.length > 2000) {
                throw (0, errorHandler_1.createError)('Description too long (max 2000 characters)', 400);
            }
            sanitized.description = desc;
        }
        if (data.location) {
            const location = data.location.trim();
            if (location.length > 100) {
                throw (0, errorHandler_1.createError)('Location too long', 400);
            }
            sanitized.location = location;
        }
        if (data.price) {
            const price = parseFloat(data.price);
            if (isNaN(price) || price <= 0) {
                throw (0, errorHandler_1.createError)('Invalid price', 400);
            }
            sanitized.price = price;
        }
        return sanitized;
    }
    static sanitizeRequestBody(req) {
        if (req.body) {
            delete req.body.__proto__;
            delete req.body.constructor;
            const maxDepth = 10;
            const sanitizeObject = (obj, depth = 0) => {
                if (depth > maxDepth) {
                    throw (0, errorHandler_1.createError)('Request too complex', 400);
                }
                if (typeof obj === 'object' && obj !== null) {
                    const sanitized = {};
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
    static validateFileUpload(file, maxSize = 10 * 1024 * 1024) {
        if (!file) {
            throw (0, errorHandler_1.createError)('No file provided', 400);
        }
        if (file.size > maxSize) {
            throw (0, errorHandler_1.createError)(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400);
        }
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExtension)) {
            throw (0, errorHandler_1.createError)('Invalid file type', 400);
        }
        const dangerousPatterns = /\.\.|\.\/|\.\\|\/|\|/;
        if (dangerousPatterns.test(file.originalname)) {
            throw (0, errorHandler_1.createError)('Invalid filename', 400);
        }
    }
    static getClientIP(req) {
        return req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket?.remoteAddress ||
            'unknown';
    }
    static generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const randomArray = new Uint8Array(length);
        crypto.getRandomValues(randomArray);
        for (let i = 0; i < length; i++) {
            result += chars.charAt(randomArray[i] % chars.length);
        }
        return result;
    }
    static validateURL(url) {
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw (0, errorHandler_1.createError)('Invalid URL protocol', 400);
            }
            return url;
        }
        catch {
            throw (0, errorHandler_1.createError)('Invalid URL format', 400);
        }
    }
}
exports.SecurityUtils = SecurityUtils;
//# sourceMappingURL=security.js.map
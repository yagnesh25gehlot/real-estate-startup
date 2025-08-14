"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createError = void 0;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
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
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = (0, exports.createError)(message, 404);
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = (0, exports.createError)(message, 400);
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = (0, exports.createError)(message, 400);
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = (0, exports.createError)(message, 401);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = (0, exports.createError)(message, 401);
    }
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        if (prismaError.code === 'P2002') {
            const message = 'Duplicate field value entered';
            error = (0, exports.createError)(message, 400);
        }
        else if (prismaError.code === 'P2025') {
            const message = 'Resource not found';
            error = (0, exports.createError)(message, 404);
        }
        else {
            const message = 'Database operation failed';
            error = (0, exports.createError)(message, 500);
        }
    }
    if (err.message.includes('File too large')) {
        error = (0, exports.createError)(err.message, 400);
    }
    if (err.message.includes('Invalid file type')) {
        error = (0, exports.createError)(err.message, 400);
    }
    if (err.message.includes('Too many requests')) {
        error = (0, exports.createError)(err.message, 429);
    }
    if (err.message.includes('Not allowed by CORS')) {
        error = (0, exports.createError)('Cross-origin request not allowed', 403);
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';
    const errorResponse = {
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
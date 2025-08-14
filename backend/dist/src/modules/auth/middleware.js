"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authMiddleware = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const authMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            console.log('🔍 Auth middleware - MVP mode: allowing all requests');
            const userEmail = req.header('X-User-Email');
            console.log('🔍 Auth middleware - User email from header:', userEmail);
            let realUser;
            if (userEmail) {
                realUser = await prisma.user.findFirst({
                    where: { email: userEmail },
                    include: { dealer: true }
                });
                console.log('🔍 Auth middleware - Found user by email:', realUser?.email, realUser?.id);
            }
            if (!realUser) {
                console.log('🔍 Auth middleware - No user found from header, using admin user');
                realUser = await prisma.user.findFirst({
                    where: {
                        email: 'bussinessstatupwork@gmail.com'
                    },
                    include: {
                        dealer: true
                    }
                });
                console.log('🔍 Auth middleware - Using admin user:', realUser?.email, realUser?.id);
            }
            if (realUser) {
                req.user = realUser;
            }
            else {
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
        }
        catch (error) {
            console.error('Auth middleware error:', error);
            next((0, errorHandler_1.createError)('Authentication failed', 401));
        }
    };
};
exports.authMiddleware = authMiddleware;
const optionalAuth = async (req, res, next) => {
    try {
        console.log('🔍 OptionalAuth middleware - MVP mode: allowing all requests');
        const userEmail = req.header('X-User-Email');
        let realUser;
        if (userEmail) {
            realUser = await prisma.user.findFirst({
                where: { email: userEmail },
                include: { dealer: true }
            });
        }
        if (!realUser) {
            realUser = await prisma.user.findFirst({
                where: {
                    email: 'bussinessstatupwork@gmail.com'
                },
                include: {
                    dealer: true
                }
            });
        }
        if (realUser) {
            req.user = realUser;
        }
        else {
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
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=middleware.js.map
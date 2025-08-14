"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const notifications_1 = require("../../mail/notifications");
const service_1 = require("../notification/service");
const prisma = new client_1.PrismaClient();
class AuthService {
    static generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
        };
        console.log('🔍 generateToken - Payload:', payload);
        console.log('🔍 generateToken - JWT_SECRET exists:', !!process.env.JWT_SECRET);
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.NODE_ENV === 'production' ? '1h' : '7d',
            issuer: 'property-platform',
            audience: 'property-platform-users'
        });
        console.log('✅ generateToken - Token generated successfully');
        return token;
    }
    static generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
        }, process.env.JWT_SECRET, {
            expiresIn: '7d',
            issuer: 'property-platform',
            audience: 'property-platform-users'
        });
    }
    static verifyToken(token) {
        try {
            console.log('🔍 verifyToken - JWT_SECRET exists:', !!process.env.JWT_SECRET);
            console.log('🔍 verifyToken - JWT_SECRET length:', process.env.JWT_SECRET?.length);
            console.log('🔍 verifyToken - Token length:', token.length);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, {
                issuer: 'property-platform',
                audience: 'property-platform-users'
            });
            console.log('✅ verifyToken - Decoded payload:', decoded);
            console.log('✅ verifyToken - Decoded type:', typeof decoded);
            console.log('✅ verifyToken - Decoded keys:', Object.keys(decoded));
            return decoded;
        }
        catch (error) {
            console.log('❌ verifyToken - Error:', error);
            throw (0, errorHandler_1.createError)('Invalid or expired token', 401);
        }
    }
    static validatePassword(password) {
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
    static async signup(request) {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(request.email)) {
                throw (0, errorHandler_1.createError)('Invalid email format', 400);
            }
            const existingUser = await prisma.user.findUnique({
                where: { email: request.email.toLowerCase() },
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 400);
            }
            const passwordValidation = this.validatePassword(request.password);
            if (!passwordValidation.isValid) {
                throw (0, errorHandler_1.createError)(passwordValidation.error, 400);
            }
            const saltRounds = process.env.NODE_ENV === 'production' ? 14 : 12;
            const hashedPassword = await bcryptjs_1.default.hash(request.password, saltRounds);
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
            try {
                await service_1.NotificationService.notifyUserSignup(newUser);
            }
            catch (notificationError) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error('Failed to send user signup notification:', notificationError);
                }
            }
            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    mobile: newUser.mobile,
                    aadhaar: newUser.aadhaar,
                    aadhaarImage: newUser.aadhaarImage,
                    profilePic: newUser.profilePic,
                    role: newUser.role,
                    createdAt: newUser.createdAt,
                    dealer: null,
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async login(request) {
        try {
            console.log('🔍 AuthService.login - Looking for email:', request.email.toLowerCase());
            const user = await prisma.user.findUnique({
                where: { email: request.email.toLowerCase() },
                include: { dealer: true },
            });
            if (!user) {
                console.log('❌ AuthService.login - User not found');
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            console.log('✅ AuthService.login - User found:', user.email, user.name, user.role);
            if (user.status === 'BLOCKED') {
                throw (0, errorHandler_1.createError)('Your account has been blocked. Please contact support.', 403);
            }
            if (!user.password) {
                throw (0, errorHandler_1.createError)('Please sign in with Google or reset your password', 401);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(request.password, user.password);
            if (!isPasswordValid) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            if (user.role === 'DEALER' && user.dealer) {
                if (user.dealer.status === 'PENDING') {
                    throw (0, errorHandler_1.createError)('Your dealer account is pending approval. Please wait for admin approval.', 403);
                }
                if (user.dealer.status === 'REJECTED') {
                    throw (0, errorHandler_1.createError)('Your dealer account has been rejected. Please contact support.', 403);
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
                    role: user.role,
                    createdAt: user.createdAt,
                    dealer: user.dealer ? {
                        id: user.dealer.id,
                        referralCode: user.dealer.referralCode,
                        status: user.dealer.status,
                    } : null,
                },
            };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Invalid email or password')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('pending approval')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('rejected')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Login failed', 500);
        }
    }
    static async googleAuth(payload) {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                throw (0, errorHandler_1.createError)('Invalid email format', 400);
            }
            let user = await prisma.user.findUnique({
                where: { email: payload.email.toLowerCase() },
                include: { dealer: true },
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: payload.email.toLowerCase(),
                        name: payload.name.trim(),
                        role: payload.role || 'USER',
                    },
                    include: { dealer: true },
                });
            }
            else {
                if (user.name !== payload.name.trim()) {
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { name: payload.name.trim() },
                        include: { dealer: true },
                    });
                }
            }
            if (user.role === 'DEALER' && user.dealer) {
                if (user.dealer.status === 'PENDING') {
                    throw (0, errorHandler_1.createError)('Your dealer account is pending approval. Please wait for admin approval.', 403);
                }
                if (user.dealer.status === 'REJECTED') {
                    throw (0, errorHandler_1.createError)('Your dealer account has been rejected. Please contact support.', 403);
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
                    role: user.role,
                    createdAt: user.createdAt,
                    dealer: user.dealer ? {
                        id: user.dealer.id,
                        referralCode: user.dealer.referralCode,
                        status: user.dealer.status,
                    } : null,
                },
            };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('pending approval')) {
                throw error;
            }
            if (error instanceof Error && error.message.includes('rejected')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Google authentication failed', 500);
        }
    }
    static async dealerSignup(request) {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(request.email)) {
                throw (0, errorHandler_1.createError)('Invalid email format', 400);
            }
            const existingUser = await prisma.user.findUnique({
                where: { email: request.email.toLowerCase() },
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 400);
            }
            const passwordValidation = this.validatePassword(request.password);
            if (!passwordValidation.isValid) {
                throw (0, errorHandler_1.createError)(passwordValidation.error, 400);
            }
            const hashedPassword = await bcryptjs_1.default.hash(request.password, 12);
            let parentId = null;
            if (request.referralCode && request.referralCode.trim()) {
                const parentDealer = await prisma.dealer.findUnique({
                    where: { referralCode: request.referralCode.trim().toUpperCase() },
                });
                if (!parentDealer) {
                    throw (0, errorHandler_1.createError)('Invalid referral code', 400);
                }
                if (parentDealer.status !== 'APPROVED') {
                    throw (0, errorHandler_1.createError)('Referral code belongs to a dealer who is not yet approved', 400);
                }
                parentId = parentDealer.id;
            }
            const user = await prisma.user.create({
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
            const dealer = await prisma.dealer.create({
                data: {
                    userId: user.id,
                    referralCode: this.generateReferralCode(),
                    parentId: parentId,
                    status: 'PENDING',
                },
            });
            try {
                await (0, notifications_1.sendDealerApprovalEmail)({
                    dealerId: dealer.id,
                    dealerName: request.name,
                    dealerEmail: request.email,
                });
            }
            catch (emailError) {
                console.error('Failed to send dealer approval email:', emailError);
            }
            return {
                message: 'Dealer registration submitted successfully. Awaiting admin approval. You can sign in as a regular user while waiting.',
            };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Dealer registration failed', 500);
        }
    }
    static async applyForDealer(userId, request) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { dealer: true },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            if (user.role === 'DEALER') {
                throw (0, errorHandler_1.createError)('User is already a dealer', 400);
            }
            if (user.role === 'ADMIN') {
                throw (0, errorHandler_1.createError)('Admins cannot apply for dealer status', 400);
            }
            if (user.dealer) {
                if (user.dealer.status === 'PENDING') {
                    throw (0, errorHandler_1.createError)('You already have a pending dealer application', 400);
                }
                if (user.dealer.status === 'APPROVED') {
                    throw (0, errorHandler_1.createError)('You are already an approved dealer', 400);
                }
                if (user.dealer.status === 'REJECTED') {
                    throw (0, errorHandler_1.createError)('Your previous dealer application was rejected', 400);
                }
            }
            let parentId = null;
            if (request.referralCode && request.referralCode.trim()) {
                const parentDealer = await prisma.dealer.findUnique({
                    where: { referralCode: request.referralCode.trim().toUpperCase() },
                });
                if (!parentDealer) {
                    throw (0, errorHandler_1.createError)('Invalid referral code', 400);
                }
                if (parentDealer.status !== 'APPROVED') {
                    throw (0, errorHandler_1.createError)('Referral code belongs to a dealer who is not yet approved', 400);
                }
                parentId = parentDealer.id;
            }
            if (user.dealer) {
                await prisma.dealer.update({
                    where: { id: user.dealer.id },
                    data: {
                        status: 'PENDING',
                        parentId: parentId,
                    },
                });
            }
            else {
                await prisma.dealer.create({
                    data: {
                        userId: user.id,
                        referralCode: this.generateReferralCode(),
                        parentId: parentId,
                        status: 'PENDING',
                    },
                });
            }
            try {
                await (0, notifications_1.sendDealerApprovalEmail)({
                    dealerId: user.dealer?.id || 'new',
                    dealerName: user.name || 'Unknown',
                    dealerEmail: user.email,
                });
            }
            catch (emailError) {
                console.error('Failed to send dealer approval email:', emailError);
            }
            return {
                message: 'Dealer application submitted successfully. Awaiting admin approval.',
            };
        }
        catch (error) {
            if (error.message && error.message !== 'Failed to submit dealer application') {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to submit dealer application', 500);
        }
    }
    static async updateProfile(userId, data) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name: data.name.trim(),
                    mobile: data.mobile?.trim() || null,
                    aadhaar: data.aadhaar?.trim() || null,
                    profilePic: data.profilePic || null,
                },
            });
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
                    aadhaarImage: updatedUser.aadhaarImage,
                    profilePic: updatedUser.profilePic,
                    role: updatedUser.role,
                    createdAt: updatedUser.createdAt,
                    dealer: dealerInfo,
                },
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update profile', 500);
        }
    }
    static async updateProfilePicture(userId, profilePicUrl) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { profilePic: profilePicUrl },
            });
            return {
                message: 'Profile picture updated successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update profile picture', 500);
        }
    }
    static async updateAadhaarImage(userId, aadhaarImageUrl) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { aadhaarImage: aadhaarImageUrl },
            });
            return {
                message: 'Aadhaar image updated successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update aadhaar image', 500);
        }
    }
    static async getUserProfile(userId) {
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
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                mobile: user.mobile,
                aadhaar: user.aadhaar,
                aadhaarImage: user.aadhaarImage,
                profilePic: user.profilePic,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                dealer: user.dealer,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to get user profile', 500);
        }
    }
    static async changePassword(userId, data) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            if (!user.password) {
                throw (0, errorHandler_1.createError)('Password change not allowed for OAuth users', 400);
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw (0, errorHandler_1.createError)('Current password is incorrect', 400);
            }
            const passwordValidation = this.validatePassword(data.newPassword);
            if (!passwordValidation.isValid) {
                throw (0, errorHandler_1.createError)(passwordValidation.error, 400);
            }
            const hashedNewPassword = await bcryptjs_1.default.hash(data.newPassword, 12);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
            return {
                message: 'Password changed successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to change password', 500);
        }
    }
    static async approveDealer(dealerId) {
        try {
            const dealer = await prisma.dealer.findUnique({
                where: { id: dealerId },
                include: { user: true },
            });
            if (!dealer) {
                throw (0, errorHandler_1.createError)('Dealer not found', 404);
            }
            if (dealer.status === 'APPROVED') {
                throw (0, errorHandler_1.createError)('Dealer is already approved', 400);
            }
            await prisma.dealer.update({
                where: { id: dealerId },
                data: { status: 'APPROVED' },
            });
            await prisma.user.update({
                where: { id: dealer.userId },
                data: { role: 'DEALER' },
            });
            return {
                message: 'Dealer approved successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to approve dealer', 500);
        }
    }
    static async rejectDealer(dealerId) {
        try {
            const dealer = await prisma.dealer.findUnique({
                where: { id: dealerId },
                include: { user: true },
            });
            if (!dealer) {
                throw (0, errorHandler_1.createError)('Dealer not found', 404);
            }
            if (dealer.status === 'REJECTED') {
                throw (0, errorHandler_1.createError)('Dealer is already rejected', 400);
            }
            await prisma.dealer.update({
                where: { id: dealerId },
                data: { status: 'REJECTED' },
            });
            return {
                message: 'Dealer rejected successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to reject dealer', 500);
        }
    }
    static async getDealerHierarchy(dealerId) {
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
                throw (0, errorHandler_1.createError)('Dealer not found', 404);
            }
            return dealer;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to get dealer hierarchy', 500);
        }
    }
    static async checkDealerAccess(userId) {
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
        }
        catch (error) {
            return false;
        }
    }
    static generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map
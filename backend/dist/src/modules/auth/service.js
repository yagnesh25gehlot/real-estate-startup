"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const notifications_1 = require("../../mail/notifications");
const prisma = new client_1.PrismaClient();
class AuthService {
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });
    }
    static async googleAuth(payload) {
        try {
            let user = await prisma.user.findUnique({
                where: { email: payload.email },
                include: { dealer: true },
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email: payload.email,
                        name: payload.name,
                        role: payload.role || 'USER',
                    },
                    include: { dealer: true },
                });
            }
            const token = this.generateToken(user);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                token,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Authentication failed', 500);
        }
    }
    static async dealerSignup(request) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: request.email },
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User already exists', 400);
            }
            const user = await prisma.user.create({
                data: {
                    email: request.email,
                    name: request.name,
                    role: 'DEALER',
                },
            });
            const dealer = await prisma.dealer.create({
                data: {
                    userId: user.id,
                    referralCode: this.generateReferralCode(),
                    parentId: request.parentId,
                },
            });
            await (0, notifications_1.sendDealerApprovalEmail)({
                dealerId: dealer.id,
                dealerName: request.name,
                dealerEmail: request.email,
            });
            return {
                message: 'Dealer registration submitted successfully. Awaiting admin approval.',
            };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Dealer registration failed', 500);
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
    static generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map
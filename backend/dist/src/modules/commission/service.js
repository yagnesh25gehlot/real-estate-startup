"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const notifications_1 = require("../../mail/notifications");
const prisma = new client_1.PrismaClient();
class CommissionService {
    static async calculateCommissions(propertyId, saleAmount) {
        try {
            const property = await prisma.property.findUnique({
                where: { id: propertyId },
                include: {
                    dealer: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!property || !property.dealer) {
                throw (0, errorHandler_1.createError)('Property or dealer not found', 404);
            }
            const commissions = [];
            let currentDealer = property.dealer;
            let level = 1;
            const commissionConfigs = await prisma.commissionConfig.findMany({
                orderBy: { level: 'asc' },
            });
            while (currentDealer && level <= 3) {
                const config = commissionConfigs.find(c => c.level === level);
                if (!config)
                    break;
                const commissionAmount = (saleAmount * config.percentage) / 100;
                const commission = await prisma.commission.create({
                    data: {
                        dealerId: currentDealer.id,
                        propertyId,
                        amount: commissionAmount,
                        level,
                    },
                });
                commissions.push(commission);
                await (0, notifications_1.sendCommissionEarningsEmail)({
                    dealerEmail: currentDealer.user.email,
                    dealerName: currentDealer.user.name || 'Dealer',
                    propertyTitle: property.title,
                    commissionAmount,
                    level,
                });
                currentDealer = await prisma.dealer.findUnique({
                    where: { id: currentDealer.parentId || '' },
                    include: {
                        user: true,
                    },
                });
                level++;
            }
            return commissions;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to calculate commissions', 500);
        }
    }
    static async getDealerCommissions(dealerId) {
        try {
            return await prisma.commission.findMany({
                where: { dealerId },
                include: {
                    property: true,
                    dealer: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch dealer commissions', 500);
        }
    }
    static async getDealerHierarchy(dealerId) {
        try {
            return await prisma.dealer.findUnique({
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
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch dealer hierarchy', 500);
        }
    }
    static async getDealerStats(dealerId) {
        try {
            const [totalCommissions, totalProperties, childrenCount] = await Promise.all([
                prisma.commission.aggregate({
                    where: { dealerId },
                    _sum: { amount: true },
                }),
                prisma.property.count({
                    where: { dealerId },
                }),
                prisma.dealer.count({
                    where: { parentId: dealerId },
                }),
            ]);
            return {
                totalCommissions: totalCommissions._sum.amount || 0,
                totalProperties,
                childrenCount,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch dealer stats', 500);
        }
    }
    static async updateCommissionConfig(level, percentage) {
        try {
            await prisma.commissionConfig.upsert({
                where: { level },
                update: { percentage },
                create: { level, percentage },
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update commission config', 500);
        }
    }
    static async getCommissionConfig() {
        try {
            return await prisma.commissionConfig.findMany({
                orderBy: { level: 'asc' },
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch commission config', 500);
        }
    }
    static async getPendingDealers() {
        try {
            return await prisma.dealer.findMany({
                where: {
                    user: {
                        role: 'DEALER',
                    },
                },
                include: {
                    user: true,
                    parent: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch pending dealers', 500);
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
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to approve dealer', 500);
        }
    }
    static async getDealerByReferralCode(referralCode) {
        try {
            return await prisma.dealer.findUnique({
                where: { referralCode },
                include: {
                    user: true,
                },
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch dealer by referral code', 500);
        }
    }
    static async getDealerTree(dealerId, maxDepth = 3) {
        try {
            const buildTree = async (dealerId, depth = 0) => {
                if (depth >= maxDepth)
                    return null;
                const dealer = await prisma.dealer.findUnique({
                    where: { id: dealerId },
                    include: {
                        user: true,
                        children: true,
                    },
                });
                if (!dealer)
                    return null;
                const children = await Promise.all(dealer.children.map(child => buildTree(child.id, depth + 1)));
                return {
                    id: dealer.id,
                    user: dealer.user,
                    children: children.filter(Boolean),
                    level: depth,
                };
            };
            return await buildTree(dealerId);
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to build dealer tree', 500);
        }
    }
}
exports.CommissionService = CommissionService;
//# sourceMappingURL=service.js.map
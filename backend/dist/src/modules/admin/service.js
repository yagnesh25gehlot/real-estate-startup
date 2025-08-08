"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const prisma = new client_1.PrismaClient();
class AdminService {
    static async getDashboardStats() {
        try {
            const [totalUsers, totalProperties, totalBookings, totalRevenue, pendingDealers, recentTransactions,] = await Promise.all([
                prisma.user.count(),
                prisma.property.count(),
                prisma.booking.count(),
                prisma.payment.aggregate({
                    _sum: { amount: true },
                }),
                prisma.dealer.count({
                    where: {
                        user: {
                            role: 'DEALER',
                        },
                    },
                }),
                prisma.payment.findMany({
                    take: 10,
                    include: {
                        booking: {
                            include: {
                                property: true,
                                user: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
            ]);
            return {
                totalUsers,
                totalProperties,
                totalBookings,
                totalRevenue: totalRevenue._sum.amount || 0,
                pendingDealers,
                recentTransactions,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch dashboard stats', 500);
        }
    }
    static async getPropertyAnalytics() {
        try {
            const [propertiesByStatus, propertiesByType, propertiesByLocation] = await Promise.all([
                prisma.property.groupBy({
                    by: ['status'],
                    _count: { id: true },
                }),
                prisma.property.groupBy({
                    by: ['type'],
                    _count: { id: true },
                }),
                prisma.property.groupBy({
                    by: ['location'],
                    _count: { id: true },
                }),
            ]);
            return {
                byStatus: propertiesByStatus,
                byType: propertiesByType,
                byLocation: propertiesByLocation,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch property analytics', 500);
        }
    }
    static async getBookingAnalytics() {
        try {
            const [bookingsByStatus, monthlyBookings, revenueByMonth] = await Promise.all([
                prisma.booking.groupBy({
                    by: ['status'],
                    _count: { id: true },
                }),
                prisma.booking.groupBy({
                    by: ['status'],
                    _count: { id: true },
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                }),
                prisma.payment.groupBy({
                    by: ['createdAt'],
                    _sum: { amount: true },
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                }),
            ]);
            return {
                byStatus: bookingsByStatus,
                monthlyBookings,
                revenueByMonth,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch booking analytics', 500);
        }
    }
    static async getDealerAnalytics() {
        try {
            const [totalDealers, dealersByLevel, commissionStats] = await Promise.all([
                prisma.dealer.count(),
                prisma.dealer.groupBy({
                    by: ['parentId'],
                    _count: { id: true },
                }),
                prisma.commission.aggregate({
                    _sum: { amount: true },
                    _count: { id: true },
                }),
            ]);
            return {
                totalDealers,
                dealersByLevel,
                totalCommissions: commissionStats._sum.amount || 0,
                totalCommissionTransactions: commissionStats._count.id,
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch dealer analytics', 500);
        }
    }
    static async getRecentActivity() {
        try {
            const activities = await prisma.$transaction([
                prisma.property.findMany({
                    take: 5,
                    include: {
                        owner: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.booking.findMany({
                    take: 5,
                    include: {
                        property: true,
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.payment.findMany({
                    take: 5,
                    include: {
                        booking: {
                            include: {
                                property: true,
                                user: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.dealer.findMany({
                    take: 5,
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
            ]);
            return [
                ...activities[0].map(p => ({ type: 'property', data: p })),
                ...activities[1].map(b => ({ type: 'booking', data: b })),
                ...activities[2].map(p => ({ type: 'payment', data: p })),
                ...activities[3].map(d => ({ type: 'dealer', data: d })),
            ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch recent activity', 500);
        }
    }
    static async updateSystemSettings(settings) {
        try {
            if (settings.commissionRates) {
                for (const [level, percentage] of Object.entries(settings.commissionRates)) {
                    await prisma.commissionConfig.upsert({
                        where: { level: parseInt(level) },
                        update: { percentage: parseFloat(percentage) },
                        create: { level: parseInt(level), percentage: parseFloat(percentage) },
                    });
                }
            }
            if (settings.bookingDuration) {
                console.log('Booking duration updated:', settings.bookingDuration);
            }
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update system settings', 500);
        }
    }
    static async getSystemSettings() {
        try {
            const commissionConfig = await prisma.commissionConfig.findMany({
                orderBy: { level: 'asc' },
            });
            return {
                commissionRates: commissionConfig.reduce((acc, config) => {
                    acc[config.level] = config.percentage;
                    return acc;
                }, {}),
                bookingDuration: parseInt(process.env.DEFAULT_BOOKING_DURATION_DAYS || '3'),
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch system settings', 500);
        }
    }
    static async getUserCount() {
        try {
            const count = await prisma.user.count({
                where: {
                    role: {
                        in: ['USER', 'DEALER']
                    }
                }
            });
            return count;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch user count', 500);
        }
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=service.js.map
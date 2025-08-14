"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
    static async getAllUsers() {
        try {
            console.log('Fetching all users...');
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                    mobile: true,
                    aadhaar: true,
                    aadhaarImage: true,
                    profilePic: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    dealer: {
                        select: {
                            id: true,
                            referralCode: true,
                            status: true,
                            commission: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            console.log(`Found ${users.length} users`);
            return users;
        }
        catch (error) {
            console.error('Error fetching users:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch users', 500);
        }
    }
    static async getAllBookings() {
        try {
            console.log('Fetching all bookings...');
            const bookings = await prisma.booking.findMany({
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            console.log(`Found ${bookings.length} bookings`);
            return bookings;
        }
        catch (error) {
            console.error('Error fetching bookings:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch bookings', 500);
        }
    }
    static async updateBookingStatus(bookingId, status) {
        try {
            console.log(`Updating booking ${bookingId} status to ${status}`);
            const booking = await prisma.booking.update({
                where: { id: bookingId },
                data: { status },
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                },
            });
            console.log(`Booking status updated successfully`);
            return booking;
        }
        catch (error) {
            console.error('Error updating booking status:', error);
            throw (0, errorHandler_1.createError)('Failed to update booking status', 500);
        }
    }
    static async getDealerRequests() {
        try {
            console.log('Fetching dealer requests...');
            const dealers = await prisma.dealer.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            createdAt: true,
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            console.log(`Found ${dealers.length} dealer requests`);
            return dealers;
        }
        catch (error) {
            console.error('Error fetching dealer requests:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch dealer requests', 500);
        }
    }
    static async approveDealerRequest(dealerId) {
        try {
            console.log(`Approving dealer request ${dealerId}`);
            const dealer = await prisma.dealer.findUnique({
                where: { id: dealerId },
                include: { user: true },
            });
            if (!dealer) {
                throw (0, errorHandler_1.createError)('Dealer not found', 404);
            }
            await prisma.dealer.update({
                where: { id: dealerId },
                data: { status: 'APPROVED' },
            });
            await prisma.user.update({
                where: { id: dealer.userId },
                data: { role: 'DEALER' },
            });
            console.log(`Dealer request approved successfully`);
            return { message: 'Dealer approved successfully' };
        }
        catch (error) {
            console.error('Error approving dealer request:', error);
            throw (0, errorHandler_1.createError)('Failed to approve dealer request', 500);
        }
    }
    static async rejectDealerRequest(dealerId) {
        try {
            console.log(`Rejecting dealer request ${dealerId}`);
            const dealer = await prisma.dealer.findUnique({
                where: { id: dealerId },
                include: { user: true },
            });
            if (!dealer) {
                throw (0, errorHandler_1.createError)('Dealer not found', 404);
            }
            await prisma.dealer.update({
                where: { id: dealerId },
                data: { status: 'REJECTED' },
            });
            await prisma.user.update({
                where: { id: dealer.userId },
                data: { role: 'USER' },
            });
            console.log(`Dealer request rejected successfully`);
            return { message: 'Dealer rejected successfully' };
        }
        catch (error) {
            console.error('Error rejecting dealer request:', error);
            throw (0, errorHandler_1.createError)('Failed to reject dealer request', 500);
        }
    }
    static async getDealerTree() {
        try {
            console.log('Building dealer tree...');
            const allDealers = await prisma.dealer.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    children: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                }
                            },
                        }
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            const buildTree = (dealers, parentId = null, level = 0) => {
                const nodes = dealers.filter(dealer => dealer.parentId === parentId);
                return nodes.map(dealer => {
                    const children = buildTree(dealers, dealer.id, level + 1);
                    const totalChildren = children.reduce((sum, child) => sum + child.totalChildren + 1, 0);
                    const totalCommission = children.reduce((sum, child) => sum + child.totalCommission, 0) + dealer.commission;
                    return {
                        id: dealer.id,
                        user: dealer.user,
                        referralCode: dealer.referralCode,
                        status: dealer.status,
                        commission: dealer.commission,
                        children: children,
                        level: level,
                        totalChildren: totalChildren,
                        totalCommission: totalCommission,
                    };
                });
            };
            const tree = buildTree(allDealers);
            console.log(`Built dealer tree with ${tree.length} root nodes`);
            return tree;
        }
        catch (error) {
            console.error('Error building dealer tree:', error);
            throw (0, errorHandler_1.createError)('Failed to build dealer tree', 500);
        }
    }
    static async blockUser(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            if (user.role === 'ADMIN') {
                throw (0, errorHandler_1.createError)('Cannot block admin users', 400);
            }
            await prisma.user.update({
                where: { id: userId },
                data: { status: 'BLOCKED' },
            });
            return {
                message: 'User blocked successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to block user', 500);
        }
    }
    static async unblockUser(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            await prisma.user.update({
                where: { id: userId },
                data: { status: 'ACTIVE' },
            });
            return {
                message: 'User unblocked successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to unblock user', 500);
        }
    }
    static async createUser(data) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email.toLowerCase() },
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 400);
            }
            let hashedPassword = null;
            if (data.password) {
                hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
            }
            const user = await prisma.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    name: data.name.trim(),
                    password: hashedPassword,
                    mobile: data.mobile?.trim() || null,
                    aadhaar: data.aadhaar?.trim() || null,
                    role: data.role,
                },
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
            if (data.role === 'DEALER') {
                await prisma.dealer.create({
                    data: {
                        userId: user.id,
                        referralCode: this.generateReferralCode(),
                        status: 'APPROVED',
                    },
                });
            }
            return user;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to create user', 500);
        }
    }
    static async updateUser(userId, data) {
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
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name: data.name?.trim() || user.name,
                    mobile: data.mobile?.trim() || user.mobile,
                    aadhaar: data.aadhaar?.trim() || user.aadhaar,
                    role: data.role || user.role,
                },
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
            if (data.role && data.role !== user.role) {
                if (data.role === 'DEALER' && user.role !== 'DEALER') {
                    await prisma.dealer.create({
                        data: {
                            userId: user.id,
                            referralCode: this.generateReferralCode(),
                            status: 'APPROVED',
                        },
                    });
                }
                else if (user.role === 'DEALER' && data.role !== 'DEALER') {
                    await prisma.dealer.deleteMany({
                        where: { userId: user.id },
                    });
                }
            }
            return updatedUser;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update user', 500);
        }
    }
    static async updateUserPassword(userId, password) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                },
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
            return updatedUser;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update user password', 500);
        }
    }
    static async deleteUser(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            if (user.role === 'ADMIN') {
                throw (0, errorHandler_1.createError)('Cannot delete admin users', 400);
            }
            await prisma.$transaction([
                prisma.dealer.deleteMany({
                    where: { userId },
                }),
                prisma.booking.deleteMany({
                    where: { userId },
                }),
                prisma.user.delete({
                    where: { id: userId },
                }),
            ]);
            return {
                message: 'User deleted successfully',
            };
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to delete user', 500);
        }
    }
    static async updateUserProfilePicture(userId, profilePicUrl) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { profilePic: profilePicUrl },
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
            return updatedUser;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update user profile picture', 500);
        }
    }
    static async updateUserAadhaarImage(userId, aadhaarImageUrl) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { aadhaarImage: aadhaarImageUrl },
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
            return updatedUser;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update user aadhaar image', 500);
        }
    }
    static async getUserById(userId) {
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
            return user;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to get user', 500);
        }
    }
    static generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=service.js.map
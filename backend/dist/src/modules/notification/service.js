"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const prisma = new client_1.PrismaClient();
class NotificationService {
    static async createNotification(data) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: data.data || {},
                    adminOnly: data.adminOnly || false,
                },
            });
            console.log('🔔 ADMIN NOTIFICATION:', {
                type: data.type,
                title: data.title,
                message: data.message,
                timestamp: new Date().toISOString(),
            });
            return notification;
        }
        catch (error) {
            console.error('Failed to create notification:', error);
            throw (0, errorHandler_1.createError)('Failed to create notification', 500);
        }
    }
    static async getAdminNotifications(page = 1, limit = 20, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const where = { adminOnly: true };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.read !== undefined) {
                where.read = filters.read === 'true';
            }
            if (filters.search) {
                where.OR = [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { message: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters.date) {
                const now = new Date();
                let filterDate = new Date();
                switch (filters.date) {
                    case 'TODAY':
                        filterDate.setHours(0, 0, 0, 0);
                        where.createdAt = { gte: filterDate };
                        break;
                    case 'WEEK':
                        filterDate.setDate(filterDate.getDate() - 7);
                        where.createdAt = { gte: filterDate };
                        break;
                    case 'MONTH':
                        filterDate.setMonth(filterDate.getMonth() - 1);
                        where.createdAt = { gte: filterDate };
                        break;
                }
            }
            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.notification.count({ where }),
            ]);
            return {
                notifications,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.error('Failed to fetch admin notifications:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch notifications', 500);
        }
    }
    static async markAsRead(notificationId) {
        try {
            const notification = await prisma.notification.update({
                where: { id: notificationId },
                data: { read: true },
            });
            return notification;
        }
        catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw (0, errorHandler_1.createError)('Failed to mark notification as read', 500);
        }
    }
    static async markAllAsRead() {
        try {
            await prisma.notification.updateMany({
                where: { read: false, adminOnly: true },
                data: { read: true },
            });
            return { message: 'All notifications marked as read' };
        }
        catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw (0, errorHandler_1.createError)('Failed to mark all notifications as read', 500);
        }
    }
    static async getUnreadCount() {
        try {
            const count = await prisma.notification.count({
                where: { read: false, adminOnly: true },
            });
            return count;
        }
        catch (error) {
            console.error('Failed to get unread count:', error);
            return 0;
        }
    }
    static async cleanupOldNotifications() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const deleted = await prisma.notification.deleteMany({
                where: {
                    createdAt: { lt: thirtyDaysAgo },
                    read: true,
                },
            });
            console.log(`🧹 Cleaned up ${deleted.count} old notifications`);
            return { deletedCount: deleted.count };
        }
        catch (error) {
            console.error('Failed to cleanup old notifications:', error);
            throw (0, errorHandler_1.createError)('Failed to cleanup old notifications', 500);
        }
    }
    static async notifyPropertyAdded(property, user) {
        await this.createNotification({
            type: 'PROPERTY_ADDED',
            title: 'New Property Listed',
            message: `User ${user.name} (${user.email}) has listed a new property: "${property.title}"`,
            data: {
                propertyId: property.id,
                propertyTitle: property.title,
                propertyPrice: property.price,
                propertyLocation: property.location,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
            },
            adminOnly: true,
        });
    }
    static async notifyPropertyUpdated(property, user, changes) {
        await this.createNotification({
            type: 'PROPERTY_UPDATED',
            title: 'Property Updated',
            message: `User ${user.name} (${user.email}) has updated property: "${property.title}"`,
            data: {
                propertyId: property.id,
                propertyTitle: property.title,
                changes,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
            },
            adminOnly: true,
        });
    }
    static async notifyUserSignup(user) {
        await this.createNotification({
            type: 'USER_SIGNUP',
            title: 'New User Registration',
            message: `New user registered: ${user.name} (${user.email})`,
            data: {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userRole: user.role,
            },
            adminOnly: true,
        });
    }
    static async notifyDealerRequest(dealer, user) {
        await this.createNotification({
            type: 'DEALER_REQUEST',
            title: 'New Dealer Request',
            message: `User ${user.name} (${user.email}) has requested to become a dealer`,
            data: {
                dealerId: dealer.id,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                referralCode: dealer.referralCode,
            },
            adminOnly: true,
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=service.js.map
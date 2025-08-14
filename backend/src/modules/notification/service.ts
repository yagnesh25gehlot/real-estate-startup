import { PrismaClient } from '@prisma/client';
import { createError } from '../../utils/errorHandler';

const prisma = new PrismaClient();

export interface NotificationData {
  type: 'PROPERTY_ADDED' | 'PROPERTY_UPDATED' | 'USER_SIGNUP' | 'BOOKING_CREATED' | 'DEALER_REQUEST';
  title: string;
  message: string;
  data?: any;
  adminOnly?: boolean;
}

export class NotificationService {
  // Create a notification
  static async createNotification(data: NotificationData): Promise<any> {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data ? JSON.stringify(data.data) : null,
          adminOnly: data.adminOnly || false,
        },
      });

      // Log to console for immediate visibility
      console.log('🔔 ADMIN NOTIFICATION:', {
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
      });

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw createError('Failed to create notification', 500);
    }
  }

  // Get all notifications for admin
  static async getAdminNotifications(page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { adminOnly: true };

      // Type filter
      if (filters.type) {
        where.type = filters.type;
      }

      // Read status filter
      if (filters.read !== undefined) {
        where.read = filters.read === 'true';
      }

      // Search filter
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { message: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Date filter
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
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
      throw createError('Failed to fetch notifications', 500);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<any> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      return notification;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw createError('Failed to mark notification as read', 500);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<any> {
    try {
      await prisma.notification.updateMany({
        where: { read: false, adminOnly: true },
        data: { read: true },
      });

      return { message: 'All notifications marked as read' };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw createError('Failed to mark all notifications as read', 500);
    }
  }

  // Get unread notification count
  static async getUnreadCount(): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: { read: false, adminOnly: true },
      });

      return count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Delete old notifications (older than 30 days)
  static async cleanupOldNotifications(): Promise<any> {
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
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
      throw createError('Failed to cleanup old notifications', 500);
    }
  }

  // Property added notification
  static async notifyPropertyAdded(property: any, user: any): Promise<void> {
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

  // Property updated notification
  static async notifyPropertyUpdated(property: any, user: any, changes: any): Promise<void> {
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

  // User signup notification
  static async notifyUserSignup(user: any): Promise<void> {
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

  // Dealer request notification
  static async notifyDealerRequest(dealer: any, user: any): Promise<void> {
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

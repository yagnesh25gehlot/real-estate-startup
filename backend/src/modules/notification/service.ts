import { PrismaClient } from '@prisma/client';
import { createError } from '../../utils/errorHandler';
import { WhatsAppService } from '../../services/whatsappService';

const prisma = new PrismaClient();

export class NotificationService {
  // Create a new notification
  static async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
  }): Promise<any> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
        },
      });

      // Log to console for immediate visibility
      console.log('🔔 NOTIFICATION:', {
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
      });

      // Send WhatsApp notification
      try {
        await WhatsAppService.sendNotification({
          type: data.type,
          title: data.title,
          message: data.message,
          data: data,
        });
        console.log('📱 WhatsApp notification sent successfully');
      } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error);
        // Don't throw error, continue with normal flow
      }

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
      const where: any = {};

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

  // Get notifications for a specific user
  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      return {
        notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      throw createError('Failed to fetch notifications', 500);
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<any> {
    try {
      const notification = await prisma.notification.delete({
        where: { id: notificationId },
      });

      return notification;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw createError('Failed to delete notification', 500);
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<any> {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      return result;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw createError('Failed to mark all notifications as read', 500);
    }
  }

  // Get unread notification count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: { userId, read: false },
      });

      return count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

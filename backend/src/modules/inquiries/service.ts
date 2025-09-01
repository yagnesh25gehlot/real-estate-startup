import prisma from '../../config/database';
import { TelegramService } from '../../services/telegramService';

export interface CreateInquiryData {
  message: string;
  mobileNumber: string;
}

export class InquiryService {
  static async createInquiry(data: CreateInquiryData) {
    try {
      console.log('Creating inquiry with data:', data);
      
      // Create the inquiry
      const inquiry = await prisma.inquiry.create({
        data: {
          message: data.message,
          mobileNumber: data.mobileNumber,
        },
      });

      console.log('Inquiry created successfully:', inquiry);

      // Create notification for admin (optional - don't fail if this fails)
      try {
        await prisma.notification.create({
          data: {
            userId: 'admin', // This will be handled by the admin dashboard
            title: 'New Inquiry Received',
            message: `New inquiry from ${data.mobileNumber}: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}`,
            type: 'INFO',
          },
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the inquiry creation if notification fails
      }

      // Send Telegram notification (optional - don't fail if this fails)
      try {
        await TelegramService.sendNotification({
          type: 'user',
          title: 'New Inquiry Received',
          message: `New inquiry from ${data.mobileNumber}`,
          details: {
            Mobile: data.mobileNumber,
            Message: data.message,
            Time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          }
        });
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't fail the inquiry creation if Telegram fails
      }

      return inquiry;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw new Error('Failed to create inquiry');
    }
  }

  static async getAllInquiries() {
    try {
      const inquiries = await prisma.inquiry.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return inquiries;
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      throw new Error('Failed to fetch inquiries');
    }
  }

  static async updateInquiryStatus(id: string, status: string) {
    try {
      const inquiry = await prisma.inquiry.update({
        where: { id },
        data: { status },
      });
      return inquiry;
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw new Error('Failed to update inquiry status');
    }
  }

  static async getInquiryById(id: string) {
    try {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id },
      });
      return inquiry;
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      throw new Error('Failed to fetch inquiry');
    }
  }

  static async deleteInquiry(id: string) {
    try {
      const inquiry = await prisma.inquiry.delete({
        where: { id },
      });
      return inquiry;
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      throw new Error('Failed to delete inquiry');
    }
  }
}

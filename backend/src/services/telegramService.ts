import axios from 'axios';

interface TelegramConfig {
  botToken: string;
  groupId: string;
  enabled: boolean;
}

interface NotificationData {
  type: 'property' | 'booking' | 'user' | 'payment' | 'system';
  title: string;
  message: string;
  details?: Record<string, any>;
  url?: string;
}

class TelegramNotificationService {
  private config: TelegramConfig;

  constructor() {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '8110714233:AAFH_kwId5WNcPvBcaUpBDxC1SmXlckkquU',
      groupId: process.env.TELEGRAM_GROUP_ID || '-1003068406152',
      enabled: process.env.TELEGRAM_ENABLED === 'true' || true
    };
  }

  /**
   * Send a notification to Telegram
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('📱 Telegram notifications are disabled');
      return false;
    }

    try {
      const message = this.formatMessage(data);
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      
      const response = await axios.post(url, {
        chat_id: this.config.groupId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      if (response.data.ok) {
        console.log('✅ Telegram notification sent successfully');
        return true;
      } else {
        console.error('❌ Telegram API error:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error);
      return false;
    }
  }

  /**
   * Format notification data into a readable message
   */
  private formatMessage(data: NotificationData): string {
    const { type, title, message, details, url } = data;
    
    let emoji = '📢';
    let formattedMessage = '';

    // Add emoji based on notification type
    switch (type) {
      case 'property':
        emoji = '🏠';
        break;
      case 'booking':
        emoji = '💰';
        break;
      case 'user':
        emoji = '👤';
        break;
      case 'payment':
        emoji = '💳';
        break;
      case 'system':
        emoji = '⚠️';
        break;
    }

    // Build the message
    formattedMessage += `${emoji} *${title}*\n\n`;
    formattedMessage += `${message}\n\n`;

    // Add details if available
    if (details && Object.keys(details).length > 0) {
      formattedMessage += '*Details:*\n';
      for (const [key, value] of Object.entries(details)) {
        if (value !== null && value !== undefined && value !== '') {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          formattedMessage += `• *${formattedKey}:* ${value}\n`;
        }
      }
      formattedMessage += '\n';
    }

    // Add timestamp
    formattedMessage += `🕐 *Time:* ${new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`;

    // Add URL if available
    if (url) {
      formattedMessage += `🔗 [View Details](${url})\n`;
    }

    return formattedMessage;
  }

  /**
   * Send property notification
   */
  async sendPropertyNotification(property: any): Promise<boolean> {
    const message = `New property has been listed on RealtyTopper`;
    const details = {
      'Property Title': property.title,
      'Location': property.location,
      'Property Type': property.propertyType,
      'Action': property.action,
      'Price': property.action === 'RENT' ? `₹${property.rentPerMonth}/month` : 
               property.action === 'LEASE' ? `₹${property.totalCharges}` :
               `₹${property.price}`,
      'Area': `${property.minArea} - ${property.maxArea} sq ft`,
      'BHK': property.bhk || 'N/A',
      'Listed By': property.registeredAs || 'Owner',
      'Contact': property.mobileNumber || 'N/A'
    };

    return this.sendNotification({
      type: 'property',
      title: '🏠 New Property Listed',
      message,
      details,
      url: `https://realtytopper.com/property/${property.id}`
    });
  }

  /**
   * Send booking notification
   */
  async sendBookingNotification(booking: any): Promise<boolean> {
    const message = `A new booking has been confirmed`;
    const details = {
      'Property': booking.property?.title || 'N/A',
      'User Name': booking.user?.name || 'N/A',
      'User Email': booking.user?.email || 'N/A',
      'User Phone': booking.user?.mobile || 'N/A',
      'Booking Amount': `₹${booking.amount}`,
      'Booking Date': new Date(booking.createdAt).toLocaleDateString('en-IN'),
      'Status': booking.status
    };

    return this.sendNotification({
      type: 'booking',
      title: '💰 New Booking Confirmed',
      message,
      details,
      url: `https://realtytopper.com/admin/bookings`
    });
  }

  /**
   * Send user registration notification
   */
  async sendUserNotification(user: any): Promise<boolean> {
    const message = `A new user has registered on RealtyTopper`;
    const details = {
      'Name': user.name,
      'Email': user.email,
      'Phone': user.mobile || 'N/A',
      'Role': user.role,
      'Status': user.status
    };

    return this.sendNotification({
      type: 'user',
      title: '👤 New User Registration',
      message,
      details,
      url: `https://realtytopper.com/admin/users`
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(payment: any): Promise<boolean> {
    const message = `A listing fee payment has been received`;
    const details = {
      'Property': payment.property?.title || 'N/A',
      'User': payment.user?.name || 'N/A',
      'Amount': `₹${payment.amount || 100}`,
      'Payment Type': 'Listing Fee',
      'Status': 'Completed'
    };

    return this.sendNotification({
      type: 'payment',
      title: '💳 Listing Fee Payment',
      message,
      details,
      url: `https://realtytopper.com/admin/properties`
    });
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(title: string, message: string, details?: Record<string, any>): Promise<boolean> {
    return this.sendNotification({
      type: 'system',
      title,
      message,
      details
    });
  }

  /**
   * Test the Telegram connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testMessage = '🤖 *RealtyTopper Bot Test*\n\nThis is a test message to verify the Telegram integration is working correctly.\n\n✅ If you see this message, the bot is properly configured!';
      
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      const response = await axios.post(url, {
        chat_id: this.config.groupId,
        text: testMessage,
        parse_mode: 'Markdown'
      });

      if (response.data.ok) {
        console.log('✅ Telegram test message sent successfully');
        return true;
      } else {
        console.error('❌ Telegram test failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Telegram test failed:', error);
      return false;
    }
  }
}

export const TelegramService = new TelegramNotificationService();

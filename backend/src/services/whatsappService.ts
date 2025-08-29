import axios from 'axios';

interface WhatsAppMessage {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: string;
  document?: string;
  caption?: string;
}

export class WhatsAppService {
  private static readonly WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private static readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  private static readonly GROUP_ID = process.env.WHATSAPP_GROUP_ID || 'FDiiHAGGLW58LT5soL0CP5';

  /**
   * Send a text message to WhatsApp group using WhatsApp Cloud API
   */
  static async sendTextMessage(message: string): Promise<boolean> {
    try {
      console.log('📱 Sending WhatsApp message:', message);
      
      // If we have WhatsApp Cloud API credentials, use them
      if (this.ACCESS_TOKEN && this.PHONE_NUMBER_ID) {
        return await this.sendViaCloudAPI(message);
      } else {
        // Fallback to manual URL generation
        return await this.sendViaManualURL(message);
      }
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send message via WhatsApp Cloud API
   */
  private static async sendViaCloudAPI(message: string): Promise<boolean> {
    try {
      const url = `${this.WHATSAPP_API_URL}/${this.PHONE_NUMBER_ID}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.GROUP_ID,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ WhatsApp Cloud API response:', response.data);
      return true;
    } catch (error) {
      console.error('❌ WhatsApp Cloud API error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send message via manual URL (fallback method)
   */
  private static async sendViaManualURL(message: string): Promise<boolean> {
    try {
      const whatsappUrl = `https://wa.me/${this.GROUP_ID}?text=${encodeURIComponent(message)}`;
      
      console.log('📱 WhatsApp URL (manual):', whatsappUrl);
      console.log('📱 To send this message:');
      console.log('   1. Copy the URL above');
      console.log('   2. Open it in a browser');
      console.log('   3. Click "Continue to Chat"');
      console.log('   4. The message will be pre-filled in WhatsApp');
      
      // For now, we'll simulate success
      return true;
    } catch (error) {
      console.error('❌ Failed to generate WhatsApp URL:', error);
      return false;
    }
  }

  /**
   * Send a notification message to WhatsApp group
   */
  static async sendNotification(notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<boolean> {
    try {
      const emoji = this.getNotificationEmoji(notification.type);
      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const message = `${emoji} *${notification.title}*\n\n${notification.message}\n\n📅 ${timestamp}\n🔗 ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/notifications`;

      return await this.sendTextMessage(message);
    } catch (error) {
      console.error('❌ Failed to send WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Get emoji for notification type
   */
  private static getNotificationEmoji(type: string): string {
    switch (type) {
      case 'PROPERTY_ADDED':
        return '🏠';
      case 'PROPERTY_UPDATED':
        return '✏️';
      case 'USER_SIGNUP':
        return '👤';
      case 'BOOKING_CREATED':
        return '📅';
      case 'DEALER_REQUEST':
        return '🤝';
      case 'PAYMENT_RECEIVED':
        return '💰';
      case 'PROPERTY_SOLD':
        return '🎉';
      default:
        return '🔔';
    }
  }

  /**
   * Send a formatted property notification
   */
  static async sendPropertyNotification(property: any, action: 'ADDED' | 'UPDATED'): Promise<boolean> {
    try {
      const emoji = action === 'ADDED' ? '🏠' : '✏️';
      const actionText = action === 'ADDED' ? 'New Property Listed' : 'Property Updated';
      
      const message = `${emoji} *${actionText}*\n\n` +
        `*${property.title}*\n` +
        `📍 ${property.location}\n` +
        `💰 ₹${property.price?.toLocaleString() || property.perMonthCharges?.toLocaleString() || '0'}\n` +
        `🏢 ${property.type} - ${property.action}\n` +
        `📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n` +
        `🔗 View: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/property/${property.id}`;

      return await this.sendTextMessage(message);
    } catch (error) {
      console.error('❌ Failed to send property WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Send a formatted booking notification
   */
  static async sendBookingNotification(booking: any): Promise<boolean> {
    try {
      const message = `📅 *New Booking*\n\n` +
        `🏠 ${booking.property.title}\n` +
        `👤 ${booking.user.name || booking.user.email}\n` +
        `💰 ₹${booking.bookingCharges?.toLocaleString() || '0'}\n` +
        `📅 ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}\n` +
        `🕐 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n` +
        `🔗 View: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/bookings`;

      return await this.sendTextMessage(message);
    } catch (error) {
      console.error('❌ Failed to send booking WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Send a formatted user signup notification
   */
  static async sendUserSignupNotification(user: any): Promise<boolean> {
    try {
      const message = `👤 *New User Signup*\n\n` +
        `📧 ${user.email}\n` +
        `👤 ${user.name || 'N/A'}\n` +
        `📱 ${user.mobile || 'N/A'}\n` +
        `🏷️ ${user.role}\n` +
        `🕐 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n` +
        `🔗 View: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/users`;

      return await this.sendTextMessage(message);
    } catch (error) {
      console.error('❌ Failed to send user signup WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Send a formatted dealer request notification
   */
  static async sendDealerRequestNotification(request: any): Promise<boolean> {
    try {
      const message = `🤝 *New Dealer Request*\n\n` +
        `👤 ${request.user.name || request.user.email}\n` +
        `📧 ${request.user.email}\n` +
        `📱 ${request.user.mobile || 'N/A'}\n` +
        `📄 ${request.status}\n` +
        `🕐 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n` +
        `🔗 View: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dealer-requests`;

      return await this.sendTextMessage(message);
    } catch (error) {
      console.error('❌ Failed to send dealer request WhatsApp notification:', error);
      return false;
    }
  }

  /**
   * Check if WhatsApp Cloud API is configured
   */
  static isCloudAPIConfigured(): boolean {
    return !!(this.ACCESS_TOKEN && this.PHONE_NUMBER_ID);
  }

  /**
   * Get configuration status
   */
  static getConfigurationStatus(): {
    cloudAPI: boolean;
    groupId: string;
    phoneNumberId: string | null;
    hasAccessToken: boolean;
  } {
    return {
      cloudAPI: this.isCloudAPIConfigured(),
      groupId: this.GROUP_ID,
      phoneNumberId: this.PHONE_NUMBER_ID || null,
      hasAccessToken: !!this.ACCESS_TOKEN
    };
  }
}

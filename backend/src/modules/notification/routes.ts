import express from 'express';
import { body, query } from 'express-validator';
import { NotificationService } from './service';
import { WhatsAppService } from '../../services/whatsappService';

const router = express.Router();

// Get all notifications (admin only)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      type: req.query.type as string,
      read: req.query.read as string,
      search: req.query.search as string,
      date: req.query.date as string,
    };

    const result = await NotificationService.getAdminNotifications(page, limit, filters);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount();
    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id);
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
  try {
    await NotificationService.markAllAsRead();
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationService.deleteNotification(id);
    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

// Test WhatsApp notification endpoint
router.post('/test-whatsapp', async (req, res) => {
  try {
    const { message, type } = req.body;
    
    const testNotification = {
      type: type || 'TEST',
      title: 'Test Notification',
      message: message || 'This is a test notification from RealtyTopper',
      data: { test: true }
    };

    const success = await WhatsAppService.sendNotification(testNotification);
    
    res.json({
      success: true,
      message: 'WhatsApp test notification sent',
      whatsappSuccess: success,
      notification: testNotification
    });
  } catch (error) {
    console.error('Failed to send WhatsApp test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp test notification',
    });
  }
});

// Send custom WhatsApp message
router.post('/send-whatsapp', [
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isString().withMessage('Type must be a string'),
], async (req, res) => {
  try {
    const { message, type } = req.body;
    
    const success = await WhatsAppService.sendTextMessage(message);
    
    res.json({
      success: true,
      message: 'WhatsApp message sent',
      whatsappSuccess: success,
      sentMessage: message
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp message',
    });
  }
});

// Get WhatsApp configuration status
router.get('/whatsapp-status', async (req, res) => {
  try {
    const status = WhatsAppService.getConfigurationStatus();
    
    res.json({
      success: true,
      data: status,
      message: status.cloudAPI 
        ? 'WhatsApp Cloud API is configured and ready to send messages automatically'
        : 'WhatsApp Cloud API is not configured. Messages will be generated as URLs for manual sending.'
    });
  } catch (error) {
    console.error('Failed to get WhatsApp status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get WhatsApp status',
    });
  }
});

export default router;

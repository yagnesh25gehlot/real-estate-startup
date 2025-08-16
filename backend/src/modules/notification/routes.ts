import express from 'express';
import { authMiddleware } from '../auth/middleware';
import { NotificationService } from './service';

const router = express.Router();

// Get all admin notifications
router.get('/', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, type, read, date } = req.query;
    
    const filters = {
      search: search as string,
      type: type as string,
      read: read as string,
      date: date as string,
    };

    const result = await NotificationService.getAdminNotifications(
      parseInt(page as string),
      parseInt(limit as string),
      filters
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read for admin
router.put('/mark-all-read', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    // For admin, mark all notifications as read (no specific user)
    const result = await NotificationService.markAllAsRead('admin');
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get unread count for admin
router.get('/unread-count', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    // For admin, get count of all unread notifications
    const count = await NotificationService.getUnreadCount('admin');
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// Get user notifications
router.get('/user/:userId', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await NotificationService.getUserNotifications(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read for a user
router.put('/user/:userId/mark-all-read', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await NotificationService.markAllAsRead(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get unread count for a user
router.get('/user/:userId/unread-count', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const count = await NotificationService.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// Delete a notification
router.delete('/:id', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await NotificationService.deleteNotification(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;

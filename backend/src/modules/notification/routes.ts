import express from 'express';
import { authMiddleware } from '../auth/middleware';
import { NotificationService } from './service';

const router = express.Router();

// Get all admin notifications
router.get('/', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await NotificationService.getAdminNotifications(
      parseInt(page as string),
      parseInt(limit as string)
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

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const result = await NotificationService.markAllAsRead();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const count = await NotificationService.getUnreadCount();
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// Cleanup old notifications
router.delete('/cleanup', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const result = await NotificationService.cleanupOldNotifications();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;

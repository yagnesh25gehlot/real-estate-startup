import express from 'express';
import { body, validationResult } from 'express-validator';
import { AdminService } from './service';
import { authMiddleware } from '../auth/middleware';
import { AuthenticatedRequest } from '../auth/types';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await AdminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Get property analytics
router.get('/analytics/properties', async (req, res, next) => {
  try {
    const analytics = await AdminService.getPropertyAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// Get booking analytics
router.get('/analytics/bookings', async (req, res, next) => {
  try {
    const analytics = await AdminService.getBookingAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer analytics
router.get('/analytics/dealers', async (req, res, next) => {
  try {
    const analytics = await AdminService.getDealerAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res, next) => {
  try {
    const activities = await AdminService.getRecentActivity();

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

// Get user count for stats
router.get('/users/count', async (req, res, next) => {
  try {
    const count = await AdminService.getUserCount();

    res.json({
      success: true,
      data: count,
    });
  } catch (error) {
    next(error);
  }
});

// Get all users for admin
router.get('/users', async (req, res, next) => {
  try {
    const users = await AdminService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// Get all bookings for admin
router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await AdminService.getAllBookings();

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

// Update booking status for admin
router.put('/bookings/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await AdminService.updateBookingStatus(id, status);

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// Update system settings
router.put('/settings', [
  body('commissionRates').optional().isObject(),
  body('bookingDuration').optional().isInt({ min: 1, max: 30 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { commissionRates, bookingDuration } = req.body;

    await AdminService.updateSystemSettings({
      commissionRates,
      bookingDuration,
    });

    res.json({
      success: true,
      message: 'System settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get system settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await AdminService.getSystemSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer requests
router.get('/dealer-requests', async (req, res, next) => {
  try {
    const requests = await AdminService.getDealerRequests();

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
});

// Approve dealer request
router.put('/dealer-requests/:dealerId/approve', async (req, res, next) => {
  try {
    const { dealerId } = req.params;

    const result = await AdminService.approveDealerRequest(dealerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Reject dealer request
router.put('/dealer-requests/:dealerId/reject', async (req, res, next) => {
  try {
    const { dealerId } = req.params;

    const result = await AdminService.rejectDealerRequest(dealerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer tree
router.get('/dealer-tree', async (req, res, next) => {
  try {
    const tree = await AdminService.getDealerTree();

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 
import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { AdminService } from './service';
import { authMiddleware } from '../auth/middleware';
import { AuthenticatedRequest } from '../auth/types';
import { S3Uploader } from '../../utils/s3Uploader';

// Configure multer for profile picture uploads (memory storage for S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'));
    }
  },
});

// Configure multer for aadhaar image uploads (memory storage for S3)
const aadhaarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for aadhaar images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for aadhaar images'));
    }
  },
});

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

// Create new user (admin only)
router.post('/users', authMiddleware(['ADMIN']), [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 }),
  body('password').optional().isLength({ min: 8 }),
  body('mobile').optional().matches(/^(\+91-)?[6-9]\d{9}$/).withMessage('Mobile number must be a valid Indian mobile number'),
  body('aadhaar').optional().isLength({ min: 12, max: 12 }).matches(/^\d{12}$/),
  body('role').optional().isIn(['USER', 'DEALER', 'ADMIN']),
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

    const { email, name, password, mobile, aadhaar, role } = req.body;

    const result = await AdminService.createUser({
      email,
      name,
      password,
      mobile,
      aadhaar,
      role: role || 'USER',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put('/users/:userId', authMiddleware(['ADMIN']), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('mobile').optional().matches(/^(\+91-)?[6-9]\d{9}$/).withMessage('Mobile number must be a valid Indian mobile number'),
  body('aadhaar').optional().isLength({ min: 12, max: 12 }).matches(/^\d{12}$/),
  body('role').optional().isIn(['USER', 'DEALER', 'ADMIN']),
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

    const { userId } = req.params;
    const { name, mobile, aadhaar, role } = req.body;

    const result = await AdminService.updateUser(userId, {
      name,
      mobile,
      aadhaar,
      role,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Update user password (admin only)
router.put('/users/:userId/password', authMiddleware(['ADMIN']), [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
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

    const { userId } = req.params;
    const { password } = req.body;

    const result = await AdminService.updateUserPassword(userId, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/users/:userId', authMiddleware(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = req.params;

    const result = await AdminService.deleteUser(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Upload profile picture for user (admin only)
router.post('/users/:userId/profile-picture', authMiddleware(['ADMIN']), upload.single('profilePic'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { userId } = req.params;
    
    let profilePicUrl = null;
    try {
      const uploadResult = await S3Uploader.uploadFile(req.file, 'profiles');
      profilePicUrl = uploadResult.url;
    } catch (uploadError) {
      console.error('Failed to upload profile picture to S3:', uploadError);
      return res.status(400).json({
        success: false,
        error: 'Failed to upload profile picture',
      });
    }

    const result = await AdminService.updateUserProfilePicture(userId, profilePicUrl);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Upload aadhaar image for user (admin only)
router.post('/users/:userId/aadhaar-image', authMiddleware(['ADMIN']), aadhaarUpload.single('aadhaarImage'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { userId } = req.params;
    
    let aadhaarImageUrl = null;
    try {
      const uploadResult = await S3Uploader.uploadDocument(req.file, 'aadhaar');
      aadhaarImageUrl = uploadResult.url;
    } catch (uploadError) {
      console.error('Failed to upload aadhaar image to S3:', uploadError);
      return res.status(400).json({
        success: false,
        error: 'Failed to upload aadhaar image',
      });
    }

    const result = await AdminService.updateUserAadhaarImage(userId, aadhaarImageUrl);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get single user (admin only)
router.get('/users/:userId', authMiddleware(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = req.params;

    const user = await AdminService.getUserById(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Block user
router.put('/users/:userId/block', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await AdminService.blockUser(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Unblock user
router.put('/users/:userId/unblock', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await AdminService.unblockUser(userId);

    res.json({
      success: true,
      data: result,
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
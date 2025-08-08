import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { AuthService } from './service';
import { authMiddleware } from './middleware';
import { createError } from '../../utils/errorHandler';

// Configure multer for profile picture uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  }),
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

const router = express.Router();

// Google OAuth callback
router.post('/google', async (req, res, next) => {
  try {
    const { email, name, picture, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required',
      });
    }

    const result = await AuthService.googleAuth({
      email,
      name,
      picture,
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

// Regular user signup
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 }),
  body('password').isLength({ min: 8 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, name, password } = req.body;

    const result = await AuthService.signup({
      email,
      name,
      password,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Regular user login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    const result = await AuthService.login({
      email,
      password,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Dealer signup
router.post('/dealer-signup', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 }),
  body('password').isLength({ min: 8 }),
  body('referralCode').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, name, password, referralCode } = req.body;

    const result = await AuthService.dealerSignup({
      email,
      name,
      password,
      referralCode,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Apply for dealer (existing users)
router.post('/apply-dealer', authMiddleware(['USER']), [
  body('referralCode').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { referralCode } = req.body;
    const userId = (req as any).user.id;

    const result = await AuthService.applyForDealer(userId, { referralCode });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authMiddleware(['USER', 'DEALER', 'ADMIN']), [
  body('name').trim().isLength({ min: 2 }),
  body('mobile').optional().isMobilePhone('en-IN'),
  body('aadhaar').optional().isLength({ min: 12, max: 12 }).matches(/^\d{12}$/),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { name, mobile, aadhaar, profilePic } = req.body;
    const userId = (req as any).user.id;

    const result = await AuthService.updateProfile(userId, { name, mobile, aadhaar, profilePic });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Upload profile picture
router.post('/profile-picture', authMiddleware(['USER', 'DEALER', 'ADMIN']), upload.single('profilePic'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const userId = (req as any).user.id;
    const profilePicUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user's profile picture
    await AuthService.updateProfilePicture(userId, profilePicUrl);

    res.json({
      success: true,
      data: { profilePicUrl },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', authMiddleware(['USER', 'DEALER', 'ADMIN']), [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    const result = await AuthService.changePassword(userId, { currentPassword, newPassword });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Approve dealer (admin only)
router.put('/approve-dealer/:dealerId', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { dealerId } = req.params;

    const result = await AuthService.approveDealer(dealerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer hierarchy
router.get('/dealer-hierarchy/:dealerId', authMiddleware(['ADMIN', 'DEALER']), async (req, res, next) => {
  try {
    const { dealerId } = req.params;

    const hierarchy = await AuthService.getDealerHierarchy(dealerId);

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router; 
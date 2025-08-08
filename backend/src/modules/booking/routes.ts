import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { BookingService } from './service';
import { authMiddleware } from '../auth/middleware';
import { AuthenticatedRequest } from '../auth/types';

const router = express.Router();

// Configure multer for payment proof uploads
const paymentsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'payments'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});
const uploadPaymentProof = multer({
  storage: paymentsStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files are allowed as payment proof'));
  },
});

// Create booking (manual UPI payment): expects multipart/form-data with optional paymentProof
router.post('/create', [
  authMiddleware(['USER', 'DEALER', 'ADMIN']),
  uploadPaymentProof.single('paymentProof'),
  body('propertyId').notEmpty(),
  body('dealerCode').optional().isString(),
  body('paymentRef').notEmpty().isString(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    }

    const { propertyId, dealerCode, paymentRef } = req.body as any;
    const filePath = req.file ? `/uploads/payments/${path.basename(req.file.path)}` : undefined;

    const result = await BookingService.createManualBooking({
      propertyId,
      userId: req.user!.id,
      dealerCode,
      paymentRef,
      paymentProof: filePath,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Confirm booking after payment (Stripe flow) - kept for future
router.post('/confirm', [
  authMiddleware(['USER', 'DEALER', 'ADMIN']),
  body('bookingId').notEmpty(),
  body('paymentIntentId').notEmpty(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    }

    const { bookingId, paymentIntentId } = req.body;
    const booking = await BookingService.confirmBooking(bookingId, paymentIntentId);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/my-bookings', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookings = await BookingService.getUserBookings(req.user!.id);
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
});

// Admin: get all bookings (must come before /:id route)
router.get('/', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const result = await BookingService.getAllBookings(
      parseInt(page as string), 
      parseInt(limit as string),
      status as string,
      search as string
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Approve booking (admin only)
router.put('/:id/approve', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingService.approveBooking(id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

// Reject booking (admin only)
router.put('/:id/reject', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    await BookingService.rejectBooking(id);
    res.json({ success: true, message: 'Booking rejected successfully' });
  } catch (error) {
    next(error);
  }
});

// Unbook property (admin only)
router.put('/:id/unbook', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingService.unbookProperty(id);
    res.json({ success: true, data: booking, message: 'Property unbooked successfully' });
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    // Users can only access their own booking; admins can access any
    if (req.user!.role === 'ADMIN') {
      const { bookings } = await BookingService.getAllBookings(1, 1000);
      const found = bookings.find((b: any) => b.id === id);
      if (!found) return res.status(404).json({ success: false, error: 'Booking not found' });
      return res.json({ success: true, data: found });
    }
    const userBookings = await BookingService.getUserBookings(req.user!.id);
    const booking = userBookings.find((b: any) => b.id === id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.delete('/:id', authMiddleware(['USER', 'DEALER', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const booking = await BookingService.cancelBooking(id, req.user!.id);
    res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

// Update expired bookings (admin only)
router.post('/update-expired', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    await BookingService.updateExpiredBookings();
    res.json({ success: true, message: 'Expired bookings updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 
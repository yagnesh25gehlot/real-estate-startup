import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { CommissionService } from './service';
import { authMiddleware } from '../auth/middleware';
import { AuthenticatedRequest } from '../auth/types';

const prisma = new PrismaClient();

const router = express.Router();

// Get dealer commissions
router.get('/my-commissions', authMiddleware(['DEALER', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { userId: req.user!.id },
    });

    if (!dealer) {
      return res.status(404).json({
        success: false,
        error: 'Dealer not found',
      });
    }

    const commissions = await CommissionService.getDealerCommissions(dealer.id);

    res.json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer hierarchy
router.get('/hierarchy/:dealerId', authMiddleware(['DEALER', 'ADMIN']), async (req, res, next) => {
  try {
    const { dealerId } = req.params;
    const hierarchy = await CommissionService.getDealerHierarchy(dealerId);

    if (!hierarchy) {
      return res.status(404).json({
        success: false,
        error: 'Dealer not found',
      });
    }

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer stats
router.get('/stats/:dealerId', authMiddleware(['DEALER', 'ADMIN']), async (req, res, next) => {
  try {
    const { dealerId } = req.params;
    const stats = await CommissionService.getDealerStats(dealerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Update commission configuration (admin only)
router.put('/config', [
  authMiddleware(['ADMIN']),
  body('level').isInt({ min: 1, max: 10 }),
  body('percentage').isFloat({ min: 0, max: 100 }),
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

    const { level, percentage } = req.body;
    await CommissionService.updateCommissionConfig(level, percentage);

    res.json({
      success: true,
      message: 'Commission configuration updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get commission configuration
router.get('/config', async (req, res, next) => {
  try {
    const config = await CommissionService.getCommissionConfig();

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
});

// Get pending dealers (admin only)
router.get('/pending-dealers', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const dealers = await CommissionService.getPendingDealers();

    res.json({
      success: true,
      data: dealers,
    });
  } catch (error) {
    next(error);
  }
});

// Approve dealer (admin only)
router.put('/approve-dealer/:dealerId', authMiddleware(['ADMIN']), async (req, res, next) => {
  try {
    const { dealerId } = req.params;
    await CommissionService.approveDealer(dealerId);

    res.json({
      success: true,
      message: 'Dealer approved successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer by referral code
router.get('/referral/:referralCode', async (req, res, next) => {
  try {
    const { referralCode } = req.params;
    const dealer = await CommissionService.getDealerByReferralCode(referralCode);

    if (!dealer) {
      return res.status(404).json({
        success: false,
        error: 'Dealer not found',
      });
    }

    res.json({
      success: true,
      data: dealer,
    });
  } catch (error) {
    next(error);
  }
});

// Get dealer tree
router.get('/tree/:dealerId', authMiddleware(['DEALER', 'ADMIN']), async (req, res, next) => {
  try {
    const { dealerId } = req.params;
    const { maxDepth = 3 } = req.query;

    const tree = await CommissionService.getDealerTree(dealerId, parseInt(maxDepth as string));

    if (!tree) {
      return res.status(404).json({
        success: false,
        error: 'Dealer not found',
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
});

// Calculate commissions for property sale (admin only)
router.post('/calculate/:propertyId', [
  authMiddleware(['ADMIN']),
  body('saleAmount').isFloat({ min: 0 }),
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

    const { propertyId } = req.params;
    const { saleAmount } = req.body;

    const commissions = await CommissionService.calculateCommissions(propertyId, saleAmount);

    res.json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 
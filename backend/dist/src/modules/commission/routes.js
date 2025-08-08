"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const service_1 = require("./service");
const middleware_1 = require("../auth/middleware");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get('/my-commissions', (0, middleware_1.authMiddleware)(['DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const dealer = await prisma.dealer.findUnique({
            where: { userId: req.user.id },
        });
        if (!dealer) {
            return res.status(404).json({
                success: false,
                error: 'Dealer not found',
            });
        }
        const commissions = await service_1.CommissionService.getDealerCommissions(dealer.id);
        res.json({
            success: true,
            data: commissions,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/hierarchy/:dealerId', (0, middleware_1.authMiddleware)(['DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const hierarchy = await service_1.CommissionService.getDealerHierarchy(dealerId);
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
    }
    catch (error) {
        next(error);
    }
});
router.get('/stats/:dealerId', (0, middleware_1.authMiddleware)(['DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const stats = await service_1.CommissionService.getDealerStats(dealerId);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/config', [
    (0, middleware_1.authMiddleware)(['ADMIN']),
    (0, express_validator_1.body)('level').isInt({ min: 1, max: 10 }),
    (0, express_validator_1.body)('percentage').isFloat({ min: 0, max: 100 }),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { level, percentage } = req.body;
        await service_1.CommissionService.updateCommissionConfig(level, percentage);
        res.json({
            success: true,
            message: 'Commission configuration updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/config', async (req, res, next) => {
    try {
        const config = await service_1.CommissionService.getCommissionConfig();
        res.json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/pending-dealers', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const dealers = await service_1.CommissionService.getPendingDealers();
        res.json({
            success: true,
            data: dealers,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/approve-dealer/:dealerId', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        await service_1.CommissionService.approveDealer(dealerId);
        res.json({
            success: true,
            message: 'Dealer approved successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/referral/:referralCode', async (req, res, next) => {
    try {
        const { referralCode } = req.params;
        const dealer = await service_1.CommissionService.getDealerByReferralCode(referralCode);
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
    }
    catch (error) {
        next(error);
    }
});
router.get('/tree/:dealerId', (0, middleware_1.authMiddleware)(['DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const { maxDepth = 3 } = req.query;
        const tree = await service_1.CommissionService.getDealerTree(dealerId, parseInt(maxDepth));
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
    }
    catch (error) {
        next(error);
    }
});
router.post('/calculate/:propertyId', [
    (0, middleware_1.authMiddleware)(['ADMIN']),
    (0, express_validator_1.body)('saleAmount').isFloat({ min: 0 }),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array(),
            });
        }
        const { propertyId } = req.params;
        const { saleAmount } = req.body;
        const commissions = await service_1.CommissionService.calculateCommissions(propertyId, saleAmount);
        res.json({
            success: true,
            data: commissions,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map
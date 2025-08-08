"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const service_1 = require("./service");
const router = express_1.default.Router();
router.get('/dashboard', async (req, res, next) => {
    try {
        const stats = await service_1.AdminService.getDashboardStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/analytics/properties', async (req, res, next) => {
    try {
        const analytics = await service_1.AdminService.getPropertyAnalytics();
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/analytics/bookings', async (req, res, next) => {
    try {
        const analytics = await service_1.AdminService.getBookingAnalytics();
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/analytics/dealers', async (req, res, next) => {
    try {
        const analytics = await service_1.AdminService.getDealerAnalytics();
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/recent-activity', async (req, res, next) => {
    try {
        const activities = await service_1.AdminService.getRecentActivity();
        res.json({
            success: true,
            data: activities,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/users/count', async (req, res, next) => {
    try {
        const count = await service_1.AdminService.getUserCount();
        res.json({
            success: true,
            data: count,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/settings', [
    (0, express_validator_1.body)('commissionRates').optional().isObject(),
    (0, express_validator_1.body)('bookingDuration').optional().isInt({ min: 1, max: 30 }),
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
        const { commissionRates, bookingDuration } = req.body;
        await service_1.AdminService.updateSystemSettings({
            commissionRates,
            bookingDuration,
        });
        res.json({
            success: true,
            message: 'System settings updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/settings', async (req, res, next) => {
    try {
        const settings = await service_1.AdminService.getSystemSettings();
        res.json({
            success: true,
            data: settings,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map
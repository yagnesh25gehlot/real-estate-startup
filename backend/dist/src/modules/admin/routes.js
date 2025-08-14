"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const service_1 = require("./service");
const middleware_1 = require("../auth/middleware");
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/profiles/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for profile pictures'));
        }
    },
});
const aadhaarUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/aadhaar/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for aadhaar images'));
        }
    },
});
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
router.get('/users', async (req, res, next) => {
    try {
        const users = await service_1.AdminService.getAllUsers();
        res.json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/users', (0, middleware_1.authMiddleware)(['ADMIN']), [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('password').optional().isLength({ min: 8 }),
    (0, express_validator_1.body)('mobile').optional().matches(/^(\+91-)?[6-9]\d{9}$/).withMessage('Mobile number must be a valid Indian mobile number'),
    (0, express_validator_1.body)('aadhaar').optional().isLength({ min: 12, max: 12 }).matches(/^\d{12}$/),
    (0, express_validator_1.body)('role').optional().isIn(['USER', 'DEALER', 'ADMIN']),
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
        const { email, name, password, mobile, aadhaar, role } = req.body;
        const result = await service_1.AdminService.createUser({
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
    }
    catch (error) {
        next(error);
    }
});
router.put('/users/:userId', (0, middleware_1.authMiddleware)(['ADMIN']), [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('mobile').optional().matches(/^(\+91-)?[6-9]\d{9}$/).withMessage('Mobile number must be a valid Indian mobile number'),
    (0, express_validator_1.body)('aadhaar').optional().isLength({ min: 12, max: 12 }).matches(/^\d{12}$/),
    (0, express_validator_1.body)('role').optional().isIn(['USER', 'DEALER', 'ADMIN']),
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
        const { userId } = req.params;
        const { name, mobile, aadhaar, role } = req.body;
        const result = await service_1.AdminService.updateUser(userId, {
            name,
            mobile,
            aadhaar,
            role,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/users/:userId/password', (0, middleware_1.authMiddleware)(['ADMIN']), [
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
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
        const { userId } = req.params;
        const { password } = req.body;
        const result = await service_1.AdminService.updateUserPassword(userId, password);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/users/:userId', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await service_1.AdminService.deleteUser(userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/users/:userId/profile-picture', (0, middleware_1.authMiddleware)(['ADMIN']), upload.single('profilePic'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }
        const { userId } = req.params;
        const profilePicUrl = `/uploads/profiles/${req.file.filename}`;
        const result = await service_1.AdminService.updateUserProfilePicture(userId, profilePicUrl);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/users/:userId/aadhaar-image', (0, middleware_1.authMiddleware)(['ADMIN']), aadhaarUpload.single('aadhaarImage'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }
        const { userId } = req.params;
        const aadhaarImageUrl = `/uploads/aadhaar/${req.file.filename}`;
        const result = await service_1.AdminService.updateUserAadhaarImage(userId, aadhaarImageUrl);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/users/:userId', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await service_1.AdminService.getUserById(userId);
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/users/:userId/block', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await service_1.AdminService.blockUser(userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/users/:userId/unblock', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await service_1.AdminService.unblockUser(userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/bookings', async (req, res, next) => {
    try {
        const bookings = await service_1.AdminService.getAllBookings();
        res.json({
            success: true,
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/bookings/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await service_1.AdminService.updateBookingStatus(id, status);
        res.json({
            success: true,
            data: booking,
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
router.get('/dealer-requests', async (req, res, next) => {
    try {
        const requests = await service_1.AdminService.getDealerRequests();
        res.json({
            success: true,
            data: requests,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/dealer-requests/:dealerId/approve', async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const result = await service_1.AdminService.approveDealerRequest(dealerId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/dealer-requests/:dealerId/reject', async (req, res, next) => {
    try {
        const { dealerId } = req.params;
        const result = await service_1.AdminService.rejectDealerRequest(dealerId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/dealer-tree', async (req, res, next) => {
    try {
        const tree = await service_1.AdminService.getDealerTree();
        res.json({
            success: true,
            data: tree,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map
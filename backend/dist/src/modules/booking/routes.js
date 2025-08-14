"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const service_1 = require("./service");
const middleware_1 = require("../auth/middleware");
const router = express_1.default.Router();
const paymentsStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(process.cwd(), 'uploads', 'payments'));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}-${file.originalname}`);
    },
});
const uploadPaymentProof = (0, multer_1.default)({
    storage: paymentsStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/'))
            return cb(null, true);
        return cb(new Error('Only image files are allowed as payment proof'));
    },
});
router.post('/create', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    uploadPaymentProof.single('paymentProof'),
    (0, express_validator_1.body)('propertyId').notEmpty(),
    (0, express_validator_1.body)('dealerCode').optional().isString(),
    (0, express_validator_1.body)('paymentRef').notEmpty().isString(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
        }
        const { propertyId, dealerCode, paymentRef } = req.body;
        const filePath = req.file ? `/uploads/payments/${path_1.default.basename(req.file.path)}` : undefined;
        const result = await service_1.BookingService.createManualBooking({
            propertyId,
            userId: req.user.id,
            dealerCode,
            paymentRef,
            paymentProof: filePath,
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.post('/confirm', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    (0, express_validator_1.body)('bookingId').notEmpty(),
    (0, express_validator_1.body)('paymentIntentId').notEmpty(),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
        }
        const { bookingId, paymentIntentId } = req.body;
        const booking = await service_1.BookingService.confirmBooking(bookingId, paymentIntentId);
        res.json({ success: true, data: booking });
    }
    catch (error) {
        next(error);
    }
});
router.get('/my-bookings', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const bookings = await service_1.BookingService.getUserBookings(req.user.id);
        res.json({ success: true, data: bookings });
    }
    catch (error) {
        next(error);
    }
});
router.get('/', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const result = await service_1.BookingService.getAllBookings(parseInt(page), parseInt(limit), status, search);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/approve', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await service_1.BookingService.approveBooking(id);
        res.json({ success: true, data: booking });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/reject', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        await service_1.BookingService.rejectBooking(id);
        res.json({ success: true, message: 'Booking rejected successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/unbook', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await service_1.BookingService.unbookProperty(id);
        res.json({ success: true, data: booking, message: 'Property unbooked successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role === 'ADMIN') {
            const { bookings } = await service_1.BookingService.getAllBookings(1, 1000);
            const found = bookings.find((b) => b.id === id);
            if (!found)
                return res.status(404).json({ success: false, error: 'Booking not found' });
            return res.json({ success: true, data: found });
        }
        const userBookings = await service_1.BookingService.getUserBookings(req.user.id);
        const booking = userBookings.find((b) => b.id === id);
        if (!booking)
            return res.status(404).json({ success: false, error: 'Booking not found' });
        res.json({ success: true, data: booking });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await service_1.BookingService.cancelBooking(id, req.user.id);
        res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/update-expired', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        await service_1.BookingService.updateExpiredBookings();
        res.json({ success: true, message: 'Expired bookings updated successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map
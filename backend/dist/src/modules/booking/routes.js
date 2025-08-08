"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const service_1 = require("./service");
const middleware_1 = require("../auth/middleware");
const router = express_1.default.Router();
router.post('/', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    (0, express_validator_1.body)('propertyId').isUUID(),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }),
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
        const { propertyId, startDate, endDate, amount } = req.body;
        const booking = await service_1.BookingService.createBooking({
            propertyId,
            startDate,
            endDate,
            amount: parseFloat(amount),
        }, req.user.id);
        res.status(201).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/payment-intent', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    (0, express_validator_1.body)('bookingId').isUUID(),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }),
    (0, express_validator_1.body)('currency').isIn(['usd', 'eur', 'gbp']),
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
        const { bookingId, amount, currency } = req.body;
        const paymentIntent = await service_1.BookingService.createPaymentIntent({
            bookingId,
            amount: parseFloat(amount),
            currency,
        });
        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/create-payment-intent', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    (0, express_validator_1.body)('propertyId').isUUID(),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }),
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
        const { propertyId, startDate, endDate, amount } = req.body;
        const paymentIntent = await service_1.BookingService.createPaymentIntentForBooking({
            propertyId,
            startDate,
            endDate,
            amount: parseFloat(amount),
            userId: req.user.id,
        });
        res.json({
            success: true,
            data: paymentIntent,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/confirm-payment', [
    (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']),
    (0, express_validator_1.body)('paymentIntentId').isString(),
    (0, express_validator_1.body)('paymentMethodId').isString(),
    (0, express_validator_1.body)('bookingData').isObject(),
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
        const { paymentIntentId, paymentMethodId, bookingData } = req.body;
        const booking = await service_1.BookingService.confirmPaymentAndCreateBooking({
            paymentIntentId,
            paymentMethodId,
            bookingData,
            userId: req.user.id,
        });
        res.json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/confirm-payment-webhook', async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                error: 'Payment intent ID is required',
            });
        }
        const payment = await service_1.BookingService.confirmPayment(paymentIntentId);
        res.json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/my-bookings', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { status, propertyId } = req.query;
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (propertyId) {
            filters.propertyId = propertyId;
        }
        const bookings = await service_1.BookingService.getBookings(req.user.id, filters);
        res.json({
            success: true,
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/', (0, middleware_1.authMiddleware)(['ADMIN']), async (req, res, next) => {
    try {
        const { status, propertyId, userId } = req.query;
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (propertyId) {
            filters.propertyId = propertyId;
        }
        const bookings = await service_1.BookingService.getBookings(userId, filters);
        res.json({
            success: true,
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await service_1.BookingService.getBookingById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found',
            });
        }
        if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized to view this booking',
            });
        }
        res.json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', (0, middleware_1.authMiddleware)(['USER', 'DEALER', 'ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        await service_1.BookingService.cancelBooking(id, req.user.id);
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/property/:propertyId/available-slots', async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required',
            });
        }
        const availableSlots = await service_1.BookingService.getAvailableTimeSlots(propertyId, startDate, endDate);
        res.json({
            success: true,
            data: availableSlots,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map
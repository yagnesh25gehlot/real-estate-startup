"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const errorHandler_1 = require("../../utils/errorHandler");
const notifications_1 = require("../../mail/notifications");
const prisma = new client_1.PrismaClient();
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
    });
}
class BookingService {
    static async createBooking(data, userId) {
        try {
            const property = await prisma.property.findUnique({
                where: { id: data.propertyId },
            });
            if (!property) {
                throw (0, errorHandler_1.createError)('Property not found', 404);
            }
            if (property.status !== 'FREE') {
                throw (0, errorHandler_1.createError)('Property is not available for booking', 400);
            }
            const overlappingBooking = await prisma.booking.findFirst({
                where: {
                    propertyId: data.propertyId,
                    status: {
                        in: ['PENDING', 'CONFIRMED'],
                    },
                    OR: [
                        {
                            startDate: {
                                lte: new Date(data.endDate),
                            },
                            endDate: {
                                gte: new Date(data.startDate),
                            },
                        },
                    ],
                },
            });
            if (overlappingBooking) {
                throw (0, errorHandler_1.createError)('Property is already booked for the selected dates', 400);
            }
            const booking = await prisma.booking.create({
                data: {
                    propertyId: data.propertyId,
                    userId,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                },
                include: {
                    property: {
                        include: {
                            owner: true,
                        },
                    },
                    user: true,
                },
            });
            return booking;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to create booking', 500);
        }
    }
    static async createPaymentIntent(data) {
        try {
            if (!stripe) {
                throw (0, errorHandler_1.createError)('Stripe not configured', 503);
            }
            const booking = await prisma.booking.findUnique({
                where: { id: data.bookingId },
                include: {
                    property: true,
                    user: true,
                },
            });
            if (!booking) {
                throw (0, errorHandler_1.createError)('Booking not found', 404);
            }
            if (booking.status !== 'PENDING') {
                throw (0, errorHandler_1.createError)('Booking is not in pending status', 400);
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(data.amount * 100),
                currency: data.currency,
                metadata: {
                    bookingId: data.bookingId,
                    propertyId: booking.propertyId,
                    userId: booking.userId,
                },
            });
            return paymentIntent;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to create payment intent', 500);
        }
    }
    static async confirmPayment(paymentIntentId) {
        try {
            if (!stripe) {
                throw (0, errorHandler_1.createError)('Stripe not configured', 503);
            }
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                throw (0, errorHandler_1.createError)('Payment not completed', 400);
            }
            const bookingId = paymentIntent.metadata.bookingId;
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' },
            });
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: { property: true },
            });
            if (booking) {
                await prisma.property.update({
                    where: { id: booking.propertyId },
                    data: { status: 'BOOKED' },
                });
            }
            const payment = await prisma.payment.create({
                data: {
                    amount: paymentIntent.amount / 100,
                    bookingId,
                    stripeId: paymentIntentId,
                },
                include: {
                    booking: {
                        include: {
                            property: true,
                            user: true,
                        },
                    },
                },
            });
            if (booking) {
                await (0, notifications_1.sendBookingConfirmationEmail)({
                    bookingId,
                    userEmail: booking.user.email,
                    userName: booking.user.name || 'User',
                    propertyTitle: booking.property.title,
                    startDate: booking.startDate.toLocaleDateString(),
                    endDate: booking.endDate.toLocaleDateString(),
                    amount: payment.amount,
                });
            }
            return payment;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to confirm payment', 500);
        }
    }
    static async getBookings(userId, filters = {}) {
        try {
            const where = {};
            if (userId) {
                where.userId = userId;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.propertyId) {
                where.propertyId = filters.propertyId;
            }
            const bookings = await prisma.booking.findMany({
                where,
                include: {
                    property: {
                        include: {
                            owner: true,
                        },
                    },
                    user: true,
                    payment: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return bookings;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch bookings', 500);
        }
    }
    static async getBookingById(id) {
        try {
            return await prisma.booking.findUnique({
                where: { id },
                include: {
                    property: {
                        include: {
                            owner: true,
                        },
                    },
                    user: true,
                    payment: true,
                },
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch booking', 500);
        }
    }
    static async cancelBooking(id, userId) {
        try {
            const booking = await prisma.booking.findUnique({
                where: { id },
                include: { property: true },
            });
            if (!booking) {
                throw (0, errorHandler_1.createError)('Booking not found', 404);
            }
            if (booking.userId !== userId) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user?.role !== 'ADMIN') {
                    throw (0, errorHandler_1.createError)('Unauthorized to cancel this booking', 403);
                }
            }
            await prisma.booking.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
            if (booking.property.status === 'BOOKED') {
                await prisma.property.update({
                    where: { id: booking.propertyId },
                    data: { status: 'FREE' },
                });
            }
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to cancel booking', 500);
        }
    }
    static async getAvailableTimeSlots(propertyId, startDate, endDate) {
        try {
            const property = await prisma.property.findUnique({
                where: { id: propertyId },
            });
            if (!property) {
                throw (0, errorHandler_1.createError)('Property not found', 404);
            }
            const existingBookings = await prisma.booking.findMany({
                where: {
                    propertyId,
                    status: {
                        in: ['PENDING', 'CONFIRMED'],
                    },
                    OR: [
                        {
                            startDate: {
                                lte: new Date(endDate),
                            },
                            endDate: {
                                gte: new Date(startDate),
                            },
                        },
                    ],
                },
            });
            const start = new Date(startDate);
            const end = new Date(endDate);
            const availableSlots = [];
            const bookingDuration = parseInt(process.env.DEFAULT_BOOKING_DURATION_DAYS || '3');
            const durationMs = bookingDuration * 24 * 60 * 60 * 1000;
            for (let current = start; current <= end; current = new Date(current.getTime() + durationMs)) {
                const slotEnd = new Date(current.getTime() + durationMs);
                const hasConflict = existingBookings.some(booking => {
                    return ((current >= booking.startDate && current < booking.endDate) ||
                        (slotEnd > booking.startDate && slotEnd <= booking.endDate) ||
                        (current <= booking.startDate && slotEnd >= booking.endDate));
                });
                if (!hasConflict && slotEnd <= end) {
                    availableSlots.push({
                        startDate: current,
                        endDate: slotEnd,
                        duration: bookingDuration,
                    });
                }
            }
            return availableSlots;
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to get available time slots', 500);
        }
    }
    static async createPaymentIntentForBooking(data) {
        try {
            const property = await prisma.property.findUnique({
                where: { id: data.propertyId },
            });
            if (!property) {
                throw (0, errorHandler_1.createError)('Property not found', 404);
            }
            if (property.status !== 'FREE') {
                throw (0, errorHandler_1.createError)('Property is not available for booking', 400);
            }
            const overlappingBooking = await prisma.booking.findFirst({
                where: {
                    propertyId: data.propertyId,
                    status: {
                        in: ['PENDING', 'CONFIRMED'],
                    },
                    OR: [
                        {
                            startDate: {
                                lte: new Date(data.endDate),
                            },
                            endDate: {
                                gte: new Date(data.startDate),
                            },
                        },
                    ],
                },
            });
            if (overlappingBooking) {
                throw (0, errorHandler_1.createError)('Property is already booked for the selected dates', 400);
            }
            const mockPaymentIntent = {
                id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
                amount: data.amount * 100,
                currency: 'inr',
                status: 'requires_payment_method',
                created: Math.floor(Date.now() / 1000),
            };
            return mockPaymentIntent;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to create payment intent', 500);
        }
    }
    static async confirmPaymentAndCreateBooking(data) {
        try {
            if (!data.paymentIntentId) {
                throw (0, errorHandler_1.createError)('Payment intent ID is required', 400);
            }
            const booking = await this.createBooking(data.bookingData, data.userId);
            const payment = await prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    amount: data.bookingData.amount,
                    currency: 'INR',
                    status: 'COMPLETED',
                    paymentMethod: 'CARD',
                    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                },
            });
            await prisma.property.update({
                where: { id: data.bookingData.propertyId },
                data: { status: 'BOOKED' },
            });
            try {
                await (0, notifications_1.sendBookingConfirmationEmail)(booking);
            }
            catch (emailError) {
                console.error('Failed to send booking confirmation email:', emailError);
            }
            return booking;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
            throw (0, errorHandler_1.createError)('Failed to confirm payment and create booking', 500);
        }
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=service.js.map
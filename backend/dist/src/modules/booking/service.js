"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const paymentService_1 = require("../../utils/paymentService");
const notifications_1 = require("../../mail/notifications");
const prisma = new client_1.PrismaClient();
class BookingService {
    static async validateDealerCode(dealerCode) {
        if (!dealerCode)
            return true;
        const dealer = await prisma.dealer.findUnique({
            where: { referralCode: dealerCode },
        });
        if (!dealer || dealer.status !== 'APPROVED') {
            console.log(`⚠️ Invalid dealer code: ${dealerCode} - proceeding with booking anyway`);
            return true;
        }
        return true;
    }
    static async isPropertyAvailable(propertyId, startDate, endDate) {
        const conflictingBookings = await prisma.booking.findMany({
            where: {
                propertyId,
                status: { in: ['CONFIRMED'] },
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate },
                    },
                ],
            },
        });
        return conflictingBookings.length === 0;
    }
    static async createManualBooking(data) {
        const { propertyId, userId, dealerCode, paymentRef, paymentProof } = data;
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw (0, errorHandler_1.createError)('Property not found', 404);
        if (property.status !== 'FREE')
            throw (0, errorHandler_1.createError)('Property is not available for booking', 400);
        if (dealerCode) {
            const ok = await this.validateDealerCode(dealerCode);
            if (!ok)
                throw (0, errorHandler_1.createError)('Invalid dealer code', 400);
        }
        const defaultStartDate = new Date();
        const defaultEndDate = new Date(defaultStartDate.getTime() + (3 * 24 * 60 * 60 * 1000));
        const available = await this.isPropertyAvailable(propertyId, defaultStartDate, defaultEndDate);
        if (!available)
            throw (0, errorHandler_1.createError)('Property is not available for the selected dates', 400);
        if (!paymentRef || paymentRef.trim().length < 4) {
            throw (0, errorHandler_1.createError)('Payment reference is required', 400);
        }
        const bookingCharges = 300;
        const totalAmount = bookingCharges;
        const booking = await prisma.booking.create({
            data: {
                propertyId,
                userId,
                dealerCode: dealerCode || null,
                startDate: defaultStartDate,
                endDate: defaultEndDate,
                bookingCharges,
                totalAmount,
                status: 'PENDING',
                paymentMethod: 'UPI',
                paymentRef,
                paymentProof: paymentProof || null,
            },
            include: { property: true, user: true },
        });
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@propertyplatform.com';
            await (0, notifications_1.sendManualBookingSubmittedEmail)(adminEmail, {
                user: booking.user.email,
                property: booking.property.title,
                paymentRef,
                proofUrl: paymentProof,
                start: defaultStartDate.toDateString(),
                end: defaultEndDate.toDateString(),
            });
            console.log('🎯 NEW BOOKING CREATED - Check admin dashboard!');
            console.log(`📊 Booking ID: ${booking.id}`);
            console.log(`👤 User: ${booking.user.email}`);
            console.log(`🏠 Property: ${booking.property.title}`);
            console.log(`💰 Payment Ref: ${paymentRef}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
        catch (e) {
            console.warn('Admin notification failed (non-blocking):', e);
        }
        return booking;
    }
    static async createBookingWithPayment(data) {
        const { propertyId, userId, dealerCode, startDate, endDate } = data;
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { owner: true },
        });
        if (!property) {
            throw (0, errorHandler_1.createError)('Property not found', 404);
        }
        if (property.status !== 'FREE') {
            throw (0, errorHandler_1.createError)('Property is not available for booking', 400);
        }
        if (dealerCode) {
            const isValidDealer = await this.validateDealerCode(dealerCode);
            if (!isValidDealer) {
                throw (0, errorHandler_1.createError)('Invalid dealer code', 400);
            }
        }
        const defaultStartDate = startDate || new Date();
        const defaultEndDate = endDate || new Date(defaultStartDate.getTime() + (3 * 24 * 60 * 60 * 1000));
        const isAvailable = await this.isPropertyAvailable(propertyId, defaultStartDate, defaultEndDate);
        if (!isAvailable) {
            throw (0, errorHandler_1.createError)('Property is not available for the selected dates', 400);
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 404);
        }
        const bookingCharges = 300;
        const totalAmount = bookingCharges;
        const booking = await prisma.booking.create({
            data: {
                propertyId,
                userId,
                dealerCode: dealerCode || null,
                startDate: defaultStartDate,
                endDate: defaultEndDate,
                bookingCharges,
                totalAmount,
                status: 'PENDING',
            },
            include: {
                property: {
                    include: { owner: true },
                },
                user: true,
            },
        });
        const paymentIntent = await paymentService_1.PaymentService.createPaymentIntent({
            amount: totalAmount,
            currency: 'inr',
            bookingId: booking.id,
            customerEmail: user.email,
            customerName: user.name || user.email,
        });
        return {
            booking,
            paymentIntent,
        };
    }
    static async confirmBooking(bookingId, paymentIntentId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true },
        });
        if (!booking) {
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        }
        if (booking.status !== 'PENDING') {
            throw (0, errorHandler_1.createError)('Booking is not in pending status', 400);
        }
        const paymentConfirmed = await paymentService_1.PaymentService.confirmPayment(paymentIntentId);
        if (!paymentConfirmed) {
            throw (0, errorHandler_1.createError)('Payment not confirmed', 400);
        }
        const [updatedBooking] = await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' },
                include: { property: true, user: true },
            }),
            prisma.payment.create({
                data: {
                    amount: booking.totalAmount,
                    bookingId,
                    stripeId: paymentIntentId,
                },
            }),
            prisma.property.update({
                where: { id: booking.propertyId },
                data: { status: 'BOOKED' },
            }),
        ]);
        return updatedBooking;
    }
    static async approveBooking(bookingId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true, user: true }
        });
        if (!booking)
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        if (booking.status !== 'PENDING')
            throw (0, errorHandler_1.createError)('Only pending bookings can be approved', 400);
        const conflictingBookings = await prisma.booking.findMany({
            where: {
                propertyId: booking.propertyId,
                status: 'CONFIRMED',
                OR: [
                    {
                        startDate: { lte: booking.endDate },
                        endDate: { gte: booking.startDate },
                    },
                ],
            },
        });
        if (conflictingBookings.length > 0) {
            throw (0, errorHandler_1.createError)('Another booking is already confirmed for this property in the same time slot', 400);
        }
        await prisma.booking.updateMany({
            where: {
                propertyId: booking.propertyId,
                status: 'PENDING',
                id: { not: bookingId },
                OR: [
                    {
                        startDate: { lte: booking.endDate },
                        endDate: { gte: booking.startDate },
                    },
                ],
            },
            data: { status: 'CANCELLED' },
        });
        const [updatedBooking] = await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' },
                include: { property: true, user: true }
            }),
            prisma.property.update({
                where: { id: booking.propertyId },
                data: { status: 'BOOKED' }
            }),
        ]);
        return updatedBooking;
    }
    static async rejectBooking(bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true } });
        if (!booking)
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        if (booking.status !== 'PENDING')
            throw (0, errorHandler_1.createError)('Only pending bookings can be rejected', 400);
        const updatedBooking = await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
        await prisma.property.update({ where: { id: booking.propertyId }, data: { status: 'FREE' } });
        return updatedBooking;
    }
    static async unbookProperty(bookingId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true, user: true }
        });
        if (!booking)
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        if (booking.status !== 'CONFIRMED')
            throw (0, errorHandler_1.createError)('Only confirmed bookings can be unbooked', 400);
        const [updatedBooking] = await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
                include: { property: true, user: true }
            }),
            prisma.property.update({
                where: { id: booking.propertyId },
                data: { status: 'FREE' }
            }),
        ]);
        return updatedBooking;
    }
    static async handleDealerCommission(booking) {
        const dealer = await prisma.dealer.findUnique({
            where: { referralCode: booking.dealerCode },
        });
        if (!dealer)
            return;
        const commissionAmount = booking.property.price * 0.1;
        await prisma.commission.create({
            data: {
                dealerId: dealer.id,
                propertyId: booking.propertyId,
                amount: commissionAmount,
                level: 1,
            },
        });
        await prisma.dealer.update({
            where: { id: dealer.id },
            data: {
                commission: {
                    increment: commissionAmount,
                },
            },
        });
    }
    static async getAllBookings(page = 1, limit = 10, status, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { property: { title: { contains: search, mode: 'insensitive' } } },
                { paymentRef: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    property: {
                        include: { owner: true },
                    },
                    user: true,
                    payment: true,
                },
            }),
            prisma.booking.count({ where }),
        ]);
        return {
            bookings,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async getUserBookings(userId) {
        return prisma.booking.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                property: true,
                payment: true,
            },
        });
    }
    static async cancelBooking(bookingId, userId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true, payment: true },
        });
        if (!booking) {
            throw (0, errorHandler_1.createError)('Booking not found', 404);
        }
        if (booking.userId !== userId) {
            throw (0, errorHandler_1.createError)('Unauthorized to cancel this booking', 403);
        }
        if (booking.status !== 'CONFIRMED') {
            throw (0, errorHandler_1.createError)('Booking cannot be cancelled', 400);
        }
        const now = new Date();
        const bookingStart = new Date(booking.startDate);
        const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilBooking < 24) {
            throw (0, errorHandler_1.createError)('Booking cannot be cancelled within 24 hours of start date', 400);
        }
        if (booking.payment) {
            await paymentService_1.PaymentService.refundPayment(booking.payment.stripeId);
        }
        const [updatedBooking] = await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
                include: { property: true, user: true },
            }),
            prisma.property.update({
                where: { id: booking.propertyId },
                data: { status: 'FREE' },
            }),
        ]);
        return updatedBooking;
    }
    static async updateExpiredBookings() {
        const now = new Date();
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                endDate: { lt: now },
            },
            include: { property: true },
        });
        for (const booking of expiredBookings) {
            await prisma.$transaction([
                prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: 'EXPIRED' },
                }),
                prisma.property.update({
                    where: { id: booking.propertyId },
                    data: { status: 'FREE' },
                }),
            ]);
        }
    }
    static async getBookingStats() {
        const [totalBookings, confirmedBookings, pendingBookings, cancelledBookings, totalRevenue,] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { status: 'CONFIRMED' } }),
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.booking.count({ where: { status: 'CANCELLED' } }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { booking: { status: 'CONFIRMED' } },
            }),
        ]);
        return {
            totalBookings,
            confirmedBookings,
            pendingBookings,
            cancelledBookings,
            totalRevenue: totalRevenue._sum.amount || 0,
        };
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=service.js.map
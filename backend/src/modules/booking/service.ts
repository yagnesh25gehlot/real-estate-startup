import { PrismaClient } from '@prisma/client';
import { createError } from '../../utils/errorHandler';
import { PaymentService } from '../../utils/paymentService';
import { sendManualBookingSubmittedEmail } from '../../mail/notifications';

const prisma = new PrismaClient();

export interface CreateBookingData {
  propertyId: string;
  userId: string;
  dealerCode?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateManualBookingData {
  propertyId: string;
  userId: string;
  dealerCode?: string;
  paymentRef: string;
  paymentProof?: string;
}

export interface BookingWithPayment {
  booking: any;
  paymentIntent: any;
}

export class BookingService {
  // Validate dealer code if provided
  static async validateDealerCode(dealerCode: string): Promise<boolean> {
    if (!dealerCode) return true;
    
    const dealer = await prisma.dealer.findUnique({
      where: { referralCode: dealerCode },
    });
    
    // Allow booking even if dealer code is invalid (just log it)
    if (!dealer || dealer.status !== 'APPROVED') {
      console.log(`⚠️ Invalid dealer code: ${dealerCode} - proceeding with booking anyway`);
      return true; // Allow the booking to proceed
    }
    
    return true;
  }

  // Check if property is available for booking
  static async isPropertyAvailable(propertyId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ['CONFIRMED'] }, // Only check CONFIRMED bookings, not PENDING
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

  // Create manual booking (UPI evidence upload) -> status PENDING until admin approval
  static async createManualBooking(data: CreateManualBookingData): Promise<any> {
    const { propertyId, userId, dealerCode, paymentRef, paymentProof } = data;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw createError('Property not found', 404);
    if (property.status !== 'FREE') throw createError('Property is not available for booking', 400);

    if (dealerCode) {
      const ok = await this.validateDealerCode(dealerCode);
      if (!ok) throw createError('Invalid dealer code', 400);
    }

    const defaultStartDate = new Date();
    const defaultEndDate = new Date(defaultStartDate.getTime() + (3 * 24 * 60 * 60 * 1000));
    const available = await this.isPropertyAvailable(propertyId, defaultStartDate, defaultEndDate);
    if (!available) throw createError('Property is not available for the selected dates', 400);

    if (!paymentRef || paymentRef.trim().length < 4) {
      throw createError('Payment reference is required', 400);
    }

    const bookingCharges = 1000;
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
        status: 'PENDING', // pending admin review
        paymentMethod: 'UPI',
        paymentRef,
        paymentProof: paymentProof || null,
      },
      include: { property: true, user: true },
    });

    // Notify admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@propertyplatform.com';
      await sendManualBookingSubmittedEmail(adminEmail, {
        user: booking.user.email,
        property: booking.property.title,
        paymentRef,
        proofUrl: paymentProof,
        start: defaultStartDate.toDateString(),
        end: defaultEndDate.toDateString(),
      });
      
      // Also log to console for immediate visibility
      console.log('🎯 NEW BOOKING CREATED - Check admin dashboard!');
      console.log(`📊 Booking ID: ${booking.id}`);
      console.log(`👤 User: ${booking.user.email}`);
      console.log(`🏠 Property: ${booking.property.title}`);
      console.log(`💰 Payment Ref: ${paymentRef}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (e) {
      console.warn('Admin notification failed (non-blocking):', e);
    }

    // Property remains FREE; overlap is prevented by PENDING bookings
    return booking;
  }

  // Create booking with payment intent
  static async createBookingWithPayment(data: CreateBookingData): Promise<BookingWithPayment> {
    const { propertyId, userId, dealerCode, startDate, endDate } = data;

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      throw createError('Property not found', 404);
    }

    if (property.status !== 'FREE') {
      throw createError('Property is not available for booking', 400);
    }

    // Validate dealer code if provided
    if (dealerCode) {
      const isValidDealer = await this.validateDealerCode(dealerCode);
      if (!isValidDealer) {
        throw createError('Invalid dealer code', 400);
      }
    }

    // Set default dates (today to 3 days from now)
    const defaultStartDate = startDate || new Date();
    const defaultEndDate = endDate || new Date(defaultStartDate.getTime() + (3 * 24 * 60 * 60 * 1000));

    // Check if property is available for the selected dates
    const isAvailable = await this.isPropertyAvailable(propertyId, defaultStartDate, defaultEndDate);
    if (!isAvailable) {
      throw createError('Property is not available for the selected dates', 400);
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Booking charges only (MVP): fixed ₹1000 for the 3-day slot
    const bookingCharges = 1000;
    const totalAmount = bookingCharges;

    // Create booking record
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

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
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

  // Confirm booking after successful payment
  static async confirmBooking(bookingId: string, paymentIntentId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    if (booking.status !== 'PENDING') {
      throw createError('Booking is not in pending status', 400);
    }

    // Verify payment
    const paymentConfirmed = await PaymentService.confirmPayment(paymentIntentId);
    if (!paymentConfirmed) {
      throw createError('Payment not confirmed', 400);
    }

    // Update booking status and create payment record
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

    // Dealer commission not applied for booking fee only

    return updatedBooking;
  }

  // Admin approval path for manual bookings
  static async approveBooking(bookingId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId }, 
      include: { property: true, user: true } 
    });
    if (!booking) throw createError('Booking not found', 404);
    if (booking.status !== 'PENDING') throw createError('Only pending bookings can be approved', 400);

    // Check if there are any other CONFIRMED bookings for this property in the same time slot
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
      throw createError('Another booking is already confirmed for this property in the same time slot', 400);
    }

    // Cancel all other PENDING bookings for this property in the same time slot
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

  static async rejectBooking(bookingId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true } });
    if (!booking) throw createError('Booking not found', 404);
    if (booking.status !== 'PENDING') throw createError('Only pending bookings can be rejected', 400);

    const updatedBooking = await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
    // Do not change property to FREE here if there are other overlapping pending requests; for MVP, set FREE
    await prisma.property.update({ where: { id: booking.propertyId }, data: { status: 'FREE' } });
    return updatedBooking;
  }

  // Admin can unbook a confirmed booking
  static async unbookProperty(bookingId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId }, 
      include: { property: true, user: true } 
    });
    if (!booking) throw createError('Booking not found', 404);
    if (booking.status !== 'CONFIRMED') throw createError('Only confirmed bookings can be unbooked', 400);

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

  // Handle dealer commission
  static async handleDealerCommission(booking: any): Promise<void> {
    const dealer = await prisma.dealer.findUnique({
      where: { referralCode: booking.dealerCode! },
    });

    if (!dealer) return;

    // Calculate commission (10% of property price)
    const commissionAmount = booking.property.price * 0.1;

    await prisma.commission.create({
      data: {
        dealerId: dealer.id,
        propertyId: booking.propertyId,
        amount: commissionAmount,
        level: 1,
      },
    });

    // Update dealer's total commission
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        commission: {
          increment: commissionAmount,
        },
      },
    });
  }

  // Get all bookings for admin
  static async getAllBookings(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<any> {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
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

  // Get user's bookings
  static async getUserBookings(userId: string): Promise<any[]> {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        payment: true,
      },
    });
  }

  // Cancel booking
  static async cancelBooking(bookingId: string, userId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true, payment: true },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw createError('Unauthorized to cancel this booking', 403);
    }

    if (booking.status !== 'CONFIRMED') {
      throw createError('Booking cannot be cancelled', 400);
    }

    // Check if booking is within cancellation period (24 hours before start)
    const now = new Date();
    const bookingStart = new Date(booking.startDate);
    const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      throw createError('Booking cannot be cancelled within 24 hours of start date', 400);
    }

    // Process refund if payment exists
    if (booking.payment) {
      await PaymentService.refundPayment(booking.payment.stripeId);
    }

    // Update booking and property status
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

  // Check and update expired bookings (run this as a cron job)
  static async updateExpiredBookings(): Promise<void> {
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

  // Get booking statistics for admin
  static async getBookingStats(): Promise<any> {
    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
    ] = await Promise.all([
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
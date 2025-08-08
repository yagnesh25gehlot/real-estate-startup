import { Booking, Payment } from '@prisma/client';
import Stripe from 'stripe';
export interface CreateBookingData {
    propertyId: string;
    startDate: string;
    endDate: string;
    amount: number;
}
export interface PaymentIntentData {
    bookingId: string;
    amount: number;
    currency: string;
}
export interface CreatePaymentIntentForBookingData {
    propertyId: string;
    startDate: string;
    endDate: string;
    amount: number;
    userId: string;
}
export interface ConfirmPaymentAndCreateBookingData {
    paymentIntentId: string;
    paymentMethodId: string;
    bookingData: CreateBookingData;
    userId: string;
}
export declare class BookingService {
    static createBooking(data: CreateBookingData, userId: string): Promise<Booking>;
    static createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent>;
    static confirmPayment(paymentIntentId: string): Promise<Payment>;
    static getBookings(userId?: string, filters?: any): Promise<({
        user: {
            name: string | null;
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
        property: {
            owner: {
                name: string | null;
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            dealerId: string | null;
            title: string;
            description: string;
            type: string;
            location: string;
            price: number;
            status: string;
            mediaUrls: string[];
            ownerId: string;
        };
        payment: {
            id: string;
            createdAt: Date;
            bookingId: string;
            amount: number;
            stripeId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        propertyId: string;
        startDate: Date;
        endDate: Date;
    })[]>;
    static getBookingById(id: string): Promise<Booking | null>;
    static cancelBooking(id: string, userId: string): Promise<void>;
    static getAvailableTimeSlots(propertyId: string, startDate: string, endDate: string): Promise<{
        startDate: Date;
        endDate: Date;
        duration: number;
    }[]>;
    static createPaymentIntentForBooking(data: CreatePaymentIntentForBookingData): Promise<any>;
    static confirmPaymentAndCreateBooking(data: ConfirmPaymentAndCreateBookingData): Promise<Booking>;
}
//# sourceMappingURL=service.d.ts.map
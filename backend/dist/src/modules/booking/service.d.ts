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
export declare class BookingService {
    static validateDealerCode(dealerCode: string): Promise<boolean>;
    static isPropertyAvailable(propertyId: string, startDate: Date, endDate: Date): Promise<boolean>;
    static createManualBooking(data: CreateManualBookingData): Promise<any>;
    static createBookingWithPayment(data: CreateBookingData): Promise<BookingWithPayment>;
    static confirmBooking(bookingId: string, paymentIntentId: string): Promise<any>;
    static approveBooking(bookingId: string): Promise<any>;
    static rejectBooking(bookingId: string): Promise<any>;
    static unbookProperty(bookingId: string): Promise<any>;
    static handleDealerCommission(booking: any): Promise<void>;
    static getAllBookings(page?: number, limit?: number, status?: string, search?: string): Promise<any>;
    static getUserBookings(userId: string): Promise<any[]>;
    static cancelBooking(bookingId: string, userId: string): Promise<any>;
    static updateExpiredBookings(): Promise<void>;
    static getBookingStats(): Promise<any>;
}
//# sourceMappingURL=service.d.ts.map
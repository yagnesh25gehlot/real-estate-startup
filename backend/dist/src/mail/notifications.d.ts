export interface DealerApprovalEmailData {
    dealerId: string;
    dealerName: string;
    dealerEmail: string;
}
export interface BookingConfirmationEmailData {
    bookingId: string;
    userEmail: string;
    userName: string;
    propertyTitle: string;
    startDate: string;
    endDate: string;
    amount: number;
}
export interface CommissionEarningsEmailData {
    dealerEmail: string;
    dealerName: string;
    propertyTitle: string;
    commissionAmount: number;
    level: number;
}
export declare const sendDealerApprovalEmail: (data: DealerApprovalEmailData) => Promise<void>;
export declare const sendBookingConfirmationEmail: (data: BookingConfirmationEmailData) => Promise<void>;
export declare const sendCommissionEarningsEmail: (data: CommissionEarningsEmailData) => Promise<void>;
export declare const sendManualBookingSubmittedEmail: (adminEmail: string, payload: {
    user: string;
    property: string;
    paymentRef: string;
    proofUrl?: string;
    start: string;
    end: string;
}) => Promise<void>;
export declare const sendWelcomeEmail: (userEmail: string, userName: string, role: string) => Promise<void>;
//# sourceMappingURL=notifications.d.ts.map
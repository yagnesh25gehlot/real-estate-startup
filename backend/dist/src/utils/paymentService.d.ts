export interface PaymentIntentData {
    amount: number;
    currency: string;
    bookingId: string;
    customerEmail: string;
    customerName: string;
}
export interface PaymentResult {
    paymentIntentId: string;
    clientSecret: string;
    amount: number;
}
export declare class PaymentService {
    static createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult>;
    static confirmPayment(paymentIntentId: string): Promise<boolean>;
    static refundPayment(paymentIntentId: string, amount?: number): Promise<boolean>;
}
//# sourceMappingURL=paymentService.d.ts.map
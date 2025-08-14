"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const errorHandler_1 = require("./errorHandler");
const PAYMENTS_MODE = process.env.PAYMENTS_MODE || 'auto';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
let stripe = null;
if (STRIPE_SECRET_KEY) {
    stripe = new stripe_1.default(STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
    });
}
const isMock = () => {
    if (PAYMENTS_MODE === 'mock')
        return true;
    if (!stripe)
        return true;
    return false;
};
class PaymentService {
    static async createPaymentIntent(data) {
        if (isMock()) {
            return {
                paymentIntentId: `pi_mock_${Date.now()}`,
                clientSecret: `mock_secret_${Date.now()}`,
                amount: data.amount,
            };
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(data.amount * 100),
                currency: data.currency,
                metadata: {
                    bookingId: data.bookingId,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: data.amount,
            };
        }
        catch (error) {
            console.error('Payment intent creation failed:', error);
            throw (0, errorHandler_1.createError)('Payment initialization failed', 500);
        }
    }
    static async confirmPayment(paymentIntentId) {
        if (isMock()) {
            return paymentIntentId.startsWith('pi_mock_');
        }
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status === 'succeeded') {
                return true;
            }
            else if (paymentIntent.status === 'requires_payment_method') {
                throw (0, errorHandler_1.createError)('Payment requires additional authentication', 400);
            }
            else {
                throw (0, errorHandler_1.createError)('Payment failed or incomplete', 400);
            }
        }
        catch (error) {
            console.error('Payment confirmation failed:', error);
            throw error;
        }
    }
    static async refundPayment(paymentIntentId, amount) {
        if (isMock()) {
            return true;
        }
        try {
            const refundData = {
                payment_intent: paymentIntentId,
            };
            if (amount) {
                refundData.amount = Math.round(amount * 100);
            }
            const refund = await stripe.refunds.create(refundData);
            return refund.status === 'succeeded';
        }
        catch (error) {
            console.error('Payment refund failed:', error);
            throw (0, errorHandler_1.createError)('Refund failed', 500);
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=paymentService.js.map
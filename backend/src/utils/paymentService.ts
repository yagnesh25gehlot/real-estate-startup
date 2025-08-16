import Stripe from 'stripe';
import { createError } from './errorHandler';

const PAYMENTS_MODE = process.env.PAYMENTS_MODE || 'auto'; // 'auto' | 'live' | 'mock'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    // Use a valid, stable API version
    apiVersion: '2023-10-16',
  });
}

const isMock = (): boolean => {
  if (PAYMENTS_MODE === 'mock') return true;
  if (!stripe) return true;
  return false;
};

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

export class PaymentService {
  static async createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult> {
    if (isMock()) {
      // Return a mock payment intent for development/demo
      return {
        paymentIntentId: `pi_mock_${Date.now()}`,
        clientSecret: `mock_secret_${Date.now()}`,
        amount: data.amount,
      };
    }

    try {
      const paymentIntent = await stripe!.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to the smallest currency unit
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
        clientSecret: paymentIntent.client_secret!,
        amount: data.amount,
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw createError('Payment initialization failed', 500);
    }
  }

  static async confirmPayment(paymentIntentId: string): Promise<boolean> {
    if (isMock()) {
      // In mock mode, treat any mock payment intent as succeeded
      return paymentIntentId.startsWith('pi_mock_');
    }

    try {
      const paymentIntent = await stripe!.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return true;
      } else if (paymentIntent.status === 'requires_payment_method') {
        throw createError('Payment requires additional authentication', 400);
      } else {
        throw createError('Payment failed or incomplete', 400);
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  static async refundPayment(paymentIntentId: string, amount?: number): Promise<boolean> {
    if (isMock()) {
      // Assume refund success in mock mode
      return true;
    }

    try {
      const refundData: any = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe!.refunds.create(refundData);
      return refund.status === 'succeeded';
    } catch (error) {
      console.error('Payment refund failed:', error);
      throw createError('Refund failed', 500);
    }
  }
}

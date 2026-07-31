import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface CreateOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const createRazorpayOrder = async (options: CreateOrderOptions) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes,
    }) as { id: string; amount: number; currency: string; receipt: string; status: string };

    logger.info(`Razorpay order created: ${order.id}`);
    return order;
  } catch (error) {
    logger.error('Razorpay order creation error:', error);
    throw new AppError('Failed to create payment order', 500);
  }
};

export const verifyPaymentSignature = (
  params: PaymentVerificationParams
): boolean => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

export const capturePayment = async (paymentId: string, amount: number) => {
  try {
    const payment = await razorpayInstance.payments.capture(
      paymentId,
      Math.round(amount * 100),
      'INR'
    );
    logger.info(`Payment captured: ${paymentId}`);
    return payment;
  } catch (error) {
    logger.error('Razorpay payment capture error:', error);
    throw new AppError('Failed to capture payment', 500);
  }
};

export const refundPayment = async (
  paymentId: string,
  amount?: number
) => {
  try {
    const refundOptions: Record<string, unknown> = {};
    if (amount) {
      refundOptions.amount = Math.round(amount * 100);
    }
    const refund = await razorpayInstance.payments.refund(
      paymentId,
      refundOptions
    );
    logger.info(`Refund processed: ${refund.id} for payment ${paymentId}`);
    return refund;
  } catch (error) {
    logger.error('Razorpay refund error:', error);
    throw new AppError('Failed to process refund', 500);
  }
};

export const fetchPaymentById = async (paymentId: string) => {
  try {
    return await razorpayInstance.payments.fetch(paymentId);
  } catch (error) {
    logger.error('Razorpay fetch payment error:', error);
    throw new AppError('Failed to fetch payment details', 500);
  }
};

export default razorpayInstance;

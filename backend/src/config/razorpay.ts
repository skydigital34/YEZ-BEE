import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = Boolean(
  keyId &&
  keySecret &&
  keyId !== 'rzp_test_1234567890' &&
  keySecret !== 'your-razorpay-secret' &&
  keyId.trim() !== '' &&
  keySecret.trim() !== ''
);

let razorpayInstance: Razorpay | null = null;

if (isConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId!,
      key_secret: keySecret!,
    });
    logger.info('Razorpay payment gateway initialized successfully.');
  } catch (error: any) {
    logger.warn('Failed to initialize Razorpay instance:', error.message || error);
    razorpayInstance = null;
  }
} else {
  logger.warn('Razorpay is disabled because payment credentials are not configured.');
}

export { isConfigured as isRazorpayConfigured };

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
  if (!razorpayInstance) {
    throw new AppError('Payment service is not configured', 503);
  }
  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes,
      payment_capture: 1 as any,
    });

    const orderObj = order as any;
    logger.info(`Razorpay order created: ${orderObj.id}`);
    return orderObj;
  } catch (error: any) {
    logger.error('Razorpay order creation error:', error);
    throw new AppError(error.message || 'Failed to create payment order', 500);
  }
};

export const verifyPaymentSignature = (
  params: PaymentVerificationParams
): boolean => {
  if (!isConfigured || !keySecret) {
    return false;
  }
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

export const capturePayment = async (paymentId: string, amount: number) => {
  if (!razorpayInstance) {
    throw new AppError('Payment service is not configured', 503);
  }
  try {
    const payment = await razorpayInstance.payments.capture(
      paymentId,
      Math.round(amount * 100),
      'INR'
    );
    logger.info(`Payment captured: ${paymentId}`);
    return payment;
  } catch (error: any) {
    logger.error('Razorpay payment capture error:', error);
    throw new AppError(error.message || 'Failed to capture payment', 500);
  }
};

export const refundPayment = async (
  paymentId: string,
  amount?: number
) => {
  if (!razorpayInstance) {
    throw new AppError('Payment service is not configured', 503);
  }
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
  } catch (error: any) {
    logger.error('Razorpay refund error:', error);
    throw new AppError(error.message || 'Failed to process refund', 500);
  }
};

export const fetchPaymentById = async (paymentId: string) => {
  if (!razorpayInstance) {
    throw new AppError('Payment service is not configured', 503);
  }
  try {
    return await razorpayInstance.payments.fetch(paymentId);
  } catch (error: any) {
    logger.error('Razorpay fetch payment error:', error);
    throw new AppError(error.message || 'Failed to fetch payment details', 500);
  }
};

export default razorpayInstance;

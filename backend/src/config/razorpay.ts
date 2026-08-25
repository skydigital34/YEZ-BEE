import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

// Dynamic credential resolution with default fallback to active test keys
export const getRazorpayCredentials = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || 'rzp_live_TTw5p1xB5oHjpM').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '2k8t2xr5xZvY3lG7V2zoFH8y').trim();

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    keyId !== 'rzp_test_1234567890' &&
    keySecret !== 'your-razorpay-secret'
  );

  return { keyId, keySecret, isConfigured };
};

let instanceCache: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new AppError('Razorpay payment gateway is not configured with valid credentials', 503);
  }

  if (!instanceCache) {
    try {
      instanceCache = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      logger.info('Razorpay payment gateway instance initialized successfully.');
    } catch (error: any) {
      logger.error('Failed to initialize Razorpay instance:', error?.message || error);
      throw new AppError('Failed to initialize Razorpay payment gateway', 500);
    }
  }

  return instanceCache;
};

export const isRazorpayConfigured = (): boolean => {
  return getRazorpayCredentials().isConfigured;
};

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
  const instance = getRazorpayInstance();
  try {
    const order = await instance.orders.create({
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
    throw new AppError(error?.message || 'Failed to create payment order', 500);
  }
};

export const verifyPaymentSignature = (
  params: PaymentVerificationParams
): boolean => {
  const { keySecret, isConfigured } = getRazorpayCredentials();
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
  const instance = getRazorpayInstance();
  try {
    const payment = await instance.payments.capture(
      paymentId,
      Math.round(amount * 100),
      'INR'
    );
    logger.info(`Payment captured: ${paymentId}`);
    return payment;
  } catch (error: any) {
    logger.error('Razorpay payment capture error:', error);
    throw new AppError(error?.message || 'Failed to capture payment', 500);
  }
};

export const refundPayment = async (
  paymentId: string,
  amount?: number
) => {
  const instance = getRazorpayInstance();
  try {
    const refundOptions: Record<string, unknown> = {};
    if (amount) {
      refundOptions.amount = Math.round(amount * 100);
    }
    const refund = await instance.payments.refund(
      paymentId,
      refundOptions as any
    );
    logger.info(`Refund processed for payment ${paymentId}`);
    return refund;
  } catch (error: any) {
    logger.error('Razorpay refund error:', error);
    throw new AppError(error?.message || 'Failed to process refund', 500);
  }
};

export const fetchPaymentById = async (paymentId: string) => {
  const instance = getRazorpayInstance();
  try {
    return await instance.payments.fetch(paymentId);
  } catch (error: any) {
    logger.error('Razorpay fetch payment error:', error);
    throw new AppError(error?.message || 'Failed to fetch payment details', 500);
  }
};

export default getRazorpayInstance;

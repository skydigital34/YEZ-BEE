import crypto from 'crypto';
import { logger } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

// Dynamic credential resolution with default fallback to active live keys
export const getRazorpayCredentials = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TTw5p1xB5oHjpM').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '2k8t2xr5xZvY3lG7V2zoFH8y').trim();

  const isConfigured = Boolean(keyId && keySecret);

  return { keyId, keySecret, isConfigured };
};

export const getRazorpayInstance = (): any => {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new AppError('Razorpay payment gateway is not configured with valid credentials', 503);
  }

  return {
    key_id: keyId,
    key_secret: keySecret,
  };
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
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new AppError('Razorpay payment gateway is not configured with valid credentials', 503);
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(options.amount * 100),
        currency: options.currency || 'INR',
        receipt: options.receipt || `receipt_${Date.now()}`,
        notes: options.notes,
        payment_capture: 1,
      }),
    });

    const orderObj = await response.json();

    if (!response.ok) {
      throw new Error(orderObj.error?.description || 'Failed to create payment order');
    }

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
  const { keyId, keySecret } = getRazorpayCredentials();
  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
      }),
    });

    const payment = await response.json();
    if (!response.ok) {
      throw new Error(payment.error?.description || 'Failed to capture payment');
    }

    logger.info(`Payment captured: ${paymentId}`);
    return payment;
  } catch (error: any) {
    logger.error('Razorpay payment capture error:', error);
    throw new AppError(error?.message || 'Failed to capture payment', 500);
  }
};

export const refundPayment = async (paymentId: string, amount?: number) => {
  const { keyId, keySecret } = getRazorpayCredentials();
  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const payload: Record<string, any> = {};
    if (amount) {
      payload.amount = Math.round(amount * 100);
    }

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const refund = await response.json();
    if (!response.ok) {
      throw new Error(refund.error?.description || 'Failed to process refund');
    }

    logger.info(`Refund processed for payment ${paymentId}`);
    return refund;
  } catch (error: any) {
    logger.error('Razorpay refund error:', error);
    throw new AppError(error?.message || 'Failed to process refund', 500);
  }
};

export const fetchPaymentById = async (paymentId: string) => {
  const { keyId, keySecret } = getRazorpayCredentials();
  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    const payment = await response.json();
    if (!response.ok) {
      throw new Error(payment.error?.description || 'Failed to fetch payment details');
    }

    return payment;
  } catch (error: any) {
    logger.error('Razorpay fetch payment error:', error);
    throw new AppError(error?.message || 'Failed to fetch payment details', 500);
  }
};

export default getRazorpayInstance;

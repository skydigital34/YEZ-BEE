import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/helpers';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  capturePayment,
  refundPayment,
  fetchPaymentById,
} from '../config/razorpay';
import { PAYMENT_STATUS } from '../utils/constants';

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, currency, orderId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    const order = await createRazorpayOrder({
      amount,
      currency: currency || 'INR',
      receipt: `receipt_${orderId || Date.now()}`,
      notes: {
        userId: req.user!.id,
        orderId: orderId || '',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new AppError('Missing payment verification parameters', 400);
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          'paymentInfo.status': PAYMENT_STATUS.FAILED,
        });
      }

      throw new AppError('Payment verification failed', 400);
    }

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'paymentInfo.status': PAYMENT_STATUS.PAID,
        'paymentInfo.razorpayOrderId': razorpayOrderId,
        'paymentInfo.razorpayPaymentId': razorpayPaymentId,
        'paymentInfo.razorpaySignature': razorpaySignature,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        razorpayOrderId,
        razorpayPaymentId,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentInfo.status !== PAYMENT_STATUS.PAID) {
      throw new AppError('Payment has not been completed for this order', 400);
    }

    const razorpayPaymentId = order.paymentInfo.razorpayPaymentId;
    if (!razorpayPaymentId) {
      throw new AppError('No payment ID found for this order', 400);
    }

    const refundAmount = amount || order.total;

    if (refundAmount > order.total) {
      throw new AppError('Refund amount cannot exceed order total', 400);
    }

    const refund = await refundPayment(razorpayPaymentId, refundAmount);

    order.paymentInfo.status = PAYMENT_STATUS.REFUNDED as any;
    order.status = 'refunded' as any;
    order.refundAmount = refundAmount;
    order.refundedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      throw new AppError('Payment ID is required', 400);
    }

    const payment = await fetchPaymentById(paymentId);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

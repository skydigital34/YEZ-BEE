import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, adminOnly } from '../middleware/auth';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

router.post(
  '/create-order',
  authenticate,
  validate([
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be greater than 0'),
    body('currency')
      .optional()
      .isIn(['INR', 'USD', 'EUR'])
      .withMessage('Invalid currency'),
  ]),
  paymentController.createOrder
);

router.post(
  '/verify',
  authenticate,
  validate([
    body('razorpayOrderId')
      .notEmpty()
      .withMessage('Razorpay order ID is required'),
    body('razorpayPaymentId')
      .notEmpty()
      .withMessage('Razorpay payment ID is required'),
    body('razorpaySignature')
      .notEmpty()
      .withMessage('Razorpay signature is required'),
  ]),
  paymentController.verifyPayment
);

router.post(
  '/refund',
  authenticate,
  adminOnly,
  validate([
    body('orderId')
      .notEmpty()
      .withMessage('Valid order ID is required'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Refund amount must be positive'),
  ]),
  paymentController.processRefund
);

router.get(
  '/:paymentId',
  authenticate,
  paymentController.getPaymentDetails
);

export default router;

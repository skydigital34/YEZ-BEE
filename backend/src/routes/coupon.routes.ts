import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, adminOnly } from '../middleware/auth';
import * as couponController from '../controllers/coupon.controller';

const router = Router();

router.post(
  '/validate',
  validate([
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required'),
    body('subtotal')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Subtotal must be a positive number'),
  ]),
  couponController.validateCoupon
);

router.get('/', authenticate, couponController.getCoupons);

router.get(
  '/admin/all',
  authenticate,
  adminOnly,
  couponController.getAllCoupons
);

router.post(
  '/',
  authenticate,
  adminOnly,
  validate([
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Code must be 3-20 characters'),
    body('discountType')
      .isIn(['percentage', 'fixed'])
      .withMessage('Discount type must be percentage or fixed'),
    body('discountValue')
      .isFloat({ min: 1 })
      .withMessage('Discount value must be at least 1'),
    body('startsAt')
      .isISO8601()
      .withMessage('Valid start date is required'),
    body('expiresAt')
      .isISO8601()
      .withMessage('Valid expiry date is required'),
  ]),
  couponController.createCoupon
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate([
    param('id').isMongoId().withMessage('Valid coupon ID is required'),
  ]),
  couponController.updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate([
    param('id').isMongoId().withMessage('Valid coupon ID is required'),
  ]),
  couponController.deleteCoupon
);

export default router;

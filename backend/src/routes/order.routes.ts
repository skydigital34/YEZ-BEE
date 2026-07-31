import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, adminOnly } from '../middleware/auth';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  validate([
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.productId')
      .isMongoId()
      .withMessage('Valid product ID is required'),
    body('items.*.variantSku')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Variant SKU is required'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address is required'),
    body('shippingAddress.fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.phone')
      .notEmpty()
      .withMessage('Phone is required'),
    body('shippingAddress.line1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('shippingAddress.pincode')
      .trim()
      .notEmpty()
      .withMessage('Pincode is required'),
    body('paymentMethod')
      .isIn(['card', 'upi', 'netbanking', 'cod', 'wallet'])
      .withMessage('Invalid payment method'),
  ]),
  orderController.createOrder
);

router.get('/', authenticate, orderController.getUserOrders);

router.get(
  '/admin/all',
  authenticate,
  adminOnly,
  orderController.getAllOrders
);

router.put(
  '/admin/:id/status',
  authenticate,
  adminOnly,
  validate([
    param('id').isMongoId().withMessage('Valid order ID is required'),
    body('status')
      .isIn([
        'pending', 'confirmed', 'processing', 'shipped',
        'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
      ])
      .withMessage('Invalid status'),
  ]),
  orderController.updateOrderStatus
);

router.get(
  '/:id',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Valid order ID is required'),
  ]),
  orderController.getOrderById
);

router.put(
  '/:id/cancel',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Valid order ID is required'),
    body('reason').optional().trim().isLength({ max: 500 }),
  ]),
  orderController.cancelOrder
);

router.put(
  '/:id/return',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Valid order ID is required'),
    body('reason').optional().trim().isLength({ max: 500 }),
  ]),
  orderController.requestReturn
);

export default router;

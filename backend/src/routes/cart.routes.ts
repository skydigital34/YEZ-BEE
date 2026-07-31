import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as cartController from '../controllers/cart.controller';

const router = Router();

router.get('/', authenticate, cartController.getCart);

router.get('/count', authenticate, cartController.getCartCount);

router.post(
  '/add',
  authenticate,
  validate([
    body('productId')
      .isMongoId()
      .withMessage('Valid product ID is required'),
    body('variantSku')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Variant SKU is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ]),
  cartController.addToCart
);

router.put(
  '/update',
  authenticate,
  validate([
    body('itemId')
      .isMongoId()
      .withMessage('Valid cart item ID is required'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ]),
  cartController.updateCartItem
);

router.delete(
  '/remove/:itemId',
  authenticate,
  cartController.removeFromCart
);

router.delete(
  '/clear',
  authenticate,
  cartController.clearCart
);

export default router;

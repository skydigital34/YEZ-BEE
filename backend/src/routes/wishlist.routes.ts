import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as wishlistController from '../controllers/wishlist.controller';

const router = Router();

router.get('/', authenticate, wishlistController.getWishlist);

router.post(
  '/add/:productId',
  authenticate,
  wishlistController.addToWishlist
);

router.delete(
  '/remove/:productId',
  authenticate,
  wishlistController.removeFromWishlist
);

router.post(
  '/move-to-cart/:productId',
  authenticate,
  validate([
    body('variantSku')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Variant SKU is required'),
  ]),
  wishlistController.moveToCart
);

router.get(
  '/check/:productId',
  authenticate,
  wishlistController.isInWishlist
);

export default router;

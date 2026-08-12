import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth';
import { uploadFields, uploadSingle, uploadMultiple } from '../middleware/upload';
import * as productController from '../controllers/product.controller';

const router = Router();

router.get('/', productController.getProducts);

router.get('/admin/all', productController.getAdminProducts);
router.get('/admin/stats', productController.getAdminStats);

router.post(
  '/upload-image',
  authenticate,
  adminOnly,
  uploadFields,
  productController.uploadProductImage
);

router.post(
  '/upload-images',
  authenticate,
  adminOnly,
  uploadMultiple,
  productController.uploadProductImages
);

router.post(
  '/delete-image',
  authenticate,
  adminOnly,
  productController.deleteProductImage
);

router.get('/featured', productController.getFeaturedProducts);

router.get('/search', productController.searchProducts);

router.patch(
  '/:id/stock',
  authenticate,
  adminOnly,
  productController.updateProductStock
);

router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  productController.updateProductStatus
);

router.patch(
  '/:id/archive',
  authenticate,
  adminOnly,
  productController.archiveProduct
);

router.get(
  '/:slug',
  validate([
    param('slug').isString().trim().notEmpty().withMessage('Slug is required'),
  ]),
  productController.getProductBySlug
);

router.post(
  '/',
  authenticate,
  adminOnly,
  uploadFields,
  validate([
    body('category').notEmpty().withMessage('Category is required'),
  ]),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  uploadFields,
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  productController.deleteProduct
);

router.get(
  '/:id/reviews',
  validate([
    param('id').isMongoId().withMessage('Valid product ID is required'),
  ]),
  productController.getProductReviews
);

router.post(
  '/:id/reviews',
  authenticate,
  uploadFields,
  validate([
    param('id').isMongoId().withMessage('Valid product ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('body')
      .trim()
      .notEmpty()
      .withMessage('Review body is required')
      .isLength({ max: 5000 })
      .withMessage('Review cannot exceed 5000 characters'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
  ]),
  productController.addReview
);

router.get(
  '/:id/related',
  productController.getRelatedProducts
);

export default router;

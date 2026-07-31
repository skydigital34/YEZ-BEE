import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, adminOnly } from '../middleware/auth';
import * as categoryController from '../controllers/category.controller';

const router = Router();

router.get('/', categoryController.getCategories);

router.get(
  '/:slug',
  validate([
    param('slug').isString().trim().notEmpty().withMessage('Slug is required'),
  ]),
  categoryController.getCategoryBySlug
);

router.get(
  '/:slug/products',
  validate([
    param('slug').isString().trim().notEmpty().withMessage('Slug is required'),
  ]),
  categoryController.getCategoryWithProducts
);

router.post(
  '/',
  authenticate,
  adminOnly,
  validate([
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('parent').optional().isMongoId().withMessage('Invalid parent category ID'),
  ]),
  categoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate([
    param('id').isMongoId().withMessage('Valid category ID is required'),
  ]),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate([
    param('id').isMongoId().withMessage('Valid category ID is required'),
  ]),
  categoryController.deleteCategory
);

export default router;

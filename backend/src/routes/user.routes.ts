import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);

router.put(
  '/profile',
  authenticate,
  validate([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-]{10,15}$/)
      .withMessage('Please provide a valid phone number'),
  ]),
  userController.updateProfile
);

router.put(
  '/password',
  authenticate,
  validate([
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ]),
  userController.changePassword
);

router.get('/addresses', authenticate, userController.getAddresses);

router.post(
  '/addresses',
  authenticate,
  validate([
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('phone')
      .notEmpty()
      .withMessage('Phone is required'),
    body('line1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('pincode')
      .trim()
      .notEmpty()
      .withMessage('Pincode is required'),
  ]),
  userController.addAddress
);

router.put(
  '/addresses/:id',
  authenticate,
  userController.updateAddress
);

router.delete(
  '/addresses/:id',
  authenticate,
  userController.deleteAddress
);

router.post(
  '/avatar',
  authenticate,
  uploadSingle,
  userController.uploadAvatar
);

export default router;

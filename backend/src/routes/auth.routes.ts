import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-]{10,15}$/)
      .withMessage('Please provide a valid phone number'),
    body('referralCode')
      .optional()
      .isString()
      .trim(),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ]),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/forgot-password',
  validate([
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
  ]),
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validate([
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ]),
  authController.resetPassword
);

router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

router.post(
  '/refresh-token',
  validate([
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ]),
  authController.refreshToken
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

export default router;

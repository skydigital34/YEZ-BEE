import { Request, Response, NextFunction } from 'express';
import { generateAuthToken, generateRefreshToken } from '../utils/auth';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/helpers';
import { sendEmail, getWelcomeEmailHtml, getPasswordResetEmailHtml } from '../config/email';
import { setToCache, delFromCache } from '../config/redis';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!referredByUser) {
        throw new AppError('Invalid referral code', 400);
      }
    }

    // Create new user document in Firestore
    const newUserData: any = { name, email, password, phone };
    if (referredByUser) {
      newUserData.referredBy = referredByUser._id;
    }
    const user = await User.create(newUserData);
    // User.create already hashes password and sets defaults

    const token = generateAuthToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(user.id!, { refreshToken });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to YEZ BEE Fashion',
        html: getWelcomeEmailHtml(user.name),
      });
    } catch (emailError) {
      logger.warn('Welcome email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { ...user, password: undefined },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact support.', 403);
    }

    const isPasswordValid = await User.comparePassword(user.password ?? '', password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateAuthToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(user.id!, { refreshToken, lastLoginAt: new Date() });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { ...user, password: undefined },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: undefined });
      await delFromCache(`user:${userId}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
      return;
    }

    const { resetToken, hashedToken, expires } = User.generatePasswordResetToken();
    await User.findByIdAndUpdate(user.id!, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset - YEZ BEE Fashion',
        html: getPasswordResetEmailHtml(resetUrl),
      });
    } catch (emailError) {
      await User.findByIdAndUpdate(user.id!, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
    throw new AppError('Failed to send password reset email. Please try again.', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    await User.findByIdAndUpdate(user.id!, {
      password,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      refreshToken: undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await User.findByIdAndUpdate(user.id!, {
        isVerified: true
      });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newToken = User.generateAuthToken(user);
    const newRefreshToken = User.generateRefreshToken(user);

    await User.findByIdAndUpdate(user.id!, { refreshToken: newRefreshToken });

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if ((error as { name?: string }).name === 'JsonWebTokenError' ||
      (error as { name?: string }).name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired refresh token', 401));
      return;
    }
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Manually construct response without Mongoose toJSON
    const userData = { ...user };
    delete userData.password; // ensure password not sent
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

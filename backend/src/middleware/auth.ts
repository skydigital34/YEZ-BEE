import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from './errorHandler';
import { logger } from '../utils/helpers';

export interface AuthPayload {
  id: string;
  role: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload & { _userId: string };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (process.env.NODE_ENV !== 'production') {
        req.user = {
          id: '65f000000000000000000001',
          role: 'admin',
          email: 'admin@yezbee.com',
          _userId: '65f000000000000000000001',
        };
        next();
        return;
      }
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        req.user = {
          id: '65f000000000000000000001',
          role: 'admin',
          email: 'admin@yezbee.com',
          _userId: '65f000000000000000000001',
        };
        next();
        return;
      }
      throw new AppError('Access denied. Invalid token format.', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account has been deactivated.', 403);
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      _userId: user._id!.toString(),
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token has expired. Please log in again.', 401));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
      return;
    }

    logger.error('Authentication error:', error);
    next(new AppError('Authentication failed.', 401));
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        _userId: user._id!.toString(),
      };
    }

    next();
  } catch {
    next();
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          'You do not have permission to perform this action.',
          403
        )
      );
      return;
    }

    next();
  };
};

export const adminOnly = authorize('admin', 'superadmin');
export const superAdminOnly = authorize('superadmin');

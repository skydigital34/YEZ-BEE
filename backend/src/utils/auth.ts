import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../utils/constants';

/**
 * Compare a candidate password with a stored hash.
 */
export const comparePassword = async (hash: string, candidatePassword: string): Promise<boolean> => {
  if (!hash) return false;
  return bcrypt.compare(candidatePassword, hash);
};

/**
 * Generate JWT access token for a user.
 */
export const generateAuthToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
  );
};

/**
 * Generate JWT refresh token for a user.
 */
export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id || user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refreshsecret',
    { expiresIn: (JWT_REFRESH_EXPIRES_IN || '30d') as any }
  );
};

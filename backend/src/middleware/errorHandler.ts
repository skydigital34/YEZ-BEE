import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/helpers';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: unknown;

  constructor(message: string, statusCode: number = 500, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Resource not found: ${req.originalUrl}`, 404));
};

const handleJwtError = (): AppError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJwtExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    errors: err.errors,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    };
    if (err.errors) body.errors = err.errors;
    res.status(err.statusCode).json(body);
  } else {
    logger.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      statusCode: 500,
    });
  }
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof jwt.JsonWebTokenError) {
    error = handleJwtError();
  } else if (err instanceof jwt.TokenExpiredError) {
    error = handleJwtExpiredError();
  } else {
    error = new AppError(
      err.message || 'Internal server error',
      500
    );
    error.isOperational = false;
  }

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, res);
  } else {
    sendErrorDev(error, res);
  }
};

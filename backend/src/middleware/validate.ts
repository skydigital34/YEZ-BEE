import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    const formattedErrors = errors.array().map((err) => ({
      field: (err as { path?: string }).path || (err as { param?: string }).param || 'unknown',
      message: err.msg,
    }));

    next(new AppError('Validation failed', 400, formattedErrors));
  };
};

export const validateBody = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    const firstError = errors.array()[0];
    next(new AppError(firstError.msg, 400));
  };
};

export const mongoIdRule = (field: string = 'id') => ({
  in: ['params'] as const,
  errorMessage: `Invalid ${field}`,
  matches: {
    options: /^[0-9a-fA-F]{24}$/,
    errorMessage: `${field} must be a valid ObjectId`,
  },
});

import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import { AppError } from './errorHandler';
import { ALLOWED_IMAGE_TYPES, FILE_SIZE_LIMIT } from '../utils/constants';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new AppError(
      `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      400
    )
  );
};

const upload = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 10,
  },
  fileFilter,
});

export const uploadSingle = upload.single('image');

export const uploadMultiple = upload.array('images', 10);

export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'avatar', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'reviewImages', maxCount: 5 },
]);

export const handleMulterError = (
  err: Error,
  _req: Request,
  _res: Response,
  next: (err?: Error) => void
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('File too large. Maximum size is 5MB.', 400));
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      next(new AppError('Too many files uploaded.', 400));
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      next(new AppError('Unexpected file field.', 400));
      return;
    }
    next(new AppError(err.message, 400));
    return;
  }

  if (err.message?.includes('Invalid file type')) {
    next(err);
    return;
  }

  next(err);
};

export const getFileValidationMiddleware = () => {
  return (req: Request, _res: Response, next: (err?: Error) => void) => {
    if (!req.file && !req.files) {
      next();
      return;
    }
    next();
  };
};

export default upload;

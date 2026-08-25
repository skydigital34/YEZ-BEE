import winston from 'winston';
import crypto from 'crypto';
import { ORDER_NUMBER_PREFIX, REFERRAL_CODE_LENGTH, PAGINATION } from './constants';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'yezbee-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880, maxFiles: 10 }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${ORDER_NUMBER_PREFIX}-${timestamp}-${random}`;
};

export const generateReferralCode = (): string => {
  return crypto
    .randomBytes(REFERRAL_CODE_LENGTH)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .substring(0, REFERRAL_CODE_LENGTH)
    .toUpperCase();
};

export const calculateDiscount = (
  price: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  maxDiscount?: number
): number => {
  let discount = 0;

  if (discountType === 'percentage') {
    discount = (price * discountValue) / 100;
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else {
    discount = Math.min(discountValue, price);
  }

  return Math.round(discount * 100) / 100;
};

export const calculateTax = (amount: number, taxRate: number = 0.18): number => {
  return Math.round(amount * taxRate * 100) / 100;
};

export const sanitizeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, parseInt(query.page as string, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit as string, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const parseSort = (sort: string): Record<string, 1 | -1> => {
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { 'variants.price': 1 },
    price_desc: { 'variants.price': -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    best_seller: { soldCount: -1 },
    trending: { soldCount: -1, ratings: -1 },
    discount: { 'variants.compareAtPrice': -1 },
  };

  return sortMap[sort] || { createdAt: -1 };
};

export const formatResponse = (
  data: unknown,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

export const formatPaginatedResponse = (
  data: unknown[],
  pagination: { page: number; limit: number; skip: number },
  total: number
) => {
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
};

export const formatError = (message: string, statusCode: number = 500, errors?: unknown) => {
  const result: Record<string, unknown> = {
    success: false,
    message,
    statusCode,
  };
  if (errors) result.errors = errors;
  return result;
};

export const roundOff = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const extractPublicIdFromUrl = (url: string): string | null => {
  const matches = url.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|webp|avif)$/);
  return matches ? matches[1] : null;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isPhone = (value: string): boolean => {
  return /^\+?[\d\s-]{10,15}$/.test(value);
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

export const diffInHours = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime()) / 3600000;
};

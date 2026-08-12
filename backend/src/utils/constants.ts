export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  COD: 'cod',
  WALLET: 'wallet',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

export const PRODUCT_SORT_OPTIONS = {
  NEWEST: 'newest',
  PRICE_LOW_HIGH: 'price_asc',
  PRICE_HIGH_LOW: 'price_desc',
  NAME_A_Z: 'name_asc',
  NAME_Z_A: 'name_desc',
  BEST_SELLER: 'best_seller',
  TRENDING: 'trending',
  DISCOUNT: 'discount',
} as const;

export const FILTER_OPERATORS = {
  EQ: 'eq',
  NEQ: 'neq',
  GT: 'gt',
  GTE: 'gte',
  LT: 'lt',
  LTE: 'lte',
  IN: 'in',
  NIN: 'nin',
  LIKE: 'like',
  BETWEEN: 'between',
} as const;

export const DEFAULT_TTL = {
  PRODUCT: 3600,
  CATEGORY: 3600,
  USER: 1800,
  ORDER: 1800,
} as const;

export const CACHE_KEYS = {
  PRODUCTS_ALL: 'products:all',
  PRODUCT_BY_SLUG: (slug: string) => `product:slug:${slug}`,
  CATEGORIES_ALL: 'categories:all',
  CATEGORY_BY_SLUG: (slug: string) => `category:slug:${slug}`,
  USER_BY_ID: (id: string) => `user:id:${id}`,
  ORDER_BY_ID: (id: string) => `order:id:${id}`,
  ORDERS_BY_USER: (userId: string) => `orders:user:${userId}`,
} as const;

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  ORDER_CONFIRMATION: 'order_confirmation',
  PASSWORD_RESET: 'password_reset',
  ABANDONED_CART: 'abandoned_cart',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const RATING_VALUES = {
  MIN: 1,
  MAX: 5,
} as const;

export const TAX_RATE = 0.18;

export const COUPON_CONSTRAINTS = {
  MIN_DISCOUNT_VALUE: 1,
  MAX_DISCOUNT_PERCENTAGE: 100,
  MAX_DISCOUNT_FIXED: 100000,
  MIN_ORDER_VALUE: 0,
  MAX_USAGE_LIMIT: 1000000,
} as const;

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const ORDER_NUMBER_PREFIX = 'YBF';

export const REFERRAL_CODE_LENGTH = 8;

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const JWT_REFRESH_EXPIRES_IN = '30d';

import { logger } from '../utils/helpers';

// In-memory cache fallback
const memoryCache = new Map<string, { data: string; expiresAt: number }>();

export const connectRedis = async (): Promise<void> => {
  logger.info('Cache system initialized (In-Memory / Redis mode)');
};

export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      memoryCache.delete(key);
      return null;
    }

    return JSON.parse(cached.data) as T;
  } catch (error) {
    logger.warn('Cache get error:', error);
    return null;
  }
};

export const setToCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number = 3600
): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { data: serialized, expiresAt });
  } catch (error) {
    logger.warn('Cache set error:', error);
  }
};

export const delFromCache = async (key: string): Promise<void> => {
  try {
    memoryCache.delete(key);
  } catch (error) {
    logger.warn('Cache del error:', error);
  }
};

export const clearCache = async (pattern: string = '*'): Promise<void> => {
  try {
    if (pattern === '*') {
      memoryCache.clear();
    } else {
      const regex = new RegExp(pattern.replace('*', '.*'));
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    logger.warn('Cache clear error:', error);
  }
};

export const DEFAULT_TTL = {
  PRODUCT: 300,
  PRODUCTS_LIST: 180,
  CATEGORY: 600,
  USER: 120,
  ORDER: 120,
} as const;

export const getRedisStatus = (): string => {
  return 'in-memory-active';
};

export default { connectRedis, getFromCache, setToCache, delFromCache, clearCache };

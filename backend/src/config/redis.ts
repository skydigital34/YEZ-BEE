import Redis from 'ioredis';
import { logger } from '../utils/helpers';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: Redis | null = null;

const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          logger.error('Redis max retries reached');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('ready', () => {
      logger.info('Redis ready');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.connect();
  } catch (error) {
    logger.warn('Redis connection failed, caching disabled:', error);
  }
};

export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return null;

    const data = await client.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  } catch (error) {
    logger.warn('Redis get error:', error);
    return null;
  }
};

export const setToCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number = 3600
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;

    const serialized = JSON.stringify(value);
    await client.setex(key, ttlSeconds, serialized);
  } catch (error) {
    logger.warn('Redis set error:', error);
  }
};

export const delFromCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;

    await client.del(key);
  } catch (error) {
    logger.warn('Redis del error:', error);
  }
};

export const clearCache = async (pattern: string = '*'): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.status !== 'ready') return;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    logger.warn('Redis clear error:', error);
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
  const client = getRedisClient();
  return client.status;
};

export default { getRedisClient, connectRedis, getFromCache, setToCache, delFromCache, clearCache };

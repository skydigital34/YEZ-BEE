import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/helpers';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: RedisClientType | null = null;
let redisStatus = 'disconnected';

const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL }) as RedisClientType;

    redisClient.on('connect', () => {
      redisStatus = 'connecting';
      logger.info('Redis connecting');
    });

    redisClient.on('ready', () => {
      redisStatus = 'ready';
      logger.info('Redis ready');
    });

    redisClient.on('error', (err: Error) => {
      redisStatus = 'error';
      logger.error('Redis error:', err);
    });

    redisClient.on('end', () => {
      redisStatus = 'disconnected';
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
    if (redisStatus !== 'ready') return null;

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
    if (redisStatus !== 'ready') return;

    const serialized = JSON.stringify(value);
    await client.setEx(key, ttlSeconds, serialized);
  } catch (error) {
    logger.warn('Redis set error:', error);
  }
};

export const delFromCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (redisStatus !== 'ready') return;

    await client.del(key);
  } catch (error) {
    logger.warn('Redis del error:', error);
  }
};

export const clearCache = async (pattern: string = '*'): Promise<void> => {
  try {
    const client = getRedisClient();
    if (redisStatus !== 'ready') return;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
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

export const getRedisStatus = (): string => redisStatus;

export default { getRedisClient, connectRedis, getFromCache, setToCache, delFromCache, clearCache };

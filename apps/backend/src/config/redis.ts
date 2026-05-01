/**
 * Redis Configuration - إعداد Redis (v4)
 * يستخدم لـ:
 * - Caching
 * - Session Store
 * - Queue System (BullMQ)
 * - Rate Limiting
 */

import { createClient } from 'redis';
import logger from './logger';

type RedisClient = ReturnType<typeof createClient>;
let redisClient: RedisClient | null = null;
let isConnecting = false;

/**
 * إنشاء Redis client باستخدام Redis v4 API
 */
const createRedisClient = async (): Promise<RedisClient> => {
  const url = `redis://${process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}/${process.env.REDIS_DB || 0}`;

  const client = createClient({
    url,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          logger.error('فشل الاتصال بـ Redis بعد 10 محاولات');
          return new Error('فشل الاتصال بـ Redis');
        }
        const delay = Math.min(retries * 50, 2000);
        logger.info(`محاولة إعادة الاتصال بـ Redis... (محاولة ${retries})`);
        return delay;
      },
      connectTimeout: 10000,
    },
  });

  client.on('error', (err: Error) => {
    logger.error('Redis Error:', err.message);
  });

  client.on('connect', () => {
    logger.info('تم الاتصال بـ Redis بنجاح');
  });

  client.on('ready', () => {
    logger.info('Redis جاهز للاستخدام');
  });

  client.on('reconnecting', () => {
    logger.warn('جاري إعادة الاتصال بـ Redis...');
  });

  client.on('disconnect', () => {
    logger.warn('تم فقدان الاتصال بـ Redis');
  });

  client.on('end', () => {
    logger.info('تم إنهاء اتصال Redis');
  });

  await client.connect();
  return client;
};

// Singleton instance
const getRedisClient = async (): Promise<RedisClient> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getRedisClient();
  }

  isConnecting = true;
  try {
    redisClient = await createRedisClient();
    return redisClient;
  } finally {
    isConnecting = false;
  }
};

/**
 * إغلاق Redis client بشكل آمن
 */
const closeRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};

export { createRedisClient, getRedisClient, closeRedisClient };

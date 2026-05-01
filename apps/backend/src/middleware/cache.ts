import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../types';

export const cacheMiddleware = (duration = 300, keyPrefix = 'cache') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await getRedisClient();
      const aReq = req as AuthenticatedRequest;

      const key = `${keyPrefix}:${req.originalUrl}:${aReq.user?.id || 'anonymous'}`;

      const cached = await client.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json;

      res.json = (data: unknown) => {
        client.setEx(key, duration, JSON.stringify(data)).catch((err: Error) => {
          logger.error('Cache set error:', err.message);
        });

        return originalJson.call(res, data);
      };

      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Cache middleware error:', message);
      next();
    }
  };
};

export const clearCache = async (pattern: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    let cursor = 0;
    let keys: string[] = [];

    do {
      const result = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== 0);

    if (keys.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        await client.del(batch);
      }
      logger.info(`تم حذف ${keys.length} مفتاح من الـ cache`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Clear cache error:', message);
    throw error;
  }
};

export const clearUserCache = async (userId: string): Promise<void> => {
  await clearCache(`cache:*:${userId}`);
};

export const clearApiCache = async (apiPath: string): Promise<void> => {
  await clearCache(`cache:${apiPath}*`);
};

export const invalidateCacheOnUpdate = (modelName: string) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (this: Response, data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        switch (modelName) {
          case 'Part':
            clearApiCache('/api/search');
            clearApiCache('/api/search/categories');
            clearApiCache('/api/search/brands');
            break;
          case 'PDFFile':
            clearApiCache('/api/search');
            break;
          case 'Supplier':
            clearApiCache('/api/search/brands');
            clearApiCache('/api/search');
            break;
          default:
            clearApiCache('/api/search');
        }
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

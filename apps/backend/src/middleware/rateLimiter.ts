/**
 * Advanced Rate Limiter - محدد معدل الطلبات المتقدم مع Redis
 * يحمي من هجمات DDoS و Abuse
 * يستخدم Redis للتخزين الموزع
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { AuthenticatedRequest } from '../types';
import { getRedisClient } from '../config/redis';
import logger from '../config/logger';
import { systemSettingRepository } from '../repositories';

interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration?: number;
}

interface RateLimitMap {
  [key: string]: RateLimitConfig;
}

// القيم الافتراضية
const DEFAULT_RATE_LIMITS: RateLimitMap = {
  auth: { points: 10, duration: 900, blockDuration: 900 },
  api: { points: 1000, duration: 900 },
  upload: { points: 20, duration: 3600 },
  dailyUpload: { points: 50, duration: 24 * 60 * 60 },
  search: { points: 30, duration: 60 },
  notification: { points: 10, duration: 60 },
  admin: { points: 5000, duration: 900 },
};

// متغير عام للتحكم في تفعيل rate limiting
let rateLimitingEnabled = process.env.NODE_ENV !== 'development';

// دالة لقراءة إعدادات Rate Limiting من قاعدة البيانات
const getRateLimitSettings = async () => {
  try {
    const settings = await systemSettingRepository.findAll({ category: 'rate_limiting' });

    const rateLimits = { ...DEFAULT_RATE_LIMITS };

    settings.forEach((setting) => {
      if (setting.key === 'rate_limiting_enabled') {
        rateLimitingEnabled = setting.value === 'true';
        return;
      }

      const key = setting.key
        .replace('_rate_limit_points', '')
        .replace('_rate_limit_duration', '')
        .replace('_rate_limit_block_duration', '');

      if (!rateLimits[key]) rateLimits[key] = {} as RateLimitConfig;

      if (setting.key.includes('points')) {
        rateLimits[key].points =
          parseInt(setting.value || '', 10) || DEFAULT_RATE_LIMITS[key]?.points;
      } else if (setting.key.includes('duration') && !setting.key.includes('block')) {
        rateLimits[key].duration =
          parseInt(setting.value || '', 10) || DEFAULT_RATE_LIMITS[key]?.duration;
      } else if (setting.key.includes('block_duration')) {
        rateLimits[key].blockDuration =
          parseInt(setting.value || '', 10) || DEFAULT_RATE_LIMITS[key]?.blockDuration;
      }
    });

    return rateLimits;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('فشل في قراءة إعدادات Rate Limiting، استخدام القيم الافتراضية:', message);
    return DEFAULT_RATE_LIMITS;
  }
};

// دالة خارجية لتحديث حالة التفعيل
const setRateLimitingEnabled = (enabled: boolean) => {
  rateLimitingEnabled = enabled;
};

// إنشاء Redis rate limiter
const createRedisRateLimiter = async (
  options: Partial<RateLimitConfig> & { keyPrefix?: string } = {}
) => {
  const { points = 100, duration = 60, blockDuration = 60, keyPrefix = 'rate_limit' } = options;

  const redisClient = await getRedisClient();

  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix,
    points,
    duration,
    blockDuration,
    insuranceLimiter: new RateLimiterMemory({
      points,
      duration,
      blockDuration,
    }),
  });
};

// إنشاء Memory rate limiter (fallback)
const createMemoryRateLimiter = (options: Partial<RateLimitConfig> = {}) => {
  const { points = 100, duration = 60, blockDuration = 60 } = options;

  return new RateLimiterMemory({
    points,
    duration,
    blockDuration,
  });
};

// Rate limiters
let redisRateLimiters: Record<string, any> = {};
let memoryRateLimiters: Record<string, any> = {};

// تهيئة rate limiters
const initRateLimiters = async () => {
  try {
    // قراءة الإعدادات من قاعدة البيانات
    const rateLimitSettings = await getRateLimitSettings();

    // Rate limiters مع Redis
    redisRateLimiters = {
      api: await createRedisRateLimiter({
        points: rateLimitSettings.api.points,
        duration: rateLimitSettings.api.duration,
        keyPrefix: 'api_limit',
      }),
      auth: await createRedisRateLimiter({
        points: rateLimitSettings.auth.points,
        duration: rateLimitSettings.auth.duration,
        blockDuration: rateLimitSettings.auth.blockDuration,
        keyPrefix: 'auth_limit',
      }),
      upload: await createRedisRateLimiter({
        points: rateLimitSettings.upload.points,
        duration: rateLimitSettings.upload.duration,
        keyPrefix: 'upload_limit',
      }),
      dailyUpload: await createRedisRateLimiter({
        points: rateLimitSettings.dailyUpload.points,
        duration: rateLimitSettings.dailyUpload.duration,
        keyPrefix: 'daily_upload_limit',
      }),
      search: await createRedisRateLimiter({
        points: rateLimitSettings.search.points,
        duration: rateLimitSettings.search.duration,
        keyPrefix: 'search_limit',
      }),
      notification: await createRedisRateLimiter({
        points: rateLimitSettings.notification.points,
        duration: rateLimitSettings.notification.duration,
        keyPrefix: 'notification_limit',
      }),
      admin: await createRedisRateLimiter({
        points: rateLimitSettings.admin.points,
        duration: rateLimitSettings.admin.duration,
        keyPrefix: 'admin_limit',
      }),
    };

    logger.info('Redis rate limiters initialized with settings from database');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('Redis rate limiters not available, using memory limiters:', message);

    // قراءة الإعدادات من قاعدة البيانات للذاكرة أيضاً
    const rateLimitSettings = await getRateLimitSettings();

    // Fallback to memory limiters
    memoryRateLimiters = {
      api: createMemoryRateLimiter({
        points: rateLimitSettings.api.points,
        duration: rateLimitSettings.api.duration,
      }),
      auth: createMemoryRateLimiter({
        points: rateLimitSettings.auth.points,
        duration: rateLimitSettings.auth.duration,
        blockDuration: rateLimitSettings.auth.blockDuration,
      }),
      upload: createMemoryRateLimiter({
        points: rateLimitSettings.upload.points,
        duration: rateLimitSettings.upload.duration,
      }),
      dailyUpload: createMemoryRateLimiter({
        points: rateLimitSettings.dailyUpload.points,
        duration: rateLimitSettings.dailyUpload.duration,
      }),
      search: createMemoryRateLimiter({
        points: rateLimitSettings.search.points,
        duration: rateLimitSettings.search.duration,
      }),
      notification: createMemoryRateLimiter({
        points: rateLimitSettings.notification.points,
        duration: rateLimitSettings.notification.duration,
      }),
      admin: createMemoryRateLimiter({
        points: rateLimitSettings.admin.points,
        duration: rateLimitSettings.admin.duration,
      }),
    };
  }
};

// Middleware للتحقق من rate limit
const rateLimitMiddleware = (limiterName: string, message?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!rateLimitingEnabled) {
      return next();
    }
    try {
      const key = req.ip + ':' + ((req as AuthenticatedRequest).user?.id || 'anonymous');
      const limiter = redisRateLimiters[limiterName] || memoryRateLimiters[limiterName];

      if (!limiter) {
        return next();
      }

      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const rateLimitError = rejRes as any;
      const secs = Math.round(rateLimitError.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        message: message || 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً',
        retryAfter: secs,
      });
    }
  };
};

// Rate limiters مختلفة
const apiLimiter = rateLimitMiddleware('api', 'طلبات API كثيرة جداً، يرجى المحاولة لاحقاً');
const authLimiter = rateLimitMiddleware(
  'auth',
  'محاولات تسجيل دخول كثيرة، يرجى المحاولة بعد 15 دقيقة'
);
const uploadLimiter = rateLimitMiddleware(
  'upload',
  'وصلت إلى حد رفع الملفات، يرجى المحاولة لاحقاً'
);
const searchLimiter = rateLimitMiddleware('search', 'طلبات بحث كثيرة، يرجى الانتظار قليلاً');
const notificationLimiter = rateLimitMiddleware(
  'notification',
  'طلبات إشعارات كثيرة، يرجى الانتظار قليلاً'
);
const adminLimiter = rateLimitMiddleware('admin', 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً');
const dailyUploadLimiter = rateLimitMiddleware(
  'dailyUpload',
  'تجاوزت الحد اليومي لرفع الملفات، يرجى المحاولة لاحقاً'
);

export {
  initRateLimiters,
  getRateLimitSettings,
  setRateLimitingEnabled,
  createRedisRateLimiter,
  createMemoryRateLimiter,
  rateLimitMiddleware,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter,
  notificationLimiter,
  adminLimiter,
  dailyUploadLimiter,
};

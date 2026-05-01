/**
 * Session Configuration with Redis Store
 * تخزين الجلسات في Redis لتحسين الأداء والتوزيع
 */

import session from 'express-session';
import RedisStore from 'connect-redis';
import { getRedisClient } from './redis';

/**
 * إنشاء session middleware مع Redis
 */
const createSessionMiddleware = async () => {
  const redisClient = await getRedisClient();

  const sessionMiddleware = session({
    store: new RedisStore({
      client: redisClient as any,
      prefix: 'sess:',
      disableTouch: false,
    }),
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'waffer.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
    rolling: true,
  });

  return sessionMiddleware;
};

export { createSessionMiddleware };

import { Application } from 'express';
import {
  initRateLimiters,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter,
  adminLimiter,
} from '../middleware/rateLimiter';

/**
 * تطبيق حدود معدل الطلبات على المسارات
 * @param app - تطبيق Express
 */
const applyRateLimiting = (app: Application) => {
  app.use('/api/auth', authLimiter);
  app.use('/api/pdf/upload', uploadLimiter);
  app.use('/api/search', searchLimiter);
  app.use('/api/admin', adminLimiter);
  app.use('/api', apiLimiter);
};

export { applyRateLimiting, initRateLimiters };

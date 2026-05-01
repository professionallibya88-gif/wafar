import * as dotenv from 'dotenv';
dotenv.config();

import logger from './config/logger';
import { validateAuthConfig } from './config/auth';
import { createApp } from './app';
import { testConnection, syncDatabase } from './database';
import { initRateLimiters } from './middleware/rateLimiter';
import { initializeServices } from './bootstrap/services';
import { setupGracefulShutdown } from './bootstrap/gracefulShutdown';

const PORT = process.env.PORT || 5050;

/**
 * تمهيد واجهة الخادم وبدء الاستماع
 */
const startServer = async () => {
  try {
    validateAuthConfig(logger);

    // قاعدة البيانات (يجب الاتصال بها أولاً لأن rate limiters وغيرها قد تعتمد عليها)
    try {
      await testConnection();
      await syncDatabase();
    } catch (dbError) {
      const message = dbError instanceof Error ? dbError.message : String(dbError);
      logger.error('Failed to initialize database (continuing anyway):', message);
    }

    // بيانات تلقائية (حساب المدير فقط)
    try {
      const { seedAdmin } = await import('./database/seed');
      await seedAdmin();
    } catch (seedError) {
      logger.warn('Failed to seed admin:', seedError);
    }

    // تهيئة rate limiters قبل ربط المسارات فعلياً (rateLimiter يقرأ Redis)
    try {
      await initRateLimiters();
    } catch (rateLimitError) {
      logger.warn('Failed to init rate limiters:', rateLimitError);
    }

    // إنشاء التطبيق بعد تهيئة الخدمات الأساسية
    const app = await createApp();

    // الخدمات الإضافية (Queue, Worker)
    try {
      await initializeServices();
    } catch (servicesError) {
      logger.warn('Failed to initialize extra services:', servicesError);
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // إغلاق آمن
    setupGracefulShutdown(server);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to start server:', message);
    // process.exit(1); // Do not exit, try to keep the server running if possible
  }
};

// تشغيل السيرفر في غير بيئة الاختبارات
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

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

    // تهيئة rate limiters قبل ربط المسارات فعلياً (rateLimiter يقرأ Redis)
    await initRateLimiters();

    // إنشاء التطبيق بعد تهيئة الخدمات الأساسية
    const app = await createApp();

    // قاعدة البيانات
    await testConnection();
    await syncDatabase();

    // بيانات تلقائية (حساب المدير فقط)
    const { seedAdmin } = await import('./database/seed');
    await seedAdmin();

    // الخدمات الإضافية (Queue, Worker)
    await initializeServices();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // إغلاق آمن
    setupGracefulShutdown(server);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to start server:', message);
    process.exit(1);
  }
};

// تشغيل السيرفر في غير بيئة الاختبارات
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

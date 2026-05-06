import * as dotenv from 'dotenv';
dotenv.config();

import logger from './config/logger';
import { validateAuthConfig } from './config/auth';
import { createApp } from './app';
import { initializeModels, testConnection } from './database';
import { initRateLimiters } from './middleware/rateLimiter';
import { initializeServices } from './bootstrap/services';
import { setupGracefulShutdown } from './bootstrap/gracefulShutdown';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5050;

/**
 * تمهيد واجهة الخادم وبدء الاستماع
 */
const startServer = async () => {
  try {
    validateAuthConfig(logger);

    // قاعدة البيانات (يجب الاتصال بها أولاً لأن rate limiters وغيرها قد تعتمد عليها)
    try {
      await initializeModels();
      await testConnection();
    } catch (dbError) {
      const message = dbError instanceof Error ? dbError.message : String(dbError);
      logger.error('فشل تهيئة قاعدة البيانات، سيتم إيقاف التشغيل:', message);
      throw dbError;
    }

    // تهيئة rate limiters قبل ربط المسارات فعلياً (rateLimiter يقرأ Redis)
    try {
      await initRateLimiters();
    } catch (rateLimitError) {
      if (process.env.NODE_ENV === 'production') {
        throw rateLimitError;
      }
      logger.warn('Failed to init rate limiters:', rateLimitError);
    }

    // إنشاء التطبيق بعد تهيئة الخدمات الأساسية
    const app = await createApp();

    // الخدمات الإضافية (Queue, Worker)
    try {
      await initializeServices();
    } catch (servicesError) {
      if (process.env.NODE_ENV === 'production') {
        throw servicesError;
      }
      logger.warn('Failed to initialize extra services:', servicesError);
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // تهيئة WebSockets
    initSocket(server);

    // إغلاق آمن
    setupGracefulShutdown(server);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('فشل تشغيل الخادم:', message);
    process.exit(1);
  }
};

// تشغيل السيرفر في غير بيئة الاختبارات
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

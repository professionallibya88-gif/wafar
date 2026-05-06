import logger from '../config/logger';
import { hasRedisConnectionConfig } from '../config/redis';
import { getPDFQueue, getPDFWorker } from '../queues/pdfQueue';

export const initializeServices = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!hasRedisConnectionConfig()) {
    const message = 'لا توجد إعدادات Redis صالحة لخدمات الطوابير';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }

    logger.warn(`${message}، سيتم الاعتماد على المعالجة المحلية لملفات PDF`);
    return;
  }

  try {
    getPDFQueue();
    getPDFWorker();
    logger.info('PDF Processing Queue and Worker initialized');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`فشل تهيئة خدمات الطوابير: ${message}`);
    }

    logger.warn('PDF Queue/Worker initialization failed:', message);
  }
};

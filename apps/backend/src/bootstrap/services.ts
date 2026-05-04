import logger from '../config/logger';
import { hasRedisConnectionConfig } from '../config/redis';
import { getPDFQueue, getPDFWorker } from '../queues/pdfQueue';

export const initializeServices = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!hasRedisConnectionConfig()) {
    logger.warn('لا توجد إعدادات Redis صالحة، سيتم الاعتماد على المعالجة المحلية لملفات PDF');
    return;
  }

  try {
    getPDFQueue();
    getPDFWorker();
    logger.info('PDF Processing Queue and Worker initialized');
  } catch (error: any) {
    logger.warn('PDF Queue/Worker initialization failed:', error.message);
  }
};

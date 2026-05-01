import logger from '../config/logger';
import { getPDFQueue, getPDFWorker } from '../queues/pdfQueue';

export const initializeServices = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    getPDFQueue();
    getPDFWorker();
    logger.info('PDF Processing Queue and Worker initialized');
  } catch (error: any) {
    logger.warn('PDF Queue/Worker initialization failed:', error.message);
  }
};

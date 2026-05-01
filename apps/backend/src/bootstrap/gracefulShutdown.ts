import { Server } from 'http';
import logger from '../config/logger';
import { closePDFQueue } from '../queues/pdfQueue';
import { closeRedisClient } from '../config/redis';
import { sequelize } from '../database';

export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await closePDFQueue();
        logger.info('PDF Queue and Worker closed');

        await closeRedisClient();
        logger.info('Redis client closed');

        await sequelize.close();
        logger.info('Database connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

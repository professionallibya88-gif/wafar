import { getRedisClient } from '../config/redis';
import { getPDFQueue } from '../queues/pdfQueue';
import { adminService } from './AdminService';
import { systemRepository } from '../repositories/SystemRepository';
import { toError } from '../utils/errors';

export interface SystemHealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  stats?: Record<string, unknown>;
}

export interface SystemHealthStatus {
  success: boolean;
  status: 'healthy' | 'degraded';
  timestamp: string;
  service: string;
  checks: {
    database: SystemHealthCheck;
    redis: SystemHealthCheck;
    queue: SystemHealthCheck;
  };
}

export class SystemStatusService {
  async getSystemStats() {
    // Redis stats
    let redisStats: Record<string, unknown> = { status: 'unavailable', keys: 0 };
    try {
      const redis = await getRedisClient();
      await redis.ping();
      const info = await redis.info('stats');
      const dbSize = await redis.dbSize();
      redisStats = {
        status: 'available',
        keys: dbSize,
        totalConnectionsReceived: info.match(/total_connections_received:(\d+)/)?.[1] || 0,
        totalCommandsProcessed: info.match(/total_commands_processed:(\d+)/)?.[1] || 0,
        keyspaceHits: info.match(/keyspace_hits:(\d+)/)?.[1] || 0,
        keyspaceMisses: info.match(/keyspace_misses:(\d+)/)?.[1] || 0,
      };
    } catch (err: unknown) {
      redisStats = { status: 'unavailable', error: toError(err).message };
    }

    // Queue stats
    let queueStats: Record<string, unknown> = { status: 'unavailable' };
    try {
      const queue = await getPDFQueue();
      queueStats = {
        status: 'available',
        waiting: await queue.getWaitingCount(),
        active: await queue.getActiveCount(),
        completed: await queue.getCompletedCount(),
        failed: await queue.getFailedCount(),
        delayed: await queue.getDelayedCount(),
      };
    } catch (err: unknown) {
      queueStats = { status: 'unavailable', error: toError(err).message };
    }

    const database = await adminService.getDatabaseStats();

    const system = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    return {
      redis: redisStats,
      queue: queueStats,
      database,
      system,
      timestamp: new Date().toISOString(),
    };
  }

  async getDetailedHealth(): Promise<SystemHealthStatus> {
    const health: SystemHealthStatus = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'waffer-backend',
      checks: {
        database: { status: 'healthy' },
        redis: { status: 'healthy' },
        queue: { status: 'healthy' },
      },
    };

    // Database check
    try {
      await systemRepository.checkDatabaseConnection();
      health.checks.database = { status: 'healthy', message: 'اتصال قاعدة البيانات سليم' };
    } catch (error: unknown) {
      health.checks.database = { status: 'unhealthy', message: toError(error).message };
      health.status = 'degraded';
      health.success = false;
    }

    // Redis check
    try {
      const redis = await getRedisClient();
      await redis.ping();
      const info = await redis.info('stats');
      health.checks.redis = {
        status: 'healthy',
        message: 'اتصال Redis سليم',
        stats: {
          total_connections_received: info.match(/total_connections_received:(\d+)/)?.[1] || 'N/A',
          total_commands_processed: info.match(/total_commands_processed:(\d+)/)?.[1] || 'N/A',
          keyspace_hits: info.match(/keyspace_hits:(\d+)/)?.[1] || 'N/A',
          keyspace_misses: info.match(/keyspace_misses:(\d+)/)?.[1] || 'N/A',
        },
      };
    } catch (error: unknown) {
      health.checks.redis = { status: 'unhealthy', message: toError(error).message };
      health.status = 'degraded';
      health.success = false;
    }

    // Queue check
    try {
      const queue = await getPDFQueue();
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);
      health.checks.queue = {
        status: 'healthy',
        message: 'BullMQ Queue سليم',
        stats: {
          waiting,
          active,
          completed,
          failed,
          delayed,
          total: waiting + active + completed + failed + delayed,
        },
      };
    } catch (error: unknown) {
      health.checks.queue = { status: 'unhealthy', message: toError(error).message };
      health.status = 'degraded';
      health.success = false;
    }

    return health;
  }
}

export const systemStatusService = new SystemStatusService();

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { systemStatusService } from '../services/SystemStatusService';

/**
 * فحص صحة بسيط
 */
export const ping = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, {
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'waffer-backend',
    },
  });
});

/**
 * فحص صحة شامل
 */
export const detailed = asyncHandler(async (_req: Request, res: Response) => {
  const health = await systemStatusService.getDetailedHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  return success(res, { data: health, statusCode });
});

/**
 * فحص الذاكرة
 */
export const memory = asyncHandler(async (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  return success(res, {
    data: {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      uptime: `${Math.floor(process.uptime())} seconds`,
    },
  });
});

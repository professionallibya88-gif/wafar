import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { getPDFQueue } from '../queues/pdfQueue';
import MonitoringSystem from '../services/MonitoringSystem';
import { getJobOrThrow, removeJobById, retryJobById } from '../services/QueueJobService';
import { NotFoundError } from '../errors';

/**
 * جلب حالة مهمة بـ ID
 */
export const status = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  const job = await getJobOrThrow(jobId);

  const state = await job.getState();
  return success(res, {
    data: {
      id: job.id,
      status: state,
      progress: job.progress || 0,
      createdAt: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    },
  });
});

/**
 * التقدم العام (إحصائيات)
 */
export const progress = asyncHandler(async (_req: Request, res: Response) => {
  const queue = getPDFQueue();
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
  ]);
  return success(res, {
    data: {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    },
  });
});

/**
 * قائمة المهام
 */
export const tasks = asyncHandler(async (req: Request, res: Response) => {
  const queue = getPDFQueue();
  const { status } = req.query;

  let jobs;
  switch (status) {
    case 'waiting':
      jobs = await queue.getWaiting(0, 100);
      break;
    case 'active':
      jobs = await queue.getActive(0, 100);
      break;
    case 'completed':
      jobs = await queue.getCompleted(0, 100);
      break;
    case 'failed':
      jobs = await queue.getFailed(0, 100);
      break;
    default:
      jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed'], 0, 100);
  }

  const tasks = await Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      createdAt: job.timestamp,
    }))
  );

  return success(res, { data: tasks });
});

/**
 * إلغاء مهمة
 */
export const cancelTask = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  await removeJobById(jobId);
  return success(res, { message: 'تم إلغاء المهمة' });
});

/**
 * إعادة معالجة مهمة فاشلة
 */
export const retry = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  await retryJobById(jobId, { failedOnly: true });
  return success(res, { message: 'تم إضافة المهمة لإعادة المعالجة' });
});

/**
 * health check (نظام المراقبة)
 */
export const health = asyncHandler(async (_req: Request, res: Response) => {
  const monitoring = MonitoringSystem.getInstance();
  const health = monitoring.getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  return success(res, { data: health, statusCode });
});

/**
 * metrics
 */
export const metrics = asyncHandler(async (_req: Request, res: Response) => {
  const monitoring = MonitoringSystem.getInstance();
  const stats = monitoring.getStats();
  const alerts = monitoring.getAlerts();
  return success(res, { data: { stats, alerts, timestamp: Date.now() } });
});

/**
 * alerts
 */
export const alerts = asyncHandler(async (req: Request, res: Response) => {
  const monitoring = MonitoringSystem.getInstance();
  const includeAcknowledged = req.query.includeAcknowledged === 'true';
  return success(res, { data: monitoring.getAlerts(includeAcknowledged) });
});

/**
 * تأكيد تنبيه
 */
export const acknowledgeAlert = asyncHandler(async (req: Request, res: Response) => {
  const monitoring = MonitoringSystem.getInstance();
  const alertId = req.params.alertId as string;
  const alert = monitoring.acknowledgeAlert(alertId);
  if (!alert) throw new NotFoundError('التنبيه غير موجود');
  return success(res, { data: alert, message: 'تم تأكيد التنبيه' });
});

/**
 * إحصائيات النظام
 */
export const systemStats = asyncHandler(async (_req: Request, res: Response) => {
  const monitoring = MonitoringSystem.getInstance();
  return success(res, { data: monitoring.getSystemMetrics() });
});

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { getPDFQueue, addPDFProcessingJob } from '../queues/pdfQueue';
import { getJobOrThrow, removeJobById, retryJobById } from '../services/QueueJobService';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const queue = await getPDFQueue();
  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();
  const completed = await queue.getCompletedCount();
  const failed = await queue.getFailedCount();
  const delayed = await queue.getDelayedCount();

  return success(res, {
    data: {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    },
  });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const { state = 'waiting', page = 1, limit = 20 } = req.query;
  const queue = await getPDFQueue();

  let jobs: any[] = [];
  let count = 0;
  const parsedPage = parseInt(page as string, 10);
  const parsedLimit = parseInt(limit as string, 10);
  const start = (parsedPage - 1) * parsedLimit;
  const end = start + parsedLimit - 1;

  switch (state) {
    case 'waiting':
      jobs = await queue.getJobs(['waiting'], start, end);
      count = await queue.getWaitingCount();
      break;
    case 'active':
      jobs = await queue.getJobs(['active'], start, end);
      count = await queue.getActiveCount();
      break;
    case 'completed':
      jobs = await queue.getJobs(['completed'], start, end);
      count = await queue.getCompletedCount();
      break;
    case 'failed':
      jobs = await queue.getJobs(['failed'], start, end);
      count = await queue.getFailedCount();
      break;
    case 'delayed':
      jobs = await queue.getJobs(['delayed'], start, end);
      count = await queue.getDelayedCount();
      break;
    default:
      jobs = await queue.getJobs(['waiting'], start, end);
      count = await queue.getWaitingCount();
  }

  const mappedJobs = await Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      state: await job.getState(),
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    }))
  );

  return success(res, {
    data: {
      jobs: mappedJobs,
      state,
    },
    meta: {
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  });
});

export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await getJobOrThrow(jobId as string);

  const state = await job.getState();
  const progress = job.progress;

  return success(res, {
    data: {
      status: state,
      progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    },
  });
});

export const addJob = asyncHandler(async (req: Request, res: Response) => {
  const { pdfId, filePath, method } = req.body;
  const job = await addPDFProcessingJob(pdfId, filePath, method);

  return success(res, {
    message: 'تم إضافة المهمة بنجاح',
    data: {
      jobId: job.id,
    },
  });
});

export const retryJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  await retryJobById(jobId as string);
  return success(res, { message: 'تم إعادة محاولة المهمة بنجاح' });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  await removeJobById(jobId as string);
  return success(res, { message: 'تم حذف المهمة بنجاح' });
});

export const clearCompleted = asyncHandler(async (req: Request, res: Response) => {
  const queue = await getPDFQueue();
  const count = await queue.getCompletedCount();
  await queue.clean(24 * 3600 * 1000, 0, 'completed');
  return success(res, { message: `تم مسح ${count} مهمة مكتملة` });
});

export const clearFailed = asyncHandler(async (req: Request, res: Response) => {
  const queue = await getPDFQueue();
  const count = await queue.getFailedCount();
  await queue.clean(7 * 24 * 3600 * 1000, 0, 'failed');
  return success(res, { message: `تم مسح ${count} مهمة فاشلة` });
});

export const pauseQueue = asyncHandler(async (req: Request, res: Response) => {
  const queue = await getPDFQueue();
  await queue.pause();
  return success(res, { message: 'تم إيقاف الـ queue مؤقتاً' });
});

export const resumeQueue = asyncHandler(async (req: Request, res: Response) => {
  const queue = await getPDFQueue();
  await queue.resume();
  return success(res, { message: 'تم استئناف الـ queue' });
});

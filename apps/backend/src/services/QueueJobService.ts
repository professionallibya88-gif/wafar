import type { Job } from 'bullmq';
import { NotFoundError, BusinessError } from '../errors';
import { getPDFQueue } from '../queues/pdfQueue';

type QueueJob = Job<Record<string, unknown>, unknown, string>;

const getJobOrThrow = async (jobId: string): Promise<QueueJob> => {
  const queue = getPDFQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new NotFoundError('المهمة غير موجودة');
  }

  return job as QueueJob;
};

const removeJobById = async (jobId: string): Promise<void> => {
  const job = await getJobOrThrow(jobId);
  await job.remove();
};

const retryJobById = async (jobId: string, options?: { failedOnly?: boolean }): Promise<void> => {
  const job = await getJobOrThrow(jobId);

  if (options?.failedOnly) {
    const state = await job.getState();
    if (state !== 'failed') {
      throw new BusinessError('يمكن إعادة المحاولة للمهام الفاشلة فقط');
    }
  }

  await job.retry();
};

export { getJobOrThrow, removeJobById, retryJobById };

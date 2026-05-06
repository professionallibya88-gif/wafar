import { Queue, Worker, Job } from 'bullmq';
import { EventEmitter } from 'events';
import IORedis from 'ioredis';
import { PDFProcessor } from '../services/pdfProcessor';
import logger from '../config/logger';
import { pdfFileRepository } from '../repositories';
import fs from 'fs';
import { BusinessError, NotFoundError, ValidationError } from '../errors';
import { resolveRedisUrl } from '../config/redis';

type LocalJobState = 'waiting' | 'active' | 'completed' | 'failed';

interface LocalJobRecord {
  id: string;
  state: LocalJobState;
  progress: number;
  data: {
    pdfFileId: string;
    filePath: string;
    method: string;
  };
  result?: Record<string, unknown>;
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
}

const localJobs = new Map<string, LocalJobRecord>();
const allowLocalQueueFallback = process.env.NODE_ENV !== 'production';

const createQueueRedisConnection = () => {
  const redisUrl = resolveRedisUrl();

  if (!redisUrl) {
    throw new Error('إعداد Redis غير متوفر لطابور معالجة PDF');
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error('فشل الاتصال بـ Redis بعد 10 محاولات');
        return null;
      }
      return Math.min(times * 50, 2000);
    },
  });
};

const createPDFQueue = () => {
  const connection = createQueueRedisConnection();

  const pdfQueue = new Queue('pdf-processing', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        count: 1000,
        age: 24 * 3600,
      },
      removeOnFail: {
        count: 5000,
        age: 7 * 24 * 3600,
      },
    },
  });

  const typedQueue = pdfQueue as unknown as EventEmitter;

  typedQueue.on('waiting', (job: unknown) => {
    const typedJob = job as Job;
    logger.info(`Job في الانتظار: ${typedJob.id}`);
  });

  typedQueue.on('active', (job: unknown) => {
    const typedJob = job as Job;
    logger.info(`Job بدأ المعالجة: ${typedJob.id}`);
  });

  typedQueue.on('completed', (job: unknown) => {
    const typedJob = job as Job;
    logger.info(`تمت معالجة PDF بنجاح: ${typedJob.id}`);
  });

  typedQueue.on('failed', (job: unknown, err: unknown) => {
    const typedJob = job as Job | undefined;
    const typedErr = err instanceof Error ? err : new Error(String(err));
    logger.error(`فشل معالجة PDF: ${typedJob?.id}`, typedErr.message);
  });

  typedQueue.on('progress', (job: unknown, progress: unknown) => {
    const typedJob = job as Job;
    logger.info(`تقدم معالجة PDF: ${typedJob.id} - ${progress}%`);
  });

  return pdfQueue;
};

const createPDFWorker = () => {
  const connection = createQueueRedisConnection();

  const worker = new Worker(
    'pdf-processing',
    async (job) => {
      const { pdfFileId, method } = job.data;

      try {
        await job.updateProgress(10);

        const pdfFile = await pdfFileRepository.findById(pdfFileId);
        if (!pdfFile) {
          throw new NotFoundError('ملف PDF غير موجود');
        }

        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        if (pdfFile.file_size > MAX_FILE_SIZE) {
          throw new ValidationError(
            `حجم الملف يتجاوز الحد الأقصى ${MAX_FILE_SIZE / 1024 / 1024}MB`
          );
        }

        if (!fs.existsSync(pdfFile.file_path)) {
          throw new NotFoundError('ملف PDF غير موجود على القرص');
        }

        await pdfFileRepository.updateById(pdfFileId, { status: 'processing' });

        await job.updateProgress(30);

        await PDFProcessor.processPDF(pdfFileId, method);

        await job.updateProgress(100);

        return { success: true, pdfFileId };
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('PDF processing error:', err.message);

        await pdfFileRepository.updateById(pdfFileId, {
          status: 'failed',
          error_message: err.message,
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Worker: تمت معالجة Job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Worker: فشل Job ${job?.id}`, err.message);
  });

  worker.on('error', (err) => {
    logger.error('Worker error:', err);
  });

  return worker;
};

let pdfQueueInstance: Queue | null = null;
let pdfWorkerInstance: Worker | null = null;

const runLocalPDFJob = async (jobId: string) => {
  const localJob = localJobs.get(jobId);
  if (!localJob) {
    return;
  }

  localJob.state = 'active';
  localJob.progress = 10;
  localJob.processedOn = Date.now();

  try {
    const { pdfFileId, method } = localJob.data;
    const pdfFile = await pdfFileRepository.findById(pdfFileId);
    if (!pdfFile) {
      throw new NotFoundError('ملف PDF غير موجود');
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (pdfFile.file_size > MAX_FILE_SIZE) {
      throw new ValidationError(`حجم الملف يتجاوز الحد الأقصى ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!fs.existsSync(pdfFile.file_path)) {
      throw new NotFoundError('ملف PDF غير موجود على القرص');
    }

    await pdfFileRepository.updateById(pdfFileId, { status: 'processing' });
    await PDFProcessor.processPDF(pdfFileId, method);

    localJob.state = 'completed';
    localJob.progress = 100;
    localJob.finishedOn = Date.now();
    localJob.result = { success: true, pdfFileId };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Local PDF processing error:', err.message);

    if (localJob.data.pdfFileId) {
      await pdfFileRepository.updateById(localJob.data.pdfFileId, {
        status: 'failed',
        error_message: err.message,
      });
    }

    localJob.state = 'failed';
    localJob.failedReason = err.message;
    localJob.finishedOn = Date.now();
  }
};

const scheduleLocalPDFProcessingJob = (
  pdfFileId: string,
  filePath: string,
  method: string
): LocalJobRecord => {
  const localJob: LocalJobRecord = {
    id: `local-${pdfFileId}-${Date.now()}`,
    state: 'waiting',
    progress: 0,
    data: {
      pdfFileId,
      filePath,
      method,
    },
  };

  localJobs.set(localJob.id, localJob);

  setImmediate(() => {
    void runLocalPDFJob(localJob.id);
  });

  return localJob;
};

export const getPDFQueue = () => {
  if (!pdfQueueInstance) {
    pdfQueueInstance = createPDFQueue();
  }
  return pdfQueueInstance;
};

export const getPDFWorker = () => {
  if (!pdfWorkerInstance) {
    pdfWorkerInstance = createPDFWorker();
  }
  return pdfWorkerInstance;
};

interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  jobId?: string;
}

export const addPDFProcessingJob = async (
  pdfFileId: string,
  filePath: string,
  method: string,
  options: JobOptions = {}
) => {
  try {
    const queue = getPDFQueue();

    const job = await queue.add(
      'process-pdf',
      {
        pdfFileId,
        filePath,
        method,
      },
      {
        priority: options.priority ?? 5,
        delay: options.delay ?? 0,
        attempts: options.attempts ?? 3,
        jobId: options.jobId || undefined,
      }
    );

    return job;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (!allowLocalQueueFallback) {
      logger.error('تعذر إضافة مهمة PDF إلى Redis في بيئة الإنتاج:', message);
      throw new BusinessError('تعذر إضافة مهمة المعالجة لأن Redis غير متاح');
    }

    logger.warn('تعذر إضافة مهمة PDF إلى Redis، سيتم استخدام المعالجة المحلية:', message);
    return scheduleLocalPDFProcessingJob(pdfFileId, filePath, method);
  }
};

export const getJobStatus = async (jobId: string) => {
  if (localJobs.has(jobId)) {
    const localJob = localJobs.get(jobId) as LocalJobRecord;
    return {
      status: localJob.state,
      progress: localJob.progress,
      data: localJob.data,
      result: localJob.result,
      failedReason: localJob.failedReason,
      processedOn: localJob.processedOn,
      finishedOn: localJob.finishedOn,
    };
  }

  const queue = getPDFQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    status: state,
    progress,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
};

export const closePDFQueue = async () => {
  if (pdfWorkerInstance) {
    await pdfWorkerInstance.close();
    pdfWorkerInstance = null;
  }
  if (pdfQueueInstance) {
    await pdfQueueInstance.close();
    pdfQueueInstance = null;
  }
};

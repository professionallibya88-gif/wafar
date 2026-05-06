import { Router } from 'express';
import {
  getStats,
  getJobs,
  getJobStatus,
  addJob,
  retryJob,
  deleteJob,
  clearCompleted,
  clearFailed,
  pauseQueue,
  resumeQueue,
} from '../../controllers/queueController';
import { runValidators } from '../../utils/validate';
import { queue as queueRules } from '../../validators';

const router = Router();

router.get('/stats', getStats);
router.get('/jobs', runValidators(queueRules.getJobsRules), getJobs);
router.get('/jobs/:jobId', runValidators(queueRules.queueJobIdRules), getJobStatus);
router.post('/jobs/add', runValidators(queueRules.addJobRules), addJob);
router.post('/jobs/:jobId/retry', runValidators(queueRules.queueJobIdRules), retryJob);
router.delete('/jobs/:jobId', runValidators(queueRules.queueJobIdRules), deleteJob);
router.delete('/completed', clearCompleted);
router.delete('/failed', clearFailed);
router.post('/pause', pauseQueue);
router.post('/resume', resumeQueue);

export default router;

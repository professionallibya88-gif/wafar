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

const router = Router();

router.get('/stats', getStats);
router.get('/jobs', getJobs);
router.get('/jobs/:jobId', getJobStatus);
router.post('/jobs/add', addJob);
router.post('/jobs/:jobId/retry', retryJob);
router.delete('/jobs/:jobId', deleteJob);
router.delete('/completed', clearCompleted);
router.delete('/failed', clearFailed);
router.post('/pause', pauseQueue);
router.post('/resume', resumeQueue);

export default router;

import { Router } from 'express';
import { adminAuth, adminOnly } from '../middleware/auth';
import * as processingController from '../controllers/processingController';

const router = Router();

// مسار عام مختصر للفحص الصحي فقط
router.get('/health', processingController.health);

// بقية مسارات المراقبة والإدارة للمشرف فقط
router.use(adminAuth, adminOnly);
router.get('/status/:jobId', processingController.status);
router.get('/progress', processingController.progress);
router.get('/tasks', processingController.tasks);
router.delete('/tasks/:jobId', processingController.cancelTask);
router.post('/retry/:jobId', processingController.retry);
router.get('/metrics', processingController.metrics);
router.get('/system-stats', processingController.systemStats);
router.get('/alerts', processingController.alerts);
router.post('/alerts/:alertId/acknowledge', processingController.acknowledgeAlert);

export default router;

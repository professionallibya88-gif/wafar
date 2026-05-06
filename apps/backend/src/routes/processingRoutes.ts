import { Router } from 'express';
import { adminAuth, adminOnly } from '../middleware/auth';
import * as processingController from '../controllers/processingController';
import { runValidators } from '../utils/validate';
import { processing as processingRules } from '../validators';

const router = Router();

// مسار عام مختصر للفحص الصحي فقط
router.get('/health', processingController.health);

// بقية مسارات المراقبة والإدارة للمشرف فقط
router.use(adminAuth, adminOnly);
router.get(
  '/status/:jobId',
  runValidators(processingRules.processingJobIdRules),
  processingController.status
);
router.get('/progress', processingController.progress);
router.get(
  '/tasks',
  runValidators(processingRules.processingTaskFiltersRules),
  processingController.tasks
);
router.delete(
  '/tasks/:jobId',
  runValidators(processingRules.processingJobIdRules),
  processingController.cancelTask
);
router.post(
  '/retry/:jobId',
  runValidators(processingRules.processingJobIdRules),
  processingController.retry
);
router.get('/metrics', processingController.metrics);
router.get('/system-stats', processingController.systemStats);
router.get('/alerts', runValidators(processingRules.alertsQueryRules), processingController.alerts);
router.post(
  '/alerts/:alertId/acknowledge',
  runValidators(processingRules.alertIdRules),
  processingController.acknowledgeAlert
);

export default router;

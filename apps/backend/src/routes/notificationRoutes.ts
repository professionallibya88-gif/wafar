import { Router } from 'express';
import { auth, adminAuth, adminOnly } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';
import * as notificationController from '../controllers/notificationController';
import { notification as notificationRules } from '../validators';
import { runValidators } from '../utils/validate';

const router = Router();

// ترتيب المسارات: المسارات الثابتة قبل المسارات ذات المعاملات
router.get(
  '/',
  auth,
  requireFeature('notifications'),
  runValidators(notificationRules.listRules),
  notificationController.list
);
router.get(
  '/unread-count',
  auth,
  requireFeature('notifications'),
  notificationController.unreadCount
);
router.put(
  '/read-all',
  auth,
  requireFeature('notifications'),
  notificationController.markAllAsRead
);
router.delete('/read', auth, requireFeature('notifications'), notificationController.deleteRead);

// مسارات إدارية
router.post(
  '/',
  adminAuth,
  adminOnly,
  runValidators(notificationRules.createRules),
  notificationController.create
);
router.post(
  '/broadcast',
  adminAuth,
  adminOnly,
  runValidators(notificationRules.broadcastRules),
  notificationController.broadcast
);
router.post(
  '/batch',
  adminAuth,
  adminOnly,
  runValidators(notificationRules.batchRules),
  notificationController.batch
);

// مسارات المعاملات في النهاية
router.get('/:id', auth, notificationController.getById);
router.put('/:id/read', auth, notificationController.markAsRead);
router.delete('/:id', auth, notificationController.deleteById);

export default router;

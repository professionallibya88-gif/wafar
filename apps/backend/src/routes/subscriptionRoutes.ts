import { Router } from 'express';
import { auth } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';
import * as subscriptionController from '../controllers/subscriptionController';

const router = Router();

router.get('/plans', auth, requireFeature('subscriptions'), subscriptionController.listPlans);
router.get(
  '/my-subscription',
  auth,
  requireFeature('subscriptions'),
  subscriptionController.getMyActiveSubscription
);
router.get(
  '/my-subscriptions',
  auth,
  requireFeature('subscriptions'),
  subscriptionController.listMySubscriptions
);

export default router;

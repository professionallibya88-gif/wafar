import { Router } from 'express';
import { auth } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';
import * as paymentController from '../controllers/paymentController';
import { payment as paymentRules } from '../validators';
import { runValidators } from '../utils/validate';

const router = Router();

router.post(
  '/create',
  auth,
  requireFeature('payments'),
  runValidators(paymentRules.createPaymentRules),
  paymentController.createPayment
);
router.post(
  '/recharge-card',
  auth,
  requireFeature('payments'),
  runValidators(paymentRules.rechargeCardRules),
  paymentController.rechargeCard
);
router.get('/my-payments', auth, requireFeature('payments'), paymentController.listMyPayments);

export default router;

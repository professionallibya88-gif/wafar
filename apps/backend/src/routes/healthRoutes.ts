import { Router } from 'express';
import { adminAuth, adminOnly } from '../middleware/auth';
import * as healthController from '../controllers/healthController';

const router = Router();

router.get('/', healthController.ping);
router.get('/detailed', adminAuth, adminOnly, healthController.detailed);
router.get('/memory', adminAuth, adminOnly, healthController.memory);

export default router;

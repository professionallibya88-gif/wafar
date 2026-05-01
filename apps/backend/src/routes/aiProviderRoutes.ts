import { Router } from 'express';
import { adminAuth, adminOnly } from '../middleware/auth';
import {
  listProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  testProvider,
  getStats,
  getProviderLogs,
  seedDefaults,
} from '../controllers/aiProviderController';

const router = Router();

router.use(adminAuth, adminOnly);

router.get('/', listProviders);
router.post('/seed-defaults', seedDefaults);
router.get('/stats', getStats);
router.post('/', createProvider);
router.get('/:id', getProvider);
router.put('/:id', updateProvider);
router.delete('/:id', deleteProvider);
router.post('/:id/test', testProvider);
router.get('/:id/logs', getProviderLogs);

export default router;

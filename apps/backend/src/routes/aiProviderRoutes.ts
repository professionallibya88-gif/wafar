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
import { runValidators } from '../utils/validate';
import {
  aiProviderIdRules,
  aiProviderLogsRules,
  createAIProviderRules,
  updateAIProviderRules,
} from '../validators/aiProviderValidator';

const router = Router();

router.use(adminAuth, adminOnly);

router.get('/', listProviders);
router.post('/seed-defaults', seedDefaults);
router.get('/stats', getStats);
router.post('/', runValidators(createAIProviderRules), createProvider);
router.get('/:id', runValidators(aiProviderIdRules), getProvider);
router.put('/:id', runValidators(updateAIProviderRules), updateProvider);
router.delete('/:id', runValidators(aiProviderIdRules), deleteProvider);
router.post('/:id/test', runValidators(aiProviderIdRules), testProvider);
router.get('/:id/logs', runValidators(aiProviderLogsRules), getProviderLogs);

export default router;

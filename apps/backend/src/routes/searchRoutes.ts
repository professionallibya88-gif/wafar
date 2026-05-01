import { Router } from 'express';
import {
  smart,
  derived,
  legacy,
  compare,
  history,
  categories,
  brands,
  exportExcel,
} from '../controllers/searchController';
import { auth } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';
import { search as searchRules } from '../validators';
import { runValidators } from '../utils/validate';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

router.get(
  '/smart',
  auth,
  requireFeature('search'),
  cacheMiddleware(300),
  runValidators(searchRules.smartSearchRules),
  smart
);
router.get('/derived', auth, requireFeature('search'), cacheMiddleware(600), derived);
router.get(
  '/compare',
  auth,
  requireFeature('compare'),
  runValidators(searchRules.compareRules),
  compare
);
router.get('/history', auth, requireFeature('history'), history);
router.get('/categories', auth, requireFeature('search'), cacheMiddleware(600), categories);
router.get('/brands', auth, requireFeature('search'), cacheMiddleware(600), brands);
router.get('/export', auth, requireFeature('search'), exportExcel);
router.get('/', auth, requireFeature('search'), cacheMiddleware(), legacy);

export default router;

import { Router } from 'express';
import {
  clearAllCache,
  clearUserCacheController,
  clearApiCacheController,
  clearSearchCache,
  clearMetadataCache,
} from '../../controllers/cacheController';

const router = Router();

router.delete('/all', clearAllCache);
router.delete('/user/:userId', clearUserCacheController);
router.delete('/api/:path', clearApiCacheController);
router.delete('/search', clearSearchCache);
router.delete('/metadata', clearMetadataCache);

export default router;

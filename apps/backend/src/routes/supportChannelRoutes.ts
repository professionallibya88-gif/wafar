import { Router } from 'express';
import {
  getAllChannels,
  getActiveChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  toggleActive,
} from '../controllers/SupportChannelController';
import { adminAuth, adminOnly } from '../middleware/auth';
import { runValidators } from '../utils/validate';
import {
  createChannelRules,
  updateChannelRules,
  channelIdRule,
} from '../validators/supportChannelValidator';

const router = Router();

// Public routes
router.get('/public', getActiveChannels);

// Admin routes
router.use(adminAuth, adminOnly);

router.get('/', getAllChannels);
router.post('/', runValidators(createChannelRules), createChannel);
router.put('/:id', runValidators(updateChannelRules), updateChannel);
router.delete('/:id', runValidators(channelIdRule), deleteChannel);
router.patch('/:id/toggle-active', runValidators(channelIdRule), toggleActive);

export default router;

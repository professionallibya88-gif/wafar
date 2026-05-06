import { Router } from 'express';
import {
  getAllSettings,
  getPublicSettings,
  updateAllSettings,
  createSetting,
  resetToDefaults,
  updateSetting,
  testEmailSettings,
  uploadSettingImage,
} from '../controllers/settingsController';
import { adminAuth, adminOnly } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { runValidators } from '../utils/validate';
import {
  createSettingRules,
  updateAllSettingsRules,
  updateSettingRules,
} from '../validators/settingsValidator';

const router = Router();

router.get('/', adminAuth, adminOnly, getAllSettings);
router.get('/public', getPublicSettings);
router.put('/', adminAuth, adminOnly, runValidators(updateAllSettingsRules), updateAllSettings);
router.post('/', adminAuth, adminOnly, runValidators(createSettingRules), createSetting);
router.post('/reset-defaults', adminAuth, adminOnly, resetToDefaults);
router.post('/test-email', adminAuth, adminOnly, testEmailSettings);
router.put('/:key', adminAuth, adminOnly, runValidators(updateSettingRules), updateSetting);

// مسار رفع الصور للإعدادات (شعار، أيقونة، الخ)
router.post('/upload-image', adminAuth, adminOnly, uploadImage.single('image'), uploadSettingImage);

export default router;

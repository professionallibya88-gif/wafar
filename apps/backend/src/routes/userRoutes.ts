import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from '../controllers/userController';
import { auth } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { user as userRules, auth as authRules } from '../validators';
import { runValidators } from '../utils/validate';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, runValidators(userRules.updateProfileRules), updateProfile);
router.post('/profile/avatar', auth, uploadImage.single('avatar'), uploadAvatar);
router.put('/change-password', auth, runValidators(authRules.changePasswordRules), changePassword);

export default router;

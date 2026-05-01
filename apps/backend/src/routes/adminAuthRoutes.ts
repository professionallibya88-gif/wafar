import { Router } from 'express';
import {
  adminLogin,
  adminLogout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/adminAuthController';
import { adminAuth } from '../middleware/auth';
import { admin } from '../validators';
import { runValidators } from '../utils/validate';

const router = Router();

router.post('/login', runValidators(admin.adminLoginRules), adminLogin);
router.post('/logout', adminAuth, adminLogout);

router.get('/me', adminAuth, getMe);
router.put('/profile', adminAuth, runValidators(admin.updateAdminProfileRules), updateProfile);
router.put(
  '/change-password',
  adminAuth,
  runValidators(admin.changeAdminPasswordRules),
  changePassword
);

export default router;

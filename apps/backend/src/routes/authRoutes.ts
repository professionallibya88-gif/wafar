import { Router } from 'express';
import {
  register,
  login,
  logout,
  requestPasswordResetOtp as forgotPasswordRequest,
  verifyPasswordResetOtp as forgotPasswordVerify,
  completePasswordReset as forgotPasswordReset,
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { auth as authRules } from '../validators';
import { runValidators } from '../utils/validate';

const router = Router();

router.post('/register', runValidators(authRules.registerRules), register);
router.post('/login', runValidators(authRules.loginRules), login);
router.post('/logout', auth, logout);
router.post(
  '/forgot-password/request',
  runValidators(authRules.requestPasswordResetRules),
  forgotPasswordRequest
);
router.post(
  '/forgot-password/verify',
  runValidators(authRules.verifyPasswordResetOtpRules),
  forgotPasswordVerify
);
router.post(
  '/forgot-password/reset',
  runValidators(authRules.completePasswordResetRules),
  forgotPasswordReset
);

export default router;

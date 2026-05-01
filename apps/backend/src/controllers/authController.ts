import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/ApiResponse';
import { authService } from '../services/AuthService';
import { passwordResetService } from '../services/PasswordResetService';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { full_name, phone, password } = req.body;
  const data = await authService.register({ full_name, phone, password });
  return created(res, { data, message: 'تم إنشاء الحساب بنجاح' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const data = await authService.login({ phone, password });
  return success(res, { data, message: 'تم تسجيل الدخول بنجاح' });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, { message: 'تم تسجيل الخروج بنجاح' });
});

export const requestPasswordResetOtp = asyncHandler(async (req: Request, res: Response) => {
  const payload = await passwordResetService.requestOtp(req.body.phone);
  return success(res, payload);
});

export const verifyPasswordResetOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = await passwordResetService.verifyOtp(req.body.phone, req.body.otp);
  return success(res, { data, message: 'تم التحقق من الرمز بنجاح' });
});

export const completePasswordReset = asyncHandler(async (req: Request, res: Response) => {
  await passwordResetService.resetPassword(
    req.body.phone,
    req.body.reset_token,
    req.body.new_password
  );
  return success(res, { message: 'تم تغيير كلمة المرور بنجاح' });
});

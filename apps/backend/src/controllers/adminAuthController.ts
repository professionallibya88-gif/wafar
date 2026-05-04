import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { adminAuthService } from '../services/AdminAuthService';
import { NotFoundError } from '../errors';
import { AuthenticatedRequest } from '../types';

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await adminAuthService.login({ email, password });
  return success(res, { data, message: 'تم تسجيل دخول المدير بنجاح' });
});

export const adminLogout = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, { message: 'تم تسجيل خروج المدير بنجاح' });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const admin = req.admin;
  return success(res, { data: adminAuthService.sanitizeAdmin(admin) });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.admin?.id;
  if (!adminId) {
    throw new NotFoundError('المدير غير موجود');
  }

  const updatedAdmin = await adminAuthService.updateProfile(adminId, req.body);

  return success(res, {
    data: updatedAdmin,
    message: 'تم تحديث الملف الشخصي بنجاح',
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as AuthenticatedRequest).admin?.id;
  if (!adminId) {
    throw new NotFoundError('المدير غير موجود');
  }
  await adminAuthService.changePassword(adminId, req.body);
  return success(res, { message: 'تم تغيير كلمة المرور بنجاح' });
});

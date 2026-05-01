import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { adminAuthService } from '../services/AdminAuthService';
import { adminRepository } from '../repositories';

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await adminAuthService.login({ email, password });
  return success(res, { data, message: 'تم تسجيل دخول المدير بنجاح' });
});

export const adminLogout = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, { message: 'تم تسجيل خروج المدير بنجاح' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const admin = (req as any).admin;
  return success(res, { data: adminAuthService.sanitizeAdmin(admin) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).admin.id;
  const { full_name, email } = req.body;

  const updatedAdmin = await adminRepository.updateById(adminId, { full_name, email });
  return success(res, {
    data: adminAuthService.sanitizeAdmin(updatedAdmin),
    message: 'تم تحديث الملف الشخصي بنجاح',
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).admin.id;
  await adminAuthService.changePassword(adminId, req.body);
  return success(res, { message: 'تم تغيير كلمة المرور بنجاح' });
});

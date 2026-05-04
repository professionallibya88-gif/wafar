import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { adminAuthService } from '../services/AdminAuthService';
import { adminRepository } from '../repositories';
import { BusinessError, NotFoundError } from '../errors';

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

  if (email !== undefined) {
    throw new BusinessError('لا يمكن تعديل بريد حساب الإدارة الوحيد');
  }

  const admin = await adminRepository.findById(adminId);
  if (!admin) {
    throw new NotFoundError('المدير غير موجود');
  }

  const updatedAdmin =
    full_name !== undefined ? await adminRepository.updateById(adminId, { full_name }) : admin;
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

import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { userService } from '../services/UserService';
import { authService } from '../services/AuthService';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError, ValidationError } from '../errors';

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) throw new ForbiddenError('هذه الصفحة متاحة للمستخدمين فقط');
  const user = await userService.getProfile(userId);
  return success(res, { data: user });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) throw new ForbiddenError('هذه الصفحة متاحة للمستخدمين فقط');
  const data = await userService.updateProfile(userId, { full_name: req.body.full_name });
  return success(res, { data, message: 'تم تحديث البيانات بنجاح' });
});

export const uploadAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) throw new ForbiddenError('هذه الصفحة متاحة للمستخدمين فقط');
  if (!req.file) {
    throw new ValidationError('لم يتم رفع أي صورة');
  }
  const avatarUrl = `/uploads/${req.file.filename}`;
  const data = await userService.updateAvatar(userId, avatarUrl);
  return success(res, { data, message: 'تم تحديث الصورة الشخصية بنجاح' });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) throw new ForbiddenError('هذه الصفحة متاحة للمستخدمين فقط');
  await authService.changePassword(userId, {
    current_password: req.body.current_password,
    new_password: req.body.new_password,
  });
  return success(res, { message: 'تم تغيير كلمة المرور بنجاح' });
});

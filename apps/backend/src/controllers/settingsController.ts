import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/ApiResponse';
import { settingsService } from '../services/SettingsService';

export const getAllSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.getAllSettings();
  return success(res, { data });
});

export const getPublicSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.getPublicSettings();
  return success(res, { data });
});

export const updateSetting = asyncHandler(async (req: Request, res: Response) => {
  const { value } = req.body;
  const data = await settingsService.updateSetting(req.params.key as string, value);
  return success(res, { data, message: 'تم تحديث الإعداد بنجاح' });
});

export const updateAllSettings = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.updateAllSettings(req.body);
  return success(res, { message: 'تم تحديث جميع الإعدادات بنجاح' });
});

export const createSetting = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.createSetting(req.body);
  return created(res, { data, message: 'تم إنشاء الإعداد بنجاح' });
});

export const resetToDefaults = asyncHandler(async (req: Request, res: Response) => {
  await settingsService.resetToDefaults();
  return success(res, { message: 'تم إعادة تعيين الإعدادات بنجاح' });
});

export const testEmailSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.testEmailConfiguration();

  const message = data.smtpEnabled
    ? 'تم فحص إعدادات البريد بنجاح'
    : 'SMTP غير مفعّل حالياً، يرجى التفعيل قبل الإرسال';

  return success(res, { data, message });
});

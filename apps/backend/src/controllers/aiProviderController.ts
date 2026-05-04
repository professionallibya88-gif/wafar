import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/ApiResponse';
import { aiProviderService } from '../services/AIProviderService';

/**
 * قائمة مزودي الذكاء الاصطناعي
 */
export const listProviders = asyncHandler(async (_req: Request, res: Response) => {
  const providers = await aiProviderService.getAllProviders();
  return success(res, {
    data: providers,
    meta: { total: providers.length },
  });
});

/**
 * تفاصيل مزود واحد
 */
export const getProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await aiProviderService.getProviderById(req.params.id as string);
  return success(res, { data: provider });
});

/**
 * إنشاء مزود جديد
 */
export const createProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await aiProviderService.createProvider(req.body);
  return created(res, { data: provider, message: 'تم إنشاء المزود بنجاح' });
});

/**
 * تحديث مزود
 */
export const updateProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await aiProviderService.updateProvider(req.params.id as string, req.body);
  return success(res, { data: provider, message: 'تم تحديث المزود بنجاح' });
});

/**
 * حذف مزود
 */
export const deleteProvider = asyncHandler(async (req: Request, res: Response) => {
  await aiProviderService.deleteProvider(req.params.id as string);
  return success(res, { message: 'تم حذف المزود بنجاح' });
});

/**
 * اختبار اتصال مزود
 */
export const testProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await aiProviderService.testProvider(id);
  return success(res, {
    data: result,
    message: result.success ? 'الاتصال ناجح' : 'فشل الاتصال',
  });
});

/**
 * إحصائيات المزودين واستخداماتهم
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await aiProviderService.getDashboardStats();
  return success(res, { data: stats });
});

/**
 * سجلات معالجة مزود محدد
 */
export const getProviderLogs = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await aiProviderService.getProviderLogs(id, limit, offset);
  return success(res, { data: result.rows, meta: { total: result.count, limit, offset } });
});

/**
 * إضافة مزود افتراضي (seed)
 */
export const seedDefaults = asyncHandler(async (_req: Request, res: Response) => {
  const createdCount = await aiProviderService.seedDefaults();
  return success(res, {
    message: `تم إنشاء ${createdCount} مزود افتراضي`,
    data: { created: createdCount },
  });
});

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { clearCache, clearApiCache, clearUserCache } from '../middleware/cache';

export const clearAllCache = asyncHandler(async (_req: Request, res: Response) => {
  await clearCache('*');
  return success(res, { message: 'تم مسح جميع الـ cache بنجاح' });
});

export const clearUserCacheController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  await clearUserCache(userId);
  return success(res, { message: `تم مسح cache للمستخدم ${userId} بنجاح` });
});

export const clearApiCacheController = asyncHandler(async (req: Request, res: Response) => {
  const path = req.params.path as string;
  await clearApiCache(path);
  return success(res, { message: `تم مسح cache للـ API ${path} بنجاح` });
});

export const clearSearchCache = asyncHandler(async (_req: Request, res: Response) => {
  await clearApiCache('/api/search');
  return success(res, { message: 'تم مسح cache البحث بنجاح' });
});

export const clearMetadataCache = asyncHandler(async (_req: Request, res: Response) => {
  await clearApiCache('/api/search/categories');
  await clearApiCache('/api/search/brands');
  return success(res, { message: 'تم مسح cache الفئات والماركات بنجاح' });
});

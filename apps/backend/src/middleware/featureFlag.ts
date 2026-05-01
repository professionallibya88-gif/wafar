import { Request, Response, NextFunction } from 'express';
import { systemSettingRepository } from '../repositories/SystemSettingRepository';
import { ForbiddenError } from '../errors';
import logger from '../config/logger';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';

/**
 * Middleware للتحقق من حالة Feature Flag قبل السماح بالوصول للـ endpoint.
 * يقوم بجلب القيمة من قاعدة البيانات ويعيد خطأ 403 إذا كانت الميزة معطلة.
 *
 * Usage:
 *   router.get('/search', requireFeature('search'), searchController.search);
 *   router.post('/upload', requireFeature('upload'), uploadController.upload);
 */
export const requireFeature = (featureKey: string) => {
  const fullKey = featureKey.startsWith('feature_') ? featureKey : `feature_${featureKey}`;
  const defaultValue =
    DEFAULT_SYSTEM_SETTINGS.feature_flags[
      fullKey as keyof typeof DEFAULT_SYSTEM_SETTINGS.feature_flags
    ] || 'true';
  const defaultEnabled = defaultValue === 'true' || defaultValue === '1';

  return async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      const setting = await systemSettingRepository.findByKey(fullKey);
      const val = setting?.value;
      const enabled =
        val === undefined || val === null || val === ''
          ? defaultEnabled
          : val === 'true' || val === '1';

      if (!enabled) {
        return next(new ForbiddenError('الميزة غير متاحة حالياً، يرجى المحاولة لاحقاً'));
      }
      next();
    } catch (error) {
      logger.warn(`تعذر قراءة إعداد الميزة ${fullKey}، سيتم استخدام القيمة الافتراضية`);

      if (defaultEnabled) {
        return next();
      }

      next(error);
    }
  };
};

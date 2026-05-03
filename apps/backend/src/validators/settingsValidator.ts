import { body, param } from 'express-validator';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';

type SettingsCategory = keyof typeof DEFAULT_SYSTEM_SETTINGS;

const allowedCategories = Object.keys(DEFAULT_SYSTEM_SETTINGS);
const allowedKeys = new Set(
  Object.values(DEFAULT_SYSTEM_SETTINGS).flatMap((categorySettings) =>
    Object.keys(categorySettings)
  )
);

const isPrimitiveSettingValue = (value: unknown) =>
  ['string', 'number', 'boolean'].includes(typeof value) || value === null;

export const createSettingRules = [
  body('key')
    .notEmpty()
    .withMessage('مفتاح الإعداد مطلوب')
    .isString()
    .withMessage('مفتاح الإعداد يجب أن يكون نصاً')
    .custom((value) => allowedKeys.has(value))
    .withMessage('مفتاح الإعداد غير معتمد'),
  body('value')
    .custom(isPrimitiveSettingValue)
    .withMessage('قيمة الإعداد يجب أن تكون نصاً أو رقماً أو قيمة منطقية'),
  body('category')
    .notEmpty()
    .withMessage('تصنيف الإعداد مطلوب')
    .isIn(allowedCategories)
    .withMessage('تصنيف الإعداد غير معتمد'),
  body('description')
    .optional()
    .isString()
    .withMessage('وصف الإعداد يجب أن يكون نصاً')
    .isLength({ max: 255 })
    .withMessage('وصف الإعداد لا يجب أن يتجاوز 255 حرفاً'),
];

export const updateSettingRules = [
  param('key')
    .notEmpty()
    .withMessage('مفتاح الإعداد مطلوب')
    .custom((value) => allowedKeys.has(value))
    .withMessage('مفتاح الإعداد غير معتمد'),
  body('value')
    .custom(isPrimitiveSettingValue)
    .withMessage('قيمة الإعداد يجب أن تكون نصاً أو رقماً أو قيمة منطقية'),
];

export const updateAllSettingsRules = [
  body().isObject().withMessage('بيانات الإعدادات يجب أن تكون كائناً'),
  body().custom((value) => {
    const categories = Object.keys(value || {});

    for (const category of categories) {
      if (!allowedCategories.includes(category)) {
        throw new Error(`تصنيف الإعداد غير معتمد: ${category}`);
      }

      const normalizedCategory = category as SettingsCategory;
      const categoryValue = value[category];
      if (
        categoryValue === null ||
        typeof categoryValue !== 'object' ||
        Array.isArray(categoryValue)
      ) {
        throw new Error(`بيانات التصنيف ${category} يجب أن تكون كائناً`);
      }

      const allowedCategoryKeys = new Set(Object.keys(DEFAULT_SYSTEM_SETTINGS[normalizedCategory]));
      for (const [key, settingValue] of Object.entries(categoryValue)) {
        if (!allowedCategoryKeys.has(key)) {
          throw new Error(`المفتاح ${key} غير معتمد داخل التصنيف ${category}`);
        }

        if (!isPrimitiveSettingValue(settingValue)) {
          throw new Error(`قيمة المفتاح ${key} داخل التصنيف ${category} غير صالحة`);
        }
      }
    }

    return true;
  }),
];

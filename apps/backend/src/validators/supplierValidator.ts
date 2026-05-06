import { body, param, query } from 'express-validator';

/**
 * قواعد التحقق للموردين
 */
export const createSupplierRules = [
  body('name').trim().notEmpty().withMessage('اسم الشركة مطلوب'),
  body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صالح'),
];

export const updateSupplierRules = [
  body('name').optional().trim().notEmpty().withMessage('اسم الشركة لا يمكن أن يكون فارغاً'),
  body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون قيمة منطقية'),
];

export const supplierIdRules = [param('id').isUUID().withMessage('معرف المورد غير صالح')];

export const listSuppliersRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صالح'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('عدد العناصر في الصفحة غير صالح'),
  query('category')
    .optional()
    .isString()
    .withMessage('تصنيف المورد يجب أن يكون نصاً')
    .isLength({ max: 100 })
    .withMessage('تصنيف المورد طويل جداً'),
];

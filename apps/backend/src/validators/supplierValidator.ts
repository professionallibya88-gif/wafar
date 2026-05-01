import { body } from 'express-validator';

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

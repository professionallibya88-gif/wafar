import { body } from 'express-validator';

/**
 * قواعد التحقق لبيانات المستخدم
 */
export const updateProfileRules = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('الاسم يجب أن يكون بين 3 و 200 حرف'),
];

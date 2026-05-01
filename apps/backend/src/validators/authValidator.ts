import { body } from 'express-validator';

/**
 * قواعد التحقق من بيانات المصادقة
 */
const normalizePhoneInput = (value: string) => {
  if (typeof value !== 'string') return value;

  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/\s+/g, '');
};

export const registerRules = [
  body('full_name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('الاسم يجب أن يكون بين 3 و 200 حرف'),
  body('phone')
    .customSanitizer(normalizePhoneInput)
    .matches(/^09[0-9]{8}$/)
    .withMessage('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('confirm_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('كلمتا المرور غير متطابقتين'),
];

export const loginRules = [
  body('phone')
    .customSanitizer(normalizePhoneInput)
    .matches(/^09[0-9]{8}$/)
    .withMessage('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
];

export const requestPasswordResetRules = [
  body('phone')
    .customSanitizer(normalizePhoneInput)
    .matches(/^09[0-9]{8}$/)
    .withMessage('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'),
];

export const verifyPasswordResetOtpRules = [
  body('phone')
    .customSanitizer(normalizePhoneInput)
    .matches(/^09[0-9]{8}$/)
    .withMessage('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'),
  body('otp')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('رمز التحقق يجب أن يتكون من 6 أرقام'),
];

export const completePasswordResetRules = [
  body('phone')
    .customSanitizer(normalizePhoneInput)
    .matches(/^09[0-9]{8}$/)
    .withMessage('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'),
  body('reset_token').trim().notEmpty().withMessage('رمز الاستعادة مطلوب'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  body('confirm_password')
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage('كلمتا المرور غير متطابقتين'),
];

export const changePasswordRules = [
  body('current_password').notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
];

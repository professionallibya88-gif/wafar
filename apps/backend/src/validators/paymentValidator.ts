import { body } from 'express-validator';

/**
 * قواعد التحقق للمدفوعات
 */
export const createPaymentRules = [
  body('plan_id').notEmpty().withMessage('الباقة مطلوبة'),
  body('payment_method').notEmpty().withMessage('طريقة الدفع مطلوبة'),
];

export const rechargeCardRules = [
  body('card_number').trim().notEmpty().withMessage('رقم الكرت مطلوب'),
  body('card_type').isIn(['madar', 'libyana']).withMessage('نوع الكرت غير صالح'),
];

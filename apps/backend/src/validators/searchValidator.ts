import { query } from 'express-validator';

/**
 * قواعد التحقق للبحث
 */
export const smartSearchRules = [query('q').trim().notEmpty().withMessage('نص البحث مطلوب')];

export const compareRules = [
  query('ids').trim().notEmpty().withMessage('يرجى تحديد القطع للمقارنة'),
];

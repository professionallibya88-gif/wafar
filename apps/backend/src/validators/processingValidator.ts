import { param, query } from 'express-validator';

export const processingJobIdRules = [
  param('jobId').trim().notEmpty().withMessage('معرف المهمة مطلوب'),
];

export const processingTaskFiltersRules = [
  query('status')
    .optional()
    .isIn(['waiting', 'active', 'completed', 'failed'])
    .withMessage('حالة المهمة غير صالحة'),
];

export const alertIdRules = [param('alertId').trim().notEmpty().withMessage('معرف التنبيه مطلوب')];

export const alertsQueryRules = [
  query('includeAcknowledged')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('قيمة includeAcknowledged غير صالحة'),
];

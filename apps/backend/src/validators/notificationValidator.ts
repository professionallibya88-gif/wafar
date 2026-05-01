import { body, query } from 'express-validator';

const NOTIFICATION_TYPES = [
  'info',
  'success',
  'warning',
  'error',
  'order',
  'payment',
  'subscription',
  'system',
  'message',
];

const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];

/**
 * قواعد التحقق للإشعارات
 */
export const listRules = [
  query('is_read').optional().isBoolean().withMessage('قيمة غير صالحة'),
  query('type').optional().isIn(NOTIFICATION_TYPES).withMessage('نوع الإشعار غير صالح'),
  query('priority').optional().isIn(PRIORITY_LEVELS).withMessage('الأولوية غير صالحة'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('الحد الأقصى يجب أن يكون بين 1 و 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('الإزاحة يجب أن تكون رقماً صحيحاً'),
];

export const createRules = [
  body('user_id').notEmpty().withMessage('معرف المستخدم مطلوب'),
  body('title').notEmpty().withMessage('عنوان الإشعار مطلوب'),
  body('message').notEmpty().withMessage('نص الإشعار مطلوب'),
  body('type').optional().isIn(NOTIFICATION_TYPES).withMessage('نوع الإشعار غير صالح'),
  body('priority').optional().isIn(PRIORITY_LEVELS).withMessage('الأولوية غير صالحة'),
];

export const broadcastRules = [
  body('title').notEmpty().withMessage('عنوان الإشعار مطلوب'),
  body('message').notEmpty().withMessage('نص الإشعار مطلوب'),
];

export const batchRules = [
  body('user_ids').isArray({ min: 1 }).withMessage('قائمة معرفات المستخدمين مطلوبة'),
  body('title').notEmpty().withMessage('عنوان الإشعار مطلوب'),
  body('message').notEmpty().withMessage('نص الإشعار مطلوب'),
];

export { NOTIFICATION_TYPES, PRIORITY_LEVELS };

import { body, param } from 'express-validator';

export const createChannelRules = [
  body('name')
    .notEmpty()
    .withMessage('اسم القناة مطلوب')
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القناة لا يجب أن يتجاوز 100 حرف'),
  body('type')
    .notEmpty()
    .withMessage('نوع القناة مطلوب')
    .isIn(['whatsapp', 'phone', 'link'])
    .withMessage('نوع القناة غير صحيح'),
  body('value')
    .notEmpty()
    .withMessage('قيمة القناة مطلوبة')
    .trim()
    .isLength({ max: 255 })
    .withMessage('قيمة القناة لا يجب أن تتجاوز 255 حرف'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة القناة يجب أن تكون منطقية (صحيح أو خطأ)'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('الأيقونة لا يجب أن تتجاوز 100 حرف'),
];

export const updateChannelRules = [
  param('id').isUUID().withMessage('معرف القناة غير صالح'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم القناة لا يجب أن يتجاوز 100 حرف'),
  body('type').optional().isIn(['whatsapp', 'phone', 'link']).withMessage('نوع القناة غير صحيح'),
  body('value')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('قيمة القناة لا يجب أن تتجاوز 255 حرف'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('حالة القناة يجب أن تكون منطقية (صحيح أو خطأ)'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('الأيقونة لا يجب أن تتجاوز 100 حرف'),
];

export const channelIdRule = [param('id').isUUID().withMessage('معرف القناة غير صالح')];

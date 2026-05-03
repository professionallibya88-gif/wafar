import { body, param } from 'express-validator';

const orderStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];

export const addCartItemRules = [
  body('part_id').isUUID().withMessage('معرف القطعة غير صالح'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage('الكمية يجب أن تكون رقماً صحيحاً بين 1 و 999')
    .toInt(),
];

export const updateCartItemRules = [
  param('id').isUUID().withMessage('معرف عنصر السلة غير صالح'),
  body('quantity')
    .notEmpty()
    .withMessage('الكمية مطلوبة')
    .isInt({ min: 0, max: 999 })
    .withMessage('الكمية يجب أن تكون رقماً صحيحاً بين 0 و 999')
    .toInt(),
];

export const cartItemIdRules = [param('id').isUUID().withMessage('معرف عنصر السلة غير صالح')];

export const updateOrderStatusRules = [
  param('id').isUUID().withMessage('معرف الطلب غير صالح'),
  body('status')
    .notEmpty()
    .withMessage('حالة الطلب مطلوبة')
    .isIn(orderStatuses)
    .withMessage('حالة الطلب غير صالحة'),
];

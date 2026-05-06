import { body, param, query } from 'express-validator';

const ticketIdRule = param('id').isUUID().withMessage('معرف التذكرة غير صالح');

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صالح'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('عدد العناصر في الصفحة غير صالح'),
];

const statusQueryRule = query('status')
  .optional()
  .isIn(['open', 'closed', 'resolved'])
  .withMessage('حالة التذكرة غير صالحة');

const messageContentRule = body('content')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('محتوى الرسالة يجب أن يكون نصاً')
  .isLength({ min: 1, max: 5000 })
  .withMessage('محتوى الرسالة يجب أن يكون بين 1 و 5000 حرف');

const legacyMessageRule = body('message')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('محتوى الرسالة يجب أن يكون نصاً')
  .isLength({ min: 1, max: 5000 })
  .withMessage('محتوى الرسالة يجب أن يكون بين 1 و 5000 حرف');

const requireMessageContentRule = body().custom((value, { req }) => {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!content && !message) {
    throw new Error('محتوى الرسالة مطلوب');
  }

  return true;
});

export const getUserTicketsRules = [...paginationRules, statusQueryRule];

export const getAdminTicketsRules = [
  ...paginationRules,
  statusQueryRule,
  query('user_id').optional().isUUID().withMessage('معرف المستخدم غير صالح'),
  query('search')
    .optional()
    .isString()
    .withMessage('نص البحث يجب أن يكون نصاً')
    .isLength({ max: 255 })
    .withMessage('نص البحث طويل جداً'),
];

export const ticketIdRules = [ticketIdRule];

export const createTicketRules = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('موضوع التذكرة مطلوب')
    .isLength({ min: 3, max: 255 })
    .withMessage('موضوع التذكرة يجب أن يكون بين 3 و 255 حرفاً'),
  messageContentRule,
  legacyMessageRule,
  requireMessageContentRule,
];

export const replyToTicketRules = [
  ticketIdRule,
  messageContentRule,
  legacyMessageRule,
  requireMessageContentRule,
];

export const updateTicketStatusRules = [
  ticketIdRule,
  body('status')
    .notEmpty()
    .withMessage('حالة التذكرة مطلوبة')
    .isIn(['open', 'closed', 'resolved'])
    .withMessage('حالة التذكرة غير صالحة'),
];

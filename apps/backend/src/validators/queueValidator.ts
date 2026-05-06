import { body, param, query } from 'express-validator';

const queueStates = ['waiting', 'active', 'completed', 'failed', 'delayed'];

export const getJobsRules = [
  query('state').optional().isIn(queueStates).withMessage('حالة المهمة غير صالحة'),
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صالح'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('عدد العناصر في الصفحة غير صالح'),
];

export const queueJobIdRules = [param('jobId').trim().notEmpty().withMessage('معرف المهمة مطلوب')];

export const addJobRules = [
  body('pdfId').trim().notEmpty().withMessage('معرف ملف PDF مطلوب'),
  body('filePath').trim().notEmpty().withMessage('مسار الملف مطلوب'),
  body('method')
    .trim()
    .notEmpty()
    .withMessage('طريقة المعالجة مطلوبة')
    .isIn(['node_pdf', 'python_pypdf', 'python_ai', 'aws_textract', 'ocr'])
    .withMessage('طريقة المعالجة غير صالحة'),
];

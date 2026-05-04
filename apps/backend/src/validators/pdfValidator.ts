import { body, param } from 'express-validator';

const allowedPdfMethods = ['node_pdf', 'python_pypdf', 'python_ai', 'aws_textract', 'ocr'];

const fileIdParamRules = [param('id').isUUID().withMessage('معرف الملف غير صالح')];

const supplierIdParamRules = [param('supplierId').isUUID().withMessage('معرف المورد غير صالح')];

const optionalMethodRule = body('method')
  .optional()
  .isIn(allowedPdfMethods)
  .withMessage('طريقة المعالجة غير صالحة');

const parseItemsRule = body('items').customSanitizer((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
});

const uploadItemsRule = body('items')
  .custom((value) => value !== undefined && value !== null && value !== '')
  .withMessage('يرجى إرسال بيانات الملفات')
  .isArray({ min: 1 })
  .withMessage('يجب إرسال items بصيغة JSON لمصفوفة غير فارغة')
  .custom((items, { req }) => {
    const files = Array.isArray((req as { files?: unknown }).files)
      ? ((req as { files?: unknown[] }).files ?? [])
      : [];

    if (files.length === 0) {
      throw new Error('يرجى رفع ملف PDF واحد على الأقل');
    }

    if (items.length !== files.length) {
      throw new Error('عدد العناصر لا يطابق عدد الملفات المرفوعة');
    }

    return true;
  });

const uploadItemSupplierRule = body('items.*.supplier_id')
  .notEmpty()
  .withMessage('يرجى تحديد المورد')
  .isUUID()
  .withMessage('معرف المورد غير صالح');

const uploadItemDocumentDateRule = body('items.*.document_date')
  .notEmpty()
  .withMessage('يرجى تحديد تاريخ المستند')
  .isISO8601()
  .withMessage('تاريخ المستند غير صالح');

const uploadItemMethodRule = body('items.*.method')
  .optional({ values: 'falsy' })
  .isIn(allowedPdfMethods)
  .withMessage('طريقة المعالجة غير صالحة');

export const uploadPdfRules = [
  parseItemsRule,
  uploadItemsRule,
  uploadItemSupplierRule,
  uploadItemDocumentDateRule,
  uploadItemMethodRule,
];

export const extractMetadataRules = [];

export const fileIdRules = fileIdParamRules;

export const reprocessPdfRules = [...fileIdParamRules, optionalMethodRule];

export const testPdfMethodRules = [optionalMethodRule];

export const supplierVersionsRules = supplierIdParamRules;

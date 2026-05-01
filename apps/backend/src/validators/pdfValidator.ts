import { body, param } from 'express-validator';

const allowedPdfMethods = ['node_pdf', 'python_pypdf', 'python_ai', 'aws_textract', 'ocr'];

const fileIdParamRules = [param('id').isUUID().withMessage('معرف الملف غير صالح')];

const supplierIdParamRules = [param('supplierId').isUUID().withMessage('معرف المورد غير صالح')];

const optionalMethodRule = body('method')
  .optional()
  .isIn(allowedPdfMethods)
  .withMessage('طريقة المعالجة غير صالحة');

const requiredSupplierRule = body('supplier_id')
  .notEmpty()
  .withMessage('يرجى تحديد المورد')
  .isUUID()
  .withMessage('معرف المورد غير صالح');

const requiredDocumentDateRule = body('document_date')
  .notEmpty()
  .withMessage('يرجى تحديد تاريخ المستند')
  .isISO8601()
  .withMessage('تاريخ المستند غير صالح');

export const uploadPdfRules = [requiredSupplierRule, optionalMethodRule, requiredDocumentDateRule];

export const extractMetadataRules = [];

export const fileIdRules = fileIdParamRules;

export const reprocessPdfRules = [...fileIdParamRules, optionalMethodRule];

export const testPdfMethodRules = [optionalMethodRule];

export const supplierVersionsRules = supplierIdParamRules;

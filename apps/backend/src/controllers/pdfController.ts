import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created, buildPaginationMeta } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';
import { pdfService } from '../services/PDFService';
import { AuthenticatedRequest } from '../types';
import { ValidationError } from '../errors';

interface UploadBatchItemInput {
  supplier_id: string;
  method?: string;
  document_date: string;
}

interface UploadBatchResponse {
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

export const upload = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (files.length === 0) throw new ValidationError('يرجى رفع ملف PDF واحد على الأقل');

  const userId = req.user ? req.user.id : undefined;
  const items = Array.isArray(req.body.items) ? (req.body.items as UploadBatchItemInput[]) : [];
  const data = (await pdfService.uploadPDFBatch({
    userId,
    files,
    items,
  })) as unknown as UploadBatchResponse;

  if (data.summary.failed === 0) {
    return created(res, { data, message: 'تم رفع جميع الملفات بنجاح - جاري المعالجة' });
  }

  const message =
    data.summary.succeeded > 0 ? 'تم رفع بعض الملفات وتعذر رفع بعضها' : 'تعذر رفع جميع الملفات';

  return success(res, {
    data,
    message,
    statusCode: 207,
  });
});

export const extractMetadata = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw new ValidationError('يرجى رفع ملف PDF لاستخراج البيانات');
  const data = await pdfService.extractMetadata(req.file);
  return success(res, { data, message: 'تم استخراج البيانات بنجاح' });
});

export const listFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const userId = req.user ? req.user.id : undefined;
  const result = await pdfService.listUserFiles({
    userId,
    status: req.query.status as string,
    limit,
    offset,
  });
  const typedResult = result as { rows: unknown[]; count: number };
  return success(res, {
    data: { files: typedResult.rows },
    meta: buildPaginationMeta({ total: typedResult.count, page, limit }),
  });
});

export const getFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  const file = await pdfService.getUserFile({
    userId,
    fileId: req.params.id as string,
  });
  return success(res, { data: file });
});

export const getFileParts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query, {
    defaultLimit: 50,
    maxLimit: 100,
  });

  const filters = {
    q: req.query.q as string,
    brand: req.query.brand as string,
    quality_grade: req.query.quality_grade as string,
    min_price: req.query.min_price as string,
    max_price: req.query.max_price as string,
    in_stock: req.query.in_stock as string,
  };

  const userId = req.user ? req.user.id : undefined;
  const result = await pdfService.getUserFileParts({
    userId,
    fileId: req.params.id as string,
    limit,
    offset,
    filters,
  });

  return success(res, {
    data: { parts: result.rows },
    meta: buildPaginationMeta({ total: result.count, page, limit }),
  });
});

export const deleteFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId && req.admin) {
    await pdfService.deleteAnyFile(req.params.id as string);
  } else {
    await pdfService.deleteUserFile({ userId: userId as string, fileId: req.params.id as string });
  }
  return success(res, { message: 'تم حذف الملف بنجاح' });
});

export const reprocess = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  let data;
  if (!userId && req.admin) {
    data = await pdfService.reprocessAnyFile({
      fileId: req.params.id as string,
      method: req.body.method,
    });
  } else {
    data = await pdfService.reprocessFile({
      userId: userId as string,
      fileId: req.params.id as string,
      method: req.body.method,
    });
  }
  return success(res, { data, message: 'تم بدء اعادة المعالجة بنجاح' });
});

export const jobStatus = asyncHandler(async (req: Request, res: Response) => {
  const aReq = req as AuthenticatedRequest;
  const userId = aReq.user ? aReq.user.id : undefined;
  let data;
  if (!userId && aReq.admin) {
    // Admin can just query the job status via getJobStatus, but getUserFileJobStatus needs userId?
    // Wait, let's implement getAnyFileJobStatus or modify getUserFileJobStatus
    data = await pdfService.getUserFileJobStatus({
      userId,
      fileId: req.params.id as string,
    });
  } else {
    data = await pdfService.getUserFileJobStatus({
      userId: userId as string,
      fileId: req.params.id as string,
    });
  }
  return success(res, { data });
});

export const testMethod = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw new ValidationError('يرجى رفع ملف PDF للاختبار');
  const data = await pdfService.testMethod({ file: req.file, method: req.body.method });
  return success(res, { data, message: 'تم اختبار الطريقة بنجاح' });
});

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const data = await pdfService.healthCheck();
  return success(res, { data });
});

export const methodStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await pdfService.methodStats();
  return success(res, { data });
});

export const stats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) {
    // Return empty stats or all stats for admin?
    // Usually admins have methodStats. If they hit this, return 0 or empty for now.
    return success(res, { data: { total: 0, completed: 0, pending: 0, failed: 0 } });
  }
  const data = await pdfService.getUserStats(userId);
  return success(res, { data });
});

export const catalogs = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const latestOnly = req.query.latest_only !== 'false';
  const result = await pdfService.listCatalogs({
    limit,
    offset,
    latestOnly,
  });
  const typedResult = result as { rows: unknown[]; count: number };
  return success(res, {
    data: { catalogs: typedResult.rows },
    meta: buildPaginationMeta({ total: typedResult.count, page, limit }),
  });
});

export const versions = asyncHandler(async (req: Request, res: Response) => {
  const supplierId = req.params.supplierId as string;
  const data = await pdfService.getVersionsBySupplier(supplierId);
  return success(res, { data });
});

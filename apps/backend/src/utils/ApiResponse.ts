import { Response } from 'express';

interface SuccessPayload {
  data?: unknown;
  message?: string | null;
  meta?: unknown;
  statusCode?: number;
}

interface ErrorPayload {
  message?: string;
  statusCode?: number;
  code?: string;
  errors?: unknown;
}

interface FilePayload {
  data: Buffer;
  contentType: string;
  fileName: string;
  statusCode?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export const success = (res: Response, payload: SuccessPayload = {}): Response => {
  const { data = null, message = null, meta = null, statusCode = 200 } = payload;
  const body: Record<string, unknown> = { success: true };
  if (message) body.message = message;
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const created = (
  res: Response,
  payload: Omit<SuccessPayload, 'statusCode'> = {}
): Response => {
  const { data = null, message = 'تم الإنشاء بنجاح', meta = null } = payload;
  return success(res, { data, message, meta, statusCode: 201 });
};

export const error = (res: Response, payload: ErrorPayload = {}): Response => {
  const { message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null } = payload;
  const body: Record<string, unknown> = { success: false, code };
  if (message) body.message = message;
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const file = (res: Response, payload: FilePayload): Response => {
  const { data, contentType, fileName, statusCode = 200 } = payload;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  return res.status(statusCode).send(data);
};

export const buildPaginationMeta = (meta: PaginationMeta): PaginationMeta => {
  const { total, page, limit } = meta;
  const parsedPage = parseInt(String(page), 10);
  const parsedLimit = parseInt(String(limit), 10);
  return {
    total,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(total / parsedLimit),
  };
};

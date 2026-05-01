import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AppError, ValidationError } from '../errors';

interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  errors?: unknown;
}

interface SequelizeErrorItem {
  path: string;
  message: string;
}

interface SequelizeValidationError extends Error {
  name: 'SequelizeValidationError' | 'SequelizeUniqueConstraintError';
  errors: SequelizeErrorItem[];
}

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`${err.code} ${req.method} ${req.originalUrl} - ${err.message}`);
    const body: ErrorResponse = {
      success: false,
      code: err.code,
      message: err.message,
    };
    if (err instanceof ValidationError && err.details) {
      body.errors = err.details;
    }
    return res.status(err.statusCode).json(body);
  }

  if (err instanceof Error && err.name === 'SequelizeValidationError') {
    const validationErr = err as SequelizeValidationError;
    const errors = validationErr.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'خطأ في التحقق من البيانات',
      errors,
    });
  }

  if (err instanceof Error && err.name === 'SequelizeUniqueConstraintError') {
    const validationErr = err as SequelizeValidationError;
    const errors = validationErr.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(409).json({
      success: false,
      code: 'CONFLICT',
      message: 'البيانات مسجلة مسبقا',
      errors,
    });
  }

  if (err instanceof Error && err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      code: 'CONFLICT',
      message: 'لا يمكن تنفيذ العملية بسبب ارتباط البيانات بسجلات أخرى',
    });
  }

  if (err instanceof Error && err.name === 'SequelizeDatabaseError') {
    logger.error('Sequelize DB error:', err.message);
    return res.status(500).json({
      success: false,
      code: 'DATABASE_ERROR',
      message: 'خطأ في قاعدة البيانات',
    });
  }

  if (
    err instanceof Error &&
    (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError')
  ) {
    logger.error('Sequelize Connection error:', err.message);
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message: 'قاعدة البيانات غير متوفرة حالياً - يرجى المحاولة لاحقاً',
    });
  }

  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'رمز المصادقة غير صالح',
    });
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجددا',
    });
  }

  if (err instanceof Error && err.name === 'MulterError') {
    const multerErr = err as Error & { code?: string };
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        code: 'FILE_TOO_LARGE',
        message: 'حجم الملف أكبر من الحد المسموح',
      });
    }
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: 'خطأ في رفع الملف',
    });
  }

  const genericErr = err instanceof Error ? err : new Error(String(err));
  logger.error('Unhandled error:', {
    message: genericErr.message,
    stack: genericErr.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(statusCode).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: isProduction ? 'خطأ في الخادم الداخلي' : genericErr.message || 'خطأ في الخادم الداخلي',
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `المسار غير موجود: ${req.originalUrl}`,
  });
};

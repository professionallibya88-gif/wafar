import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * مغلف لدوال التحكم غير المتزامنة
 * يلتقط الأخطاء ويمررها إلى middleware معالجة الأخطاء بدون try/catch متكرر
 */
export const asyncHandler = <R extends Request = Request>(
  fn: (_req: R, _res: Response, _next: NextFunction) => Promise<unknown> | unknown
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as R, res, next)).catch(next);
  };
};

export default asyncHandler;

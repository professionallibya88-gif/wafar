import { validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ValidationError } from '../errors';

export const runValidators = (
  validators: ValidationChain | ValidationChain[]
): RequestHandler[] => {
  const list = Array.isArray(validators) ? validators : [validators];
  return [
    ...list,
    (req: Request, _res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) return next();

      const details = errors.array().map((e: any) => ({
        field: e.path || e.param,
        message: e.msg,
      }));

      return next(new ValidationError('خطأ في البيانات المدخلة', details as any));
    },
  ];
};

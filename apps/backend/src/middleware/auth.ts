import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { userRepository, adminRepository } from '../repositories';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { AuthenticatedRequest } from '../types';
import { getJwtSecret } from '../config/auth';

interface JwtPayload {
  id: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const aReq = req as AuthenticatedRequest;
    const authHeader = aReq.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('غير مصرح بالدخول - يرجى تسجيل الدخول'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (!decoded || !decoded.id) {
      return next(new UnauthorizedError('رمز المصادقة غير صالح'));
    }

    // Since we separated admins and users, if an admin uses the standard auth middleware
    // we should allow them to pass, but assign to aReq.admin instead of aReq.user
    if (decoded.isAdmin) {
      const admin = await adminRepository.findByIdSafe(decoded.id);
      if (!admin) {
        return next(new UnauthorizedError('حساب المدير غير موجود'));
      }
      if (!admin.is_active) {
        return next(new ForbiddenError('حساب المدير معطل - يرجى التواصل مع الإدارة'));
      }
      aReq.admin = admin as any;
      return next();
    }

    const user = await userRepository.findByIdSafe(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('المستخدم غير موجود'));
    }

    if (!user.is_active) {
      return next(new ForbiddenError('الحساب معطل - يرجى التواصل مع الدعم الفني'));
    }

    aReq.user = user as any; // Typecast because of missing models relation
    return next();
  } catch (error) {
    return next(error);
  }
};

export const adminAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const aReq = req as AuthenticatedRequest;
    const authHeader = aReq.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('غير مصرح بالدخول - يرجى تسجيل الدخول'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (!decoded || !decoded.id) {
      return next(new UnauthorizedError('رمز المصادقة غير صالح'));
    }

    const admin = await adminRepository.findByIdSafe(decoded.id);

    if (!admin) {
      return next(new UnauthorizedError('حساب المدير غير موجود'));
    }

    if (!admin.is_active) {
      return next(new ForbiddenError('حساب المدير معطل - يرجى التواصل مع الإدارة'));
    }

    aReq.admin = admin as any;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const adminOnly = (req: Request, _res: Response, next: NextFunction) => {
  const aReq = req as AuthenticatedRequest;
  if (aReq.admin) return next();
  return next(new ForbiddenError('هذه الصفحة متاحة للمدير فقط'));
};

export const retailerOnly = (req: Request, _res: Response, next: NextFunction) => {
  const aReq = req as AuthenticatedRequest;
  if (aReq.user && aReq.user.role === 'retailer') return next();
  return next(new ForbiddenError('هذه الصفحة متاحة لتجار التجزئة فقط'));
};

export const supplierOnly = (req: Request, _res: Response, next: NextFunction) => {
  const aReq = req as AuthenticatedRequest;
  if (aReq.user && aReq.user.role === 'supplier') return next();
  return next(new ForbiddenError('هذه الصفحة متاحة للموردين فقط'));
};

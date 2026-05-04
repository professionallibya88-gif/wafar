import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { userRepository, adminRepository } from '../repositories';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { AuthenticatedRequest, AdminInfo, UserInfo } from '../types';
import { getJwtSecret } from '../config/auth';

interface JwtPayload {
  id: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

type SerializableRecord = {
  toJSON?: () => Record<string, unknown>;
};

const toPlainRecord = (entity: SerializableRecord | Record<string, unknown>) =>
  'toJSON' in entity && typeof entity.toJSON === 'function' ? entity.toJSON() : entity;

const toAdminInfo = (entity: SerializableRecord | Record<string, unknown>): AdminInfo => {
  const record = toPlainRecord(entity);

  return {
    id: String(record.id ?? ''),
    full_name: String(record.full_name ?? ''),
    email: String(record.email ?? ''),
    role: (record.role as AdminInfo['role']) ?? 'admin',
    is_active: Boolean(record.is_active),
    last_login: (record.last_login as Date | null | undefined) ?? null,
    created_at: record.created_at as Date | undefined,
    updated_at: record.updated_at as Date | undefined,
  };
};

const toUserInfo = (entity: SerializableRecord | Record<string, unknown>): UserInfo => {
  const record = toPlainRecord(entity);
  const balanceValue = record.balance;
  const parsedBalance =
    typeof balanceValue === 'number'
      ? balanceValue
      : typeof balanceValue === 'string'
        ? Number(balanceValue)
        : 0;

  return {
    id: String(record.id ?? ''),
    full_name: String(record.full_name ?? ''),
    phone: String(record.phone ?? ''),
    role: (record.role as UserInfo['role']) ?? 'retailer',
    is_active: Boolean(record.is_active),
    balance: Number.isFinite(parsedBalance) ? parsedBalance : 0,
    last_login: (record.last_login as Date | null | undefined) ?? null,
    created_at: record.created_at as Date | undefined,
    updated_at: record.updated_at as Date | undefined,
  };
};

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
      aReq.admin = toAdminInfo(admin);
      return next();
    }

    const user = await userRepository.findByIdSafe(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('المستخدم غير موجود'));
    }

    if (!user.is_active) {
      return next(new ForbiddenError('الحساب معطل - يرجى التواصل مع الدعم الفني'));
    }

    aReq.user = toUserInfo(user);
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

    aReq.admin = toAdminInfo(admin);
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

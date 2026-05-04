import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { adminRepository } from '../repositories';
import { UnauthorizedError, ForbiddenError, NotFoundError, BusinessError } from '../errors';
import { getJwtSecret } from '../config/auth';
import logger from '../config/logger';
import type { AdminInfo } from '../types';

type AdminLoginPayload = {
  email: string;
  password: string;
};

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

type SanitizableAdmin = Partial<AdminInfo> & {
  toJSON?: () => Record<string, unknown>;
};

export class AdminAuthService {
  generateToken(adminId: string): string {
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    const signOptions: SignOptions = {
      expiresIn,
    };

    // We can add a role or admin flag to distinguish tokens if necessary,
    // but the ID itself being used in the admin auth middleware with adminRepository is usually enough.
    // However, it's safer to include a flag in the payload.
    return jwt.sign({ id: adminId, isAdmin: true }, getJwtSecret(), signOptions);
  }

  async login(data: AdminLoginPayload) {
    const password = String(data.password || '');
    let input = String(data.email || '');
    input = input.trim().toLowerCase();

    const admin = await adminRepository.findByEmailOrPhone(input);

    if (!admin) {
      throw new UnauthorizedError('البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    if (!admin.is_active) {
      throw new ForbiddenError('الحساب معطل - يرجى التواصل مع الإدارة');
    }

    if (!admin.password || typeof admin.password !== 'string') {
      logger.error('Admin login failed: missing password hash', {
        adminId: admin.id,
        loginInput: input,
      });
      throw new UnauthorizedError('بيانات الدخول غير صالحة لهذا الحساب');
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, admin.password);
    } catch (error) {
      logger.error('Admin login compare failed', {
        adminId: admin.id,
        loginInput: input,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedError('تعذر التحقق من بيانات الدخول');
    }

    if (!isMatch) {
      throw new UnauthorizedError('البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    try {
      await adminRepository.updateLastLogin(admin.id);
    } catch (error) {
      logger.warn('Admin last_login update failed', {
        adminId: admin.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const token = this.generateToken(admin.id);

    return { user: this.sanitizeAdmin(admin), token };
  }

  async changePassword(adminId: string, data: ChangePasswordPayload): Promise<void> {
    const { current_password, new_password } = data;
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    const isMatch = await bcrypt.compare(current_password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError('كلمة المرور الحالية غير صحيحة');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await adminRepository.updateById(adminId, { password: hashedPassword });
  }

  async updateProfile(adminId: string, data: { full_name?: string; email?: string }) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    if (data.email && data.email !== admin.email) {
      const existingEmail = await adminRepository.findByEmail(data.email);
      if (existingEmail) throw new BusinessError('البريد الإلكتروني مسجل مسبقا');
    }

    const updates: { full_name?: string; email?: string } = {};
    if (data.full_name !== undefined) updates.full_name = data.full_name;
    if (data.email !== undefined) updates.email = data.email;

    const updatedAdmin =
      Object.keys(updates).length > 0 ? await adminRepository.updateById(adminId, updates) : admin;

    return this.sanitizeAdmin(updatedAdmin);
  }

  sanitizeAdmin(admin: SanitizableAdmin | null | undefined): Record<string, unknown> {
    if (!admin) {
      return {};
    }

    const raw = admin.toJSON ? admin.toJSON() : ({ ...admin } as Record<string, unknown>);
    const record = { ...raw };
    delete record.password;
    return record;
  }
}

export const adminAuthService = new AdminAuthService();

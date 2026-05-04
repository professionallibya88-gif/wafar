import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { adminRepository } from '../repositories';
import { UnauthorizedError, ForbiddenError, NotFoundError, BusinessError } from '../errors';
import { getJwtSecret } from '../config/auth';
import logger from '../config/logger';
import {
  SINGLE_ADMIN_EMAIL,
  SINGLE_ADMIN_PHONE,
  SINGLE_ADMIN_PASSWORD,
} from '../repositories/AdminRepository';

type AdminLoginPayload = {
  email: string;
  password: string;
};

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
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

    if (!adminRepository.isSingleAdminLoginInput(input)) {
      throw new UnauthorizedError('بيانات دخول الإدارة محصورة بالحساب 0910000000');
    }

    if (password !== SINGLE_ADMIN_PASSWORD) {
      throw new UnauthorizedError('بيانات دخول الإدارة محصورة بالحساب 0910000000 / 000000');
    }

    const admin = await adminRepository.findByEmailOrPhone(input);

    if (!admin) {
      throw new UnauthorizedError('حساب الإدارة الوحيد غير مهيأ بعد');
    }

    if (admin.role !== 'super_admin') {
      throw new ForbiddenError('تم تقييد الدخول على حساب super_admin الوحيد');
    }

    if (admin.phone !== SINGLE_ADMIN_PHONE || admin.email !== SINGLE_ADMIN_EMAIL) {
      throw new ForbiddenError('بيانات حساب الإدارة الحالي لا تطابق الحساب الإجباري');
    }

    if (!admin.is_active) {
      throw new ForbiddenError('الحساب معطل - يرجى التواصل مع الدعم الفني');
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

    if (admin.role !== 'super_admin') {
      throw new ForbiddenError('تم تقييد هذه العملية على حساب super_admin الوحيد');
    }

    if (current_password !== SINGLE_ADMIN_PASSWORD || new_password !== SINGLE_ADMIN_PASSWORD) {
      throw new BusinessError('كلمة مرور حساب الإدارة الوحيد ثابتة ولا يمكن تغييرها');
    }
  }

  sanitizeAdmin(admin: any) {
    const withToJSON = admin as { toJSON?: () => unknown };
    const raw = withToJSON.toJSON ? withToJSON.toJSON() : admin;
    const record = raw as Record<string, unknown>;
    delete record.password;
    return record;
  }
}

export const adminAuthService = new AdminAuthService();

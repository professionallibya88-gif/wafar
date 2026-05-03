import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { adminRepository } from '../repositories';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors';
import { getJwtSecret } from '../config/auth';
import logger from '../config/logger';

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

    const admin = await adminRepository.findByEmailOrPhone(input);

    if (!admin) {
      throw new UnauthorizedError('البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة');
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
      // تحديث عبر SQL خام لتجنب مشاكل الأعمدة المفقودة مثل phone إذا كان المودل غير متزامن
      await adminRepository.sequelize!.query(
        `UPDATE admins SET last_login = NOW() WHERE id = :id`,
        { replacements: { id: admin.id } }
      );
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

    await adminRepository.updateById(admin.id, {
      password: await bcrypt.hash(new_password, 12),
    });
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

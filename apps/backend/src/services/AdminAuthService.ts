import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { adminRepository } from '../repositories';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors';
import { getJwtSecret } from '../config/auth';

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
    const { password } = data;
    let email = data.email;
    email = email.trim().toLowerCase();

    // إذا كان الإدخال عبارة عن رقم هاتف محلي، نقوم بإضافة الدومين الافتراضي
    if (/^(09|02)\d{8}$/.test(email) || /^\d{10}$/.test(email)) {
      email = `${email}@waffer.local`;
    }

    const admin = await adminRepository.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError('البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    if (!admin.is_active) {
      throw new ForbiddenError('الحساب معطل - يرجى التواصل مع الدعم الفني');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError('البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    await adminRepository.updateById(admin.id, { last_login: new Date() });
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

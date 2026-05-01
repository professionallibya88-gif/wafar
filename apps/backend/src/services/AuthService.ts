import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { userRepository } from '../repositories';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../errors';
import { AuthResponse } from '../types';
import { getJwtSecret } from '../config/auth';
import { normalizePhoneNumber } from '../utils/phone';

type RegisterPayload = {
  full_name: string;
  phone: string;
  password: string;
};

type LoginPayload = {
  phone: string;
  password: string;
};

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export class AuthService {
  generateToken(userId: string): string {
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    const signOptions: SignOptions = {
      expiresIn,
    };

    return jwt.sign({ id: userId }, getJwtSecret(), signOptions);
  }

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const { full_name, phone, password } = data;
    const normalizedPhone = normalizePhoneNumber(phone);
    const exists = await userRepository.findByPhone(normalizedPhone);
    if (exists) {
      throw new ConflictError('رقم الهاتف مسجل مسبقا');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userRepository.create({
      full_name,
      phone: normalizedPhone,
      password: hashedPassword,
      role: 'retailer',
      is_active: true,
    });

    const token = this.generateToken(user.id);

    return { user: this.sanitizeUser(user), token };
  }

  async login(data: LoginPayload): Promise<AuthResponse> {
    const { phone, password } = data;
    const normalizedPhone = normalizePhoneNumber(phone);
    const user = await userRepository.findByPhone(normalizedPhone);
    if (!user) {
      throw new UnauthorizedError('رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    if (!user.is_active) {
      throw new ForbiddenError('الحساب معطل - يرجى التواصل مع الدعم الفني');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    await userRepository.updateById(user.id, { last_login: new Date() });
    const token = this.generateToken(user.id);

    return { user: this.sanitizeUser(user), token };
  }

  async changePassword(userId: string, data: ChangePasswordPayload): Promise<void> {
    const { current_password, new_password } = data;
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('المستخدم غير موجود');
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('كلمة المرور الحالية غير صحيحة');
    }

    await userRepository.updateById(user.id, {
      password: await bcrypt.hash(new_password, 12),
    });
  }

  sanitizeUser(user: unknown): AuthResponse['user'] {
    const withToJSON = user as { toJSON?: () => unknown };
    const raw = withToJSON.toJSON ? withToJSON.toJSON() : user;
    const record = raw as Record<string, unknown>;
    delete record.password;
    return record as AuthResponse['user'];
  }
}

export const authService = new AuthService();

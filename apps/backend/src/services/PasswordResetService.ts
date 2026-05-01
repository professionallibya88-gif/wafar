import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { userRepository } from '../repositories';
import { BusinessError, UnauthorizedError } from '../errors';
import { normalizePhoneNumber } from '../utils/phone';

import logger from '../config/logger';
import { getRedisClient } from '../config/redis';
import { notificationService } from './NotificationService';

const OTP_TTL_SECONDS = parseInt(process.env.PASSWORD_RESET_OTP_TTL || '600', 10);
const RESET_TOKEN_TTL_SECONDS = parseInt(process.env.PASSWORD_RESET_TOKEN_TTL || '900', 10);
const RESEND_COOLDOWN_SECONDS = parseInt(process.env.PASSWORD_RESET_RESEND_COOLDOWN || '60', 10);
const MAX_VERIFY_ATTEMPTS = parseInt(process.env.PASSWORD_RESET_MAX_ATTEMPTS || '5', 10);

type PasswordResetRecord = {
  phone: string;
  userId: string;
  otpHash: string | null;
  otpExpiresAt: number | null;
  verifyAttempts: number;
  resendAvailableAt: number;
  resetTokenHash: string | null;
  resetTokenExpiresAt: number | null;
};

class PasswordResetStore {
  private memory = new Map<string, { record: PasswordResetRecord; expiresAt: number }>();

  private buildKey(phone: string) {
    return `password-reset:${phone}`;
  }

  private computeTtl(record: PasswordResetRecord) {
    const expiry = Math.max(record.otpExpiresAt || 0, record.resetTokenExpiresAt || 0);
    return Math.max(60, Math.ceil((expiry - Date.now()) / 1000));
  }

  async get(phone: string): Promise<PasswordResetRecord | null> {
    const key = this.buildKey(phone);

    try {
      const client = await getRedisClient();
      if (client?.isOpen) {
        const raw = await client.get(key);
        return raw ? JSON.parse(raw) : null;
      }
    } catch (error: any) {
      logger.warn(`تعذر استخدام Redis لتخزين استعادة كلمة المرور: ${error.message}`);
    }

    const memoryRecord = this.memory.get(key);
    if (!memoryRecord) return null;

    if (memoryRecord.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }

    return memoryRecord.record;
  }

  async set(record: PasswordResetRecord): Promise<void> {
    const key = this.buildKey(record.phone);
    const ttl = this.computeTtl(record);
    const expiresAt = Date.now() + ttl * 1000;

    try {
      const client = await getRedisClient();
      if (client?.isOpen) {
        await client.setEx(key, ttl, JSON.stringify(record));
        return;
      }
    } catch (error: any) {
      logger.warn(`تعذر حفظ بيانات استعادة كلمة المرور في Redis: ${error.message}`);
    }

    this.memory.set(key, { record, expiresAt });
  }

  async delete(phone: string): Promise<void> {
    const key = this.buildKey(phone);

    try {
      const client = await getRedisClient();
      if (client?.isOpen) {
        await client.del(key);
      }
    } catch (error: any) {
      logger.warn(`تعذر حذف بيانات استعادة كلمة المرور من Redis: ${error.message}`);
    }

    this.memory.delete(key);
  }
}

export class PasswordResetService {
  private store = new PasswordResetStore();

  private hashValue(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private safeEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) return false;
    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
  }

  private async deliverOtp(user: { id: string; phone: string }, otp: string) {
    const title = 'رمز استعادة كلمة المرور';
    const message = `رمز التحقق الخاص بك هو ${otp} وصلاحيته ${Math.floor(OTP_TTL_SECONDS / 60)} دقائق`;

    try {
      await notificationService.notifyUser(user.id, 'system', title, message, {
        priority: 'high',
        icon: 'shield-check',
      });
    } catch (error: any) {
      logger.warn(`تعذر إنشاء إشعار استعادة كلمة المرور للمستخدم ${user.id}: ${error.message}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.warn(`رمز استعادة كلمة المرور للمستخدم ${user.phone}: ${otp}`);
    }
  }

  async requestOtp(phone: string): Promise<any> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const genericResponse: any = {
      message: 'إذا كان رقم الهاتف مسجلاً فسيتم إرسال رمز التحقق إليه',
      data: {
        expires_in: OTP_TTL_SECONDS,
        resend_cooldown: RESEND_COOLDOWN_SECONDS,
      },
    };

    const user = await userRepository.findByPhone(normalizedPhone);
    if (!user || !user.is_active) {
      return genericResponse;
    }

    const existingRecord = await this.store.get(normalizedPhone);
    if (existingRecord && existingRecord.resendAvailableAt > Date.now()) {
      if (process.env.NODE_ENV !== 'production') {
        genericResponse.data.retry_after = Math.ceil(
          (existingRecord.resendAvailableAt - Date.now()) / 1000
        );
      }
      return genericResponse;
    }

    const otp = this.generateOtp();
    const now = Date.now();
    const record: PasswordResetRecord = {
      phone: normalizedPhone,
      userId: user.id,
      otpHash: this.hashValue(otp),
      otpExpiresAt: now + OTP_TTL_SECONDS * 1000,
      verifyAttempts: 0,
      resendAvailableAt: now + RESEND_COOLDOWN_SECONDS * 1000,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    };

    await this.store.set(record);
    await this.deliverOtp(user, otp);

    if (process.env.NODE_ENV !== 'production') {
      genericResponse.data.debug_otp = otp;
    }

    return genericResponse;
  }

  async verifyOtp(phone: string, otp: string): Promise<any> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const record = await this.store.get(normalizedPhone);
    const invalidOtpError = new UnauthorizedError('رمز التحقق غير صحيح أو منتهي الصلاحية');

    if (!record || !record.otpHash || !record.otpExpiresAt || record.otpExpiresAt < Date.now()) {
      await this.store.delete(normalizedPhone);
      throw invalidOtpError;
    }

    if (record.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
      await this.store.delete(normalizedPhone);
      throw new BusinessError('تم تجاوز عدد محاولات التحقق المسموحة، يرجى طلب رمز جديد');
    }

    const hashedOtp = this.hashValue(otp.trim());
    if (!this.safeEqual(hashedOtp, record.otpHash)) {
      record.verifyAttempts += 1;
      await this.store.set(record);
      throw invalidOtpError;
    }

    const resetToken = this.generateResetToken();
    record.otpHash = null;
    record.otpExpiresAt = null;
    record.verifyAttempts = 0;
    record.resetTokenHash = this.hashValue(resetToken);
    record.resetTokenExpiresAt = Date.now() + RESET_TOKEN_TTL_SECONDS * 1000;

    await this.store.set(record);

    return {
      reset_token: resetToken,
      expires_in: RESET_TOKEN_TTL_SECONDS,
    };
  }

  async resetPassword(phone: string, resetToken: string, newPassword: string): Promise<void> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const record = await this.store.get(normalizedPhone);
    const invalidTokenError = new UnauthorizedError('رمز الاستعادة غير صالح أو منتهي الصلاحية');

    if (
      !record ||
      !record.resetTokenHash ||
      !record.resetTokenExpiresAt ||
      record.resetTokenExpiresAt < Date.now()
    ) {
      await this.store.delete(normalizedPhone);
      throw invalidTokenError;
    }

    const hashedToken = this.hashValue(resetToken.trim());
    if (!this.safeEqual(hashedToken, record.resetTokenHash)) {
      throw invalidTokenError;
    }

    const user = await userRepository.findById(record.userId);
    if (!user || !user.is_active) {
      await this.store.delete(normalizedPhone);
      throw invalidTokenError;
    }

    await userRepository.updateById(user.id, {
      password: await bcrypt.hash(newPassword, 12),
    });
    await this.store.delete(normalizedPhone);

    try {
      await notificationService.notifyUser(
        user.id,
        'system',
        'تم تغيير كلمة المرور',
        'تم تغيير كلمة المرور بنجاح عبر رمز استعادة مؤقت',
        {
          priority: 'high',
          icon: 'shield-check',
        }
      );
    } catch (error: any) {
      logger.warn(
        `تعذر إنشاء إشعار نجاح استعادة كلمة المرور للمستخدم ${user.id}: ${error.message}`
      );
    }
  }
}

export const passwordResetService = new PasswordResetService();

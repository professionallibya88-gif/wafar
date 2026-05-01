/**
 * اختبارات وحدة لنظام المصادقة
 * لا تحتاج قاعدة بيانات - تعتمد على mocking
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import { validationResult } from 'express-validator';
import { auth, adminOnly, retailerOnly } from '../middleware/auth';
import {
  registerRules,
  loginRules,
  requestPasswordResetRules,
  verifyPasswordResetOtpRules,
  completePasswordResetRules,
  changePasswordRules,
} from '../validators/authValidator';

// Helpers
const runValidation = async (rules: any[], body: Record<string, unknown>) => {
  const req = { body };
  for (const rule of rules) {
    await rule.run(req);
  }
  return validationResult(req as any);
};

const createMockReq = (overrides: Record<string, unknown> = {}) => ({
  headers: {},
  ...overrides,
});

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const nextFn = jest.fn();

describe('Auth Middleware', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret-jwt-key-12345' };
    nextFn.mockClear();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('يجب أن يرفض طلب بدون رأس Authorization', async () => {
    const req = createMockReq() as any;
    const res = createMockRes();
    await auth(req, res, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
    expect((nextFn.mock.calls[0] as any)[0].message).toContain('غير مصرح');
  });

  it('يجب أن يرفض رمز Bearer غير صالح', async () => {
    const req = createMockReq({ headers: { authorization: 'Bearer invalid-token' } }) as any;
    const res = createMockRes();
    await auth(req, res, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
  });

  it('adminOnly يجب أن يرفض مستخدم غير admin', () => {
    const req = { user: { role: 'retailer' } } as any;
    const res = createMockRes();
    adminOnly(req, res, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
    expect((nextFn.mock.calls[0] as any)[0].message).toContain('مدير');
  });

  it('adminOnly يجب أن يسمح للمدير', () => {
    const req = createMockReq({
      admin: { id: 'a1', role: 'super_admin' },
    }) as any;
    const res = createMockRes();
    adminOnly(req, res, nextFn);
    expect(nextFn).toHaveBeenCalledWith();
  });

  it('retailerOnly يجب أن يسمح للتاجر', () => {
    const req = { user: { role: 'retailer' } } as any;
    const res = createMockRes();
    retailerOnly(req, res, nextFn);
    expect(nextFn).toHaveBeenCalledWith();
  });
});

describe('Auth Validators', () => {
  it('registerRules يقبل بيانات صحيحة', async () => {
    const result = await runValidation(registerRules, {
      full_name: 'أحمد محمد',
      phone: '0912345678',
      password: 'secret123',
      confirm_password: 'secret123',
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('registerRules يرفض رقم هاتف غير صالح', async () => {
    const result = await runValidation(registerRules, {
      full_name: 'أحمد',
      phone: '12345',
      password: 'secret123',
      confirm_password: 'secret123',
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors.some((e: any) => e.path === 'phone')).toBe(true);
  });

  it('registerRules يرفض كلمات مرور غير متطابقة', async () => {
    const result = await runValidation(registerRules, {
      full_name: 'أحمد',
      phone: '0912345678',
      password: 'secret123',
      confirm_password: 'different',
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors.some((e: any) => e.path === 'confirm_password')).toBe(true);
  });

  it('loginRules يقبل بيانات صحيحة', async () => {
    const result = await runValidation(loginRules, {
      phone: '0912345678',
      password: 'secret123',
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('loginRules يرفض رقم هاتف غير صالح', async () => {
    const result = await runValidation(loginRules, {
      phone: '12345',
      password: 'secret123',
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('verifyPasswordResetOtpRules يرفض OTP قصير', async () => {
    const result = await runValidation(verifyPasswordResetOtpRules, {
      phone: '0912345678',
      otp: '123',
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors.some((e: any) => e.path === 'otp')).toBe(true);
  });

  it('changePasswordRules يقبل كلمات مرور صحيحة', async () => {
    const result = await runValidation(changePasswordRules, {
      current_password: 'oldpass',
      new_password: 'newpass123',
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('requestPasswordResetRules يرفض رقم هاتف فارغ', async () => {
    const result = await runValidation(requestPasswordResetRules, { phone: '' });
    expect(result.isEmpty()).toBe(false);
  });

  it('completePasswordResetRules يرفض reset_token فارغ', async () => {
    const result = await runValidation(completePasswordResetRules, {
      phone: '0912345678',
      reset_token: '',
      new_password: 'newpass123',
      confirm_password: 'newpass123',
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors.some((e: any) => e.path === 'reset_token')).toBe(true);
  });
});

describe('Password Reset Logic', () => {
  it('يجب أن تكون أرقام OTP من 6 خانات فقط', () => {
    const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
    const otp = generateOtp();
    expect(otp).toMatch(/^[0-9]{6}$/);
    expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100000);
    expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999);
  });
});

describe('Auth Store (Frontend helpers)', () => {
  const normalizePhoneNumber = (value: string) => {
    if (typeof value !== 'string') return '';
    return value
      .trim()
      .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
      .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
      .replace(/\s+/g, '');
  };

  it('normalizePhoneNumber يحول الأرقام العربية إلى إنجليزية', () => {
    expect(normalizePhoneNumber('٠٩١٢٣٤٥٦٧٨')).toBe('0912345678');
  });

  it('normalizePhoneNumber يزيل المسافات', () => {
    expect(normalizePhoneNumber(' 091 234 5678 ')).toBe('0912345678');
  });
});

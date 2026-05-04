import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { validationResult } from 'express-validator';
import * as bcrypt from 'bcryptjs';
import {
  adminLoginRules,
  changeAdminPasswordRules,
  createAdminRules,
  updateAdminRules,
} from '../validators/adminValidator';
import { adminAuthService } from '../services/AdminAuthService';
import { UnauthorizedError } from '../errors';
import {
  SINGLE_ADMIN_EMAIL,
  SINGLE_ADMIN_PASSWORD,
  SINGLE_ADMIN_PHONE,
} from '../repositories/AdminRepository';
import { adminRepository } from '../repositories';

jest.mock('../repositories', () => ({
  adminRepository: {
    findByEmailOrPhone: jest.fn(),
    isSingleAdminLoginInput: jest.fn(),
    updateLastLogin: jest.fn(),
    sequelize: {
      query: jest.fn(),
    },
  },
}));

const mockedAdminRepository = adminRepository as unknown as {
  findByEmailOrPhone: jest.Mock;
  isSingleAdminLoginInput: jest.Mock;
  updateLastLogin: jest.Mock;
  sequelize: {
    query: jest.Mock;
  };
};

const runValidation = async (rules: any[], body: Record<string, unknown>) => {
  const req = { body };
  for (const rule of rules) {
    await rule.run(req);
  }
  return validationResult(req as any);
};

describe('Admin Singleton Validators', () => {
  it('adminLoginRules يقبل بيانات الحساب الإداري الثابتة', async () => {
    const result = await runValidation(adminLoginRules, {
      email: SINGLE_ADMIN_PHONE,
      password: SINGLE_ADMIN_PASSWORD,
    });

    expect(result.isEmpty()).toBe(true);
  });

  it('adminLoginRules يرفض أي رقم دخول مختلف', async () => {
    const result = await runValidation(adminLoginRules, {
      email: '0919999999',
      password: SINGLE_ADMIN_PASSWORD,
    });

    expect(result.isEmpty()).toBe(false);
  });

  it('createAdminRules يرفض إنشاء أي مدير إضافي', async () => {
    const result = await runValidation(createAdminRules, {
      full_name: 'مدير إضافي',
      phone: '0911111111',
      password: '123456',
    });

    expect(result.isEmpty()).toBe(false);
  });

  it('updateAdminRules يرفض تعديل بيانات الدخول الثابتة', async () => {
    const result = await runValidation(updateAdminRules, {
      phone: '0911111111',
      password: '123456',
    });

    expect(result.isEmpty()).toBe(false);
    expect(result.array().some((error: any) => error.path === 'phone')).toBe(true);
    expect(result.array().some((error: any) => error.path === 'password')).toBe(true);
  });

  it('changeAdminPasswordRules يرفض تغيير كلمة المرور الثابتة', async () => {
    const result = await runValidation(changeAdminPasswordRules, {
      current_password: SINGLE_ADMIN_PASSWORD,
      new_password: '654321',
    });

    expect(result.isEmpty()).toBe(false);
  });
});

describe('AdminAuthService Singleton Login', () => {
  beforeEach(() => {
    mockedAdminRepository.findByEmailOrPhone.mockReset();
    mockedAdminRepository.isSingleAdminLoginInput.mockReset();
    mockedAdminRepository.updateLastLogin.mockReset();
    mockedAdminRepository.sequelize.query.mockReset();
    process.env.JWT_SECRET = 'admin-singleton-test-secret';
  });

  it('يسمح بتسجيل دخول الحساب الإداري الوحيد', async () => {
    mockedAdminRepository.isSingleAdminLoginInput.mockReturnValue(true);
    (mockedAdminRepository.findByEmailOrPhone as any).mockResolvedValue({
      id: 'admin-1',
      full_name: 'المدير العام',
      email: SINGLE_ADMIN_EMAIL,
      phone: SINGLE_ADMIN_PHONE,
      password: await bcrypt.hash(SINGLE_ADMIN_PASSWORD, 8),
      role: 'super_admin',
      is_active: true,
      toJSON() {
        return { ...this };
      },
    });
    (mockedAdminRepository.updateLastLogin as any).mockResolvedValue(undefined);

    const result = await adminAuthService.login({
      email: SINGLE_ADMIN_PHONE,
      password: SINGLE_ADMIN_PASSWORD,
    });

    expect(result.user).toMatchObject({
      id: 'admin-1',
      email: SINGLE_ADMIN_EMAIL,
      phone: SINGLE_ADMIN_PHONE,
      role: 'super_admin',
    });
    expect((result.user as Record<string, unknown>).password).toBeUndefined();
    expect(typeof result.token).toBe('string');
  });

  it('يرفض أي محاولة دخول ببيانات مختلفة عن الحساب الثابت', async () => {
    mockedAdminRepository.isSingleAdminLoginInput.mockReturnValue(false);

    await expect(
      adminAuthService.login({
        email: '0919999999',
        password: SINGLE_ADMIN_PASSWORD,
      })
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(mockedAdminRepository.findByEmailOrPhone).not.toHaveBeenCalled();
  });
});

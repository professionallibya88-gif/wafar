import { describe, expect, it } from 'vitest';
import {
  buildLoginRedirect,
  getPostAdminAuthRedirect,
  getPostAuthRedirect,
  normalizeRedirectPath,
} from './authRedirect';

describe('authRedirect utils', () => {
  it('يعيد الوجهة الافتراضية عند تمرير قيمة غير صالحة', () => {
    expect(normalizeRedirectPath('https://example.com')).toBe('/');
    expect(normalizeRedirectPath('//evil.test')).toBe('/');
    expect(normalizeRedirectPath(null, '/fallback')).toBe('/fallback');
  });

  it('يمنع إعادة توجيه الإدارة إلى مسارات غير إدارية', () => {
    expect(getPostAdminAuthRedirect('/admin/settings')).toBe('/admin/settings');
    expect(getPostAdminAuthRedirect('/profile')).toBe('/admin');
  });

  it('يبني رابط الدخول مع الاحتفاظ بالوجهة الداخلية فقط', () => {
    expect(buildLoginRedirect('/payments')).toEqual({
      path: '/login',
      query: { redirect: '/payments' },
    });

    expect(buildLoginRedirect('https://bad.test')).toEqual({
      path: '/login',
      query: {},
    });
  });

  it('يختار وجهة الإدارة أو المستخدم حسب الدور', () => {
    expect(getPostAuthRedirect({ isAdmin: true }, '/admin/users')).toBe('/admin/users');
    expect(getPostAuthRedirect({ isAdmin: false }, '/profile')).toBe('/profile');
  });
});

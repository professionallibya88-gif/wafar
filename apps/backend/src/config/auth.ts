/**
 * توحيد قراءة سر JWT في مكان واحد لتفادي اختلاف السلوك بين
 * المصادقة بالرمز المميز وتهيئة الجلسات.
 */
import { ValidationError } from '../errors';

type AuthSecretSource = 'JWT_SECRET' | 'SESSION_SECRET';

const getJwtSecretSource = (): AuthSecretSource | null => {
  if (process.env.JWT_SECRET?.trim()) {
    return 'JWT_SECRET';
  }

  if (process.env.SESSION_SECRET?.trim()) {
    return 'SESSION_SECRET';
  }

  return null;
};

const getJwtSecret = () => {
  const source = getJwtSecretSource();

  if (source === 'JWT_SECRET') {
    return process.env.JWT_SECRET!.trim();
  }

  if (source === 'SESSION_SECRET') {
    return process.env.SESSION_SECRET!.trim();
  }

  throw new ValidationError('يجب ضبط JWT_SECRET أو SESSION_SECRET لتفعيل المصادقة');
};

const validateAuthConfig = (logger?: { warn: (_msg: string) => void }) => {
  const source = getJwtSecretSource();

  if (!source) {
    throw new ValidationError('تعذر تشغيل المصادقة: JWT_SECRET و SESSION_SECRET غير مضبوطين');
  }

  if (source === 'SESSION_SECRET' && logger) {
    logger.warn('JWT_SECRET غير مضبوط، سيتم استخدام SESSION_SECRET مؤقتاً للمصادقة');
  }

  return source;
};

export { getJwtSecret, getJwtSecretSource, validateAuthConfig };

/**
 * الصنف الأساسي لجميع أخطاء التطبيق
 * يرث من Error ويضيف حقل statusCode ورسائل مترجمة
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  details: unknown;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details: unknown = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * خطأ التحقق من البيانات (400)
 */
export class ValidationError extends AppError {
  constructor(message = 'خطأ في التحقق من البيانات', details: unknown = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * خطأ عدم المصادقة (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'غير مصرح بالدخول') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * خطأ عدم الصلاحية (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'ليس لديك صلاحية الوصول إلى هذا المورد') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * خطأ المورد غير موجود (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'المورد المطلوب غير موجود') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * خطأ التعارض في البيانات (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'تعارض في البيانات') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * خطأ تجاوز معدل الطلبات (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'تم تجاوز عدد الطلبات المسموح به') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * خطأ خدمة خارجية (502)
 */
export class ExternalServiceError extends AppError {
  constructor(message = 'خطأ في خدمة خارجية', details: unknown = null) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

/**
 * خطأ عمليات الأعمال (422)
 */
export class BusinessError extends AppError {
  constructor(message = 'خطأ في عمليات الأعمال', details: unknown = null) {
    super(message, 422, 'BUSINESS_ERROR', details);
  }
}

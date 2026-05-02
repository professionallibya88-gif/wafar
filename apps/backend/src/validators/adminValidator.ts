import { body } from 'express-validator';

/**
 * قواعد التحقق لمصادقة المديرين
 */
export const adminLoginRules = [
  body('email').trim().notEmpty().withMessage('البريد الإلكتروني أو رقم الهاتف مطلوب'),
  body('password').trim().notEmpty().withMessage('كلمة المرور مطلوبة'),
];

export const updateAdminProfileRules = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('الاسم لا يمكن أن يكون فارغاً')
    .isLength({ min: 3, max: 200 })
    .withMessage('الاسم يجب أن يكون بين 3 و 200 حرف'),
  body('email').optional().trim().isEmail().withMessage('البريد الإلكتروني غير صالح'),
];

export const changeAdminPasswordRules = [
  body('current_password').notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
  body('new_password')
    .isLength({ min: 6, max: 100 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
];

/**
 * قواعد التحقق لعمليات الإدارة
 */
export const createPlanRules = [
  body('name').trim().notEmpty().withMessage('اسم الباقة مطلوب'),
  body('name_ar').trim().notEmpty().withMessage('اسم الباقة بالعربية مطلوب'),
  body('plan_type')
    .optional()
    .isIn(['free', 'basic', 'professional', 'enterprise', 'custom'])
    .withMessage('نوع الباقة غير صالح'),
  body('color_hex')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('لون الباقة يجب أن يكون بصيغة HEX'),
  body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقماً موجباً'),
  body('duration_days').isInt({ min: 0 }).withMessage('مدة الباقة يجب أن تكون صفراً أو أكثر'),
  body('currency').optional().isIn(['LYD', 'USD']).withMessage('العملة غير صالحة'),
  body('max_searches_per_day')
    .optional()
    .isInt({ min: 0 })
    .withMessage('عدد البحث يجب أن يكون رقماً موجباً'),
  body('max_pdf_uploads')
    .optional()
    .isInt({ min: 0 })
    .withMessage('عدد الملفات يجب أن يكون رقماً موجباً'),
  body('max_comparisons_per_day')
    .optional()
    .isInt({ min: 0 })
    .withMessage('عدد المقارنات يجب أن يكون رقماً موجباً'),
  body('allowed_roles')
    .optional()
    .isArray({ min: 1 })
    .withMessage('الأدوار المسموح بها يجب أن تكون قائمة'),
  body('allowed_roles.*')
    .optional()
    .isIn(['admin', 'retailer', 'supplier'])
    .withMessage('الدور المسموح به غير صالح'),
  body('permissions').optional().isObject().withMessage('الصلاحيات يجب أن تكون كائناً'),
  body('permissions.compare_parts')
    .optional()
    .isBoolean()
    .withMessage('صلاحية المقارنة يجب أن تكون قيمة منطقية'),
  body('permissions.export_results')
    .optional()
    .isBoolean()
    .withMessage('صلاحية التصدير يجب أن تكون قيمة منطقية'),
  body('permissions.upload_pdf')
    .optional()
    .isBoolean()
    .withMessage('صلاحية رفع الملفات يجب أن تكون قيمة منطقية'),
  body('permissions.view_saved_searches')
    .optional()
    .isBoolean()
    .withMessage('صلاحية السجل المحفوظ يجب أن تكون قيمة منطقية'),
  body('permissions.priority_support')
    .optional()
    .isBoolean()
    .withMessage('صلاحية الدعم المميز يجب أن تكون قيمة منطقية'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون قيمة منطقية'),
];

export const updatePlanRules = [
  body('name').optional().trim().notEmpty().withMessage('اسم الباقة لا يمكن أن يكون فارغاً'),
  body('name_ar')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('اسم الباقة بالعربية لا يمكن أن يكون فارغاً'),
  body('plan_type')
    .optional()
    .isIn(['free', 'basic', 'professional', 'enterprise', 'custom'])
    .withMessage('نوع الباقة غير صالح'),
  body('color_hex')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('لون الباقة يجب أن يكون بصيغة HEX'),
  body('price').optional().isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقماً موجباً'),
  body('duration_days').optional().isInt({ min: 0 }).withMessage('مدة الباقة غير صالحة'),
  body('max_searches_per_day')
    .optional()
    .isInt({ min: 0 })
    .withMessage('عدد البحث يجب أن يكون رقماً موجباً'),
  body('max_pdf_uploads')
    .optional()
    .isInt({ min: 0 })
    .withMessage('عدد الملفات يجب أن يكون رقماً موجباً'),
  body('max_comparisons_per_day')
    .optional()
    .isInt({ min: 0 })
    .withMessage('عدد المقارنات يجب أن يكون رقماً موجباً'),
  body('allowed_roles')
    .optional()
    .isArray({ min: 1 })
    .withMessage('الأدوار المسموح بها يجب أن تكون قائمة'),
  body('allowed_roles.*')
    .optional()
    .isIn(['admin', 'retailer', 'supplier'])
    .withMessage('الدور المسموح به غير صالح'),
  body('permissions').optional().isObject().withMessage('الصلاحيات يجب أن تكون كائناً'),
  body('permissions.compare_parts')
    .optional()
    .isBoolean()
    .withMessage('صلاحية المقارنة يجب أن تكون قيمة منطقية'),
  body('permissions.export_results')
    .optional()
    .isBoolean()
    .withMessage('صلاحية التصدير يجب أن تكون قيمة منطقية'),
  body('permissions.upload_pdf')
    .optional()
    .isBoolean()
    .withMessage('صلاحية رفع الملفات يجب أن تكون قيمة منطقية'),
  body('permissions.view_saved_searches')
    .optional()
    .isBoolean()
    .withMessage('صلاحية السجل المحفوظ يجب أن تكون قيمة منطقية'),
  body('permissions.priority_support')
    .optional()
    .isBoolean()
    .withMessage('صلاحية الدعم المميز يجب أن تكون قيمة منطقية'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون قيمة منطقية'),
];

export const approvePaymentRules = [
  body('admin_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('ملاحظات الإدارة يجب أن تكون 500 حرف كحد أقصى'),
];

export const rejectPaymentRules = [
  body('admin_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('ملاحظات الإدارة يجب أن تكون 500 حرف كحد أقصى'),
];

export const updateUserRules = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('الاسم لا يمكن أن يكون فارغاً')
    .isLength({ min: 3, max: 200 })
    .withMessage('الاسم يجب أن يكون بين 3 و 200 حرف'),
  body('phone').optional().trim().notEmpty().withMessage('رقم الهاتف لا يمكن أن يكون فارغاً'),
  body('password')
    .optional()
    .isLength({ min: 6, max: 100 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role').optional().isIn(['retailer', 'supplier']).withMessage('نوع الحساب غير صالح'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون قيمة منطقية'),
];

export const createAdminRules = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('الاسم لا يمكن أن يكون فارغاً')
    .isLength({ min: 3, max: 200 })
    .withMessage('الاسم يجب أن يكون بين 3 و 200 حرف'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('رقم الهاتف غير صالح'),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('يجب إدخال البريد الإلكتروني أو رقم الهاتف');
    }
    return true;
  }),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'editor', 'viewer'])
    .withMessage('الدور الإداري غير صالح'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون قيمة منطقية'),
];

export const updateAdminRules = [
  body('full_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('الاسم لا يمكن أن يكون فارغاً')
    .isLength({ min: 3, max: 200 })
    .withMessage('الاسم يجب أن يكون بين 3 و 200 حرف'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('رقم الهاتف غير صالح'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6, max: 100 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'editor', 'viewer'])
    .withMessage('الدور الإداري غير صالح'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون قيمة منطقية'),
];

export const createPartRules = [
  body('part_name').trim().notEmpty().withMessage('اسم القطعة مطلوب'),
  body('quality_grade')
    .optional()
    .isIn(['original', 'high', 'medium', 'low', 'unspecified'])
    .withMessage('درجة الجودة غير صالحة'),
  body('currency').optional().trim().isLength({ min: 3, max: 10 }).withMessage('العملة غير صالحة'),
  body('supplier_id').optional({ nullable: true }).isUUID().withMessage('معرف المورد غير صالح'),
  body('in_stock').optional().isBoolean().withMessage('حالة التوفر يجب أن تكون قيمة منطقية'),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('السعر غير صالح'),
  body('price_cash')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر النقد غير صالح'),
  body('price_bank')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر المصرف غير صالح'),
  body('price_wholesale')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر الجملة غير صالح'),
  body('price_wholesale_small')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر نصف الجملة غير صالح'),
  body('quantity_available')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('الكمية المتاحة غير صالحة'),
];

export const updatePartRules = [
  body('part_name').optional().trim().notEmpty().withMessage('اسم القطعة لا يمكن أن يكون فارغاً'),
  body('quality_grade')
    .optional()
    .isIn(['original', 'high', 'medium', 'low', 'unspecified'])
    .withMessage('درجة الجودة غير صالحة'),
  body('currency').optional().trim().isLength({ min: 3, max: 10 }).withMessage('العملة غير صالحة'),
  body('supplier_id').optional({ nullable: true }).isUUID().withMessage('معرف المورد غير صالح'),
  body('in_stock').optional().isBoolean().withMessage('حالة التوفر يجب أن تكون قيمة منطقية'),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('السعر غير صالح'),
  body('price_cash')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر النقد غير صالح'),
  body('price_bank')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر المصرف غير صالح'),
  body('price_wholesale')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر الجملة غير صالح'),
  body('price_wholesale_small')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('سعر نصف الجملة غير صالح'),
  body('quantity_available')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('الكمية المتاحة غير صالحة'),
];

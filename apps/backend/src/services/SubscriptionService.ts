import { subscriptionRepository, subscriptionPlanRepository } from '../repositories';
import { NotFoundError } from '../errors';

type SubscriptionPlanRole = 'admin' | 'retailer' | 'supplier';
type SubscriptionPlanType = 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
type SubscriptionPlanPermissions = {
  compare_parts: boolean;
  export_results: boolean;
  upload_pdf: boolean;
  view_saved_searches: boolean;
  priority_support: boolean;
};

interface SubscriptionPlanRecord {
  get(_options: { plain: true }): Record<string, any>;
}

const DEFAULT_PLAN_PERMISSIONS: SubscriptionPlanPermissions = {
  compare_parts: false,
  export_results: false,
  upload_pdf: true,
  view_saved_searches: true,
  priority_support: false,
};

const DEFAULT_ALLOWED_ROLES: SubscriptionPlanRole[] = ['retailer', 'supplier'];
const DEFAULT_PLAN_COLORS: Record<SubscriptionPlanType, string> = {
  free: '#64748B',
  basic: '#2563EB',
  professional: '#7C3AED',
  enterprise: '#0F766E',
  custom: '#EA580C',
};

type PlanPayload = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizePlanType = (value: unknown, price?: unknown): SubscriptionPlanType => {
  const allowedTypes: SubscriptionPlanType[] = [
    'free',
    'basic',
    'professional',
    'enterprise',
    'custom',
  ];
  if (typeof value === 'string' && allowedTypes.includes(value as SubscriptionPlanType)) {
    return value as SubscriptionPlanType;
  }

  return Number(price) === 0 ? 'free' : 'basic';
};

const normalizeColorHex = (value: unknown, planType: SubscriptionPlanType): string => {
  if (typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value.toUpperCase();
  }

  return DEFAULT_PLAN_COLORS[planType];
};

const normalizeAllowedRoles = (value: unknown): SubscriptionPlanRole[] => {
  const allowedRoles: SubscriptionPlanRole[] = ['admin', 'retailer', 'supplier'];
  if (!Array.isArray(value)) {
    return DEFAULT_ALLOWED_ROLES;
  }

  const roles = value.filter(
    (role): role is SubscriptionPlanRole =>
      typeof role === 'string' && allowedRoles.includes(role as SubscriptionPlanRole)
  );

  return roles.length > 0 ? roles : DEFAULT_ALLOWED_ROLES;
};

const normalizePermissions = (source: PlanPayload): SubscriptionPlanPermissions => {
  const inputPermissions = isPlainObject(source.permissions) ? source.permissions : {};

  return {
    compare_parts:
      typeof inputPermissions.compare_parts === 'boolean'
        ? inputPermissions.compare_parts
        : Boolean(source.can_compare),
    export_results:
      typeof inputPermissions.export_results === 'boolean'
        ? inputPermissions.export_results
        : Boolean(source.can_export),
    upload_pdf:
      typeof inputPermissions.upload_pdf === 'boolean' ? inputPermissions.upload_pdf : true,
    view_saved_searches:
      typeof inputPermissions.view_saved_searches === 'boolean'
        ? inputPermissions.view_saved_searches
        : true,
    priority_support:
      typeof inputPermissions.priority_support === 'boolean'
        ? inputPermissions.priority_support
        : false,
  };
};

const normalizePlanPayload = (input: PlanPayload): PlanPayload => {
  const normalized: PlanPayload = { ...input };

  if (typeof normalized.name_en === 'string' && typeof normalized.name !== 'string') {
    normalized.name = normalized.name_en.trim();
  }

  if (typeof normalized.name === 'string') {
    normalized.name = normalized.name.trim();
  }

  if (typeof normalized.name_ar === 'string') {
    normalized.name_ar = normalized.name_ar.trim();
  }

  if (typeof normalized.description === 'string') {
    normalized.description = normalized.description.trim();
  }

  if (normalized.max_pdf_files !== undefined && normalized.max_pdf_uploads === undefined) {
    normalized.max_pdf_uploads = normalized.max_pdf_files;
  }

  if (normalized.max_files !== undefined && normalized.max_pdf_uploads === undefined) {
    normalized.max_pdf_uploads = normalized.max_files;
  }

  if (normalized.max_searches !== undefined && normalized.max_searches_per_day === undefined) {
    normalized.max_searches_per_day = normalized.max_searches;
  }

  const planType = normalizePlanType(normalized.plan_type, normalized.price);
  const permissions = normalizePermissions(normalized);

  normalized.plan_type = planType;
  normalized.color_hex = normalizeColorHex(normalized.color_hex, planType);
  normalized.allowed_roles = normalizeAllowedRoles(normalized.allowed_roles);
  normalized.permissions = permissions;
  normalized.can_compare = permissions.compare_parts;
  normalized.can_export = permissions.export_results;

  if (normalized.max_searches_per_day === 0) {
    normalized.max_searches_per_day = null;
  }

  if (normalized.max_pdf_uploads === 0) {
    normalized.max_pdf_uploads = null;
  }

  if (normalized.max_comparisons_per_day === 0) {
    normalized.max_comparisons_per_day = null;
  }

  return normalized;
};

const serializePlan = (plan: SubscriptionPlanRecord) => {
  const data = plan.get({ plain: true });
  const permissions = {
    ...DEFAULT_PLAN_PERMISSIONS,
    ...(isPlainObject(data.permissions) ? data.permissions : {}),
    compare_parts:
      typeof data.can_compare === 'boolean'
        ? data.can_compare
        : DEFAULT_PLAN_PERMISSIONS.compare_parts,
    export_results:
      typeof data.can_export === 'boolean'
        ? data.can_export
        : DEFAULT_PLAN_PERMISSIONS.export_results,
  };

  return {
    ...data,
    name_en: data.name,
    max_pdf_files: data.max_pdf_uploads,
    allowed_roles: normalizeAllowedRoles(data.allowed_roles),
    color_hex: normalizeColorHex(data.color_hex, normalizePlanType(data.plan_type, data.price)),
    plan_type: normalizePlanType(data.plan_type, data.price),
    permissions,
  };
};

/**
 * خدمة الاشتراكات والباقات
 */
export class SubscriptionService {
  /**
   * جلب الباقات النشطة
   */
  async listPlans() {
    const plans = await subscriptionPlanRepository.findActiveOrdered();
    return plans.map(serializePlan);
  }

  /**
   * جلب جميع الباقات للإدارة
   */
  async listAllPlans() {
    const plans = await subscriptionPlanRepository.findAllOrdered();
    return plans.map(serializePlan);
  }

  /**
   * جلب الاشتراك النشط للمستخدم
   */
  async getMyActiveSubscription(userId: any) {
    return subscriptionRepository.findActiveByUser(userId);
  }

  /**
   * جلب جميع اشتراكات المستخدم
   */
  async listMySubscriptions(userId: any) {
    return subscriptionRepository.findAllByUser(userId);
  }

  /**
   * إنشاء باقة (للإدارة)
   */
  async createPlan(data: any) {
    const plan = await subscriptionPlanRepository.create(normalizePlanPayload(data as PlanPayload));
    return serializePlan(plan);
  }

  /**
   * تحديث باقة (للإدارة)
   */
  async updatePlan(id: any, data: any) {
    const plan = await subscriptionPlanRepository.findById(id);
    if (!plan) throw new NotFoundError('الباقة غير موجودة');
    const updatedPlan = await subscriptionPlanRepository.updateById(
      id,
      normalizePlanPayload(data as PlanPayload)
    );
    if (!updatedPlan) throw new NotFoundError('الباقة غير موجودة');
    return serializePlan(updatedPlan);
  }

  /**
   * حذف باقة (للإدارة)
   */
  async deletePlan(id: any) {
    const plan = await subscriptionPlanRepository.findById(id);
    if (!plan) throw new NotFoundError('الباقة غير موجودة');
    await subscriptionPlanRepository.deleteById(id);
  }
}

export const subscriptionService = new SubscriptionService();

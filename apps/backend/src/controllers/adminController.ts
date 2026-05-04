import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created, buildPaginationMeta } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';
import { adminService } from '../services/AdminService';
import { systemStatusService } from '../services/SystemStatusService';
import { userService } from '../services/UserService';
import { supplierService } from '../services/SupplierService';
import { subscriptionService } from '../services/SubscriptionService';
import { paymentService } from '../services/PaymentService';
import { pdfService } from '../services/PDFService';
import { partAdminService } from '../services/PartAdminService';
import MonitoringSystem from '../services/MonitoringSystem';
import PerformanceMonitor from '../services/PerformanceMonitor';
import { AuthenticatedRequest } from '../types';
import { BusinessError, NotFoundError } from '../errors';
import { activityLogService } from '../services/ActivityLogService';

/**
 * إدارة المديرين
 */

/**
 * إحصائيات لوحة التحكم الرئيسية
 */
export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getDashboardStats();
  return success(res, { data });
});

/**
 * إحصائيات النظام الكاملة (Redis + Queue + DB + OS)
 */
export const systemStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await systemStatusService.getSystemStats();
  return success(res, { data });
});

/**
 * مراقبة - metrics
 */
export const monitoringMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const stats = MonitoringSystem.getInstance().getStats();
  return success(res, { data: stats });
});

/**
 * مراقبة - health
 */
export const monitoringHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = MonitoringSystem.getInstance().getHealthStatus();
  return success(res, { data: health });
});

/**
 * مراقبة - أداء
 */
export const monitoringPerformance = asyncHandler(async (req: Request, res: Response) => {
  const timeRange = parseInt(req.query.timeRange as string, 10) || 60000;
  const report = PerformanceMonitor.getInstance().getReport(timeRange);
  return success(res, { data: report });
});

/**
 * إدارة المستخدمين
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const { rows, count } = await userService.listUsers({
    role: req.query.role as string | undefined,
    search: req.query.search as string | undefined,
    limit,
    offset,
  });
  return success(res, {
    data: { users: rows },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.toggleActive(req.params.id as string);
  const message = data.is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب';
  return success(res, { data, message });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string);
  return success(res, { message: 'تم حذف المستخدم بنجاح' });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUserByAdmin(req.params.id as string, req.body);
  return success(res, { data: user, message: 'تم تحديث بيانات المستخدم بنجاح' });
});

/**
 * إدارة المديرين
 */
export const listAdmins = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const { admins, count } = await adminService.listAdmins({
    limit,
    offset,
    search: req.query.search as string | undefined,
  });

  return success(res, {
    data: { admins },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

export const createAdmin = asyncHandler(async (_req: Request, res: Response) => {
  await adminService.createAdmin();
});

export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.params.id as string;
  const data = await adminService.updateAdmin(adminId, req.body);
  return success(res, { data, message: 'تم تحديث بيانات المدير بنجاح' });
});

export const toggleAdminActive = asyncHandler(async (req: Request, _res: Response) => {
  const adminId = req.params.id as string;
  await adminService.toggleAdminActive(adminId);
});

export const deleteAdmin = asyncHandler(async (req: Request, _res: Response) => {
  const adminId = req.params.id as string;
  await adminService.deleteAdmin(adminId);
});

/**
 * إدارة الموردين
 */
export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.create(req.body);
  return created(res, { data: supplier, message: 'تم إنشاء الشركة بنجاح' });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.update(req.params.id as string, req.body);
  return success(res, { data: supplier, message: 'تم تحديث الشركة بنجاح' });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.delete(req.params.id as string);
  return success(res, { message: 'تم حذف الشركة بنجاح' });
});

/**
 * إدارة المدفوعات
 */
export const listAllPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const { rows, count } = await paymentService.listAllPayments({
    status: req.query.status as string | undefined,
    limit,
    offset,
  });
  return success(res, {
    data: { payments: rows },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

export const approvePayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payment = await paymentService.approvePayment(
    req.params.id as string,
    req.admin!.id,
    req.body.admin_notes
  );
  return success(res, { data: payment, message: 'تم قبول الدفعة بنجاح' });
});

export const rejectPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payment = await paymentService.rejectPayment(
    req.params.id as string,
    req.admin!.id,
    req.body.admin_notes
  );
  return success(res, { data: payment, message: 'تم رفض الدفعة' });
});

/**
 * إدارة باقات الاشتراك
 */
export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await subscriptionService.listAllPlans();
  return success(res, { data: plans });
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await subscriptionService.createPlan(req.body);
  return created(res, { data: plan, message: 'تم إنشاء الباقة بنجاح' });
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await subscriptionService.updatePlan(req.params.id as string, req.body);
  return success(res, { data: plan, message: 'تم تحديث الباقة بنجاح' });
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  await subscriptionService.deletePlan(req.params.id as string);
  return success(res, { message: 'تم حذف الباقة بنجاح' });
});

/**
 * جميع ملفات PDF (للإدارة)
 */
export const listAllPDFs = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const result = await pdfService.listAllFiles({
    limit,
    offset,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  });
  const typedResult = result as { rows: unknown[]; count: number };
  return success(res, {
    data: { files: typedResult.rows },
    meta: buildPaginationMeta({ total: typedResult.count, page, limit }),
  });
});

export const reprocessPDF = asyncHandler(async (req: Request, res: Response) => {
  const data = await pdfService.reprocessAnyFile({
    fileId: req.params.id as string,
    method: req.body.method,
  });
  return success(res, { data, message: 'تم بدء إعادة المعالجة بنجاح' });
});

export const deletePDF = asyncHandler(async (req: Request, res: Response) => {
  await pdfService.deleteAnyFile(req.params.id as string);
  return success(res, { message: 'تم حذف الملف بنجاح' });
});

/**
 * إدارة قطع الغيار
 */
export const listParts = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const { rows, count } = await partAdminService.listParts({
    q: req.query.q as string | undefined,
    category: req.query.category as string | undefined,
    brand: req.query.brand as string | undefined,
    quality_grade: req.query.quality_grade as string | undefined,
    supplier_id: req.query.supplier_id as string | undefined,
    min_price: req.query.min_price as string | undefined,
    max_price: req.query.max_price as string | undefined,
    in_stock: req.query.in_stock as string | undefined,
    sortField: req.query.sort_field as string | undefined,
    sortDir: req.query.sort_dir as string | undefined,
    limit,
    offset,
  });

  return success(res, {
    data: { parts: rows },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

export const getPartFilterOptions = asyncHandler(async (_req: Request, res: Response) => {
  const data = await partAdminService.getFilterOptions();
  return success(res, { data });
});

export const createPart = asyncHandler(async (req: Request, res: Response) => {
  const part = await partAdminService.createPart(req.body);
  return created(res, { data: part, message: 'تم إنشاء قطعة الغيار بنجاح' });
});

export const updatePart = asyncHandler(async (req: Request, res: Response) => {
  const part = await partAdminService.updatePart(req.params.id as string, req.body);
  return success(res, { data: part, message: 'تم تحديث قطعة الغيار بنجاح' });
});

export const deletePart = asyncHandler(async (req: Request, res: Response) => {
  await partAdminService.deletePart(req.params.id as string);
  return success(res, { message: 'تم حذف قطعة الغيار بنجاح' });
});

/**
 * سجلات النشاط
 */
export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 100 });
  const { search, action } = req.query;

  const { rows, count } = await activityLogService.getLogs({
    search: search as string,
    action: action as string,
    limit,
    offset,
  });

  return success(res, {
    data: { logs: rows, total: count, totalPages: Math.ceil(count / limit) },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

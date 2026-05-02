import { Router, RequestHandler } from 'express';
import { adminAuth, adminOnly } from '../middleware/auth';
import * as adminController from '../controllers/adminController';
import { supplier as supplierRules, admin as adminRules } from '../validators';
import { runValidators } from '../utils/validate';
import cacheRoutes from './admin/cacheRoutes';
import queueRoutes from './admin/queueRoutes';

const router = Router();

// تطبيق adminAuth + adminOnly على جميع مسارات الإدارة
router.use(adminAuth as unknown as RequestHandler, adminOnly as unknown as RequestHandler);

// الإحصائيات
router.get('/stats', adminController.dashboardStats);
router.get('/system-stats', adminController.systemStats);

// المراقبة
router.get('/monitoring/metrics', adminController.monitoringMetrics);
router.get('/monitoring/health', adminController.monitoringHealth);
router.get('/monitoring/performance', adminController.monitoringPerformance);

// إدارة المستخدمين
router.get('/users', adminController.listUsers);
router.put('/users/:id/toggle-active', adminController.toggleUserActive);
router.put('/users/:id', runValidators(adminRules.updateUserRules), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// إدارة المديرين
router.get('/admins', adminController.listAdmins);
router.post('/admins', runValidators(adminRules.createAdminRules), adminController.createAdmin);
router.put('/admins/:id/toggle-active', adminController.toggleAdminActive);
router.put('/admins/:id', runValidators(adminRules.updateAdminRules), adminController.updateAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

// إدارة الموردين
router.post(
  '/suppliers',
  runValidators(supplierRules.createSupplierRules),
  adminController.createSupplier
);
router.put(
  '/suppliers/:id',
  runValidators(supplierRules.updateSupplierRules),
  adminController.updateSupplier
);
router.delete('/suppliers/:id', adminController.deleteSupplier);

// إدارة المدفوعات
router.get('/payments', adminController.listAllPayments);
router.put(
  '/payments/:id/approve',
  runValidators(adminRules.approvePaymentRules),
  adminController.approvePayment
);
router.put(
  '/payments/:id/reject',
  runValidators(adminRules.rejectPaymentRules),
  adminController.rejectPayment
);

// إدارة باقات الاشتراك
router.get('/plans', adminController.listPlans);
router.post('/plans', runValidators(adminRules.createPlanRules), adminController.createPlan);
router.put('/plans/:id', runValidators(adminRules.updatePlanRules), adminController.updatePlan);
router.delete('/plans/:id', adminController.deletePlan);

// جميع ملفات PDF
router.get('/pdf-files', adminController.listAllPDFs);
router.post('/pdf-files/:id/reprocess', adminController.reprocessPDF);
router.delete('/pdf-files/:id', adminController.deletePDF);

// إدارة قطع الغيار
router.get('/parts', adminController.listParts);
router.get('/parts/filter-options', adminController.getPartFilterOptions);
router.post('/parts', runValidators(adminRules.createPartRules), adminController.createPart);
router.put('/parts/:id', runValidators(adminRules.updatePartRules), adminController.updatePart);
router.delete('/parts/:id', adminController.deletePart);

// سجلات النشاط
router.get('/activity-logs', adminController.getActivityLogs);

// المسارات الفرعية (لها middleware خاص مسبقاً)
router.use('/cache', cacheRoutes);
router.use('/queue', queueRoutes);

export default router;

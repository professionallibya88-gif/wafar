import {
  userRepository,
  supplierRepository,
  partRepository,
  pdfFileRepository,
  paymentRepository,
  subscriptionRepository,
  adminRepository,
} from '../repositories';
import { BusinessError, NotFoundError } from '../errors';

export class AdminService {
  async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalSuppliers,
      totalParts,
      totalPDFs,
      pendingPayments,
      activeSubscriptions,
      newUsers30Days,
      totalRevenue,
    ] = await Promise.all([
      userRepository.count({ role: 'retailer' }),
      supplierRepository.count(),
      partRepository.count(),
      pdfFileRepository.count(),
      paymentRepository.count({ status: 'pending' }),
      subscriptionRepository.count({ status: 'active' }),
      userRepository.countNewSince(thirtyDaysAgo, { role: 'retailer' }),
      paymentRepository.sumApprovedRevenue(),
    ]);

    return {
      totalUsers,
      totalSuppliers,
      totalParts,
      totalPDFs,
      pendingPayments,
      activeSubscriptions,
      newUsers30Days,
      totalRevenue,
    };
  }

  async getDatabaseStats() {
    const counts = await Promise.all([
      userRepository.count(),
      supplierRepository.count(),
      partRepository.count(),
      pdfFileRepository.count(),
      paymentRepository.count(),
      subscriptionRepository.count({ status: 'active' }),
    ]);

    const [totalUsers, totalSuppliers, totalParts, totalPDFs, totalPayments, activeSubscriptions] =
      counts;

    return {
      totalUsers,
      totalSuppliers,
      totalParts,
      totalPDFs,
      totalPayments,
      activeSubscriptions,
    };
  }

  async listAdmins(options: { limit: number; offset: number; search?: string }) {
    const { rows, count } = await adminRepository.searchWithPagination({
      role: 'super_admin',
      search: options.search,
      limit: options.limit,
      offset: options.offset,
    });

    const safeRows = rows.map((admin) => {
      const data = admin.toJSON();
      delete data.password;
      return data;
    });

    return { admins: safeRows, count };
  }

  async createAdmin() {
    throw new BusinessError(
      'تم تعطيل إنشاء المديرين يدوياً لأن النظام يدعم حساب super_admin واحد فقط'
    );
  }

  async updateAdmin(adminId: string, payload: any) {
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    if (admin.role !== 'super_admin') {
      throw new BusinessError('يمكن تعديل حساب super_admin الوحيد فقط');
    }

    const forbiddenFields = ['email', 'phone', 'password', 'role', 'is_active'].filter((field) =>
      Object.prototype.hasOwnProperty.call(payload, field)
    );
    if (forbiddenFields.length > 0) {
      throw new BusinessError('يمكن تحديث الاسم الكامل فقط. بيانات الدخول وحالة الحساب ثابتة');
    }

    const updates: any = {};
    if (payload.full_name !== undefined) {
      updates.full_name = payload.full_name;
    }

    const updatedAdmin =
      Object.keys(updates).length > 0 ? await adminRepository.updateById(adminId, updates) : admin;
    if (!updatedAdmin) {
      throw new NotFoundError('المدير غير موجود');
    }
    
    const data = updatedAdmin.toJSON();
    delete data.password;

    return data;
  }

  async toggleAdminActive(adminId: string) {
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    if (admin.role !== 'super_admin') {
      throw new BusinessError('تم تعطيل إدارة الحسابات الإدارية القديمة');
    }

    throw new BusinessError('لا يمكن تعطيل أو تفعيل حساب super_admin الوحيد');
  }

  async deleteAdmin(adminId: string) {
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    if (admin.role !== 'super_admin') {
      throw new BusinessError('تم تعطيل إدارة الحسابات الإدارية القديمة');
    }

    throw new BusinessError('لا يمكن حذف حساب super_admin الوحيد');
  }
}

export const adminService = new AdminService();

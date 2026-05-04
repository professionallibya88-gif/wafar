import {
  userRepository,
  supplierRepository,
  partRepository,
  pdfFileRepository,
  paymentRepository,
  subscriptionRepository,
  adminRepository,
} from '../repositories';
import {} from // Removed single admin configs
'../repositories/AdminRepository';
import { BusinessError, NotFoundError } from '../errors';
import bcrypt from 'bcryptjs';
import type { AdminAttributes } from '../database/models/Admin';

type AdminRole = AdminAttributes['role'];

type CreateAdminPayload = {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  role?: AdminRole;
};

type UpdateAdminPayload = {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: AdminRole;
  is_active?: boolean;
};

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

  async createAdmin(payload: CreateAdminPayload) {
    if (payload.email) {
      const existingEmail = await adminRepository.findByEmail(payload.email);
      if (existingEmail) throw new BusinessError('البريد الإلكتروني مسجل مسبقا');
    }

    if (payload.phone) {
      const existingPhone = await adminRepository.findByPhone(payload.phone);
      if (existingPhone) throw new BusinessError('رقم الهاتف مسجل مسبقا');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const admin = await adminRepository.create({
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      password: hashedPassword,
      role: payload.role || 'admin',
      is_active: true,
    } as never);

    const data = admin.toJSON();
    delete data.password;

    return data;
  }

  async updateAdmin(adminId: string, payload: UpdateAdminPayload) {
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    if (payload.email && payload.email !== admin.email) {
      const existingEmail = await adminRepository.findByEmail(payload.email);
      if (existingEmail) throw new BusinessError('البريد الإلكتروني مسجل مسبقا');
    }

    if (payload.phone && payload.phone !== admin.phone) {
      const existingPhone = await adminRepository.findByPhone(payload.phone);
      if (existingPhone) throw new BusinessError('رقم الهاتف مسجل مسبقا');
    }

    const updates: UpdateAdminPayload = {};
    if (payload.full_name !== undefined) updates.full_name = payload.full_name;
    if (payload.email !== undefined) updates.email = payload.email;
    if (payload.phone !== undefined) updates.phone = payload.phone;
    if (payload.role !== undefined) updates.role = payload.role;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;

    if (payload.password) {
      updates.password = await bcrypt.hash(payload.password, 10);
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

    if (admin.role === 'super_admin') {
      throw new BusinessError('لا يمكن تعطيل حساب super_admin');
    }

    await adminRepository.updateById(adminId, { is_active: !admin.is_active });
  }

  async deleteAdmin(adminId: string) {
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError('المدير غير موجود');
    }

    if (admin.role === 'super_admin') {
      throw new BusinessError('لا يمكن حذف حساب super_admin');
    }

    await adminRepository.deleteById(adminId);
  }
}

export const adminService = new AdminService();

import {
  userRepository,
  supplierRepository,
  partRepository,
  pdfFileRepository,
  paymentRepository,
  subscriptionRepository,
} from '../repositories';

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
}

export const adminService = new AdminService();

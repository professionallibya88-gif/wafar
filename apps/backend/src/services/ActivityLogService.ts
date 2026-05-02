import ActivityLogRepository from '../repositories/ActivityLogRepository';

class ActivityLogService {
  /**
   * جلب سجلات النشاط مع دعم الفلترة والترقيم
   */
  public async getLogs(options: {
    search?: string;
    action?: string;
    limit: number;
    offset: number;
  }) {
    const { search, action, limit, offset } = options;
    return await ActivityLogRepository.findWithFilters({
      search,
      action,
      limit,
      offset,
    });
  }

  /**
   * إضافة سجل نشاط جديد
   */
  public async logActivity(data: {
    user_id?: string;
    admin_id?: string;
    user_name: string;
    user_email: string;
    action: string;
    description?: string;
    ip_address?: string;
  }) {
    return await ActivityLogRepository.create(data);
  }
}

export const activityLogService = new ActivityLogService();

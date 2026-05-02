import { BaseRepository } from './BaseRepository';
import { ActivityLog } from '../database/models';
import { Op } from 'sequelize';

export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor() {
    super(ActivityLog);
  }

  /**
   * بناء شروط البحث المخصصة للسجلات
   */
  protected buildWhereFromFilters(filters: any = {}): any {
    const where: any = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.search) {
      where[Op.or] = [
        { action: { [Op.iLike]: `%${filters.search}%` } },
        { entity_type: { [Op.iLike]: `%${filters.search}%` } },
        { ip_address: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return where;
  }

  public async findWithFilters(options: {
    search?: string;
    action?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: ActivityLog[]; count: number }> {
    const where = this.buildWhereFromFilters({ search: options.search, action: options.action });

    return this.model.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: options.limit,
      offset: options.offset,
    });
  }
}

export default new ActivityLogRepository();

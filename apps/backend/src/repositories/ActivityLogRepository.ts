import { BaseRepository } from './BaseRepository';
import { ActivityLog } from '../database/models';
import type { ActivityLogAttributes } from '../database/models/ActivityLog';
import { Op, WhereOptions } from 'sequelize';

type ActivityLogFilters = {
  action?: string;
  search?: string;
};

export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor() {
    super(ActivityLog);
  }

  /**
   * بناء شروط البحث المخصصة للسجلات
   */
  protected buildWhereFromFilters(
    filters: ActivityLogFilters = {}
  ): WhereOptions<ActivityLogAttributes> {
    const where: WhereOptions<ActivityLogAttributes> = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.search) {
      Object.assign(where, {
        [Op.or]: [
          { action: { [Op.iLike]: `%${filters.search}%` } },
          { entity_type: { [Op.iLike]: `%${filters.search}%` } },
          { ip_address: { [Op.iLike]: `%${filters.search}%` } },
        ],
      } as WhereOptions<ActivityLogAttributes>);
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

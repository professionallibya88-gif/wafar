import { BaseRepository } from './BaseRepository';
import { Supplier, SupplierAttributes } from '../database/models/Supplier';
import { Op } from 'sequelize';

export type SupplierRecord = Supplier;
export { SupplierAttributes };

export class SupplierRepository extends BaseRepository<Supplier> {
  constructor() {
    super(Supplier);
  }

  async findActiveWithPagination(options: {
    category?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: Supplier[]; count: number }> {
    const { category, limit, offset } = options;
    const where: any = { is_active: true };
    if (category) where.category = category;

    return this.model.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset,
    });
  }

  async findByName(name: string, userId?: string): Promise<Supplier | null> {
    const normalizedName = name.trim();
    const where = userId
      ? {
          name: normalizedName,
          [Op.or]: [{ user_id: userId }, { user_id: null }],
        }
      : { name: normalizedName };

    return this.findOne(where);
  }
}

export const supplierRepository = new SupplierRepository();

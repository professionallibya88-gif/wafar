import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Admin } from '../database/models/Admin';

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.model.findOne({ where: { email } });
  }

  async findByIdSafe(id: string): Promise<Admin | null> {
    return this.model.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  async searchWithPagination(options: {
    role?: string;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: Admin[]; count: number }> {
    const { role, search, limit, offset } = options;
    const where: any = {};

    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return this.model.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async findAllActive(): Promise<Admin[]> {
    return this.model.findAll({ where: { is_active: true } });
  }
}

export const adminRepository = new AdminRepository();

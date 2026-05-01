import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { User } from '../database/models/User';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.model.findOne({ where: { phone } });
  }

  async findByIdSafe(id: string): Promise<User | null> {
    return this.model.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  async searchWithPagination(options: {
    role?: string;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: User[]; count: number }> {
    const { role, search, limit, offset } = options;
    const where: any = {};

    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
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

  async findAllActive(): Promise<User[]> {
    return this.model.findAll({ where: { is_active: true } });
  }

  async countNewSince(date: Date, where: Record<string, unknown> = {}): Promise<number> {
    return this.model.count({
      where: { ...where, created_at: { [Op.gte]: date } },
    });
  }
}

export const userRepository = new UserRepository();

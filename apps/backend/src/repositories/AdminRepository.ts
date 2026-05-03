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

  async findByEmailOrPhone(input: string): Promise<Admin | null> {
    try {
      return await this.model.findOne({
        where: {
          [Op.or]: [{ email: input }, { phone: input }, { email: `${input}@waffer.local` }],
        },
      });
    } catch (error) {
      // إذا فشل الاستعلام بسبب عدم وجود عمود phone في الإنتاج
      try {
        const [results]: any = await this.model.sequelize!.query(
          `SELECT * FROM admins WHERE email = :input OR email = :localEmail LIMIT 1`,
          {
            replacements: { input, localEmail: `${input}@waffer.local` },
          }
        );
        if (results && results.length > 0) {
          const adminData = results[0];
          // تمرير البيانات بدون حقل phone إذا كان غير موجود لمنع أخطاء ORM لاحقاً
          return this.model.build(adminData, { isNewRecord: false });
        }
        return null;
      } catch (sqlError) {
        throw sqlError;
      }
    }
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

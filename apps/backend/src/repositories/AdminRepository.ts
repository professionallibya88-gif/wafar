import { Op, QueryTypes, Transaction, WhereOptions } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Admin, AdminAttributes, AdminCreationAttributes } from '../database/models/Admin';

export const SINGLE_ADMIN_PHONE = '0910000000';
export const SINGLE_ADMIN_PASSWORD = '000000';
export const SINGLE_ADMIN_EMAIL = `${SINGLE_ADMIN_PHONE}@waffer.local`;
export const SINGLE_ADMIN_FULL_NAME = 'المدير العام';

type AdminLookupRow = Partial<
  Pick<AdminAttributes, 'id' | 'full_name' | 'email' | 'phone' | 'password'>
>;

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super(Admin);
  }

  normalizeLoginInput(input: string): string {
    return String(input || '')
      .trim()
      .toLowerCase();
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.model.findOne({ where: { email: this.normalizeLoginInput(email) } });
  }

  async findByPhone(phone: string): Promise<Admin | null> {
    return this.model.findOne({ where: { phone: this.normalizeLoginInput(phone) } });
  }

  async findByEmailOrPhone(input: string): Promise<Admin | null> {
    const normalizedInput = this.normalizeLoginInput(input);

    try {
      return await this.model.findOne({
        where: {
          [Op.or]: [{ email: normalizedInput }, { phone: normalizedInput }],
          is_active: true,
        },
      });
    } catch (error) {
      // Fallback for raw query if 'phone' column doesn't exist yet
      try {
        const results = await this.model.sequelize!.query<AdminLookupRow>(
          `SELECT * FROM admins
           WHERE is_active = true
             AND (email = :input OR phone = :input)
           ORDER BY created_at ASC
           LIMIT 1`,
          {
            replacements: { input: normalizedInput },
            type: QueryTypes.SELECT,
          }
        );
        if (results && results.length > 0) {
          const adminData = results[0];
          return this.model.build(adminData as AdminCreationAttributes, { isNewRecord: false });
        }
      } catch (innerError) {
        // Ultimate fallback: check only email if phone completely fails
        const results = await this.model.sequelize!.query<AdminLookupRow>(
          `SELECT * FROM admins
           WHERE is_active = true
             AND email = :input
           ORDER BY created_at ASC
           LIMIT 1`,
          {
            replacements: { input: normalizedInput },
            type: QueryTypes.SELECT,
          }
        );
        if (results && results.length > 0) {
          const adminData = results[0];
          return this.model.build(adminData as AdminCreationAttributes, { isNewRecord: false });
        }
      }
      return null;
    }
  }

  async enforceSingleAdmin(
    password: string,
    options: { transaction?: unknown } = {}
  ): Promise<{ admin: Admin; cleanedCount: number; created: boolean }> {
    try {
      const transaction = options.transaction as Transaction | undefined;
      const admins = await this.model.findAll({
        order: [['created_at', 'ASC']],
        transaction,
      });

      let singleAdmin =
        admins.find(
          (admin) =>
            this.normalizeLoginInput(admin.phone || '') === SINGLE_ADMIN_PHONE ||
            this.normalizeLoginInput(admin.email || '') === SINGLE_ADMIN_EMAIL
        ) ||
        admins.find((admin) => admin.role === 'super_admin') ||
        admins[0] ||
        null;

      let created = false;

      if (singleAdmin) {
        // Only update if it's the specific seeded admin, otherwise leave alone
        if (singleAdmin.email === SINGLE_ADMIN_EMAIL) {
          await singleAdmin.update(
            {
              full_name: SINGLE_ADMIN_FULL_NAME,
              password,
              role: 'super_admin',
              is_active: true,
            },
            { transaction }
          );
        }
      } else {
        singleAdmin = await this.model.create(
          {
            full_name: SINGLE_ADMIN_FULL_NAME,
            email: SINGLE_ADMIN_EMAIL,
            phone: SINGLE_ADMIN_PHONE,
            password,
            role: 'super_admin',
            is_active: true,
          } as never,
          { transaction }
        );
        created = true;
      }

      return { admin: singleAdmin, cleanedCount: 0, created };
    } catch (error) {
      // Return a dummy object if DB doesn't exist yet, avoiding crashing migrations
      return { admin: this.model.build(), cleanedCount: 0, created: false };
    }
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await this.model.sequelize!.query(`UPDATE admins SET last_login = NOW() WHERE id = :id`, {
      replacements: { id: adminId },
    });
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
    const where: WhereOptions<AdminAttributes> = {};

    if (role) where.role = role;
    if (search) {
      Object.assign(where, {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
        ],
      } as WhereOptions<AdminAttributes>);
    }

    return this.model.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }
}

export const adminRepository = new AdminRepository();

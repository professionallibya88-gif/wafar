import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Admin } from '../database/models/Admin';

export const SINGLE_ADMIN_PHONE = '0910000000';
export const SINGLE_ADMIN_PASSWORD = '000000';
export const SINGLE_ADMIN_EMAIL = `${SINGLE_ADMIN_PHONE}@waffer.local`;
export const SINGLE_ADMIN_FULL_NAME = 'المدير العام';

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super(Admin);
  }

  normalizeLoginInput(input: string): string {
    return String(input || '')
      .trim()
      .toLowerCase();
  }

  isSingleAdminLoginInput(input: string): boolean {
    const normalizedInput = this.normalizeLoginInput(input);
    return normalizedInput === SINGLE_ADMIN_PHONE || normalizedInput === SINGLE_ADMIN_EMAIL;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.model.findOne({ where: { email } });
  }

  async findByEmailOrPhone(input: string): Promise<Admin | null> {
    const normalizedInput = this.normalizeLoginInput(input);
    if (!this.isSingleAdminLoginInput(normalizedInput)) {
      return null;
    }

    try {
      return await this.model.findOne({
        where: {
          role: 'super_admin',
          [Op.or]: [{ email: SINGLE_ADMIN_EMAIL }, { phone: SINGLE_ADMIN_PHONE }],
        },
      });
    } catch (error) {
      // إذا فشل الاستعلام بسبب عدم وجود عمود phone في الإنتاج
      const [results]: any = await this.model.sequelize!.query(
        `SELECT * FROM admins
         WHERE role = 'super_admin'
           AND (email = :email OR phone = :phone)
         ORDER BY created_at ASC
         LIMIT 1`,
        {
          replacements: { email: SINGLE_ADMIN_EMAIL, phone: SINGLE_ADMIN_PHONE },
        }
      );
      if (results && results.length > 0) {
        const adminData = results[0];
        // تمرير البيانات بدون حقل phone إذا كان غير موجود لمنع أخطاء ORM لاحقاً
        return this.model.build(adminData, { isNewRecord: false });
      }
      return null;
    }
  }

  async findSingleAdmin(): Promise<Admin | null> {
    return this.model.findOne({
      where: { role: 'super_admin' },
      order: [['created_at', 'ASC']],
    });
  }

  async enforceSingleAdmin(
    password: string,
    options: { transaction?: unknown } = {}
  ): Promise<{ admin: Admin; cleanedCount: number; created: boolean }> {
    try {
      const transaction = options.transaction as any;
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
        await singleAdmin.update(
          {
            full_name: SINGLE_ADMIN_FULL_NAME,
            email: SINGLE_ADMIN_EMAIL,
            phone: SINGLE_ADMIN_PHONE,
            password,
            role: 'super_admin',
            is_active: true,
          },
          { transaction }
        );
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

      let cleanedCount = 0;
      for (const legacyAdmin of admins) {
        if (legacyAdmin.id === singleAdmin.id) {
          continue;
        }

        await legacyAdmin.update(
          {
            is_active: false,
            role: legacyAdmin.role === 'super_admin' ? 'viewer' : legacyAdmin.role,
          },
          { transaction }
        );
        await legacyAdmin.destroy({ transaction });
        cleanedCount += 1;
      }

      return { admin: singleAdmin, cleanedCount, created };
    } catch (error) {
      // Fallback raw SQL update if ORM fails
      await this.model.sequelize!.query(
        `UPDATE admins
         SET is_active = false,
             role = CASE WHEN role = 'super_admin' THEN 'viewer' ELSE role END,
             deleted_at = NOW(),
             updated_at = NOW()
         WHERE deleted_at IS NULL
           AND (phone <> :phone OR phone IS NULL)
           AND (email <> :email OR email IS NULL)`,
        {
          replacements: {
            phone: SINGLE_ADMIN_PHONE,
            email: SINGLE_ADMIN_EMAIL,
          },
        }
      );

      const [results]: any = await this.model.sequelize!.query(
        `SELECT id FROM admins
         WHERE deleted_at IS NULL
           AND (phone = :phone OR email = :email OR role = 'super_admin')
         ORDER BY created_at ASC
         LIMIT 1`,
        {
          replacements: {
            phone: SINGLE_ADMIN_PHONE,
            email: SINGLE_ADMIN_EMAIL,
          },
        }
      );

      let adminData;
      let created = false;

      if (results && results.length > 0) {
        await this.model.sequelize!.query(
          `UPDATE admins
           SET full_name = :full_name,
               email = :email,
               phone = :phone,
               password = :password,
               role = 'super_admin',
               is_active = true,
               deleted_at = NULL,
               updated_at = NOW()
           WHERE id = :id`,
          {
            replacements: {
              id: results[0].id,
              full_name: SINGLE_ADMIN_FULL_NAME,
              email: SINGLE_ADMIN_EMAIL,
              phone: SINGLE_ADMIN_PHONE,
              password,
            },
          }
        );
        adminData = results[0];
      } else {
        const { v4: uuidv4 } = require('uuid');
        const newId = uuidv4();
        await this.model.sequelize!.query(
          `INSERT INTO admins (id, full_name, email, phone, password, role, is_active, created_at, updated_at)
           VALUES (:id, :full_name, :email, :phone, :password, 'super_admin', true, NOW(), NOW())`,
          {
            replacements: {
              id: newId,
              full_name: SINGLE_ADMIN_FULL_NAME,
              email: SINGLE_ADMIN_EMAIL,
              phone: SINGLE_ADMIN_PHONE,
              password,
            },
          }
        );
        adminData = { id: newId };
        created = true;
      }
      
      const admin = this.model.build(adminData, { isNewRecord: false });
      return { admin, cleanedCount: 1, created };
    }
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await this.model.sequelize!.query(
      `UPDATE admins SET last_login = NOW() WHERE id = :id`,
      { replacements: { id: adminId } }
    );
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
    return this.model.findAll({ where: { role: 'super_admin', is_active: true } });
  }
}

export const adminRepository = new AdminRepository();

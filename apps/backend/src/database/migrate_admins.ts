import { sequelize } from './index';
import logger from '../config/logger';

export const migrateAdmins = async () => {
  try {
    logger.info('بدء تهجير جدول admins...');

    // Create admins table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // Migrate existing admins from users table to admins table
    let existingAdmins = [];
    try {
      const [results]: any = await sequelize.query(`
        SELECT * FROM users WHERE role::text = 'admin';
      `);
      existingAdmins = results;
    } catch (e) {
      logger.info('الاستعلام عن المدراء في جدول users فشل، ربما تم تغيير الـ enum مسبقاً.');
    }

    if (existingAdmins && existingAdmins.length > 0) {
      logger.info(`نقل ${existingAdmins.length} مدراء من جدول users إلى admins...`);
      for (const admin of existingAdmins) {
        // نحافظ على التوافق مع البيانات القديمة عبر بريد بديل مع حفظ الهاتف إن وجد
        const email = admin.email || `${admin.phone}@waffer.local`;
        await sequelize.query(
          `
          INSERT INTO admins (id, full_name, email, phone, password, role, is_active, created_at, updated_at)
          VALUES (:id, :full_name, :email, :phone, :password, 'super_admin', :is_active, :created_at, :updated_at)
          ON CONFLICT (email) DO NOTHING;
        `,
          {
            replacements: {
              id: admin.id,
              full_name: admin.full_name,
              email: email,
              phone: admin.phone || null,
              password: admin.password,
              is_active: admin.is_active,
              created_at: admin.created_at || new Date(),
              updated_at: admin.updated_at || new Date(),
            },
          }
        );
      }

      // Delete old admins from users table
      await sequelize.query(`
        DELETE FROM users WHERE role = 'admin';
      `);
    }

    // Now update the ENUM for role in users table (PostgreSQL specific)
    // In PostgreSQL, you cannot easily remove a value from an ENUM type.
    // Usually, you rename the type, create a new one, and alter the column.

    logger.info('تحديث نوع enum لعمود role في جدول users...');

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
          ALTER TYPE enum_users_role RENAME TO enum_users_role_old;
          CREATE TYPE enum_users_role AS ENUM ('retailer', 'supplier');
          ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
          ALTER TABLE users ALTER COLUMN role TYPE enum_users_role USING role::text::enum_users_role;
          ALTER TABLE users ALTER COLUMN role SET DEFAULT 'retailer';
          DROP TYPE enum_users_role_old;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          -- Ignore errors if type already altered
      END
      $$;
    `);

    logger.info('تحديث علاقة reviewed_by في جدول payments...');

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payments_reviewed_by_fkey') THEN
          ALTER TABLE payments DROP CONSTRAINT payments_reviewed_by_fkey;
        END IF;
        
        ALTER TABLE payments
          ADD CONSTRAINT payments_reviewed_by_fkey
          FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN OTHERS THEN
          -- Ignore errors if constraint already altered
      END
      $$;
    `);

    logger.info('تم تهجير جدول admins وتحديث جدول users بنجاح.');
  } catch (error) {
    logger.error('خطأ في تهجير جدول admins:', error);
    throw error;
  }
};

// Run directly if called as a script
if (require.main === module) {
  migrateAdmins()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

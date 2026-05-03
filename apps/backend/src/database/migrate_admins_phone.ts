import { sequelize } from './index';
import logger from '../config/logger';

export const migrateAdminsPhone = async () => {
  try {
    logger.info('Applying admins phone compatibility migration...');

    await sequelize.query(`
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `);

    await sequelize.query(`
      ALTER TABLE admins
      ALTER COLUMN email DROP NOT NULL;
    `);

    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admins_phone_unique
      ON admins (phone)
      WHERE phone IS NOT NULL;
    `);

    logger.info('Admins phone compatibility migration completed.');
  } catch (error) {
    logger.error('Error in migration:', error);
    throw error;
  }
};

if (require.main === module) {
  migrateAdminsPhone()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

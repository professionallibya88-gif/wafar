import { sequelize } from './index';
import logger from '../config/logger';

export const migrateAdminsPhone = async () => {
  try {
    logger.info('Adding phone to admins table...');
    await sequelize.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;`);
    await sequelize.query(`ALTER TABLE admins ALTER COLUMN email DROP NOT NULL;`);
    logger.info('Migration complete.');
  } catch (error) {
    logger.error('Error in migration:', error);
  }
};

if (require.main === module) {
  migrateAdminsPhone()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

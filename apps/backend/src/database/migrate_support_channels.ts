import { sequelize } from './index';
import logger from '../config/logger';

export const migrateSupportChannels = async () => {
  try {
    logger.info('بدء تهجير جدول قنوات الدعم (support_channels)...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS support_channels (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        value VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        icon VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `);

    logger.info('تم تهجير جدول قنوات الدعم بنجاح.');
  } catch (error) {
    logger.error('خطأ في تهجير جدول قنوات الدعم:', error);
    throw error;
  }
};

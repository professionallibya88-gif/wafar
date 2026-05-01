import * as dotenv from 'dotenv';
dotenv.config();
import { testConnection, syncDatabase } from './index';
import { migrateAdmins } from './migrate_admins';
import { migrateSupportChannels } from './migrate_support_channels';
import { up as migrateSupportMessaging } from './migrate_support_messaging';
import { sequelize } from './index';
import logger from '../config/logger';

const migrate = async () => {
  try {
    logger.info('بدء الاتصال بقاعدة البيانات...');
    await testConnection();

    logger.info('بدء مزامنة قاعدة البيانات...');
    await syncDatabase();

    logger.info('تشغيل تهجير الإدارة (Admins Migration)...');
    await migrateAdmins();

    logger.info('تشغيل تهجير قنوات الدعم (Support Channels Migration)...');
    await migrateSupportChannels();

    logger.info('تشغيل تهجير نظام المراسلة والدعم...');
    try {
      await migrateSupportMessaging(sequelize.getQueryInterface());
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        throw e;
      }
    }

    logger.info('تمت مزامنة قاعدة البيانات بنجاح');
    process.exit(0);
  } catch (error: any) {
    logger.error('خطأ في مزامنة قاعدة البيانات:', error);
    process.exit(1);
  }
};

migrate();

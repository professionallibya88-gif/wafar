import * as dotenv from 'dotenv';
dotenv.config();
import { sequelize } from './index';
import './models';
import logger from '../config/logger';
import { systemSettingRepository } from '../repositories';

const seedRateLimitingSettings = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    const rateLimitingSettings = [
      {
        key: 'rate_limiting_enabled',
        value: 'false',
        category: 'rate_limiting',
        description: 'تفعيل حدود معدل الطلبات',
      },
      {
        key: 'auth_rate_limit_points',
        value: '10',
        category: 'rate_limiting',
        description: 'عدد محاولات المصادقة المسموحة',
      },
      {
        key: 'auth_rate_limit_duration',
        value: '900',
        category: 'rate_limiting',
        description: 'مدة نافذة محاولات المصادقة (ثانية)',
      },
      {
        key: 'auth_rate_limit_block_duration',
        value: '900',
        category: 'rate_limiting',
        description: 'مدة حظر محاولات المصادقة (ثانية)',
      },
      {
        key: 'api_rate_limit_points',
        value: '1000',
        category: 'rate_limiting',
        description: 'عدد طلبات API المسموحة',
      },
      {
        key: 'api_rate_limit_duration',
        value: '900',
        category: 'rate_limiting',
        description: 'مدة نافذة طلبات API (ثانية)',
      },
      {
        key: 'upload_rate_limit_points',
        value: '20',
        category: 'rate_limiting',
        description: 'عدد عمليات الرفع المسموحة',
      },
      {
        key: 'upload_rate_limit_duration',
        value: '3600',
        category: 'rate_limiting',
        description: 'مدة نافذة عمليات الرفع (ثانية)',
      },
      {
        key: 'search_rate_limit_points',
        value: '30',
        category: 'rate_limiting',
        description: 'عدد عمليات البحث المسموحة',
      },
      {
        key: 'search_rate_limit_duration',
        value: '60',
        category: 'rate_limiting',
        description: 'مدة نافذة عمليات البحث (ثانية)',
      },
    ];

    for (const setting of rateLimitingSettings) {
      const existing = await systemSettingRepository.findByKey(setting.key);
      if (!existing) {
        await systemSettingRepository.create(setting);
        logger.info(`Created setting: ${setting.key}`);
      } else {
        logger.info(`Setting already exists: ${setting.key}`);
      }
    }

    logger.info('Rate limiting settings seeded successfully.');
    process.exit(0);
  } catch (error: any) {
    logger.error('Error seeding rate limiting settings:', error);
    process.exit(1);
  }
};

seedRateLimitingSettings();

import * as bcrypt from 'bcryptjs';
import logger from '../config/logger';
import { buildDefaultSettingsRecords } from '../config/systemSettings';
import {
  userRepository,
  adminRepository,
  subscriptionPlanRepository,
  systemSettingRepository,
} from '../repositories';
import { toError } from '../utils/errors';

export const seedAdmin = async () => {
  try {
    logger.info('بدء تهيئة البيانات الافتراضية...');

    const adminPassword = process.env.ADMIN_PASSWORD || '000000';
    const adminPhone = process.env.ADMIN_PHONE || '0910000000';
    const adminEmail = process.env.ADMIN_EMAIL || `${adminPhone}@waffer.local`;

    const existingAdmin = await adminRepository.findOne({ role: 'super_admin' });
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingAdmin) {
      // تحديث كلمة المرور ورقم الهاتف لضمان القدرة على الدخول بعد النشر (بناء على طلب المستخدم)
      await adminRepository.updateById(existingAdmin.id, {
        password: hashedPassword,
        phone: adminPhone,
        email: adminEmail,
      });
      logger.info(`حساب المدير موجود مسبقاً - تم تحديث بيانات الدخول لتكون (${adminPhone}).`);
    } else {
      await adminRepository.create({
        full_name: 'المدير العام',
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: 'super_admin',
        is_active: true,
      });
      logger.info(`تم إنشاء حساب المدير بنجاح (${adminPhone}).`);
    }

    if (process.env.NODE_ENV === 'development') {
      const testUsers = [
        {
          full_name: 'تاجر الاختبار',
          phone: '0911111111',
          password: 'Retailer@123456',
          role: 'retailer',
          is_active: true,
        },
        {
          full_name: 'مورد الاختبار',
          phone: '0922222222',
          password: 'Supplier@123456',
          role: 'supplier',
          is_active: true,
        },
        {
          full_name: 'مستخدم معطل',
          phone: '0933333333',
          password: 'Inactive@123456',
          role: 'retailer',
          is_active: false,
        },
      ];

      for (const u of testUsers) {
        const exists = await userRepository.findOne({ phone: u.phone });
        if (!exists) {
          await userRepository.create({
            full_name: u.full_name,
            phone: u.phone,
            password: await bcrypt.hash(u.password, 12),
            role: u.role,
            is_active: u.is_active,
          });
          logger.info(`Test user created: ${u.phone} (${u.role})`);
        }
      }
    }

    const plansCount = await subscriptionPlanRepository.count();
    if (plansCount === 0) {
      await subscriptionPlanRepository.bulkCreate([
        {
          name: 'free',
          name_ar: 'مجاني',
          description: 'باقة مجانية محدودة الميزات',
          duration_days: 0,
          price: 0,
          max_searches_per_day: 10,
          max_pdf_uploads: 0,
          can_compare: false,
          can_export: false,
          sort_order: 1,
        },
        {
          name: 'weekly',
          name_ar: 'اسبوعي',
          description: 'باقة اسبوعية ببحث غير محدود',
          duration_days: 7,
          price: 5,
          max_searches_per_day: null,
          max_pdf_uploads: 10,
          can_compare: true,
          can_export: true,
          max_comparisons_per_day: 5,
          sort_order: 2,
        },
        {
          name: 'monthly',
          name_ar: 'شهري',
          description: 'باقة شهرية بجميع الميزات',
          duration_days: 30,
          price: 15,
          max_searches_per_day: null,
          max_pdf_uploads: null,
          can_compare: true,
          can_export: true,
          max_comparisons_per_day: null,
          sort_order: 3,
        },
        {
          name: 'annual',
          name_ar: 'سنوي',
          description: 'باقة سنوية بجميع الميزات وسعر مخفض',
          duration_days: 365,
          price: 150,
          max_searches_per_day: null,
          max_pdf_uploads: null,
          can_compare: true,
          can_export: true,
          max_comparisons_per_day: null,
          sort_order: 4,
        },
      ]);
      logger.info('Subscription plans created successfully.');
    }

    const settingsCount = await systemSettingRepository.count();
    if (settingsCount === 0) {
      await systemSettingRepository.bulkCreate(buildDefaultSettingsRecords());
      logger.info('System settings created successfully.');
    }
  } catch (error) {
    const normalizedError = toError(error);
    logger.error('Seed error:', normalizedError.message);
    throw normalizedError;
  }
};

if (process.argv[1] && process.argv[1].includes('seed')) {
  seedAdmin()
    .then(() => {
      logger.info('Seed completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed failed:', error);
      process.exit(1);
    });
}

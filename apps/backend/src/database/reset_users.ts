/**
 * إعادة تعيين المستخدمين:
 * 1. حذف جميع المستخدمين الحاليين
 * 2. إنشاء حساب المدير (لوحة التحكم)
 * 3. إنشاء حساب مستخدم (الموقع)
 */
import * as dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { sequelize } from './index';
import './models';
import logger from '../config/logger';
import { adminRepository, userRepository } from '../repositories';
import { toError } from '../utils/errors';
import { normalizePhoneNumber } from '../utils/phone';
import { SINGLE_ADMIN_PHONE, SINGLE_ADMIN_PASSWORD } from '../repositories/AdminRepository';

const resetUsers = async () => {
  try {
    await sequelize.authenticate();
    logger.info('تم الاتصال بقاعدة البيانات بنجاح.');

    let deletedUsersCount = 0;
    let deletedAdminsCount = 0;
    let adminPhone = '';
    let userPhone = '';

    await sequelize.transaction(async (transaction) => {
      deletedUsersCount = await userRepository.deleteWhere({}, { force: true, transaction });
      deletedAdminsCount = await adminRepository.deleteWhere({}, { force: true, transaction });

      const adminPassword = await bcrypt.hash(SINGLE_ADMIN_PASSWORD, 12);
      await adminRepository.enforceSingleAdmin(adminPassword, { transaction });
      adminPhone = SINGLE_ADMIN_PHONE;

      const userPassword = await bcrypt.hash('000000', 12);
      const user = await userRepository.create(
        {
          full_name: 'مستخدم الموقع',
          phone: normalizePhoneNumber('0920000000'),
          password: userPassword,
          role: 'retailer',
          is_active: true,
        },
        { transaction }
      );
      userPhone = user.phone;
    });

    logger.info(`تم حذف ${deletedUsersCount} مستخدم/مستخدمين و ${deletedAdminsCount} مدير/مديرين.`);
    logger.info(`تم إنشاء حساب المدير: ${adminPhone} / ${SINGLE_ADMIN_PASSWORD}`);
    logger.info(`تم إنشاء حساب المستخدم: ${userPhone} / 000000`);

    logger.info('اكتملت إعادة تعيين المستخدمين بنجاح.');
    process.exit(0);
  } catch (error) {
    logger.error('فشلت إعادة تعيين المستخدمين:', toError(error).message);
    process.exit(1);
  }
};

resetUsers();

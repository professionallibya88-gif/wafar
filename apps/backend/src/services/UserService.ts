import { userRepository } from '../repositories';
import { NotFoundError, ConflictError } from '../errors';
import * as bcrypt from 'bcryptjs';
import { normalizePhoneNumber } from '../utils/phone';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

interface ProfileResponse {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  balance: number;
  last_login?: Date | null;
}

export class UserService {
  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await userRepository.findByIdSafe(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');
    return user.toJSON() as ProfileResponse;
  }

  async updateProfile(userId: string, data: { full_name?: string }): Promise<ProfileResponse> {
    const { full_name } = data;
    const user = await userRepository.findByIdSafe(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    await userRepository.updateById(user.id, { full_name });

    return {
      id: user.id,
      full_name: full_name || user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      balance: user.balance,
      last_login: user.last_login ?? null,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<ProfileResponse> {
    const user = await userRepository.findByIdSafe(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    if (user.avatar_url) {
      // حذف الصورة القديمة
      const oldFileName = user.avatar_url.replace('/uploads/', '');
      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          logger.error('خطأ في حذف الصورة القديمة:', e);
        }
      }
    }

    await userRepository.updateById(user.id, { avatar_url: avatarUrl });

    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: avatarUrl,
      role: user.role,
      is_active: user.is_active,
      balance: user.balance,
      last_login: user.last_login ?? null,
    };
  }

  async listUsers(options: {
    role?: string;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: ProfileResponse[]; count: number }> {
    const result = await userRepository.searchWithPagination(options);
    return { rows: result.rows.map((u) => u.toJSON() as ProfileResponse), count: result.count };
  }

  async toggleActive(userId: string): Promise<{ id: string; is_active: boolean }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    const newStatus = !user.is_active;
    await userRepository.updateById(user.id, { is_active: newStatus });

    return { id: user.id, is_active: newStatus };
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    await userRepository.deleteById(user.id);
  }

  async updateUserByAdmin(
    userId: string,
    data: {
      full_name?: string;
      phone?: string;
      role?: 'retailer' | 'supplier';
      is_active?: boolean;
      password?: string;
    }
  ): Promise<ProfileResponse> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    const updateData: Record<string, any> = {};

    if (data.full_name) updateData.full_name = data.full_name;
    if (data.role) updateData.role = data.role;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (data.phone) {
      const normalizedPhone = normalizePhoneNumber(data.phone);
      if (normalizedPhone !== user.phone) {
        const exists = await userRepository.findByPhone(normalizedPhone);
        if (exists) {
          throw new ConflictError('رقم الهاتف مسجل مسبقا لمستخدم آخر');
        }
        updateData.phone = normalizedPhone;
      }
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    if (Object.keys(updateData).length > 0) {
      await userRepository.updateById(user.id, updateData);
    }

    const updatedUser = await userRepository.findByIdSafe(user.id);
    return updatedUser!.toJSON() as ProfileResponse;
  }
}

export const userService = new UserService();

import { systemSettingRepository } from '../repositories';
import { initRateLimiters, setRateLimitingEnabled } from '../middleware/rateLimiter';
import logger from '../config/logger';
import {
  buildDefaultSettingsRecords,
  buildPublicSettingsFallback,
  SETTING_DESCRIPTIONS,
} from '../config/systemSettings';
import { Op } from 'sequelize';
import { NotFoundError } from '../errors';

type SettingsTree = Record<string, Record<string, string | undefined>>;
type SettingsUpdatePayload = Record<string, Record<string, unknown> | undefined>;

interface SystemSettingRecord {
  id: string;
  key: string;
  value?: string;
  category?: string | null;
  description?: string | null;
}

const mapSettingsByCategory = (settings: SystemSettingRecord[]): SettingsTree => {
  return settings.reduce<SettingsTree>((result, setting) => {
    const category = setting.category || 'general';

    if (!result[category]) {
      result[category] = {};
    }

    result[category][setting.key] = setting.value;
    return result;
  }, {});
};

const mergeSettingsTrees = (base: SettingsTree, overrides: SettingsTree): SettingsTree => {
  const merged: SettingsTree = { ...base };

  for (const [category, values] of Object.entries(overrides)) {
    merged[category] = {
      ...(merged[category] || {}),
      ...values,
    };
  }

  return merged;
};

export class SettingsService {
  async getAllSettings(): Promise<SettingsTree> {
    const settings = await systemSettingRepository.findAll(
      {},
      {
        order: [
          ['category', 'ASC'],
          ['key', 'ASC'],
        ],
      }
    );

    return mapSettingsByCategory(settings);
  }

  async getPublicSettings(): Promise<SettingsTree> {
    const fallback = buildPublicSettingsFallback() as SettingsTree;

    try {
      const settings = await systemSettingRepository.findAll({
        category: {
          [Op.in]: ['general', 'feature_flags', 'widget'],
        },
      });

      if (!settings.length) {
        return fallback;
      }

      return mergeSettingsTrees(fallback, mapSettingsByCategory(settings));
    } catch (error: unknown) {
      try {
        logger.error('خطأ في جلب الإعدادات العامة:', error);
      } catch {
        // تجاهل أخطاء الـ logger لضمان إرجاع القيم الافتراضية
      }

      return fallback;
    }
  }

  async updateSetting(key: string, value: unknown): Promise<SystemSettingRecord> {
    const setting = await systemSettingRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundError('الإعداد غير موجود');
    }

    const updatedSetting = await systemSettingRepository.updateById(setting.id, {
      value: String(value),
    });

    if (!updatedSetting) {
      throw new NotFoundError('الإعداد غير موجود');
    }

    return updatedSetting;
  }

  async createSetting(data: Partial<SystemSettingRecord>): Promise<SystemSettingRecord> {
    return systemSettingRepository.create(data);
  }

  async updateAllSettings(data: SettingsUpdatePayload): Promise<void> {
    const {
      general,
      pdf_processing,
      ai_providers,
      email,
      security,
      system,
      rate_limiting,
      feature_flags,
      widget,
    } = data;
    const updates: Promise<SystemSettingRecord>[] = [];

    const updateCategory = (
      categoryData: Record<string, unknown> | undefined,
      categoryName: string
    ) => {
      if (categoryData) {
        for (const [key, value] of Object.entries(categoryData)) {
          updates.push(
            systemSettingRepository.upsert({
              key,
              value: String(value),
              category: categoryName,
              description: this.getSettingDescription(categoryName, key),
            })
          );
        }
      }
    };

    updateCategory(general, 'general');
    updateCategory(pdf_processing, 'pdf_processing');
    updateCategory(ai_providers, 'ai_providers');
    updateCategory(email, 'email');
    updateCategory(security, 'security');
    updateCategory(system, 'system');
    updateCategory(rate_limiting, 'rate_limiting');
    updateCategory(feature_flags, 'feature_flags');
    updateCategory(widget, 'widget');

    await Promise.all(updates);

    if (rate_limiting) {
      try {
        if (rate_limiting.rate_limiting_enabled !== undefined) {
          const enabled =
            rate_limiting.rate_limiting_enabled === 'true' ||
            rate_limiting.rate_limiting_enabled === true;
          setRateLimitingEnabled(enabled);
        }
        await initRateLimiters();
        logger.info('تم إعادة تحميل Rate Limiters بنجاح');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'خطأ غير معروف';
        logger.warn('فشل في إعادة تحميل Rate Limiters:', message);
      }
    }
  }

  async resetToDefaults(): Promise<void> {
    await systemSettingRepository.destroyAll();
    await systemSettingRepository.bulkCreate(buildDefaultSettingsRecords());
  }

  async testEmailConfiguration(): Promise<{
    smtpEnabled: boolean;
    smtpHost: string;
    smtpPort: string;
  }> {
    const settings = await this.getAllSettings();
    const emailSettings = settings.email || {};

    return {
      smtpEnabled: emailSettings.smtp_enabled === 'true',
      smtpHost: emailSettings.smtp_host || '',
      smtpPort: emailSettings.smtp_port || '',
    };
  }

  getSettingDescription(category: string, key: string): string {
    return SETTING_DESCRIPTIONS[category as keyof typeof SETTING_DESCRIPTIONS]?.[key] || key;
  }
}

export const settingsService = new SettingsService();

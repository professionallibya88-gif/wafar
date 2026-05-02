import { reactive, ref } from "vue";
import { settingsAPI } from "@/services/api";

/**
 * نظام التحكم بالميزات (Feature Flags)
 * يجلب إعدادات feature_flags من الـ Backend ويتحكم في ظهور/إخفاء الميزات
 */
const FLAG_DEFAULTS = {
  feature_search: true,
  feature_catalogs: true,
  feature_upload: true,
  feature_files: true,
  feature_compare: true,
  feature_subscriptions: true,
  feature_payments: true,
  feature_history: true,
  feature_notifications: true,
  feature_admin_dashboard: true,
  feature_admin_monitoring: true,
  feature_admin_advanced_monitoring: true,
  feature_admin_activity_logs: true,
  feature_email_smtp: true,
  feature_rate_limiting: true,
  feature_mvp_mode: false,
  feature_cart: false,
};

const flags = reactive({ ...FLAG_DEFAULTS });
const initialized = ref(false);
const loading = ref(false);

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1";
  return Boolean(value);
};

export const useFeatureFlags = () => {
  const loadFlags = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
      const response = await settingsAPI.getPublic();
      const data = response.data.data || {};
      const featureFlags = data.feature_flags || data;

      Object.keys(FLAG_DEFAULTS).forEach((key) => {
        if (featureFlags[key] !== undefined) {
          flags[key] = parseBoolean(featureFlags[key]);
        }
      });

      initialized.value = true;
    } catch (error) {
      console.warn("فشل في تحميل إعدادات الميزات، استخدام القيم الافتراضية", error);
      Object.assign(flags, FLAG_DEFAULTS);
      initialized.value = true;
    } finally {
      loading.value = false;
    }
  };

  const isEnabled = (key) => {
    const fullKey = key.startsWith("feature_") ? key : `feature_${key}`;
    if (flags.feature_mvp_mode) {
      const mvpCoreFeatures = [
        "feature_search",
        "feature_upload",
        "feature_files",
        "feature_catalogs",
      ];
      return mvpCoreFeatures.includes(fullKey);
    }
    return flags[fullKey] !== false;
  };

  return {
    flags,
    initialized,
    loading,
    loadFlags,
    isEnabled,
  };
};

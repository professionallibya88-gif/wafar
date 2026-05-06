import { ref } from 'vue';
import { settingsAPI } from '@/services/api';
import { applyFont, DEFAULT_FONT_KEY } from './useSiteFont';
import { preferenceStorage, themeStorage } from '@/services/storage';
import { useThemeStore } from '@/stores/theme';

const SPINNER_STORAGE_KEY = 'spinner-settings';
const VALID_THEME_MODES = ['light', 'dark', 'system'];

const defaultSiteSettings = {
  site_name: 'منصة وفر',
  site_slogan: 'الخيار الول لقطع الغيار',
  site_description: 'منصة متخصصة في قطع غيار السيارات',
  site_logo: '',
  site_favicon: '',
  site_font_family: DEFAULT_FONT_KEY,
  landing_hero_title: 'اكتشف منصة وفر لقطع الغيار',
  landing_hero_description:
    'المنصة الذكية الولى في ليبيا للبحث المتقدم ومقارنة سعار قطع غيار السيارات. قم بنشاء حسابك الآن لتجربة بحث لا مثيل لها.',
  widget_bg_color: '#2563eb',
  widget_icon_color: '#ffffff',
  widget_shape: 'circle',
  auth_visual_badge: 'REALTIME SEARCH CORE',
  auth_visual_title: 'عمق بصري حي\nيعبر عن قوة النظام',
  auth_visual_description:
    'مشهد ثلاثي البعاد نظيف ومتحرك بهدوء يوحي بمحرك بحث ومعالجة بيانات يعمل في العمق بشكل متقدم واحترافي.',
  loader_spinner_variant: 'arc-gradient',
  loader_spinner_size: 'md',
  loader_spinner_color: 'primary',
  loader_spinner_speed: 'normal',
  theme_default_mode: 'dark',
  theme_show_switcher: true,
};

const siteSettings = ref({ ...defaultSiteSettings });
const settingsLoaded = ref(false);
let publicSettingsPromise = null;

const parseBoolean = (value, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
};

const sanitizeThemeMode = (mode) =>
  VALID_THEME_MODES.includes(mode) ? mode : defaultSiteSettings.theme_default_mode;

const sanitizeSpinnerSettings = (settings = {}) => ({
  loader_spinner_variant: settings.loader_spinner_variant || defaultSiteSettings.loader_spinner_variant,
  loader_spinner_size: settings.loader_spinner_size || defaultSiteSettings.loader_spinner_size,
  loader_spinner_color: settings.loader_spinner_color || defaultSiteSettings.loader_spinner_color,
  loader_spinner_speed: settings.loader_spinner_speed || defaultSiteSettings.loader_spinner_speed,
});

const persistSpinnerSettings = (settings) => {
  try {
    const payload = sanitizeSpinnerSettings(settings);
    preferenceStorage.setItem(SPINNER_STORAGE_KEY, payload);
    window.__WAFAR_BOOTSTRAP__?.setSpinnerSettings?.(payload);
  } catch {
    // تجاهل مشاكل التخزين حتى لا تتعطل الواجهة.
  }
};

const normalizeSettingsPayload = (payload = {}) => {
  const generalSettings = payload.general || payload;
  const widgetSettings = payload.widget || {};
  const authVisualSettings = payload.auth_visual || {};

  return {
    ...defaultSiteSettings,
    ...siteSettings.value,
    ...generalSettings,
    ...widgetSettings,
    ...authVisualSettings,
    ...sanitizeSpinnerSettings(generalSettings),
    theme_default_mode: sanitizeThemeMode(generalSettings.theme_default_mode),
    theme_show_switcher: parseBoolean(generalSettings.theme_show_switcher, true),
    site_font_family:
      generalSettings.site_font_family ||
      payload.site_font_family ||
      siteSettings.value.site_font_family ||
      DEFAULT_FONT_KEY,
  };
};

const getRetryableError = (error) => {
  const status = error?.response?.status;
  return !status || status >= 500;
};

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const fetchPublicSettings = async (force = false) => {
  if (publicSettingsPromise && !force) {
    return publicSettingsPromise;
  }

  publicSettingsPromise = (async () => {
    const maxAttempts = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await settingsAPI.getPublic();
        const payload = res.data?.data || {};
        return normalizeSettingsPayload(payload);
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts && getRetryableError(error)) {
          await delay(800);
          continue;
        }
        throw lastError;
      }
    }

    throw lastError;
  })();

  try {
    return await publicSettingsPromise;
  } catch (error) {
    if (force) {
      publicSettingsPromise = null;
    }
    throw error;
  }
};

const applyCriticalSettings = (settings) => {
  if (settings.site_name) {
    document.title = settings.site_name;
  }

  try {
    themeStorage.setDefaultTheme(sanitizeThemeMode(settings.theme_default_mode));
  } catch {
    // تجاهل مشاكل التخزين حتى لا تتعطل الواجهة.
  }

  const themeStore = useThemeStore();
  themeStore.updateDefaultTheme?.(sanitizeThemeMode(settings.theme_default_mode));

  applyFont(settings.site_font_family || DEFAULT_FONT_KEY);
  persistSpinnerSettings(settings);
};

const applyDeferredSettings = (settings) => {
  if (settings.site_favicon) {
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.site_favicon;
  }

  if (settings.site_description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = settings.site_description;
  }
};

export function useSiteSettings() {
  const loadSettings = async ({ force = false } = {}) => {
    try {
      const resolvedSettings = await fetchPublicSettings(force);
      siteSettings.value = resolvedSettings;
      applyCriticalSettings(resolvedSettings);
      applyDeferredSettings(resolvedSettings);
    } catch (error) {
      applyCriticalSettings(siteSettings.value);
      console.error('Failed to load public settings', error);
    } finally {
      settingsLoaded.value = true;
    }

    return siteSettings.value;
  };

  const applySettings = (settings) => {
    const normalizedSettings = normalizeSettingsPayload(settings);
    siteSettings.value = normalizedSettings;
    applyCriticalSettings(normalizedSettings);
    applyDeferredSettings(normalizedSettings);
    return normalizedSettings;
  };

  return {
    siteSettings,
    settingsLoaded,
    loadSettings,
    applySettings,
  };
}

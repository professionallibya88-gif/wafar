import { ref } from "vue";
import { settingsAPI } from "@/services/api";

const siteSettings = ref({
  site_name: "منصة وفر",
  site_slogan: "الخيار الأول لقطع الغيار",
  site_description: "منصة متخصصة في قطع غيار السيارات",
  site_logo: "",
  site_favicon: "",
  landing_hero_title: "اكتشف منصة وفر لقطع الغيار",
  landing_hero_description: "المنصة الذكية الأولى في ليبيا للبحث المتقدم ومقارنة أسعار قطع غيار السيارات. قم بإنشاء حسابك الآن لتجربة بحث لا مثيل لها.",
  widget_bg_color: "#2563eb",
  widget_icon_color: "#ffffff",
  widget_shape: "circle",
});

const settingsLoaded = ref(false);

export function useSiteSettings() {
  const loadSettings = async () => {
    const maxAttempts = 2;
    let lastError = null;

    const isRetryableError = (error) => {
      const status = error?.response?.status;
      return !status || status >= 500;
    };

    const delay = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const res = await settingsAPI.getPublic();
          if (res.data?.success && res.data.data) {
            const data = res.data.data;
            siteSettings.value = {
              ...siteSettings.value,
              ...data.general,
              ...data.widget,
            };
          }
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          if (attempt < maxAttempts && isRetryableError(error)) {
            await delay(800);
            continue;
          }
          break;
        }
      }
    } catch (error) {
      lastError = error;
    } finally {
      applySettings(siteSettings.value);
      if (lastError) {
        console.error("Failed to load public settings", lastError);
      }
      settingsLoaded.value = true;
    }
  };

  const applySettings = (settings) => {
    // Apply Document Title
    if (settings.site_name) {
      document.title = settings.site_name;
    }
    
    // Apply Favicon
    if (settings.site_favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.site_favicon;
    }
    
    // Apply meta description
    if (settings.site_description) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = settings.site_description;
    }
  };

  return {
    siteSettings,
    settingsLoaded,
    loadSettings,
    applySettings,
  };
}

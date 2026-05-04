import { ref } from "vue";
import { settingsAPI } from "@/services/api";

export const DEFAULT_FONT_KEY = "tajawal";

const siteFont = ref(DEFAULT_FONT_KEY);
const settingsLoaded = ref(false);
let activeFontHref = "";

// خرائطة الخطوط
export const fontMap = {
  tajawal: {
    name: "Tajawal",
    nameAr: "تجوال",
    googleFont: "Tajawal",
    weights: "300;400;500;600;700;800",
    css: "'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif",
  },
  "noto-sans-arabic": {
    name: "Noto Sans Arabic",
    nameAr: "نوتو سانس عربي",
    googleFont: "Noto+Sans+Arabic",
    weights: "300;400;500;600;700",
    css: "'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif",
  },
  "noto-kufi-arabic": {
    name: "Noto Kufi Arabic",
    nameAr: "نوتو كوفي عربي",
    googleFont: "Noto+Kufi+Arabic",
    weights: "300;400;500;600;700",
    css: "'Noto Kufi Arabic', 'Segoe UI', Tahoma, Arial, sans-serif",
  },
  "scheherazade-new": {
    name: "Scheherazade New",
    nameAr: "شهرزاد",
    googleFont: "Scheherazade+New",
    weights: "400;700",
    css: "'Scheherazade New', 'Traditional Arabic', Arial, serif",
  },
  cairo: {
    name: "Cairo",
    nameAr: "القاهرة",
    googleFont: "Cairo",
    weights: "300;400;500;600;700",
    css: "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif",
  },
};

const getFontDefinition = (fontKey) => fontMap[fontKey] || fontMap[DEFAULT_FONT_KEY];

const getFontHref = (fontKey) => {
  const font = getFontDefinition(fontKey);
  return `https://fonts.googleapis.com/css2?family=${font.googleFont}:wght@${font.weights}&display=swap`;
};

const ensureFontLink = (fontKey) => {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  const href = getFontHref(fontKey);
  let link = document.getElementById("google-font-link");

  if (!link) {
    link = document.createElement("link");
    link.id = "google-font-link";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  if (link.getAttribute("href") === href || activeFontHref === href) {
    activeFontHref = href;
    return Promise.resolve();
  }

  activeFontHref = href;

  return new Promise((resolve) => {
    const finalize = () => resolve();

    link.addEventListener("load", finalize, { once: true });
    link.addEventListener("error", finalize, { once: true });
    link.href = href;
  });
};

export const applyFont = (fontKey) => {
  if (typeof document === "undefined") {
    return DEFAULT_FONT_KEY;
  }

  const resolvedKey = fontMap[fontKey] ? fontKey : DEFAULT_FONT_KEY;
  const font = getFontDefinition(resolvedKey);
  const root = document.documentElement;

  siteFont.value = resolvedKey;
  root.style.setProperty("--site-font-family", font.css);
  root.style.setProperty("--font-sans", font.css);
  root.style.setProperty("--font-display", font.css);

  document.body?.style?.setProperty("font-family", "var(--font-sans)");
  window.__WAFAR_BOOTSTRAP__?.setFontFamily?.(font.css);

  return resolvedKey;
};

export function useSiteFont() {
  const loadFont = async (fontKey = siteFont.value) => {
    const resolvedKey = applyFont(fontKey);

    try {
      await ensureFontLink(resolvedKey);
    } finally {
      settingsLoaded.value = true;
    }

    return resolvedKey;
  };

  // تحديث الخط (للأدمن)
  const updateFont = async (fontKey) => {
    try {
      await settingsAPI.update("site_font_family", fontKey);
      await loadFont(fontKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  // الحصول على قائمة الخطوط المتاحة
  const getAvailableFonts = () => {
    return Object.entries(fontMap).map(([key, font]) => ({
      key,
      ...font,
    }));
  };

  return {
    siteFont,
    settingsLoaded,
    loadFont,
    applyFont,
    updateFont,
    getAvailableFonts,
    fontMap,
  };
}

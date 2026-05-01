import { ref } from "vue";
import { settingsAPI } from "@/services/api";

const siteFont = ref("tajawal");
const settingsLoaded = ref(false);

// خرائطة الخطوط
const fontMap = {
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

export function useSiteFont() {
  // تحميل الخط من الإعدادات
  const loadFont = async () => {
    try {
      const res = await settingsAPI.getPublic();
      if (res.data?.success && res.data.data?.site_font_family) {
        siteFont.value = res.data.data.site_font_family;
        applyFont(res.data.data.site_font_family);
      } else {
        // استخدام الخط الافتراضي في حالة عدم وجود البيانات
        applyFont("tajawal");
      }
    } catch (error) {
      // استخدام الخط الافتراضي في حالة الخطأ
      applyFont("tajawal");
    } finally {
      settingsLoaded.value = true;
    }
  };

  // تطلبيق الخط على الموقع
  const applyFont = (fontKey) => {
    const font = fontMap[fontKey];
    if (!font) return;

    // إزالة أي خط Google Fonts موجود مسبقاً
    const existingLink = document.getElementById("google-font-link");
    if (existingLink) {
      existingLink.remove();
    }

    // تحميل خط Google Fonts الجديد
    const link = document.createElement("link");
    link.id = "google-font-link";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}:wght@${font.weights}&display=swap`;
    document.head.appendChild(link);

    // تطلبيق الخط على جميع العناصر
    document.documentElement.style.setProperty("--site-font-family", font.css);
    document.body.style.fontFamily = font.css;

    // تحديث جميع العناصر
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      el.style.fontFamily = font.css;
    });

    // تحديث Tailwind
    document.documentElement.style.fontFamily = font.css;
  };

  // تحديث الخط (للأدمن)
  const updateFont = async (fontKey) => {
    try {
      await settingsAPI.update("site_font_family", fontKey);
      siteFont.value = fontKey;
      applyFont(fontKey);
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

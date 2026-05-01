import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { themeStorage } from "@/services/storage";

export const useThemeStore = defineStore("theme", () => {
  // حالة الوضع الحالي
  const themeMode = ref("light");
  const resolvedTheme = ref("light");
  const isInitialized = ref(false);

  // مراقبة تفضيلات النظام
  let systemDarkQuery = null;
  let systemListener = null;

  // تطلبيق الوضع على DOM
  const applyTheme = (newTheme, mode = "light") => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-theme", newTheme);
    root.setAttribute(
      "data-theme-source",
      mode === "system" ? "system" : "manual",
    );

    // تحديث لون meta theme
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        newTheme === "dark" ? "#0a0a0a" : "#f8f9fa",
      );
    }
  };

  // الحصول على وضع النظام
  const getSystemTheme = () => {
    if (systemDarkQuery) {
      return systemDarkQuery.matches ? "dark" : "light";
    }
    return "light";
  };

  // الحصول على الوضع المحفوظ أو الافتراضي
  const getStoredTheme = () => {
    const stored = themeStorage.getTheme();
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return null;
  };

  // تحديد الوضع الفعال
  const resolveTheme = (mode) => {
    if (mode === "system") {
      return getSystemTheme();
    }
    return mode;
  };

  // تهيئة الوضع
  const initTheme = () => {
    if (isInitialized.value) return;

    // إعداد مراقبة النظام
    systemDarkQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    // الحصول على الوضع المحفوظ أو الافتراضي
    const stored = getStoredTheme();
    themeMode.value = stored || "light";
    resolvedTheme.value = resolveTheme(themeMode.value);

    // تطلبيق الوضع
    applyTheme(resolvedTheme.value, themeMode.value);

    // إضافة مستمع لتغيرات النظام
    if (systemDarkQuery) {
      systemListener = (e) => {
        if (themeMode.value === "system") {
          const newResolved = e.matches ? "dark" : "light";
          resolvedTheme.value = newResolved;
          applyTheme(newResolved, "system");
        }
      };
      systemDarkQuery.addEventListener("change", systemListener);
    }

    isInitialized.value = true;
  };

  // تعيين الوضع
  const setTheme = (mode) => {
    if (!["light", "dark", "system"].includes(mode)) return;

    themeMode.value = mode;
    const newResolved = resolveTheme(mode);
    resolvedTheme.value = newResolved;

    themeStorage.setTheme(mode);
    applyTheme(newResolved, mode);
  };

  // تبديل الوضع
  const toggleTheme = () => {
    if (resolvedTheme.value === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // التحقق من الوضع المظلم
  const isDark = () => resolvedTheme.value === "dark";

  // تنظيف المستمعين
  const cleanup = () => {
    if (systemListener && systemDarkQuery) {
      systemDarkQuery.removeEventListener("change", systemListener);
      systemListener = null;
    }
    isInitialized.value = false;
  };

  // مراقبة تغيرات themeMode
  watch(themeMode, (newMode) => {
    const newResolved = resolveTheme(newMode);
    resolvedTheme.value = newResolved;
    applyTheme(newResolved, newMode);
  });

  return {
    theme: resolvedTheme,
    themeMode,
    setTheme,
    toggleTheme,
    isDark,
    initTheme,
    cleanup,
  };
});

import { defineStore } from "pinia";
import { ref } from "vue";
import { themeStorage } from "@/services/storage";

const VALID_THEME_MODES = ["light", "dark", "system"];
const DEFAULT_THEME_MODE = "dark";
const DEFAULT_RESOLVED_THEME = "dark";

export const useThemeStore = defineStore("theme", () => {
  // حالة الوضع الحالي
  const themeMode = ref(DEFAULT_THEME_MODE);
  const resolvedTheme = ref(DEFAULT_RESOLVED_THEME);
  const isInitialized = ref(false);

  // مراقبة تفضيلات النظام
  let systemDarkQuery = null;
  let systemListener = null;

  // تطبيق الوضع على DOM
  const applyTheme = (newTheme, mode = "dark") => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const resolvedMode = newTheme === "light" ? "light" : "dark";

    if (resolvedMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-theme", resolvedMode);
    root.setAttribute(
      "data-theme-source",
      mode === "system" ? "system" : "manual",
    );
    root.style.colorScheme = resolvedMode;

    // تحديث لون meta theme
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolvedMode === "dark" ? "#0a0a0a" : "#f8f9fa",
      );
    }
  };

  // الحصول على وضع النظام
  const getSystemTheme = () => {
    if (systemDarkQuery) {
      return systemDarkQuery.matches ? "dark" : "light";
    }
    return DEFAULT_RESOLVED_THEME;
  };

  // الحصول على الوضع المحفوظ أو الافتراضي
  const getStoredTheme = () => {
    const stored = themeStorage.getTheme();
    if (VALID_THEME_MODES.includes(stored)) {
      return stored;
    }
    return null;
  };

  const getPlatformDefaultThemeMode = () => {
    if (typeof window === "undefined") return DEFAULT_THEME_MODE;
    try {
      const storedDefault = themeStorage.getDefaultTheme();
      if (VALID_THEME_MODES.includes(storedDefault)) {
        return storedDefault;
      }
    } catch {
      return DEFAULT_THEME_MODE;
    }
    return DEFAULT_THEME_MODE;
  };

  const getBootstrapThemeState = () => {
    if (typeof document === "undefined") return null;

    const root = document.documentElement;
    const domResolvedTheme = root.getAttribute("data-theme");
    const domThemeSource = root.getAttribute("data-theme-source");

    return {
      themeMode:
        domThemeSource === "system" ? "system" : DEFAULT_THEME_MODE,
      resolvedTheme:
        domResolvedTheme === "light" || domResolvedTheme === "dark"
          ? domResolvedTheme
          : null,
    };
  };

  // تحديد الوضع الفعال
  const resolveTheme = (mode) => {
    if (mode === "system") {
      return getSystemTheme();
    }
    return mode;
  };

  // تهيئة الوضع
  const initTheme = (initialState = null) => {
    if (isInitialized.value) return;

    // إعداد مراقبة النظام
    systemDarkQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    // الحصول على الوضع المحفوظ أو الافتراضي
    const bootstrapState = initialState || getBootstrapThemeState();
    const stored = getStoredTheme();
    const initialMode =
      stored ||
      bootstrapState?.themeMode ||
      getPlatformDefaultThemeMode();

    themeMode.value = initialMode;
    resolvedTheme.value =
      bootstrapState?.resolvedTheme || resolveTheme(initialMode);

    // تطبيق الوضع
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

  const updateDefaultTheme = (mode) => {
    if (!VALID_THEME_MODES.includes(mode)) return;
    if (getStoredTheme()) return;

    themeMode.value = mode;
    const newResolved = resolveTheme(mode);
    resolvedTheme.value = newResolved;
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
    systemDarkQuery = null;
    isInitialized.value = false;
  };

  return {
    theme: resolvedTheme,
    themeMode,
    setTheme,
    updateDefaultTheme,
    toggleTheme,
    isDark,
    initTheme,
    cleanup,
  };
});

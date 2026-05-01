/**
 * useIcons Composable - واجهة استخدام الأيقونات المتعددة
 * يوفر طريقة مريحة لإضافة الأيقونات
 */

import { computed } from "vue";
import { getIcon, IconSizes, IconColors } from "@/components/icons";

/**
 * Composable تفاعل مع نظام الأيقونات
 * @param {Object} options - خيارات الأيقونة
 * @param {string} options.name - اسم الأيقونة
 * @param {string} options.size - الحجم (xs, sm, md, lg, xl, 2xl, 3xl)
 * @param {string} options.color - اللون (primary, secondary, success, warning, error, info, white, gray, dark)
 * @param {string} options.customClass - كلاس CSS إضافي
 */
export function useIcon(options = {}) {
  const { name, size = "md", color, customClass = "" } = options;

  /**
   * الحصول على الأيقونة
   */
  const iconComponent = computed(() => {
    if (typeof name === "object" && name.render) {
      return name; // إذا كانت الأيقونة component بالفعل
    }
    return getIcon(name);
  });

  /**
   * حجم الأيقونة والـ classes
   */
  const sizeClass = computed(() => {
    if (!size) return "";
    return IconSizes[size] || IconSizes.md;
  });

  /**
   *   الألوان classes
   */
  const colorClass = computed(() => {
    if (!color) return "";
    return IconColors[color] || "";
  });

  /**
   * جمع الـ classes مجتمعة
   */
  const iconClasses = computed(() => {
    const classes = [sizeClass.value];
    if (colorClass.value) classes.push(colorClass.value);
    if (customClass) classes.push(customClass);
    return classes.join(" ");
  });

  /**
   * تحدد ما إذا كانت الأيقونة متاحة
   */
  const isAvailable = computed(() => {
    return iconComponent.value !== null;
  });

  return {
    iconComponent,
    sizeClass,
    colorClass,
    iconClasses,
    isAvailable,
    size: sizeClass,
    color: colorClass,
    class: iconClasses,
  };
}

/**
 * دالة مساعدة لإنشاء أيقونة سريعة
 * @param {string} name - اسم الأيقونة
 * @param {string} size - الحجم
 * @param {string} color - اللون
 */
export function createIcon(name, size = "md", color = "") {
  return {
    name,
    size,
    color,
    class: [IconSizes[size] || IconSizes.md, IconColors[color] || ""]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * قائمة الأيقونات الجاهزة للاستخدام
 * يمكن استيرادها واستخدامها مباشرة في القالب
 */
export const NavIcons = {
  home: "Home",
  search: "Search",
  upload: "CloudArrowUp",
  files: "Folder",
  catalogs: "BookOpen",
  compare: "ChartSquare",
  history: "Clock",
  subscriptions: "CreditCard",
  payments: "CurrencyDollar",
  profile: "User",
  settings: "Settings",
  dashboard: "ChartBar",
  admin: "Cog6Tooth",
  logout: "ArrowRightStartOnRectangle",
};

export const ActionIcons = {
  add: "Plus",
  edit: "Pencil",
  delete: "Trash",
  save: "Check",
  cancel: "X",
  close: "XCircle",
  refresh: "Refresh",
  download: "ArrowDownTray",
  upload: "ArrowUpTray",
  copy: "Clipboard",
  paste: "ClipboardDocumentList",
};

export const StatusIcons = {
  success: "CheckCircle",
  error: "ExclamationCircle",
  warning: "ExclamationTriangle",
  info: "InformationCircle",
  loading: "Spinner",
  pending: "Clock",
  approved: "CheckCircle",
  rejected: "XCircle",
};

export const CategoryIcons = {
  users: "Users",
  suppliers: "BuildingOffice",
  files: "DocumentText",
  payments: "CreditCard",
  plans: "CurrencyDollar",
  settings: "Settings",
  notifications: "Bell",
};

export default useIcon;

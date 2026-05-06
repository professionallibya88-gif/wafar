# خطة تنفيذ إعدادات التحكم في مظهر المنصة (Theme)

## الهدف
توفير إعدادات في لوحة التحكم (Admin Settings) للتحكم في المظهر الافتراضي للمنصة (داكن/فاتح/حسب النظام) وتفعيل/إخفاء زر التبديل للمستخدمين. سيتم ربط هذه الإعدادات مع الواجهة الأمامية بسلاسة دون التسبب في وميض (FOUC).

## الخطوات التفصيلية

### 1. تحديث الإعدادات في الخلفية (Backend)
- **الملف:** `apps/backend/src/config/systemSettings.ts`
- **التعديلات:**
  - إضافة المتغيرات التالية إلى `DEFAULT_SYSTEM_SETTINGS.general`:
    - `theme_default_mode: 'dark'`
    - `theme_show_switcher: 'true'`
  - إضافة أوصاف هذه المتغيرات في `SETTING_DESCRIPTIONS.general` لتوضيح الغرض منها في قاعدة البيانات (مثل: "الوضع الافتراضي للمظهر"، "إظهار زر تبديل المظهر").

### 2. تحديث لوحة التحكم في الواجهة الأمامية (Frontend Admin)
- **الملف:** `apps/frontend/src/views/admin/AdminSettingsView.vue`
- **التعديلات:**
  - إضافة قسم جديد "إعدادات المظهر" (Appearance Settings) في التبويب "عام" (General).
  - تضمين حقل اختيار (Select) لتحديد `theme_default_mode` (مظلم، فاتح، نظام).
  - تضمين حقل اختيار (Checkbox) لتحديد `theme_show_switcher` (تفعيل/إخفاء الزر).
  - تحديث دالة `loadSettings` لتهيئة هذه القيم واستخدام `parseBool` للزر.

### 3. تحديث دالة إعدادات الموقع المركزية (useSiteSettings)
- **الملف:** `apps/frontend/src/composables/useSiteSettings.js`
- **التعديلات:**
  - إضافة `theme_default_mode` و `theme_show_switcher` إلى `defaultSiteSettings`.
  - في دالة `normalizeSettingsPayload`، التأكد من تمرير القيم الصحيحة.
  - في دالة `applyCriticalSettings`، نقوم بحفظ `theme_default_mode` في `localStorage` تحت مفتاح `site_theme_default` لكي تتمكن `index.html` من قراءته قبل تحميل تطبيق Vue.
  - استدعاء دالة جديدة في `themeStore` لتحديث المظهر الحالي للمستخدم فوراً إذا لم يكن قد اختار مظهراً مخصصاً بنفسه.

### 4. تحديث مدير المظهر (Theme Store)
- **الملف:** `apps/frontend/src/stores/theme.js`
- **التعديلات:**
  - إضافة دالة `updateDefaultTheme(newDefaultMode)` التي تقوم بتحديث المظهر الفعلي فقط في حال عدم وجود تفضيل مسبق محفوظ للمستخدم (أي `themeStorage.getTheme()` فارغ).
  - يمكن تصدير هذه الدالة لاستخدامها في `useSiteSettings.js`.

### 5. تحديث سكريبت التهيئة في `index.html`
- **الملف:** `apps/frontend/index.html`
- **التعديلات:**
  - تحديث الدالة `readStoredTheme` لتقرأ تفضيل المستخدم من `localStorage("theme")`.
  - إذا لم يوجد، تقرأ `site_theme_default` الذي قمنا بحفظه.
  - إذا لم يوجد، تعود للوضع الافتراضي الصلب (`"dark"`).

### 6. ربط زر التبديل بالإعدادات (ThemeToggle)
- **الملف:** `apps/frontend/src/components/base/ThemeToggle.vue`
- **التعديلات:**
  - استيراد `useSiteSettings` للحصول على إعدادات الموقع الحالية (`siteSettings`).
  - استخدام `v-if="siteSettings.theme_show_switcher !== false"` لإخفاء الزر كلياً من كل مكان في المنصة (مثل `AdminNavbar` و `DashboardNavbar`) بناءً على قرار الإدارة.

## المراجعة والتحقق
- التأكد من عدم حدوث وميض عند تحديث الصفحة باستخدام مظهر غير افتراضي.
- التأكد من أن الزر يختفي من جميع القوائم عندما يقوم المشرف بتعطيله.
- التأكد من أن التغييرات تنعكس فورياً في لوحة الإدارة.

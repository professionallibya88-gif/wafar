# Tasks
- [x] Task 1: تحديث مكون `BaseSpinner.vue` لدعم الأشكال المتعددة (variants).
  - [x] SubTask 1.1: إضافة أنماط الـ CSS والأنيميشن الخاصة بتصميم "dual-ring" (حلقتان هندسيتان) وتصاميم أخرى.
  - [x] SubTask 1.2: تعيين "dual-ring" كخيار افتراضي في حالة عدم تحديد شكل.
- [x] Task 2: إعادة إنشاء قسم إعدادات السبينر.
  - [x] SubTask 2.1: إنشاء مكون `SpinnerSystemSettings.vue` مع خيارات الشكل، الحجم، اللون، والسرعة والمعاينة.
  - [x] SubTask 2.2: تحديث `AdminSettingsView.vue` لاستيراد المكون وإضافة حالات الإعدادات الخاصة بالسبينر (`loader_spinner_variant`, إلخ).
- [x] Task 3: إصلاح تموضع مؤشرات التحميل العامة (Deep Fix).
  - [x] SubTask 3.1: تعديل `BaseRouteLoader.vue` لاستخدام `inset-0 flex items-center justify-center` بدلاً من `top-0 pt-5`.
  - [x] SubTask 3.2: التحقق من `BaseBlockingOverlay.vue` لضمان التموضع المركزي السليم.

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 can run in parallel with Task 1 and 2
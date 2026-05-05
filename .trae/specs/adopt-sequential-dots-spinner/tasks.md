# Tasks
- [x] Task 1: تحديث مكون `BaseSpinner.vue` ليعتمد تصميم "نقاط تتابعية".
  - [x] SubTask 1.1: إضافة أنماط الـ CSS والأنيميشن الخاصة بتصميم النقاط التتابعية.
  - [x] SubTask 1.2: إزالة أنماط وأنواع (variants) السبينرات القديمة من الكود.
- [x] Task 2: تنظيف مكونات التحميل العامة وإزالة الحواف/الخلفيات الزائدة.
  - [x] SubTask 2.1: مراجعة `BaseRouteLoader` و `BaseBlockingOverlay` للتأكد من ظهور النقاط نظيفة بدون حواف غير ضرورية.
- [x] Task 3: حذف قائمة اختيار السبينر من إعدادات النظام.
  - [x] SubTask 3.1: حذف مكون `SpinnerSystemSettings.vue`.
  - [x] SubTask 3.2: إزالة قسم واستيرادات اختيار السبينر من `AdminSettingsView.vue`.

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
# Adopt Sequential Dots Spinner Spec

## Why
طلب المستخدم اعتماد تصميم "نقاط تتابعية" (التصميم رقم 8 من مجلد `mockups/spinners-30`) كافتراضي وموحد في النظام. يجب تنظيف الواجهة لتظهر هذه النقاط (الشعار المتحرك) فقط بدون أي قوائم اختيار للسبينر (إزالة الإعدادات الخاصة باختيار نوع السبينر) وبدون حواف حول السبينر، ليكون تصميماً نظيفاً وموحداً بشكل كامل عبر المشروع.

## What Changes
- تحديث مكون `BaseSpinner.vue` ليعتمد فقط تصميم "نقاط تتابعية" (4 نقاط متجاورة تنبض بشكل تتابعي).
- إزالة الخصائص القديمة للسبينر (`variant`) لتوحيد التصميم بشكل إجباري.
- حذف مكون `SpinnerSystemSettings.vue` وإزالة قسم اختيار السبينر من صفحة إعدادات الإدارة `AdminSettingsView.vue`.
- التأكد من عدم وجود خلفيات أو حواف غير ضرورية حول السبينر في مكونات التحميل العامة مثل `BaseRouteLoader` و `BaseBlockingOverlay` (بحيث يظهر الشعار المتحرك فقط بوضوح).

## Impact
- Affected specs: نظام التحميل الموحد (Unified Spinner System).
- Affected code:
  - `apps/frontend/src/components/base/BaseSpinner.vue`
  - `apps/frontend/src/components/admin/SpinnerSystemSettings.vue` (حذف)
  - `apps/frontend/src/views/admin/AdminSettingsView.vue`
  - `apps/frontend/src/components/base/BaseRouteLoader.vue`
  - `apps/frontend/src/components/base/BaseBlockingOverlay.vue`

## ADDED Requirements
### Requirement: توحيد تصميم مؤشر التحميل
النظام يجب أن يستخدم حصرياً تصميم "نقاط تتابعية" كمؤشر تحميل (شعار متحرك) عبر المنصة بالكامل، بدون إمكانية تغييره من الإعدادات.

#### Scenario: تحميل صفحة أو عملية
- **WHEN** ينتظر المستخدم تحميل محتوى أو إكمال إجراء
- **THEN** يظهر الشعار المتحرك "نقاط تتابعية" بشكل نظيف ومباشر بدون حواف إضافية

## REMOVED Requirements
### Requirement: خيارات تصميم السبينر
**Reason**: بناءً على طلب المستخدم لتوحيد التصميم بشكل نظيف وإجباري (بدون قائمة).
**Migration**: حذف `SpinnerSystemSettings.vue` وإزالة الإعدادات من `AdminSettingsView.vue`.

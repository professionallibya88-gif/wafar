# Restore Spinner Settings and Fix Position Spec

## Why
طلب المستخدم تغيير السبينر الافتراضي إلى "2. حلقتان هندسيتان" (Dual Geometric Rings)، وإعادة إنشاء قسم الإعدادات الخاص بالسبينر في لوحة التحكم ليتمكن من تغييره متى شاء مع إمكانية المعاينة. بالإضافة إلى ذلك، أبلغ المستخدم عن مشكلة ظهور السبينر في أعلى وسط الشاشة بدلاً من منتصف الشاشة في بعض الأحيان (مثل شاشات التحميل والتنقل)، مما يتطلب فحصاً عميقاً وإصلاحاً.

## What Changes
- استعادة دعم المتغيرات (variants) في مكون `BaseSpinner.vue` وتعيين "dual-ring" كخيار افتراضي.
- إعادة إنشاء مكون `SpinnerSystemSettings.vue` الذي يوفر واجهة لاختيار شكل، حجم، لون، وسرعة السبينر مع معاينة حية.
- إعادة دمج قسم إعدادات السبينر في صفحة `AdminSettingsView.vue` ضمن الإعدادات العامة.
- فحص عميق وإصلاح مكون `BaseRouteLoader.vue` (ومكونات التغطية الأخرى) لتغيير التموضع من أعلى الشاشة (`top-0 pt-5`) إلى منتصف الشاشة تماماً (`inset-0 flex items-center justify-center`).

## Impact
- Affected specs: تعديل على قرار `adopt-sequential-dots-spinner` السابق لاستعادة المرونة.
- Affected code:
  - `apps/frontend/src/components/base/BaseSpinner.vue`
  - `apps/frontend/src/components/admin/SpinnerSystemSettings.vue` (إعادة إنشاء)
  - `apps/frontend/src/views/admin/AdminSettingsView.vue`
  - `apps/frontend/src/components/base/BaseRouteLoader.vue`
  - `apps/frontend/src/components/base/BaseBlockingOverlay.vue`

## ADDED Requirements
### Requirement: قسم إعدادات السبينر
يجب أن يوفر النظام واجهة إعدادات كاملة في لوحة تحكم الإدارة تتيح للمدير تغيير نوع السبينر، حجمه، لونه، وسرعته مع معاينة حية.

#### Scenario: تغيير شكل السبينر
- **WHEN** يقوم المدير بتغيير شكل السبينر من الإعدادات وحفظ التغييرات
- **THEN** ينعكس التغيير فوراً على جميع مؤشرات التحميل في المنصة

## MODIFIED Requirements
### Requirement: التموضع المركزي لمؤشرات التحميل
يجب أن تظهر مؤشرات التحميل العامة (مثل `BaseRouteLoader`) في منتصف الشاشة تماماً في جميع الأوقات.

#### Scenario: التنقل بين الصفحات
- **WHEN** يظهر مؤشر التحميل أثناء الانتقال من صفحة لأخرى
- **THEN** يظهر السبينر في منتصف الشاشة (أفقياً وعمودياً) بدلاً من أعلى الشاشة.

## REMOVED Requirements
### Requirement: إجبار استخدام تصميم النقاط التتابعية فقط
**Reason**: بناءً على طلب المستخدم لاستعادة المرونة في اختيار تصميم السبينر.
**Migration**: إعادة دعم الـ variants في `BaseSpinner.vue`.

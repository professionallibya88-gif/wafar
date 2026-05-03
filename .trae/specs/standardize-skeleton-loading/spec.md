# Standardize Skeleton Loading Spec

## Why
حالياً، المشروع لا يستفيد من ميزة الهيكل التحميلي (Skeleton Loading) بالشكل المطلوب رغم وجود مكون أساسي له `BaseSkeleton.vue`. استخدام الهيكل التحميلي (مثل يوتيوب وفيسبوك) يحسن بشكل كبير من تجربة المستخدم (UX) والإدراك البصري لسرعة النظام (Perceived Performance) مقارنة بالشاشات الفارغة أو مؤشرات الدوران التقليدية (Spinners).

## What Changes
- تفعيل واستخدام مكون `BaseSkeleton.vue` في الصفحات الرئيسية (مثل `SearchView`, `CartView`, `AdminDashboardView`).
- استبدال مؤشرات التحميل النصية، أو الدائرية، أو الشاشات الفارغة بهياكل تحميل تتوافق مع تصميم البطاقات والجداول الفعلية.
- التأكد من توافق `BaseSkeleton.vue` التام مع الوضع الليلي (Dark Mode) والوضع النهاري (Light Mode) حسب ثيم منصة "وفر" والاتجاه (RTL).

## Impact
- Affected specs: تجربة المستخدم (UX)، واجهات العرض (UI Layouts).
- Affected code: 
  - `apps/frontend/src/components/base/BaseSkeleton.vue`
  - `apps/frontend/src/views/dashboard/SearchView.vue`
  - `apps/frontend/src/views/dashboard/CartView.vue`
  - `apps/frontend/src/views/admin/AdminDashboardView.vue`
  - `apps/frontend/src/views/dashboard/MyOrdersView.vue`

## ADDED Requirements
### Requirement: Skeleton Loading Integration
النظام يجب أن يعرض Skeleton Loaders بشكل متوافق مع الثيم أثناء جلب البيانات من الخادم في جميع القوائم والجداول والبطاقات الرئيسية.

#### Scenario: Data Fetching State
- **WHEN** المستخدم يفتح صفحة البحث (SearchView) والبيانات قيد التحميل.
- **THEN** يظهر هيكل تحميلي (Card Skeleton) يطابق شكل وتخطيط بطاقة المنتج الفعلي حتى تكتمل البيانات.

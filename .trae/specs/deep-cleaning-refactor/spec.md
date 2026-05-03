# Deep Cleaning Refactor Spec

## Why
تحتوي بعض الملفات في الواجهة الأمامية (مثل `AdminLayout.vue`) على مئات الأسطر وتدمج العديد من المسؤوليات (شريط التنقل، القائمة الجانبية، القائمة السفلية، الإعدادات). هذا يصعب من عملية الصيانة. في الواجهة الخلفية، يحتوي `SearchService.ts` على العديد من استخدامات `any` مما يفقدنا مزايا التحقق الصارم في TypeScript ويزيد من احتمالية الأخطاء وقت التشغيل.

## What Changes
- تفكيك `AdminLayout.vue` إلى مكونات أصغر:
  - `AdminNavbar.vue`: شريط التنقل العلوي.
  - `AdminSidebar.vue`: القائمة الجانبية.
  - `AdminBottomNav.vue`: القائمة السفلية للموبايل.
- إنشاء Composable جديد `useAdminMenu.js` لمشاركة بيانات القائمة والإحصائيات بين مكونات الإدارة.
- إضافة واجهات TypeScript (Interfaces) دقيقة لملف `SearchService.ts` للتخلص التام من استخدام `any`.

## Impact
- Affected specs: بنية الواجهة الأمامية للإدارة، طبقة خدمة البحث.
- Affected code:
  - `apps/frontend/src/layouts/AdminLayout.vue`
  - `apps/frontend/src/components/layout/AdminNavbar.vue` (جديد)
  - `apps/frontend/src/components/layout/AdminSidebar.vue` (جديد)
  - `apps/frontend/src/components/layout/AdminBottomNav.vue` (جديد)
  - `apps/frontend/src/composables/useAdminMenu.js` (جديد)
  - `apps/backend/src/services/SearchService.ts`

## ADDED Requirements
### Requirement: Strict Typing in SearchService
يجب أن يحتوي `SearchService.ts` على أنواع (Types/Interfaces) لجميع المعاملات في كل الدوال (`smartSearch`, `legacySearch`, `compare`, `exportToExcel`، وغيرها)، دون أي استخدام صريح لـ `any`.

## MODIFIED Requirements
### Requirement: Decomposed Admin Layout
يجب أن يكون `AdminLayout.vue` مجرد هيكل حاوية (Wrapper) يعتمد على المكونات الفرعية المستقلة، بحيث لا يتجاوز حجمه 150-200 سطر بدلاً من 680 سطر.

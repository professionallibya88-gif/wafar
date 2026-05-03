# Tasks

- [x] Task 1: Decompose AdminLayout.vue
  - [x] SubTask 1.1: إنشاء Composable `useAdminMenu.js` لنقل منطق الإحصائيات (quickStats) وتكوين القوائم (adminMenuSectionsConfig) وحساب العناصر الفعالة.
  - [x] SubTask 1.2: إنشاء مكون `AdminNavbar.vue` لنقل شريط التنقل العلوي (القائمة المنسدلة، التمرير، زر تبديل القائمة الجانبية).
  - [x] SubTask 1.3: إنشاء مكون `AdminSidebar.vue` لنقل القائمة الجانبية (روابط الأقسام، زر الطي).
  - [x] SubTask 1.4: إنشاء مكون `AdminBottomNav.vue` لنقل القائمة السفلية الخاصة بالموبايل.
  - [x] SubTask 1.5: إعادة بناء `AdminLayout.vue` لاستيراد واستخدام هذه المكونات بدلاً من الكود المباشر.

- [x] Task 2: Strict Typing for SearchService.ts
  - [x] SubTask 2.1: تعريف واجهات (Interfaces) واضحة لمعاملات البحث (`LegacySearchParams`, `ExportFilters`, إلخ) في `SearchService.ts` أو ملف أنواع منفصل.
  - [x] SubTask 2.2: استبدال جميع حالات `any` في دوال `SearchService.ts` بالأنواع المحددة.
  - [x] SubTask 2.3: إجراء فحص TypeScript (tsc) للتأكد من عدم وجود أخطاء في Service.

- [x] Task 3: Lint & Build Verification
  - [x] SubTask 3.1: تشغيل `npm run lint` للتأكد من توافق المكونات الأمامية والخلفية مع المعايير.
  - [x] SubTask 3.2: تشغيل `npm run test` (للباكند) للتأكد من أن الأنواع الجديدة لم تكسر الاختبارات.

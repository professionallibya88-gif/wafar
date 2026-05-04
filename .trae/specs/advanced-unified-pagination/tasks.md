# Tasks

- [x] Task 1: Create `BasePagination` component
  - [x] إنشاء ملف `src/components/base/BasePagination.vue`
  - [x] برمجة منطق حساب أرقام الصفحات (Pagination Logic) مع إظهار النقاط `...` للقفز عند كثرة الصفحات.
  - [x] إضافة قائمة اختيار عدد العناصر (Page Size Selector: 20, 50, 100, 200).
  - [x] إضافة حقل الانتقال المباشر لرقم الصفحة (Jump to Page).
  - [x] تصدير المكون من `src/components/base/index.js`.
  
- [x] Task 2: Implement Pagination in Admin Views
  - [x] تحديث `AdminUsersView.vue` لاستخدام `BasePagination` أعلى وأسفل الجدول وربط `pageSize` مع الـ API.
  - [x] تحديث `AdminSuppliersView.vue` لاستخدام `BasePagination`.
  - [x] تحديث `AdminPartsView.vue` لاستخدام `BasePagination`.
  - [x] تحديث `AdminFilesView.vue` (إن وجد) لاستخدام `BasePagination`.
  - [x] تحديث `AdminPaymentsView.vue` لاستخدام `BasePagination`.
  - [x] تحديث `AdminPlansView.vue` لاستخدام `BasePagination` إذا كان يحتوي على ترقيم.
  
- [x] Task 3: Implement Pagination in Dashboard Views
  - [x] تحديث `SearchView.vue` (جدول نتائج البحث).
  - [x] تحديث `MyFilesView.vue`.
  - [x] تحديث `CatalogsView.vue`.
  - [x] تحديث `SearchHistoryView.vue`.
  - [x] تحديث `PaymentsView.vue` (للمستخدمين).

- [x] Task 4: Clean up and Validation
  - [x] التأكد من أن جميع الجداول تعمل بسلاسة مع تغيير `pageSize` وتنتقل للبيانات الصحيحة.
  - [x] التأكد من ظهور الترقيم في بداية (أعلى) ونهاية (أسفل) الجدول.
  - [x] تشغيل `npm run lint` للتأكد من نظافة الكود وإصلاح أي تحذيرات.

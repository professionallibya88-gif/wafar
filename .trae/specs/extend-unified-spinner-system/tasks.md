# Tasks
- [x] Task 1: مراجعة مكون `BaseSpinner` وتثبيت مواصفاته البصرية النهائية.
  - [x] SubTask 1.1: توحيد الأحجام والألوان والسرعة الحركية
  - [x] SubTask 1.2: التأكد من وضوحه في الوضعين الفاتح والداكن
  - [x] SubTask 1.3: تثبيت سلوك `prefers-reduced-motion` عند الحاجة

- [x] Task 2: استبدال جميع مؤشرات التحميل الدائرية غير الموحدة في المكونات المشتركة.
  - [x] SubTask 2.1: مراجعة `NotificationBell.vue`
  - [x] SubTask 2.2: مراجعة أي مكونات مشتركة أخرى تعتمد دوراناً مباشراً أو سبينراً غير معياري

- [x] Task 3: توحيد استخدام السبينر في الصفحات التي تعتمد تحميلات خفيفة.
  - [x] SubTask 3.1: مراجعة `NotificationsView.vue`
  - [x] SubTask 3.2: مراجعة `UploadPDFView.vue`
  - [x] SubTask 3.3: تطبيق `BaseSpinner` فقط في المواضع المناسبة التي لا تتطلب Skeleton

- [x] Task 4: توثيق السياسة العملية بين Spinner و Skeleton داخل النظام.
  - [x] SubTask 4.1: تثبيت مواضع استخدام السبينر الدائري
  - [x] SubTask 4.2: تثبيت مواضع استمرار استخدام Skeleton

- [x] Task 5: التحقق النهائي من التوحيد البصري.
  - [x] SubTask 5.1: تشغيل `lint` للواجهة الأمامية
  - [x] SubTask 5.2: مراجعة الصفحات والمكونات التي تم تحديثها
  - [x] SubTask 5.3: التأكد من عدم بقاء أي تحميل دائري قديم في النطاق المستهدف

- [x] Task 6: استكمال إزالة مؤشرات التحميل الدائرية القديمة المتبقية في الملفات الحرجة.
  - [x] SubTask 6.1: مراجعة صفحات المصادقة التي ما زالت تستخدم أيقونات دوران مباشرة
  - [x] SubTask 6.2: مراجعة صفحات الإدارة واللوحات التي ما زالت تحتوي `animate-spin` أو مؤشرات دوران قديمة
  - [x] SubTask 6.3: استبدال المؤشرات القديمة بـ `BaseSpinner` أو الإبقاء على `BaseSkeleton` حيث يكون أنسب

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 1, Task 2, Task 3
- Task 6 depends on Task 1, Task 2, Task 3, Task 4
- Task 5 depends on Task 1, Task 2, Task 3, Task 4, Task 6

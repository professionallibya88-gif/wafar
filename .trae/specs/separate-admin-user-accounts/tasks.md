# Tasks
- [x] Task 1: إنشاء نماذج ومستودعات المديرين (Backend: Database & Repositories): بناء هيكل قاعدة البيانات للمديرين وإزالة صلاحيات المدير من المستخدمين.
  - [x] SubTask 1.1: إنشاء نموذج `Admin.ts` بخصائص إدارية (مثل `id`, `full_name`, `email`, `password`, `role`).
  - [x] SubTask 1.2: تحديث نموذج `User.ts` لإزالة الدور `admin` من `role`.
  - [x] SubTask 1.3: إنشاء `AdminRepository.ts` وتحديث `index.ts` للمستودعات.
  - [x] SubTask 1.4: إنشاء ملف تهجير (Migration) لإنشاء جدول `admins` وتعديل عمود `role` في جدول `users`.
- [x] Task 2: فصل خدمات المصادقة والموجهات (Backend: Auth Services & Routes): بناء نظام مصادقة مستقل للمديرين.
  - [x] SubTask 2.1: إنشاء `AdminAuthService.ts` للتعامل مع تسجيل دخول المديرين وتوليد توكن مخصص.
  - [x] SubTask 2.2: إنشاء `adminAuthController.ts` و `adminAuthRoutes.ts` لمسارات دخول وخروج المديرين.
  - [x] SubTask 2.3: تحديث `auth.ts` middleware لدعم التحقق المستقل من التوكن عبر ميدلوير جديد مخصص للمديرين (`adminAuth`).
  - [x] SubTask 2.4: تحديث مسارات الإدارة الحالية `adminRoutes.ts` لتستخدم الميدلوير الجديد `adminAuth`.
- [x] Task 3: تحديث لوحة التحكم للمصادقة المستقلة (Frontend: Dashboard Auth): فصل نظام تسجيل الدخول.
  - [x] SubTask 3.1: إنشاء صفحة تسجيل دخول خاصة بالمديرين (مثلاً `AdminLoginView.vue`).
  - [x] SubTask 3.2: تحديث متجر `auth` في Pinia لدعم نوعين من المصادقة (admin و user) بشكل مستقل أو إنشاء `adminAuthStore`.
  - [x] SubTask 3.3: تعديل نظام التوجيه (`router/index.js`) لضمان عدم توجيه المدير إلى حساب مستخدم عادي، وحماية مسارات `/admin` لتعتمد على مصادقة المديرين فقط.
- [x] Task 4: فصل إدارة المستخدمين والمديرين في الواجهة الأمامية (Frontend: User & Admin Management):
  - [x] SubTask 4.1: إزالة أي خيارات تخص المديرين من `AdminUsersView.vue` (إزالة خيار الترقية لمدير، وإزالة المديرين من القائمة).
  - [x] SubTask 4.2: إنشاء واجهة `AdminAdminsView.vue` لإدارة المديرين كقسم مستقل بالكامل (عرض، إضافة، تعديل، حذف).
  - [x] SubTask 4.3: تحديث القائمة الجانبية في لوحة التحكم لتشمل قسم "المديرين" المستقل.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]

# المهام (Tasks)

- [x] Task 1: توسيع إعدادات النظام لتشمل شكل ولون الويدجت (Widget Settings)
  - [ ] SubTask 1.1: تعديل ملفات الإعدادات في الباك إند لإضافة متغيرات لون وشكل الأيقونة العائمة (Background Color, Icon Color, Shape).
  - [ ] SubTask 1.2: تحديث صفحة `AdminSettingsView.vue` في قسم الواجهة لإضافة حقول اختيار الألوان والأشكال للويدجت العائم.

- [x] Task 2: بناء نماذج وجداول نظام التذاكر والمراسلات
  - [ ] SubTask 2.1: إنشاء `SupportTicket` و `SupportMessage` Sequelize models (يتضمن `status`, `user_id`, `subject`, `content`).
  - [ ] SubTask 2.2: إنشاء ملف Migration لتكوين هذه الجداول وتنفيذ التهجير في قاعدة البيانات.

- [x] Task 3: بناء طبقة الواجهة الخلفية لنظام المراسلة
  - [x] SubTask 3.1: إنشاء `SupportTicketRepository` و `SupportMessageRepository`.
  - [x] SubTask 3.2: إنشاء `SupportTicketService` ومتحكم `SupportTicketController`.
  - [x] SubTask 3.3: بناء مسارات `supportTicketRoutes.ts` (API لجلب، إنشاء، الرد، وإغلاق التذاكر) للمدير والمستخدم.

- [x] Task 4: بناء قسم إدارة التذاكر في لوحة التحكم
  - [x] SubTask 4.1: إنشاء `SupportTicketsView.vue` في مجلد `admin` لعرض قائمة التذاكر وتفاصيلها.
  - [x] SubTask 4.2: إضافة نافذة محادثة للمدير للرد المباشر على رسائل المستخدم وإغلاق التذكرة.

- [x] Task 5: تحديث وتوسيع الويدجت العائم للمستخدمين
  - [x] SubTask 5.1: تعديل `FloatingSupportWidget.vue` لتطبيق ألوان وشكل الإعدادات الديناميكية المسترجعة من الـ API.
  - [x] SubTask 5.2: إضافة زر "مراسلة الدعم" داخل الويدجت يفتح نافذة منبثقة مصغرة (Mini Chat) لإنشاء تذكرة والرد عليها.
  - [x] SubTask 5.3: دمج نظام المراسلة بالكامل في الويدجت وربطه بخدمة `supportTicketAPI`.

# تبعيات المهام (Task Dependencies)
- [Task 2] يعتمد على [Task 1].
- [Task 3] يعتمد على [Task 2].
- [Task 4] يعتمد على [Task 3].
- [Task 5] يعتمد على [Task 1] و [Task 3].

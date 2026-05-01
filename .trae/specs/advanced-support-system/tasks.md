# المهام (Tasks)

- [x] Task 1: إنشاء نموذج قاعدة البيانات الخاص بقنوات التواصل
  - [x] SubTask 1.1: إنشاء `SupportChannel` Sequelize model (يحتوي على: `id`, `name`, `type` (whatsapp, phone, link), `value`, `is_active`, `icon`).
  - [x] SubTask 1.2: إنشاء ملف Migration للنموذج الجديد `support_channels`.
  - [x] SubTask 1.3: تشغيل الـ Migrations.

- [x] Task 2: بناء طبقة الواجهة الخلفية (Backend Layer)
  - [x] SubTask 2.1: إنشاء `SupportChannelRepository` للتعامل مع قاعدة البيانات.
  - [x] SubTask 2.2: إنشاء `SupportChannelService` لإدارة منطق الأعمال.
  - [x] SubTask 2.3: إنشاء `SupportChannelController` مع `asyncHandler` و `ApiResponse`.
  - [x] SubTask 2.4: إضافة مسارات (Routes) و Validation Middleware (إضافة/تعديل/جلب/حذف).

- [x] Task 3: بناء مكون الواجهة الأمامية العائم (Floating Widget)
  - [x] SubTask 3.1: إنشاء `FloatingSupportWidget.vue` باستخدام `AppIcon.vue` لدعم أيقونات `@heroicons/vue`.
  - [x] SubTask 3.2: إنشاء خدمة API `services/api/support.js` في الواجهة الأمامية.
  - [x] SubTask 3.3: دمج المكون `FloatingSupportWidget.vue` في التخطيط العام `DashboardLayout.vue`.

- [x] Task 4: بناء قسم إدارة قنوات التواصل في لوحة التحكم
  - [x] SubTask 4.1: إنشاء صفحة `SupportChannelsView.vue` داخل مجلد `admin`.
  - [x] SubTask 4.2: إضافة واجهة لعرض، إضافة، تعديل، وحذف قنوات التواصل.
  - [x] SubTask 4.3: دمج زر التحكم في الحالة (Toggle Active) لإخفاء/إظهار القناة.
  - [x] SubTask 4.4: تحديث القائمة الجانبية `DashboardSidebar.vue` لإضافة رابط "إدارة التواصل والدعم".

# تبعيات المهام (Task Dependencies)
- [Task 2] يعتمد على [Task 1].
- [Task 3] يعتمد على [Task 2].
- [Task 4] يعتمد على [Task 2].

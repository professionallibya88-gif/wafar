# المهام (Tasks)
- [x] Task 1: توحيد تخزين الجلسة (Storage Consolidation)
  - [x] SubTask 1.1: إزالة `adminAuthStorage` من `services/storage.js` والإبقاء على `authStorage` فقط.
  - [x] SubTask 1.2: تحديث `authStorage` للتعامل مع بيانات المستخدم والمدير بشكل موحد تحت مفاتيح `token` و `user`.
- [x] Task 2: توحيد عميل الشبكة (HTTP Client Unification)
  - [x] SubTask 2.1: حذف ملف `services/adminHttp.js`.
  - [x] SubTask 2.2: تحديث `services/http.js` ليكون العميل الوحيد، وتعديل Interceptor الخاص بالخطأ 401 ليتعامل مع التوجيه بناءً على مسار الصفحة الحالي بذكاء (أو ترك التوجيه لـ Vue Router بالكامل).
  - [x] SubTask 2.3: تحديث جميع خدمات الـ API (مثل `adminAPI`, `settingsAPI`, إلخ) لاستخدام `http.js` بدلاً من `adminHttp.js`.
- [x] Task 3: توحيد متاجر المصادقة (Pinia Auth Stores Unification)
  - [x] SubTask 3.1: حذف ملف `stores/adminAuth.js`.
  - [x] SubTask 3.2: تحديث `stores/auth.js` ليدعم أدوار المديرين (`isAdmin` تعتمد على التحقق من الأدوار `super_admin, admin, editor, viewer`).
  - [x] SubTask 3.3: توحيد دالة `initializeAuth` و `logout` لتشمل مسارات الـ API الخاصة بالمدير (`/admin/auth/me`) إذا كان الـ role يخص الإدارة، أو دمج الـ API الخلفي ليصبح نقطة دخول واحدة `/auth/me`.
- [x] Task 4: تحديث حراس التوجيه (Router Guards Update)
  - [x] SubTask 4.1: تحديث `router/index.js` ليعتمد فقط على `authStore`.
  - [x] SubTask 4.2: التأكد من أن `requiresAuth` يسمح بمرور المديرين والمستخدمين، وأن `requiresAdminAuth` يسمح بمرور المديرين فقط.
  - [x] SubTask 4.3: تحديث `utils/authRedirect.js` للتوافق مع النظام الموحد وتصحيح التوجيه بعد تسجيل الدخول.
- [x] Task 5: تعديل الواجهة الخلفية لدعم المصادقة المشتركة (Backend Middleware & Controllers)
  - [x] SubTask 5.1: تحديث `middleware/auth.ts` بحيث لا يرفض `auth` رموز المديرين (Admin Tokens)، بل يقوم بتعيين `req.admin` أو كائن `req.user` وهمي/معدل ليمر بسلام للمتحكمات.
  - [x] SubTask 5.2: تحديث `pdfController` والمتحكمات الأخرى التي تتطلب `req.user.id` لتسمح بمرور الطلب إذا كان من مدير (مثلاً بجعل `user_id` يساوي `null` أو التعامل معه كـ System Action).

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] can be done in parallel with frontend tasks, but is required for full end-to-end functionality.
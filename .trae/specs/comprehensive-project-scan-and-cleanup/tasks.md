# Tasks
- [x] Task 1: فحص البنية المعمارية للواجهة الخلفية (Backend Architecture Validation)
  - [x] SubTask 1.1: فحص Controllers للتأكد من استخدام `asyncHandler` و `ApiResponse` وعدم وجود استدعاءات لقاعدة البيانات.
  - [x] SubTask 1.2: فحص Services للتأكد من استخدام Repositories بدلاً من النماذج (Models) مباشرة، والتأكد من رمي الأخطاء المخصصة (AppError subclasses).
  - [x] SubTask 1.3: التأكد من وضع جميع قواعد التحقق (Validators) في مجلد `validators/` وعدم وجودها في `routes/`.
- [x] Task 2: فحص الواجهة الأمامية (Frontend Validation)
  - [x] SubTask 2.1: التأكد من أن متاجر Pinia لا تستخدم `localStorage` مباشرة وتعتمد على `services/storage.js`.
  - [x] SubTask 2.2: التحقق من عدم وجود إيموجيز (Emojis) واستخدام `AppIcon.vue` حصراً للأيقونات.
  - [x] SubTask 2.3: التأكد من أن جميع الأرقام تُعرض بالتنسيق الغربي (123) والاتجاه RTL (اليمين لليسار).
- [x] Task 3: فحص خدمة بايثون (Python Service Validation)
  - [x] SubTask 3.1: التأكد من عدم وجود أخطاء استيراد أو دوال غير مستخدمة.
  - [x] SubTask 3.2: التأكد من التزام الكود بالمعايير ومعالجة الأخطاء بشكل سليم.
- [x] Task 4: تنظيف الكود والمشروع (Project Cleanup)
  - [x] SubTask 4.1: البحث عن أي ملفات غير مستخدمة أو سكربتات اختبار/تنظيف مؤقتة في جذر المشروع وإزالتها أو نقلها.
  - [x] SubTask 4.2: إزالة جميع الاستيرادات (Imports) غير المستخدمة في الكود (Frontend & Backend).
- [x] Task 5: تشغيل فحوصات الجودة (Linting & Testing)
  - [x] SubTask 5.1: تشغيل `npm run lint` في مجلد الواجهة الخلفية وإصلاح كافة الأخطاء.
  - [x] SubTask 5.2: تشغيل `npm run lint` في مجلد الواجهة الأمامية وإصلاح كافة الأخطاء.

# Task Dependencies
- [Task 5] depends on [Task 1], [Task 2], [Task 3], [Task 4]

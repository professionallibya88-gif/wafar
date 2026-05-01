# Tasks
- [x] Task 1: تنظيم ملفات الجذر والسكربتات المؤقتة: مراجعة ملفات `.cjs` و `.js` و `.py` في جذر المشروع ونقلها إلى مجلد `scripts` أو حذفها إذا لم تكن ضرورية.
  - [x] SubTask 1.1: إنشاء مجلد `scripts/` في الجذر.
  - [x] SubTask 1.2: نقل سكربتات الإصلاح والفحص (مثل `fix-*.cjs`, `scan-*.cjs`, `test-*.cjs`) إلى `scripts/`.
- [x] Task 2: فحص وإصلاح أخطاء TypeScript و Linter في Backend: تشغيل الفحص وإصلاح الأخطاء.
  - [x] SubTask 2.1: تشغيل `npm run lint` في الـ Backend وإصلاح الأخطاء.
  - [x] SubTask 2.2: التحقق من عدم وجود `any` غير مبرر والتأكد من تطبيق الواجهات (Interfaces) الصارمة.
- [x] Task 3: فحص وإصلاح أخطاء Linter و Vue في Frontend: تشغيل الفحص وإصلاح الأخطاء.
  - [x] SubTask 3.1: تشغيل `npm run lint` في الـ Frontend وإصلاح الأخطاء إن وجدت.
  - [x] SubTask 3.2: التحقق من تنظيم المكونات والمتاجر (Stores).
- [x] Task 4: فحص وتأكيد عمل Python Service: التحقق من الأكواد واستقرار الخدمة.
  - [x] SubTask 4.1: مراجعة أكواد بايثون والتأكد من عدم وجود أخطاء منطقية.
  - [x] SubTask 4.2: إزالة ملفات `.pyc` أو إضافتها لـ `.gitignore` بشكل صحيح.
- [x] Task 5: مراجعة البنية المعمارية: التأكد من عدم وجود خروقات للقواعد المعمارية (مثلاً استدعاء Models خارج Repositories).
  - [x] SubTask 5.1: فحص Controllers و Services للتأكد من التزامها بنمط المستودع (Repository Pattern).
  - [x] SubTask 5.2: التأكد من استخدام `asyncHandler` و `ApiResponse` في جميع الـ Controllers.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 5] depends on [Task 2]
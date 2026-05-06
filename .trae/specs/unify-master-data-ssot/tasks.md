# Tasks

- [x] Task 1: حصر البيانات الأساسية الحالية وتحديد مصدر SSOT المقترح.
  - [x] SubTask 1.1: جرد جميع القوائم الثابتة المستخدمة فعليًا في `apps/frontend/src` و`apps/backend/src/config`.
  - [x] SubTask 1.2: توثيق أماكن التكرار وتحديد ما سيتم نقله كما هو وما يحتاج توحيد تسمية.
  - [x] SubTask 1.3: تحديد موقع الوحدة المركزية داخل المشروع الحالي بما يتوافق مع بنية الـ monorepo.
  - [x] SubTask 1.4: التحقق عبر `GetDiagnostics` أن التغييرات المرحلية لا تُدخل أخطاء TypeScript.

- [x] Task 2: بناء وحدة master-data المركزية (Foundation) مع أنواع صارمة وسجل أصول موحد.
  - [x] SubTask 2.1: إنشاء مجلد `master-data` في الموقع المعتمد داخل المستودع.
  - [x] SubTask 2.2: نقل القوائم الأساسية (brand/model/type...) إلى ملفات منسقة وقابلة للتصدير.
  - [x] SubTask 2.3: إنشاء `index.ts` للتصدير الموحّد وتعريف الأنواع الصارمة.
  - [x] SubTask 2.4: بناء `asset mapping` مع fallback افتراضي آمن.
  - [x] SubTask 2.5: التحقق عبر `GetDiagnostics` بعد اكتمال المرحلة.

- [x] Task 3: توثيق جاهزية الانتقال للمرحلة الثانية بعد مراجعة المرحلة الأولى.
  - [x] SubTask 3.1: تحديث هذا الملف بعد اكتمال Task 1 و Task 2 بعلامات الإنجاز.
  - [x] SubTask 3.2: إبقاء التنفيذ الفعلي للمرحلة الثانية وما بعدها إلى دورة لاحقة بعد اعتماد المستخدم.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1] and [Task 2]

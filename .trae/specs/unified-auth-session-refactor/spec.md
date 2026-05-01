# إعادة تصميم معمارية المصادقة والجلسات (Unified Auth & Session Refactor) Spec

## لماذا (Why)
يوجد حالياً فصل صارم ومزدوج للمصادقة في الواجهة الأمامية (متاجر منفصلة `authStore` و `adminAuthStore`، عملاء HTTP منفصلون `http.js` و `adminHttp.js`) مما يؤدي إلى مشاكل خطيرة في تجربة المستخدم (UX) وتضارب في حراس التوجيه (Router Guards). عندما يحاول مدير مسجل الدخول الوصول إلى مسار مستخدم عادي مثل `/upload`، يتم إعادة توجيهه قسراً إلى صفحة تسجيل الدخول، وأحياناً يدخل في دوامة إعادة توجيه لا نهائية بسبب اعتراضات (Interceptors) متعارضة. يجب إعادة تصميم هذه الآلية من الصفر لتصبح موحدة ونظيفة ومبنية على أسس صحيحة.

## التغييرات (What Changes)
- **توحيد التخزين (Storage):** دمج `adminAuthStorage` و `authStorage` في متجر واحد نظيف يدير جلسة واحدة (إما مستخدم أو مدير).
- **توحيد عميل HTTP:** إزالة `adminHttp.js` واستخدام `http.js` موحد لجميع الطلبات، مع معالجة ذكية وموحدة لخطأ `401 Unauthorized` دون إعادة توجيه قسرية متعارضة.
- **توحيد متاجر Pinia:** دمج `adminAuth.js` داخل `auth.js` لتوفير حالة توثيق واحدة `isAuthenticated` تعتمد على `role` لتحديد الصلاحيات (`isAdmin`).
- **تحديث حراس التوجيه (Router Guards):** تبسيط `router/index.js` ليعتمد على متجر التوثيق الموحد، والسماح للمديرين بالوصول إلى المسارات العامة للمستخدمين (مثل `/upload`) دون الحاجة لتسجيل دخول مزدوج.
- ****BREAKING** تعديل الواجهة الخلفية (Backend Auth Middleware):** تعديل برمجية `auth` الوسيطة لتسمح بمرور رموز المديرين (Admin Tokens) وتعيين `req.admin` بدلاً من رفضها، وتحديث المتحكمات (Controllers) مثل `pdfController` للتعامل مع `req.user.id` بأمان (تجنب أخطاء Foreign Key بجعله اختياريًا أو معالجة الحالة الإدارية).

## التأثير (Impact)
- **المواصفات المتأثرة:** توجيه الصفحات، تسجيل الدخول، حماية المسارات، رفع الملفات.
- **الكود المتأثر:**
  - `apps/frontend/src/services/storage.js`
  - `apps/frontend/src/services/http.js` (وإلغاء `adminHttp.js`)
  - `apps/frontend/src/stores/auth.js` (وإلغاء `adminAuth.js`)
  - `apps/frontend/src/router/index.js`
  - `apps/frontend/src/utils/authRedirect.js`
  - `apps/backend/src/middleware/auth.ts`
  - `apps/backend/src/controllers/*.ts` (خاصة التي تستخدم `req.user.id` بشكل مباشر وتُستدعى من مسارات مشتركة).

## المتطلبات المضافة (ADDED Requirements)
### Requirement: وصول موحد للمنصة
يجب أن يتمكن المدير المسجل دخوله من استخدام كافة ميزات المنصة (مثل `/upload`، `/search`) دون الحاجة لتسجيل الدخول بحساب مستخدم منفصل.

#### Scenario: مدير يصل إلى صفحة الرفع
- **WHEN** يقوم المدير بتسجيل الدخول وينتقل إلى `/upload`
- **THEN** تفتح الصفحة بشكل طبيعي، ولا يتم إعادة توجيهه إلى `/login` أو `/admin/login`.

## المتطلبات المعدلة (MODIFIED Requirements)
### Requirement: حراس التوجيه (Router Guards)
يجب أن يتم التحقق من المصادقة باستخدام متجر واحد فقط، وألا تقوم Interceptors الخاصة بـ axios بفرض `window.location.href` بشكل يتعارض مع حراس Vue Router.

## المتطلبات المحذوفة (REMOVED Requirements)
### Requirement: متاجر وعملاء منفصلة بالكامل
**السبب:** الفصل المزدوج في الواجهة الأمامية تسبب في تضارب وتجربة مستخدم سيئة.
**الترحيل:** سيتم مسح المفاتيح القديمة (`admin_token` وغيرها) من التخزين المحلي، وسيتم نقل الاعتماد بالكامل إلى `auth.js` و `http.js`.
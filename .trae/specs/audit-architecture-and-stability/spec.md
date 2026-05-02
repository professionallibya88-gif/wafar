# مواصفة التدقيق المعماري والاستقرار الشامل

## Why
المشروع يحتوي على معمارية معلنة وواضحة، لكن الفحص الحالي يكشف وجود انجراف فعلي بين القواعد الموثقة والتنفيذ في عدة نقاط حساسة. هذا يرفع مخاطر الأعطال الصامتة، ويزيد كلفة التعديل، ويضعف الثقة في الاستقرار التشغيلي والتوسع المستقبلي.

## What Changes
- إجراء تدقيق معماري شامل للواجهة الخلفية والواجهة الأمامية وهيكل المشروع ومسارات التشغيل والتحقق.
- توثيق الخروقات الحرجة الحالية ضد القواعد المعمارية المعلنة وترتيبها حسب مستوى الخطورة.
- تعريف خطة إصلاح مرحلية تقلل المخاطر بدون كسر السلوك الحالي أو خلط نطاقات الإصلاح.
- تحديد سياسة استقرار تشغيلي أوضح للإقلاع، التهيئة، المراقبة، والتحقق الآلي.
- تحديد الملفات والأنظمة الحرجة التي يجب أن تخضع لإعادة تنظيم أو عزل أو اختبار.

## Impact
- Affected specs: المعمارية الخلفية, معمارية الواجهة الأمامية, الاستقرار التشغيلي, التحقق والجودة, التوثيق التشغيلي
- Affected code: `apps/backend/src/controllers`, `apps/backend/src/services`, `apps/backend/src/repositories`, `apps/backend/src/server.ts`, `apps/backend/src/app.ts`, `apps/frontend/src/layouts`, `apps/frontend/src/stores`, `apps/frontend/src/services`, `apps/frontend/project.json`, `README.md`, `DEPLOYMENT.md`

## ADDED Requirements
### Requirement: Architectural Audit Baseline
النظام SHALL يوفّر مواصفة تدقيق مرجعية تجمع الخروقات المعمارية الحالية في طبقات المشروع مع ربط كل خطر بالملفات المتأثرة وأثره التشغيلي.

#### Scenario: Backend rule violations are classified
- **WHEN** تتم مراجعة `controllers` و`services` و`repositories`
- **THEN** يتم تحديد أي وصول مباشر لقاعدة البيانات خارج `repositories`
- **AND** يتم تمييز أي منطق أعمال أو استعلامات موجودة داخل `controllers`
- **AND** يتم تصنيف كل خرق إلى حرج أو مرتفع أو متوسط

#### Scenario: Frontend fragility is classified
- **WHEN** تتم مراجعة `layouts` و`stores` و`services`
- **THEN** يتم تحديد الملفات ذات التكدس العالي أو الاقتران العالي أو الاعتماد العالمي الهش
- **AND** يتم ربط كل نقطة خطر بخطة تفكيك أو توحيد أو عزل مناسبة

### Requirement: Stabilization Roadmap
النظام SHALL يوفّر خارطة إصلاح مرحلية تبدأ بالأعطال المباشرة والمخاطر البنيوية ثم تنتقل إلى التوحيد والتحسينات الوقائية.

#### Scenario: Immediate runtime defects are prioritized
- **WHEN** توجد أعطال تشغيلية مباشرة أو تضارب واضح في المسؤوليات
- **THEN** يتم وضعها في المرحلة الأولى قبل أي إعادة تنظيم تجميلية
- **AND** يتم منع خلط الإصلاحات الحرجة مع أعمال تحسين منخفضة الأولوية

#### Scenario: Startup and dependency policy is defined
- **WHEN** تتم مراجعة سلوك الإقلاع والاعتماد على DB وRedis وQueue وSession
- **THEN** يتم تعريف سياسة واضحة لما يجب أن يفشل إقلاعه فوراً وما يمكن أن يعمل بوضع degraded مضبوط
- **AND** يتم ربط السياسة بمؤشرات readiness وhealth والتحقق التشغيلي

### Requirement: Verification Coverage Map
النظام SHALL يوفّر خريطة تحقق تبين الفجوات الحالية في `lint`, `test`, اختبارات التكامل, واختبارات الواجهة الأمامية ومسارات CI.

#### Scenario: Validation gaps are documented
- **WHEN** تتم مراجعة أوامر Nx وpackage scripts والاختبارات الحالية
- **THEN** يتم توثيق أي أوامر شكلية لا تنفذ تحققاً فعلياً
- **AND** يتم تحديد الفجوات في اختبارات DB وFrontend وPython وCI

### Requirement: Critical File Inventory
النظام SHALL يوفّر قائمة بالملفات الحرجة التي تمثل نقاط اختناق أو مخاطر عالية ويجب أن تكون محور الإصلاح.

#### Scenario: High-risk files are inventoried
- **WHEN** يتم إعداد تقرير التدقيق
- **THEN** يتم تضمين الملفات الحرجة في الباكند والفروانت إند والتشغيل
- **AND** يتم توضيح سبب الخطورة لكل ملف بشكل مختصر وقابل للتنفيذ

## MODIFIED Requirements
### Requirement: Backend Architectural Integrity
النظام SHALL يلتزم فعلياً وليس توثيقياً فقط بالتدفق `Route -> Controller -> Service -> Repository -> DB`، بحيث يمنع أي وصول مباشر للنماذج أو عمليات ORM من `controllers` و`services` إلا عبر `repositories` المخصصة.

### Requirement: Frontend Structural Discipline
النظام SHALL يطبّق قاعدة تقسيم التخطيطات والمنطق المشترك عملياً، بحيث لا تبقى التخطيطات الكبيرة أو الخدمات العالمية الهشة كنقاط اختناق مركزية يصعب اختبارها وصيانتها.

### Requirement: Operational Reliability
النظام SHALL يعرّف ويطبق سياسة تحقق وتشغيل موحدة تغطي أوامر `lint` و`test` وCI وفحوص الصحة والاستعداد التشغيلي بدلاً من الاعتماد على توثيق أو مسارات تحقق غير مكتملة.

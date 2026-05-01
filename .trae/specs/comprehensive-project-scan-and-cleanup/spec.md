# Comprehensive Project Scan & Cleanup Spec

## Why
طلب المستخدم إجراء فحص كامل للمشروع لاكتشاف الأخطاء المعمارية والهيكلية والحرجة، والكسور، والنواقص، والقيام بعملية تنظيف شاملة لضمان توافق المشروع مع القواعد المعمارية الصارمة (مثل Repository Pattern) وتحسين جودة الكود.

## What Changes
- فحص كامل للواجهة الخلفية (Backend) للتأكد من الالتزام بالبنية المعمارية (عدم استدعاء النماذج خارج Repositories، استخدام asyncHandler و ApiResponse).
- فحص شامل للواجهة الأمامية (Frontend) للتأكد من استخدام خدمات التخزين الصحيحة، والامتثال لقواعد Tailwind و Pinia.
- مراجعة خدمة بايثون (Python Service) لضمان عدم وجود أخطاء أو ملفات زائدة.
- تشغيل أوامر الفحص (Lint) في جميع بيئات العمل (Frontend, Backend) لمعالجة أي أخطاء أو تحذيرات.
- تنظيف الملفات غير المستخدمة، الواردات (Imports) الزائدة، والسكربتات المؤقتة في جذر المشروع.
- **BREAKING**: قد يتم حذف الملفات المؤقتة أو السكربتات غير الضرورية التي تؤثر على تنظيم المشروع.

## Impact
- Affected specs: استقرار المشروع، الالتزام بالمعمارية (Architecture Guidelines).
- Affected code: كافة أجزاء النظام (Backend, Frontend, Python Service, Root Scripts).

## ADDED Requirements
### Requirement: Comprehensive Linter & Format Check
يجب على النظام اجتياز كافة فحوصات الكود (Linting & Formatting) بنجاح دون أي تحذيرات أو أخطاء في كل من Backend و Frontend.

#### Scenario: Success case
- **WHEN** المطور يقوم بتشغيل `npm run lint` في مسار المشروع.
- **THEN** لا تظهر أي أخطاء وتعود النتيجة بنجاح.

## MODIFIED Requirements
### Requirement: Architecture Validation
يجب التأكد من أن جميع طبقات الـ Backend تتبع بدقة `ARCHITECTURE.md` بحيث تنحصر استدعاءات قاعدة البيانات (Sequelize Models) في طبقة `repositories/` فقط.

## REMOVED Requirements
لا يوجد متطلبات محذوفة.

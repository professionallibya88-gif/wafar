# Deep Project Refactor and Cleanup Spec

## Why
المشروع يحتاج إلى فحص عميق وشامل لضمان استقرار جميع الوظائف، إزالة التكرارات، إصلاح الأخطاء، تحسين التسميات (للمتغيرات والحقول)، وتنظيف الكود البرمجي ليكون متوافقاً تماماً مع المعايير المعمارية للمشروع.

## What Changes
- مراجعة شاملة لأسماء المتغيرات والدوال والحقول في قواعد البيانات لضمان توحيدها وتوافقها مع المعايير.
- إزالة الأكواد المكررة أو غير المستخدمة في كل من الواجهة الأمامية (Frontend) والخلفية (Backend) وخدمة البايثون (Python Service).
- تعزيز معالجة الأخطاء (Error Handling) في جميع الطبقات (Controllers, Services, Repositories).
- التأكد من استخدام النماذج الصحيحة للاستجابات (`ApiResponse`) ومرور جميع طلبات قاعدة البيانات عبر طبقة `Repositories` حصراً.
- تحسين وتنظيف مكونات الواجهة الأمامية ومتاجر Pinia لضمان الأداء الجيد وعدم وجود تضارب.

## Impact
- Affected specs: استقرار النظام بشكل عام، جودة الكود البرمجي، وسهولة الصيانة.
- Affected code:
  - `apps/backend/src/**/*`
  - `apps/frontend/src/**/*`
  - `apps/python-service/**/*`

## ADDED Requirements
### Requirement: Code Quality and Stability
النظام يجب أن يكون مستقراً، الكود يجب أن يكون نظيفاً وخالياً من التكرارات، والتسميات يجب أن تكون واضحة وموحدة (camelCase في الكود، snake_case في قاعدة البيانات).

#### Scenario: Code Review and Refactoring
- **WHEN** المطور يراجع الكود
- **THEN** يجب ألا يجد أي تكرار، أو دوال غير مستخدمة، أو تجاوزات للطبقات المعمارية (مثل استخدام Models خارج Repositories).

## MODIFIED Requirements
### Requirement: Architecture Adherence
جميع المتحكمات يجب أن تستخدم `asyncHandler` و `ApiResponse`، وجميع الخدمات يجب أن ترمي `AppError` بدلاً من الأخطاء العامة.

## REMOVED Requirements
- لا توجد متطلبات محذوفة، ولكن سيتم إزالة الأكواد الميتة (Dead Code) والملفات غير المستخدمة.

# Advanced Table Extractors Spec

## Why
بناءً على طلب المستخدم، بعض ملفات PDF تحتوي على جداول معقدة ذات خطوط شبكية (Grid lines) قد لا يتم استخراجها بدقة متناهية باستخدام المحرك الحالي المعتمد على `PyMuPDF`. مكتبات مثل `Camelot` و `Tabula-py` و `pdfplumber` متخصصة في تحليل الجداول المعقدة والخطوط الطولية والعرضية، مما يقلل من أخطاء تداخل الأعمدة وتزيد من موثوقية الاستخراج في حالات الملفات المعقدة.

## What Changes
- إضافة مكتبة `camelot-py[cv]` و `pdfplumber` كخيارات إضافية لمحرك استخراج الجداول في خدمة بايثون.
- إنشاء فئات (Classes) استخراج جديدة مثل `CamelotExtractor` و `PdfPlumberExtractor` تعمل كبدائل أو محركات احتياطية (Fallbacks) لـ `TableExtractor` الحالي.
- إضافة آلية لاختيار محرك الاستخراج المناسب (عبر تمرير متغير أو استخدام التراجع التلقائي Fallback Mechanism) بحيث إذا فشل محرك في استخراج جداول بدقة، يتم تجربة المحرك المتخصص في الشبكات (Lattice/Stream).

## Impact
- Affected specs: PDF Table Extraction Accuracy, System Dependencies.
- Affected code: 
  - `apps/backend/python-service/requirements.txt`
  - `apps/backend/python-service/table_extractor.py` (أو إنشاء ملفات منفصلة لكل محرك)
  - `apps/backend/python-service/app.py`

## ADDED Requirements
### Requirement: Multi-Engine PDF Extraction
The system SHALL support multiple PDF table extraction engines (`pymupdf`, `camelot`, `pdfplumber`) and allow switching between them based on table complexity or as a fallback.

#### Scenario: Success case
- **WHEN** user uploads a PDF with complex grid tables and selects the 'camelot' engine (or the system falls back to it)
- **THEN** the system utilizes Camelot to accurately parse the grid lines and returns perfectly aligned columns without data shifting.

## MODIFIED Requirements
### Requirement: Python Microservice API
The `/extract-tables` endpoint MUST accept an optional `engine` parameter to define which extraction strategy to use, defaulting to the fastest one (`pymupdf`) unless specified otherwise.

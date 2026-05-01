# Fix Python Extractor Column Shift Spec

## Why
في صفحة "تفاصيل الملف" (File Details)، تظهر بيانات القطع المستخرجة في أعمدة غير صحيحة (مثل ظهور التواريخ في عمود الكود، وأكواد القطع في عمود الاسم). السبب يعود إلى خطأ منطقي في خدمة بايثون `table_extractor.py` عند تنظيف الجداول؛ حيث يتم حذف الأعمدة الفارغة بالكامل من بيانات الجدول (Data rows) دون إزالة العناوين (Headers) المقابلة لها، مما يؤدي إلى إزاحة العناوين عن بياناتها الصحيحة واختلاط الحقول عند الحفظ في قاعدة البيانات.

## What Changes
- إصلاح دالة `extract` في `table_extractor.py` لضمان مزامنة حذف الأعمدة الفارغة بين البيانات (`df`) وقائمة العناوين (`headers`).
- الاحتفاظ بفهرس الأعمدة الصالحة (`valid_cols`) بعد تطبيق `dropna` وتحديث قائمة العناوين بناءً عليه بدلاً من قصها عشوائياً.
- مراجعة وتصحيح مكونات الجداول في الواجهة الأمامية (مثل `FileDetailView.vue`) لضمان خلوها من تداخل وسوم `<tbody>`.

## Impact
- Affected specs: PDF Table Extraction, Data Mapping (HeaderMapper).
- Affected code: 
  - `apps/backend/python-service/table_extractor.py`
  - `apps/frontend/src/views/dashboard/FileDetailView.vue`

## ADDED Requirements
### Requirement: Synchronized Column Dropping
The system SHALL ensure that when an empty data column is dropped from the extracted PDF table, its corresponding header is also dropped to maintain data integrity.

#### Scenario: Success case
- **WHEN** the Python service processes a table with an entirely empty column (e.g., column index 2)
- **THEN** both the data column and the header at index 2 are removed, preventing subsequent columns from shifting into the wrong header names.

## MODIFIED Requirements
### Requirement: PDF Table Cleaning Logic
The cleaning logic must explicitly filter the `headers` list using the exact column indices retained in the pandas DataFrame.

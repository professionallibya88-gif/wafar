# Build Advanced PDF Parser Spec

## Why
هناك حاجة ملحة لمعالجة ملفات PDF ضخمة (تصل إلى أكثر من 100 صفحة وتحتوي على آلاف قطع الغيار، مثل ملف C:\files-2.pdf) تخص الموردين. الأداة الحالية (pdfplumber) قد تكون بطيئة وتستهلك موارد كبيرة مع الملفات الضخمة. الحل المعماري الأقوى والمجاني للملفات النصية (Digital PDFs) هو دمج `PyMuPDF` (لسرعته الخارقة ودقته العالية في استخراج الجداول والنصوص العربية) مع مكتبة `Pandas` (لدمج وتنظيف البيانات الضخمة في أجزاء من الثانية).

## What Changes
- **BREAKING**: استبدال محرك الاستخراج الحالي في خدمة Python (`pdfplumber`) بمحرك `PyMuPDF` (المعروف بـ `fitz`).
- إضافة مكتبة `Pandas` لخدمة Python للتعامل مع دمج الجداول الضخمة عبر الصفحات المتعددة وإزالة صفوف العناوين المكررة.
- تحديث دالة `extract` في `table_extractor.py` لتقوم بإرجاع بيانات نظيفة ومدمجة.
- تحسين عملية الإدراج الجماعي (Bulk Insert) في الواجهة الخلفية (Node.js) لضمان سرعة حفظ آلاف السجلات.
- إنشاء اختبار مخصص للتحقق من استخراج البيانات بدقة من الملف `C:\files-2.pdf`.

## Impact
- Affected specs: PDF Table Extraction, Background Processing (BullMQ), Database Bulk Insertion.
- Affected code: 
  - `apps/backend/python-service/requirements.txt`
  - `apps/backend/python-service/table_extractor.py`
  - `apps/backend/python-service/app.py`
  - `apps/backend/src/services/PDFService.js` (أو ما يعادله في عملية الحفظ)

## ADDED Requirements
### Requirement: Advanced PDF Table Extraction
يجب أن يوفر النظام قدرة فائقة على استخراج الجداول من ملفات PDF النصية الضخمة بسرعة ودقة.

#### Scenario: Success case
- **WHEN** يقوم المورد برفع ملف PDF ضخم (مثل 100 صفحة).
- **THEN** يقوم `PyMuPDF` باستخراج الجداول، ويقوم `Pandas` بدمجها، وتُرسل كـ JSON نظيف إلى Node.js لحفظها عبر `bulkCreate` في ثوانٍ.

## MODIFIED Requirements
### Requirement: Python Extraction Engine
سيتم تعديل المحرك ليعتمد كلياً على `PyMuPDF` بدلاً من `pdfplumber` لزيادة السرعة بأكثر من 20 ضعفاً وللحفاظ على دقة الحروف العربية.

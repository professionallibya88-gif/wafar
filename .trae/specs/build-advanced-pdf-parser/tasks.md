# Tasks

- [x] Task 1: Setup Advanced Python Dependencies
  - [x] SubTask 1.1: إضافة مكتبات `PyMuPDF` و `pandas` إلى ملف `requirements.txt` وتثبيتها.
  - [x] SubTask 1.2: إزالة الاعتماد الأساسي على `pdfplumber` (إن لزم) أو الاحتفاظ به كبديل فقط.

- [x] Task 2: Implement Advanced Extraction Engine
  - [x] SubTask 2.1: إعادة كتابة دالة `TableExtractor` في `table_extractor.py` لاستخدام `fitz` (`PyMuPDF`).
  - [x] SubTask 2.2: استخدام ميزة `page.find_tables()` لاستخراج الجداول.
  - [x] SubTask 2.3: دمج الجداول عبر جميع الصفحات باستخدام `pandas.DataFrame`.
  - [x] SubTask 2.4: تنظيف البيانات وحذف عناوين الجداول المكررة الناتجة عن رأس كل صفحة في الـ PDF.
  - [x] SubTask 2.5: التأكد من معالجة النصوص العربية بدقة وبدون أخطاء ترميز.

- [x] Task 3: Backend Bulk Insert Optimization
  - [x] SubTask 3.1: فحص آلية الحفظ (Node.js backend) للقطع المستخرجة.
  - [x] SubTask 3.2: التأكد من استخدام أوامر `bulkCreate` و `updateOnDuplicate` (Upsert) لحفظ آلاف القطع في ثوانٍ وتجنب التكرار.

- [x] Task 4: Integration and Validation Test
  - [x] SubTask 4.1: إنشاء نص اختباري مخصص في Python لمعالجة ملف `C:\files-2.pdf` وعرض عينة من النتائج وسرعة الاستخراج.
  - [x] SubTask 4.2: التحقق من دقة الاستخراج عبر الواجهة.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 4] depends on [Task 2]
- [Task 3] depends on [Task 2]
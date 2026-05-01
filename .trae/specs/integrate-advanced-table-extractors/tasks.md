# Tasks

- [x] Task 1: Update Python Dependencies
  - [x] SubTask 1.1: إضافة مكتبات `camelot-py[cv]` و `pdfplumber` إلى ملف `requirements.txt`.
  - [x] SubTask 1.2: تثبيت المكتبات وتوثيق أي متطلبات نظام إضافية (مثل `ghostscript` لـ Camelot).

- [x] Task 2: Implement Advanced Extractors
  - [x] SubTask 2.1: إنشاء فئة استخراج جديدة تعتمد على `camelot.read_pdf` وتدعم وضع الشبكة `lattice` ووضع النص `stream`.
  - [x] SubTask 2.2: إنشاء فئة استخراج بديلة تعتمد على `pdfplumber.extract_tables()`.
  - [x] SubTask 2.3: توحيد مخرجات هذه الفئات (Headers و Rows) لتتطابق مع هيكل الاستجابة المتوقع من الواجهة الخلفية (Node.js).

- [x] Task 3: Integrate Extractors into the API
  - [x] SubTask 3.1: تعديل نقطة النهاية `/extract-tables` في `app.py` لدعم تمرير معامل `engine` لاختيار المحرك.
  - [x] SubTask 3.2: تطبيق آلية التراجع (Fallback) بحيث إذا فشل المحرك السريع `pymupdf`، يتم تجربة `pdfplumber` أو `camelot` تلقائياً.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]

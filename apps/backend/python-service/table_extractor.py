import fitz
import pandas as pd
import logging
import re

logger = logging.getLogger('wafar.python_service.table_extractor')


class TableExtractor:
    """محرك استخراج الجداول المتقدم باستخدام PyMuPDF و Pandas"""

    PART_TABLE_KEYWORDS = {
        'ar': [
            'رقم', 'كود', 'قطعة', 'اسم', 'صنف', 'سعر', 'الكمية', 'متوفر',
            'رقم الصنف', 'كود القطعة', 'رقم القطعة', 'اسم القطعة', 'السعر',
            'سعر النقد', 'سعر البنك', 'الشركة', 'البلد', 'الجودة', 'OEM',
            'رقم عالمي', 'رقم اصلي', 'صناعة', 'بلد الصنع', 'الماركة',
            'ﺍﻟﺴﻌﺭ', 'ﺍﻝﺼﻨﻑ', 'ﺭﻗﻡ'
        ],
        'en': [
            'code', 'part', 'name', 'item', 'price', 'qty', 'stock',
            'available', 'number', 'no.', 'oem', 'brand', 'country',
            'quality', 'original', 'cash', 'bank', 'wholesale', 'retail',
        ],
    }

    def _process_dataframe(self, all_data, headers, method_name):
        """معالجة وتنظيف DataFrame المستخرج من الجدول"""
        if not all_data or not headers:
            return []

        # إنشاء DataFrame للتنظيف
        df = pd.DataFrame(all_data)

        # حذف الأعمدة الفارغة بالكامل والاحتفاظ بمعرفات الأعمدة الصالحة
        df = df.replace('', pd.NA).dropna(how='all', axis=1)
        valid_cols = df.columns.tolist()
        df = df.fillna('')

        # تصفية العناوين بناءً على الأعمدة المتبقية لمنع إزاحة الأعمدة
        filtered_headers = []
        for col_idx in valid_cols:
            if isinstance(col_idx, int) and col_idx < len(headers):
                filtered_headers.append(headers[col_idx])
            else:
                filtered_headers.append('')
        headers = filtered_headers

        # حذف الصفوف التي تماثل العناوين تماماً (تكرار رأس الجدول في كل صفحة)
        if len(headers) > 0 and len(df.columns) > 0:
            header_col0 = headers[0]
            df = df[df[df.columns[0]] != header_col0]

        # استبدال القيم الفارغة
        df = df.fillna("")

        # تحويل البيانات إلى القائمة المطلوبة
        final_rows = df.values.tolist()

        return [{
            'page': 1,
            'table_index': 0,
            'headers': headers,
            'rows': final_rows,
            'method': method_name,
            'row_count': len(final_rows),
            'col_count': len(headers)
        }]

    def extract(self, pdf_path):
        doc = None
        try:
            all_data = []
            headers = None

            doc = fitz.open(pdf_path)
            try:
                for page_num, page in enumerate(doc, start=1):
                    tables = page.find_tables()
                    if not tables:
                        continue

                    for tab in tables:
                        extracted = tab.extract()
                        if not extracted or len(extracted) < 2:
                            continue

                        # تنظيف الخلايا
                        cleaned = [[self._clean(c) for c in row]
                                   for row in extracted]
                        # إزالة الصفوف الفارغة
                        cleaned = [r for r in cleaned if any(c.strip() for c in r)]
                        if not cleaned:
                            continue

                        # فحص ما إذا كان الجدول جدول قطع غيار عبر الكلمات المفتاحية
                        if not self._is_part_table(cleaned):
                            continue

                        # إذا كان هذا أول جدول نأخذ العناوين منه
                        if headers is None:
                            header_idx = 0
                            for i, r in enumerate(cleaned[:15]):
                                row_text = ' '.join(r).lower()
                                if any(
                                        kw.lower() in row_text for kw in self.PART_TABLE_KEYWORDS['ar'] +
                                        self.PART_TABLE_KEYWORDS['en']):
                                    header_idx = i
                                    break

                            headers = cleaned[header_idx]
                            all_data.extend(cleaned[header_idx + 1:])
                        else:
                            all_data.extend(cleaned)
            finally:
                close_method = getattr(doc, 'close', None)
                if callable(close_method):
                    close_method()

            if not all_data or not headers:
                return []

            return self._process_dataframe(all_data, headers, 'pymupdf_pandas')

        except (OSError, RuntimeError, ValueError) as e:
            logger.error('خطأ تشغيلي أثناء استخراج الجداول باستخدام PyMuPDF: %s', str(e))
            return []
        except Exception as e:
            logger.exception('فشل غير متوقع لاستخراج الجداول باستخدام PyMuPDF للملف %s: %s', pdf_path, str(e))
            return []

    def _is_part_table(self, rows):
        """فحص ما إذا كان الجدول جدول قطع غيار عبر العناوين"""
        if not rows:
            return False

        score = 0
        # نفحص أول 10 صفوف لاحتمالية وجود العناوين فيها
        header_candidates = rows[:10]

        all_text = ' '.join([' '.join(r) for r in header_candidates]).lower()

        for kw in self.PART_TABLE_KEYWORDS['ar'] + \
                self.PART_TABLE_KEYWORDS['en']:
            if kw.lower() in all_text:
                score += 15

        # وجود أرقام
        if any(re.search(r'\d', ' '.join(row)) for row in rows):
            score += 20

        # print(f"Table score: {score}, text: {all_text[:50]}")
        return score >= 35

    def _clean(self, text):
        if text is None:
            return ''
        text = str(text).strip()
        # تنظيف الرموز الغريبة
        text = re.sub(r'[\x00-\x08\x0b-\x1f]', '', text)

        # تحويل الأشكال التقديمية العربية (Presentation Forms) إلى حروف عربية
        # قياسية
        import unicodedata
        text = unicodedata.normalize('NFKC', text)

        # معالجة النص العربي المقلوب
        arabic_pattern = re.compile(r'[\u0600-\u06FF]')
        if arabic_pattern.search(text):
            words = text.split()
            fixed_words = []
            for word in words:
                if arabic_pattern.search(word):
                    # Fix: Preserve LTR for numbers and English letters mixed
                    # in Arabic words
                    parts = re.split(r'([A-Za-z0-9/.\-]+)', word)
                    fixed_parts = []
                    for part in parts:
                        if re.match(r'^[A-Za-z0-9/.\-]+$', part):
                            fixed_parts.append(part)
                        else:
                            fixed_parts.append(part[::-1])
                    fixed_words.append("".join(fixed_parts[::-1]))
                else:
                    fixed_words.append(word)
            fixed_words.reverse()
            text = ' '.join(fixed_words)
            text = text.replace('ـ', '')

        # إزالة الأرقام الهندية
        hindi_digits = '٠١٢٣٤٥٦٧٨٩'
        arabic_digits = '0123456789'
        for h, a in zip(hindi_digits, arabic_digits):
            text = text.replace(h, a)
        return text.replace('\n', ' ').replace('\r', ' ')


class PdfPlumberExtractor(TableExtractor):
    """محرك استخراج الجداول المتقدم باستخدام pdfplumber"""

    def extract(self, pdf_path):
        import pdfplumber
        try:
            all_data = []
            headers = None

            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    tables = page.extract_tables()
                    if not tables:
                        continue

                    for tab in tables:
                        # تنظيف الخلايا
                        cleaned = [[self._clean(c) for c in row]
                                   for row in tab]
                        # إزالة الصفوف الفارغة
                        cleaned = [
                            r for r in cleaned if any(
                                c.strip() for c in r)]
                        if not cleaned:
                            continue

                        # فحص ما إذا كان الجدول جدول قطع غيار عبر الكلمات
                        # المفتاحية
                        if not self._is_part_table(cleaned):
                            continue

                        # إذا كان هذا أول جدول نأخذ العناوين منه
                        if headers is None:
                            header_idx = 0
                            for i, r in enumerate(cleaned[:15]):
                                row_text = ' '.join(r).lower()
                                if any(
                                        kw.lower() in row_text for kw in self.PART_TABLE_KEYWORDS['ar'] +
                                        self.PART_TABLE_KEYWORDS['en']):
                                    header_idx = i
                                    break

                            headers = cleaned[header_idx]
                            # skip adding the header row to the data
                            all_data.extend(cleaned[header_idx + 1:])
                        else:
                            all_data.extend(cleaned)

            if not all_data or not headers:
                return []

            return self._process_dataframe(all_data, headers, 'pdfplumber')

        except Exception:
            logger.exception(
                'فشل استخراج الجداول باستخدام pdfplumber للملف %s',
                pdf_path)
            return []


class CamelotExtractor(TableExtractor):
    """محرك استخراج الجداول المتقدم باستخدام camelot-py"""

    def extract(self, pdf_path, flavor='lattice'):
        import camelot
        try:
            all_data = []
            headers = None

            # قراءة الجداول باستخدام camelot
            tables = camelot.read_pdf(pdf_path, pages='all', flavor=flavor)
            if not tables:
                return []

            for tab in tables:
                extracted = tab.df.values.tolist()

                # تنظيف الخلايا
                cleaned = [[self._clean(c) for c in row] for row in extracted]
                # إزالة الصفوف الفارغة
                cleaned = [r for r in cleaned if any(c.strip() for c in r)]
                if not cleaned:
                    continue

                # فحص ما إذا كان الجدول جدول قطع غيار عبر الكلمات المفتاحية
                if not self._is_part_table(cleaned):
                    continue

                # إذا كان هذا أول جدول نأخذ العناوين منه
                if headers is None:
                    header_idx = 0
                    for i, r in enumerate(cleaned[:15]):
                        row_text = ' '.join(r).lower()
                        if any(
                                kw.lower() in row_text for kw in self.PART_TABLE_KEYWORDS['ar'] +
                                self.PART_TABLE_KEYWORDS['en']):
                            header_idx = i
                            break

                    headers = cleaned[header_idx]
                    # skip adding the header row to the data
                    all_data.extend(cleaned[header_idx + 1:])
                else:
                    all_data.extend(cleaned)

            if not all_data or not headers:
                return []

            return self._process_dataframe(
                all_data, headers, f'camelot_{flavor}')

        except Exception:
            logger.exception(
                'فشل استخراج الجداول باستخدام camelot للملف %s',
                pdf_path)
            return []


def save_temp(file):
    """حفظ الملف مؤقتاً بطريقة آمنة"""
    import tempfile
    import os
    from werkzeug.utils import secure_filename
    tmp_dir = tempfile.gettempdir()
    filename = secure_filename(file.filename)
    if not filename:
        filename = "temp_pdf_file.pdf"
    tmp_path = os.path.join(tmp_dir, filename)
    file.save(tmp_path)
    return tmp_path


def cleanup_temp(path):
    """حذف الملف المؤقت"""
    import os
    if os.path.exists(path):
        os.remove(path)

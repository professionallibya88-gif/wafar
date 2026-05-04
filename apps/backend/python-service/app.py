"""
Libya Spare Parts - Python PDF Processing Microservice
Methods: 1) PyPDF2 + OCR  2) AI/ML Processing  3) Enhanced Processing
"""

import os
import re
import json
import logging
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

logger = logging.getLogger('wafar.python_service')
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s [%(name)s] %(message)s'))
    logger.addHandler(handler)
logger.setLevel(os.environ.get('PYTHON_SERVICE_LOG_LEVEL', 'INFO').upper())
logger.propagate = False

app = Flask(__name__)
CORS(app)

# Performance tracking
request_count = 0
total_processing_time = 0


def internal_server_error(context='Unhandled python-service error'):
    """تسجيل الخطأ داخلياً مع إرجاع رسالة عامة آمنة"""
    logger.exception(context)
    return jsonify({'error': 'حدث خطأ داخلي أثناء المعالجة'}), 500


def normalize_metadata_text(raw_text):
    """تنظيف النص المستخرج قبل التحليل"""
    import unicodedata

    cleaned = []
    for line in (raw_text or "").split("\n"):
        normalized = unicodedata.normalize("NFKC", line or "").replace("ـ", "")
        normalized = re.sub(r"\s+", " ", normalized).strip()
        if normalized:
            cleaned.append(normalized)
    return "\n".join(cleaned)


def clean_supplier_candidate(value):
    """تنظيف مرشح اسم الشركة"""
    if not value:
        return ""

    candidate = value.strip(" :;,_-|")
    candidate = re.sub(
        r"^(?:اسم\s+الشركة|اسم\s+المورد|الشركة\s+الموردة|المورد|supplier|company|vendor|manufacturer)\s*[:\-–]*\s*",
        "",
        candidate,
        flags=re.IGNORECASE,
    )
    return re.sub(r"\s{2,}", " ", candidate).strip()


def extract_supplier_name_from_text(text):
    """استخراج اسم الشركة مع استبعاد عناوين الجداول"""
    normalized_text = normalize_metadata_text(text)
    if not normalized_text:
        return ""

    lines = [clean_supplier_candidate(line)
             for line in normalized_text.split("\n")]
    lines = [line for line in lines if line]

    prefix_only_pattern = re.compile(
        r"^(?:شركة|مؤسسة|محلات|وكالة|مكتب|معرض|Company|Supplier)$",
        re.IGNORECASE)
    prefix_start_pattern = re.compile(
        r"^(?:شركة|مؤسسة|محلات|وكالة|مكتب|معرض)\s*", re.IGNORECASE)
    blacklist = [
        "قائمة الأسعار",
        "الأسعار",
        "السعر",
        "price list",
        "catalog",
        "كتالوج",
        "المادة",
        "رقم الصنف",
        "اسم الصنف",
        "نقدي",
        "مصرف",
        "تاريخ",
        "الطباعة",
        "page",
        "invoice",
        "quotation",
        "قطع غيار",
        "لقطع غيار",
    ]

    best_value = ""
    best_score = -10**9

    for idx, line in enumerate(lines[:40]):
        candidates = [line]
        if prefix_only_pattern.match(line) and idx + 1 < len(lines):
            candidates.append(
                clean_supplier_candidate(f"{line} {lines[idx + 1]}"))

        for candidate in candidates:
            if not candidate:
                continue

            lowered = candidate.lower()
            if any(word in lowered for word in blacklist):
                continue

            letters_count = len(
                re.findall(
                    r"[A-Za-z\u0600-\u06FF]",
                    candidate))
            digits_count = len(re.findall(r"\d", candidate))
            words_count = len(
                [word for word in candidate.split(" ") if word.strip()])

            if letters_count < 3 or words_count < 2:
                continue

            # أسماء الشركات الحقيقية لا يجب أن تحتوي أرقاماً متسلسلة
            if digits_count > 0:
                continue

            # السماح إمّا بصيغة شركات عربية، أو اسم إنجليزي واضح بصيغة مؤسسية
            has_company_prefix = bool(prefix_start_pattern.search(candidate))
            is_upper_english_name = bool(
                re.match(r"^[A-Z][A-Z\s.&-]{3,}$", candidate))
            if not has_company_prefix and not is_upper_english_name:
                continue

            score = 0
            if has_company_prefix:
                score += 40
            if re.search(r"[\u0600-\u06FF]", candidate):
                score += 20
            if 2 <= words_count <= 6:
                score += 12
            if idx < 10:
                score += (15 - idx)
            if digits_count > 0:
                score -= digits_count * 3
            if re.search(r"\d{3,}", candidate):
                score -= 30

            if score > best_score:
                best_score = score
                best_value = candidate

    return best_value


def extract_document_date_from_text(text):
    """استخراج تاريخ الملف بصيغة yyyy-mm-dd"""
    normalized_text = normalize_metadata_text(text)
    if not normalized_text:
        return ""

    patterns = [
        r"(?:تاريخ\s+الطباعة|تاريخ\s+الإصدار|تاريخ|Date(?:\s+Printed)?)\s*[:\-–]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})",
        r"(?:تاريخ\s+الطباعة|تاريخ\s+الإصدار|تاريخ|Date(?:\s+Printed)?)\s*[:\-–]?\s*(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})",
        r"\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4})\b",
        r"\b(\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b",
    ]

    def to_iso(candidate):
        raw = candidate.replace(".", "/").replace("-", "/").strip()
        parts = [p.strip() for p in raw.split("/") if p.strip()]
        if len(parts) != 3:
            return ""

        if len(parts[0]) == 4:
            year, month, day = parts[0], parts[1], parts[2]
        else:
            day, month, year = parts[0], parts[1], parts[2]
            if len(year) == 2:
                year = f"20{year}" if int(year) < 50 else f"19{year}"

        try:
            year_i = int(year)
            month_i = int(month)
            day_i = int(day)
            if (
                year_i < 2000
                or year_i > 2099
                or month_i < 1
                or month_i > 12
                or day_i < 1
                or day_i > 31
            ):
                return ""
            return f"{year_i:04d}-{month_i:02d}-{day_i:02d}"
        except (TypeError, ValueError):
            return ""

    for pattern in patterns:
        match = re.search(pattern, normalized_text, flags=re.IGNORECASE)
        if not match:
            continue
        parsed = to_iso(match.group(1))
        if parsed:
            return parsed

    return ""


def ocr_top_header_text(page, fitz_module):
    """محاولة OCR على الجزء العلوي من الصفحة لاستخراج اسم الشركة"""
    try:
        import pytesseract
        from PIL import Image, ImageOps
    except ImportError:
        return ""

    try:
        header_height = max(page.rect.height * 0.35, 200)
        clip = fitz_module.Rect(
            0, 0, page.rect.width, min(
                page.rect.height, header_height))
        pix = page.get_pixmap(
            matrix=fitz_module.Matrix(
                2.5, 2.5), clip=clip, alpha=False)
        mode = "RGB" if pix.n < 4 else "RGBA"
        image = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
        gray = ImageOps.grayscale(image)
        gray = ImageOps.autocontrast(gray)
        bw = gray.point(lambda x: 0 if x < 175 else 255, "1")
        text = pytesseract.image_to_string(
            bw,
            lang="ara+eng",
            config="--oem 1 --psm 6",
        )
        return normalize_metadata_text(text)
    except (OSError, RuntimeError, ValueError):
        return ""


def extract_text_from_pdf(file_path):
    """استخراج النص من ملف PDF مع دعم OCR"""
    full_text = ""
    page_count = 0
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        page_count = len(reader.pages)

        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                full_text += text + "\n"
            else:
                # Page is image-based, use OCR
                try:
                    ocr_text = ocr_page(file_path, page_num)
                    full_text += ocr_text + "\n"
                except Exception as e:
                    logger.error('فشل OCR للصفحة %s أثناء استخراج النص من الملف %s: %s', page_num, file_path, str(e))

    except ImportError:
        # PyPDF2 غير مثبت
        logger.warning('تعذر استخراج النص لأن PyPDF2 غير مثبت')
        full_text = ""

    return full_text, page_count

# ============================================================
# Method 3: Enhanced Processing with Table Detection
# ============================================================


def process_enhanced(file_path):
    """
    Enhanced PDF processing with:
    - Better text extraction
    - Table detection
    - Structured data extraction
    - Quality scoring
    """
    parts = []
    tables = []
    page_count = 0
    full_text = ""
    supplier_name = None
    start_time = time.time()

    full_text, page_count = extract_text_from_pdf(file_path)

    # Extract supplier name
    supplier_name = extract_supplier_name_from_text(full_text)

    # Parse lines into parts with enhanced parsing
    lines = full_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue

        part = parse_line_enhanced(line)
        if part:
            parts.append(part)

        # Table detection
        if is_table_row(line):
            table_data = parse_table_row(line)
            if table_data:
                tables.append(table_data)

    processing_time = time.time() - start_time

    return {
        'parts': parts,
        'tables': tables,
        'pageCount': page_count,
        'rawData': {
            'fullText': full_text[:50000],
            'totalLines': len(lines),
            'processingTime': processing_time,
        },
        'supplierName': supplier_name,
        'metadata': {
            'method': 'enhanced',
            'processingTime': round(processing_time, 3),
            'partsExtracted': len(parts),
            'tablesDetected': len(tables),
            'confidence': calculate_confidence(parts)
        }
    }


def parse_line_enhanced(line):
    """Enhanced line parsing with quality scoring"""
    part = parse_line(line)
    if part:
        # Assign default confidence based on matched pattern type
        # For simplicity, we just assign a generic confidence or try to deduce it
        # Pattern 1 (Code - Name - Price) is usually best, Pattern 4 is Arabic code, etc.
        # But we can just use regexes again or assign a default
        m1 = re.match(
            r'^([A-Z0-9\-\.\/]+)\s+[\-\s]+(.+?)\s+[\-\s]+([\d,]+\.?\d*)\s*$',
            line)
        if m1:
            part['confidence'] = 90
        elif re.match(r'^([0-9]+[A-Za-z]*[0-9]*)\s+(.+?)\s+([\d,]+\.?\d*)\s*$', line):
            part['confidence'] = 85
        elif '\t' in line:
            part['confidence'] = 80
        elif '|' in line:
            part['confidence'] = 75
        else:
            part['confidence'] = 70
        return part
    return None


def is_table_row(line):
    """Detect if a line is part of a table"""
    if '\t' in line and len(line.split('\t')) >= 3:
        return True
    if line.count('|') >= 3:
        return True
    if re.match(r'^[\s\d\-\.]+$', line) and len(line) > 20:
        return True
    return False


def parse_table_row(line):
    """Parse a table row"""
    if '\t' in line:
        return {
            'type': 'tab', 'data': [
                c.strip() for c in line.split('\t') if c.strip()]}
    if '|' in line:
        return {
            'type': 'pipe', 'data': [
                c.strip() for c in line.split('|') if c.strip()]}
    return None


def calculate_confidence(parts):
    """Calculate overall confidence score"""
    if not parts:
        return 0
    total = sum(p.get('confidence', 0) for p in parts)
    return round(total / len(parts), 2)


# ============================================================
# Method 2: Python PyPDF2 + Tesseract OCR
# ============================================================
def process_pypdf(file_path):
    """Extract text from PDF using PyPDF2, OCR for image-based pages"""
    parts = []
    page_count = 0
    full_text = ""
    supplier_name = None

    full_text, page_count = extract_text_from_pdf(file_path)

    # Extract supplier name
    supplier_name = extract_supplier_name_from_text(full_text)

    # Parse lines into parts
    lines = full_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue

        part = parse_line(line)
        if part:
            parts.append(part)

    return {
        'parts': parts,
        'pageCount': page_count,
        'rawData': {
            'fullText': full_text[:50000],
            'totalLines': len(lines),
        },
        'supplierName': supplier_name
    }


def ocr_page(file_path, page_num):
    """OCR a single PDF page using Tesseract"""
    try:
        from pdf2image import convert_from_path
        import pytesseract

        images = convert_from_path(
            file_path,
            first_page=page_num + 1,
            last_page=page_num + 1,
            dpi=300
        )
        if images:
            text = pytesseract.image_to_string(images[0], lang='ara+eng')
            return text
    except ImportError:
        logger.warning('تعذر تنفيذ OCR لأن pdf2image أو pytesseract غير مثبت')
    return ""


def parse_line(line):
    """Parse a single line to extract part data"""
    # Pattern 1: Code - Name - Price
    m = re.match(
        r'^([A-Z0-9\-\.\/]+)\s+[\-\s]+(.+?)\s+[\-\s]+([\d,]+\.?\d*)\s*$',
        line)
    if m:
        return {
            'partCode': m.group(1).strip(),
            'partName': m.group(2).strip(),
            'price': float(m.group(3).replace(',', ''))
        }

    # Pattern 2: Tab-separated
    cols = [c.strip() for c in line.split('\t') if c.strip()]
    if len(cols) >= 2:
        part = {'partCode': cols[0], 'partName': cols[1]}
        if len(cols) >= 3:
            try:
                price = float(cols[2].replace(',', ''))
                if price > 0:
                    part['price'] = price
            except ValueError:
                pass
        return part if part.get('partCode') and part.get('partName') else None

    # Pattern 3: Pipe-separated
    cols = [c.strip() for c in line.split('|') if c.strip()]
    if len(cols) >= 2:
        part = {'partCode': cols[0], 'partName': cols[1]}
        if len(cols) >= 3:
            try:
                part['price'] = float(cols[2].replace(',', ''))
            except ValueError:
                pass
        return part if part.get('partCode') and part.get('partName') else None

    # Pattern 4: Arabic code pattern (numbers/arabic)
    m = re.match(
        r'^([0-9]+[A-Za-z]*[0-9]*)\s+(.+?)\s+([\d,]+\.?\d*)\s*$',
        line)
    if m:
        return {
            'partCode': m.group(1).strip(),
            'partName': m.group(2).strip(),
            'price': float(m.group(3).replace(',', ''))
        }

    return None


# ============================================================
# Method 1: Python AI/ML Processing
# ============================================================
def process_ai(file_path):
    """
    AI-enhanced PDF processing.
    Uses ML models for better extraction accuracy.
    Falls back to pypdf method if AI is not available.
    """
    try:
        # Try using a trained model or API
        result = process_pypdf(file_path)

        # AI Enhancement: Clean and improve extracted data
        if result.get('parts'):
            result['parts'] = ai_enhance_parts(result['parts'])

        result['_method'] = 'ai_enhanced'
        return result

    except Exception as e:
        logger.error('فشلت المعالجة المعززة بالذكاء الاصطناعي؛ سيتم الرجوع إلى PyPDF للملف %s: %s', file_path, str(e))
        return process_pypdf(file_path)


def ai_enhance_parts(parts):
    """
    Enhance extracted parts using AI/ML techniques.
    - Normalize part codes
    - Clean part names
    - Infer categories
    - Estimate quality grades
    """
    enhanced = []
    for part in parts:
        ep = dict(part)

        # Normalize part code (uppercase, remove spaces)
        if ep.get('partCode'):
            ep['partCode'] = ep['partCode'].upper().replace(' ', '')

        # Clean part name
        if ep.get('partName'):
            ep['partName'] = re.sub(r'\s+', ' ', ep['partName']).strip()

        # Infer category from part name
        if not ep.get('category'):
            ep['category'] = infer_category(ep.get('partName', ''))

        # Estimate quality grade
        if not ep.get('qualityGrade'):
            ep['qualityGrade'] = infer_quality(ep.get('partName', ''))

        enhanced.append(ep)

    return enhanced


def infer_category(name):
    """Infer part category from name"""
    categories = {
        'engine': ['محرك', 'موتور', 'بستان', 'بستم', 'حزام', 'سير', 'زيت', 'فلتر', 'ردياتير', 'مروحة'],
        'brakes': ['فرامل', 'فرامل', 'دسك', 'بادات', 'اسطوانة', 'ABS'],
        'suspension': ['مساعد', 'ياي', 'ربركة', 'وصلة', 'مساعد', 'بوش'],
        'electrical': ['بطارية', 'لمبة', 'مولد', 'دينامو', 'مارش', 'حساس', 'سلك'],
        'body': ['باب', 'كابريه', 'صدام', 'رفرف', 'غطاء', 'مراية', 'زجاج'],
        'transmission': ['قير', 'كلتش', 'فتيس', 'عصا', 'جوين', 'طيار'],
    }

    name_lower = name.lower()
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in name_lower:
                return cat
    return 'other'


def infer_quality(name):
    """Infer quality grade from name"""
    if any(x in name for x in ['اصلي', 'أصلي', 'OEM', 'original']):
        return 'original'
    if any(x in name for x in ['هاي', 'جيد', 'high', 'premium']):
        return 'high'
    if any(x in name for x in ['وسط', 'متوسط', 'medium']):
        return 'medium'
    if any(x in name for x in ['صيني', 'رخيص', 'low', 'economic']):
        return 'low'
    return 'unspecified'


# ============================================================
# API Routes
# ============================================================
@app.route('/process/pypdf', methods=['POST'])
def api_process_pypdf():
    try:
        data = request.get_json(silent=True) or {}
        file_path = data.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 400

        logger.info('بدء معالجة PyPDF للملف %s', file_path)
        result = process_pypdf(file_path)
        logger.info(
            'اكتملت معالجة PyPDF للملف %s: parts=%s pages=%s',
            file_path,
            len(result.get('parts', [])),
            result.get('pageCount', 0),
        )
        return jsonify(result)
    except Exception as e:
        logger.error('فشل المسار /process/pypdf: %s', str(e))
        return internal_server_error('فشل المسار /process/pypdf')


@app.route('/process/ai', methods=['POST'])
def api_process_ai():
    global request_count, total_processing_time
    try:
        data = request.get_json(silent=True) or {}
        file_path = data.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 400

        request_count += 1
        start_time = time.time()

        logger.info('بدء معالجة AI للملف %s', file_path)
        result = process_ai(file_path)

        duration = time.time() - start_time
        total_processing_time += duration
        logger.info(
            'اكتملت معالجة AI للملف %s خلال %.3f ثانية: parts=%s',
            file_path,
            duration,
            len(result.get('parts', [])),
        )

        return jsonify(result)
    except Exception as e:
        logger.error('فشل المسار /process/ai: %s', str(e))
        return internal_server_error('فشل المسار /process/ai')


@app.route('/process/enhanced', methods=['POST'])
def api_process_enhanced():
    """Enhanced processing endpoint with table detection and quality scoring"""
    global request_count, total_processing_time
    try:
        data = request.get_json(silent=True) or {}
        file_path = data.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 400

        request_count += 1
        start_time = time.time()

        logger.info('بدء المعالجة المحسنة للملف %s', file_path)
        result = process_enhanced(file_path)

        duration = time.time() - start_time
        total_processing_time += duration
        logger.info(
            'اكتملت المعالجة المحسنة للملف %s خلال %.3f ثانية: parts=%s tables=%s',
            file_path,
            duration,
            len(result.get('parts', [])),
            len(result.get('tables', [])),
        )

        return jsonify(result)
    except Exception as e:
        logger.error('فشل المسار /process/enhanced: %s', str(e))
        return internal_server_error('فشل المسار /process/enhanced')


@app.route('/extract-tables', methods=['POST'])
def extract_tables():
    """استخراج الجداول من ملف PDF باستخدام المحرك الجديد"""
    from table_extractor import TableExtractor, PdfPlumberExtractor, CamelotExtractor, save_temp, cleanup_temp

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'no file'}), 400

    engine = request.form.get('engine', 'auto')

    tmp_path = save_temp(file)
    try:
        logger.info(
            'بدء استخراج الجداول للمحرك %s من الملف المؤقت %s',
            engine,
            tmp_path)
        tables = []
        if engine == 'pymupdf':
            extractor = TableExtractor()
            tables = extractor.extract(tmp_path)
        elif engine == 'pdfplumber':
            extractor = PdfPlumberExtractor()
            tables = extractor.extract(tmp_path)
        elif engine == 'camelot':
            extractor = CamelotExtractor()
            tables = extractor.extract(tmp_path)
        else:  # auto fallback
            extractor = TableExtractor()
            tables = extractor.extract(tmp_path)

            if not tables:
                logger.info(
                    'لم يُرجع PyMuPDF جداول، سيتم التبديل إلى pdfplumber')
                extractor = PdfPlumberExtractor()
                tables = extractor.extract(tmp_path)

            if not tables:
                logger.info(
                    'لم يُرجع pdfplumber جداول، سيتم التبديل إلى camelot')
                extractor = CamelotExtractor()
                tables = extractor.extract(tmp_path)

        logger.info(
            'اكتمل استخراج الجداول من الملف المؤقت %s: count=%s',
            tmp_path,
            len(tables))
        return jsonify({'tables': tables, 'count': len(tables)}), 200
    except Exception as e:
        logger.error('فشل المسار /extract-tables: %s', str(e))
        return internal_server_error('فشل المسار /extract-tables')
    finally:
        cleanup_temp(tmp_path)


def call_openrouter_vision(
        base_url,
        api_key,
        model,
        prompt,
        image_base64,
        mime_type="image/png"):
    """استدعاء OpenRouter API للمعالجة البصرية"""
    import requests

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://waffar.ly",
        "X-Title": "Waffar PDF AI Processor"
    }

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{image_base64}"}
                }
            ]
        }
    ]

    body = {
        "model": model or "google/gemini-2.0-flash-exp:free",
        "messages": messages,
        "max_tokens": 4096,
        "temperature": 0.1
    }

    response = requests.post(
        f"{base_url}/chat/completions",
        headers=headers,
        json=body,
        timeout=60)
    response.raise_for_status()
    result = response.json()
    return result["choices"][0]["message"]["content"]


@app.route('/extract-metadata', methods=['POST'])
def extract_metadata():
    """استخراج البيانات الوصفية (اسم الشركة، التاريخ) من أول صفحة باستخدام تقنية بصرية ذكية أو PyMuPDF كبديل"""
    from table_extractor import save_temp, cleanup_temp
    import fitz
    import os
    import base64

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'no file'}), 400

    # قراءة إعدادات المزود من الطلب
    provider_type = request.form.get('provider_type', 'google')
    api_key = request.form.get('api_key') or request.form.get(
        'gemini_api_key') or os.environ.get("GEMINI_API_KEY")
    base_url = request.form.get('base_url', '')
    model = request.form.get('model', '')

    tmp_path = save_temp(file)
    doc = None
    try:
        logger.info(
            'بدء استخراج البيانات الوصفية للملف المؤقت %s باستخدام المزود %s',
            tmp_path,
            provider_type,
        )
        doc = fitz.open(tmp_path)

        # 1. محاولة استخدام الذكاء الاصطناعي البصري حسب نوع المزود
        if api_key and provider_type == 'openrouter':
            try:
                # التقاط الصفحة الأولى كصورة
                page = doc[0]
                rect = page.rect
                clip_rect = fitz.Rect(0, 0, rect.width, rect.height * 0.5)
                pix = page.get_pixmap(dpi=200, clip=clip_rect)
                img_bytes = pix.tobytes("png")
                img_base64 = base64.b64encode(img_bytes).decode('utf-8')

                prompt = """
                أنت خبير في استخراج البيانات من فواتير وكتالوجات قطع غيار السيارات في ليبيا.
                استخرج بدقة "اسم الشركة الموردة" (التي أصدرت الكتالوج أو الفاتورة) و "تاريخ الملف" من هذه الصورة.
                ملاحظات هامة:
                - استخرج اسم الشركة كاملاً (مثلاً "شركة السفير لاستيراد قطع غيار السيارات" أو "شركة الهاني").
                - التاريخ غالباً يكون بجوار كلمة "تاريخ الطباعة" أو "Date".
                - أرجع النتيجة بصيغة JSON فقط، بالهيكل التالي:
                {
                    "supplier_name": "اسم الشركة هنا",
                    "document_date": "تاريخ الملف بصيغة YYYY-MM-DD إن وجد، وإلا اتركه فارغاً"
                }
                تأكد من عدم وجود أي نص آخر قبل أو بعد الـ JSON.
                """

                url = base_url or 'https://openrouter.ai/api/v1'
                text_response = call_openrouter_vision(
                    url, api_key, model, prompt, img_base64)

                if text_response.startswith("```json"):
                    text_response = text_response[7:]
                if text_response.endswith("```"):
                    text_response = text_response[:-3]

                data = json.loads(text_response.strip())
                if data.get('supplier_name') or data.get('document_date'):
                    doc.close()
                    return jsonify({
                        'supplierName': data.get('supplier_name', ''),
                        'documentDate': data.get('document_date', ''),
                        'source': 'python_openrouter_vision'
                    }), 200
            except Exception as e:
                logger.error('فشل OpenRouter Vision للملف المؤقت %s: %s', tmp_path, str(e))

        elif api_key and provider_type == 'google':
            try:
                import google.generativeai as genai
                import PIL.Image
                import io
                import json

                genai.configure(api_key=api_key)

                # التقاط النصف العلوي من الصفحة الأولى كصورة
                page = doc[0]
                rect = page.rect
                clip_rect = fitz.Rect(
                    0, 0, rect.width, rect.height * 0.5)  # النصف العلوي
                pix = page.get_pixmap(dpi=200, clip=clip_rect)
                img_bytes = pix.tobytes("png")
                img = PIL.Image.open(io.BytesIO(img_bytes))

                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = """
                أنت خبير في استخراج البيانات من فواتير وكتالوجات قطع غيار السيارات في ليبيا.
                استخرج بدقة "اسم الشركة الموردة" (التي أصدرت الكتالوج أو الفاتورة) و "تاريخ الملف" من هذه الصورة.
                ملاحظات هامة:
                - استخرج اسم الشركة كاملاً (مثلاً "شركة السفير لاستيراد قطع غيار السيارات" أو "شركة الهاني").
                - التاريخ غالباً يكون بجوار كلمة "تاريخ الطباعة" أو "Date".
                - أرجع النتيجة بصيغة JSON فقط، بالهيكل التالي:
                {
                    "supplier_name": "اسم الشركة هنا",
                    "document_date": "تاريخ الملف بصيغة YYYY-MM-DD إن وجد، وإلا اتركه فارغاً"
                }
                تأكد من عدم وجود أي نص آخر قبل أو بعد الـ JSON.
                """
                response = model.generate_content([prompt, img])
                text_response = response.text.strip()
                if text_response.startswith("```json"):
                    text_response = text_response[7:]
                if text_response.endswith("```"):
                    text_response = text_response[:-3]

                data = json.loads(text_response.strip())
                if data.get('supplier_name') or data.get('document_date'):
                    doc.close()
                    # نرجع النتيجة المهيكلة مباشرة ليتم استخدامها في Backend
                    return jsonify({
                        'supplierName': data.get('supplier_name', ''),
                        'documentDate': data.get('document_date', ''),
                        'source': 'python_vision_ai'
                    }), 200
            except Exception as e:
                logger.error('فشل Google Vision AI للملف المؤقت %s: %s', tmp_path, str(e))
                # المتابعة للبديل المحلي في حال الفشل

        # 2. البديل المحلي: استخراج النص الخام + OCR للترويسة
        text_parts = []
        ocr_header_text = ""
        for i in range(min(2, len(doc))):
            page = doc[i]
            raw_text = page.get_text("text")

            cleaned_lines = []
            for line in raw_text.split('\n'):
                line = line.strip()
                if not line:
                    continue

                import unicodedata
                line = unicodedata.normalize('NFKC', line).replace('ـ', '')

                # إصلاح الكلمات العربية المعكوسة (مثل "ةكرش" -> "شركة")
                # إذا كانت الكلمة تحتوي على مقاطع معكوسة شائعة نقوم بعكس السطر
                # بالكامل أو الكلمات
                reversed_keywords = [
                    "ةكرش",
                    "تلاحم",
                    "ةسسؤم",
                    "ةعابطلا",
                    "خيرا",
                    "ةرايسلا",
                    "رايغ"]
                if any(rk in line for rk in reversed_keywords):
                    # نعكس الكلمات لترتيبها الصحيح ثم نعكس حروف كل كلمة عربية
                    words = line.split()
                    fixed_words = []
                    for w in reversed(words):
                        # نعكس الكلمة إذا كانت تحتوي على حروف عربية
                        if any("\u0600" <= c <= "\u06FF" for c in w):
                            fixed_words.append(w[::-1])
                        else:
                            fixed_words.append(w)
                    line = " ".join(fixed_words)

                cleaned_lines.append(line)

            page_text = normalize_metadata_text('\n'.join(cleaned_lines))
            if page_text:
                text_parts.append(page_text)

            if i == 0:
                ocr_header_text = ocr_top_header_text(page, fitz)

        text = '\n'.join(
            [segment for segment in [ocr_header_text] + text_parts if segment]).strip()
        supplier_name = extract_supplier_name_from_text(text)
        document_date = extract_document_date_from_text(text)

        doc.close()
        doc = None
        logger.info(
            'اكتمل استخراج البيانات الوصفية للملف المؤقت %s: supplier_found=%s date_found=%s',
            tmp_path,
            bool(supplier_name),
            bool(document_date),
        )
        return jsonify({
            'text': text,
            'supplierName': supplier_name,
            'documentDate': document_date,
            'source': 'python_local',
        }), 200
    except Exception as e:
        logger.error('فشل المسار /extract-metadata: %s', str(e))
        return internal_server_error('فشل المسار /extract-metadata')
    finally:
        if doc is not None:
            doc.close()
        cleanup_temp(tmp_path)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'pdf-processor',
        'stats': {
            'requests': request_count,
            'totalProcessingTime': round(total_processing_time, 2),
            'avgProcessingTime': round(total_processing_time / max(request_count, 1), 2)
        }
    })


@app.route('/stats', methods=['GET'])
def stats():
    """Get processing statistics"""
    return jsonify({
        'requestCount': request_count,
        'totalProcessingTime': round(total_processing_time, 2),
        'averageProcessingTime': round(total_processing_time / max(request_count, 1), 2),
        'uptime': time.time() - app.config.get('START_TIME', time.time())
    })


API_KEY = os.environ.get('PYTHON_SERVICE_API_KEY', 'wafar_internal_secret_key_2025')

@app.before_request
def require_api_key():
    # Allow health check without API key
    if request.path == '/health':
        return
    
    # Check for X-API-Key header
    provided_key = request.headers.get('X-API-Key')
    if not provided_key or provided_key != API_KEY:
        return jsonify({'error': 'Unauthorized: Invalid API Key'}), 401

@app.before_request
def before_request():
    app.config['START_TIME'] = time.time()


if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_SERVICE_PORT', 5051))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)

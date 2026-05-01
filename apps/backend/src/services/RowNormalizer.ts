import * as carModels from '../config/car_models.json';
import * as partTypes from '../config/part_types.json';
import * as makerKeywords from '../config/maker_keywords.json';

/**
 * خدمة تنظيف وتوحيد صفوف البيانات
 * تحول البيانات الخام من الجداول إلى البيانات الموحدة
 */
class RowNormalizer {
  /**
   * تنظيف صف واحد باستخدام خريطة الأعمدة
   * @param {Array} row - الصف الخام
   * @param {Object} mapping - خريطة الأعمدة من HeaderMapper
   * @returns {Object} - البيانات الموحدة
   */
  static normalize(row: any, mapping: any) {
    let rawName = this.getCell(row, mapping.item_name) || this.getCell(row, mapping.part_name);
    const rawNumber =
      this.getCell(row, mapping.item_number) || this.getCell(row, mapping.part_code);
    let oemNumber = this.cleanCode(this.getCell(row, mapping.oem_number));

    // Smart Extraction: Extract OEM from name if missing
    if (!oemNumber && rawName) {
      const extraction = this.extractOemFromText(rawName);
      if (extraction.oem) {
        oemNumber = this.cleanCode(extraction.oem);
        rawName = extraction.cleanText;
      }
    }

    const result = {
      part_code: this.cleanCode(rawNumber),
      oem_number: oemNumber,
      part_name: rawName,
      brand: this.getCell(row, mapping.brand),
      origin_country: this.getCell(row, mapping.origin),
      quality_grade: this.getCell(row, mapping.quality) || 'unspecified',
      price_cash: this.parsePrice(this.getCell(row, mapping.price_cash)),
      price_bank: this.parsePrice(this.getCell(row, mapping.price_bank)),
      price_wholesale: this.parsePrice(this.getCell(row, mapping.price_wholesale)),
      price_wholesale_small: this.parsePrice(this.getCell(row, mapping.price_wholesale_small)),
      price_retail: this.parsePrice(this.getCell(row, mapping.price_retail)),
      stock: this.parseStock(this.getCell(row, mapping.stock)),
      supplier_name: this.getCell(row, mapping.supplier_name),
      car_model: this.getCell(row, mapping.car_model),
    };

    this.repairMisalignedCells(result as any, row);
    (result as any).derived = this.extractDerived(result.part_name, result.car_model);
    (result as any).search_signature = this.makeSignature(result);

    return result;
  }

  /**
   * استخراج الرقم الأصلي من نص إذا وجد
   * @param {String} text - النص
   * @returns {Object} - { oem, cleanText }
   */
  static extractOemFromText(text: string): { oem: string | null; cleanText: string } {
    if (!text) return { oem: null, cleanText: '' };

    // Pattern 1: Standard with dash or dot e.g., 35150-02600, 56500-1Y000, 56500.1Y501, C1000.56500
    const dashDotPattern = /\b([A-Z0-9]{3,7}[-_.][A-Z0-9]{3,7}(?:[-_.][A-Z0-9]+)?)\b/i;
    let match = text.match(dashDotPattern);

    if (match) {
      return {
        oem: match[1],
        cleanText: text
          .replace(match[0], '')
          .replace(/\s{2,}/g, ' ')
          .trim(),
      };
    }

    // Pattern 2: Alphanumeric mix, length 4+ (at least one letter and one digit) e.g., 2E000, 2B000, A000, SP1248
    // We avoid matching generic words by ensuring it's a tight sequence of letters and numbers.
    const alphanumericPattern = /\b((?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{4,15})\b/i;
    match = text.match(alphanumericPattern);

    if (match) {
      return {
        oem: match[1],
        cleanText: text
          .replace(match[0], '')
          .replace(/\s{2,}/g, ' ')
          .trim(),
      };
    }

    return { oem: null, cleanText: text };
  }

  /**
   * تنظيف الكود (حذف المسافات والنقاط الزائدة)
   * @param {String} raw - النص الخام
   * @returns {String|null} - الكود المنظف
   */
  static cleanCode(raw: any) {
    if (!raw) return null;
    return String(raw)
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^[.\s-]+|[.\s-]+$/g, '');
  }

  /**
   * استخراج قيمة من خلية
   * @param {Array} row - الصف
   * @param {Object} mapInfo - معلومات التعيين
   * @returns {String|null} - القيمة
   */
  static getCell(row: any, mapInfo: any) {
    if (!mapInfo) return null;
    const value = row[mapInfo.column];
    return value ? String(value).trim() : null;
  }

  /**
   * تحويل نص السعر إلى رقم
   * @param {String} raw - النص الخام
   * @returns {Number|null} - السعر
   */
  static parsePrice(raw: any) {
    if (!raw) return null;
    const cleaned = raw.replace(/[,٬]/g, '.').replace(/[^\d.]/g, '');
    const price = parseFloat(cleaned);
    if (isNaN(price)) return null;
    if (price > 999999999.99) return null;
    return price;
  }

  /**
   * تحويل نص المخزون إلى رقم
   * @param {String} raw - النص الخام
   * @returns {Number|null} - الكمية
   */
  static parseStock(raw: any) {
    if (!raw) return null;
    const cleaned = raw.replace(/[^\d]/g, '');
    const qty = parseInt(cleaned, 10);
    if (isNaN(qty)) return null;
    if (qty > 2147483647) return null;
    return qty;
  }

  static repairMisalignedCells(result: any, row: any[]) {
    const cells = Array.isArray(row)
      ? row.map((cell) => (cell ? String(cell).trim() : '')).filter((cell) => !!cell)
      : [];

    const codeLikeCells = cells.filter((cell) => this.isCodeLike(cell));
    const numericIdCells = cells.filter((cell) => this.isLikelyPartNumber(cell));
    const nameCells = cells.filter((cell) => this.looksLikePartName(cell));
    const brandCells = cells.filter((cell) => this.looksLikeBrand(cell));

    if (
      !result.part_name ||
      this.isCodeLike(result.part_name) ||
      !this.looksLikePartName(result.part_name)
    ) {
      const bestName = nameCells.sort((a, b) => b.length - a.length)[0];
      if (bestName) {
        result.part_name = bestName;
      }
    }

    if (!result.oem_number) {
      const bestOem = codeLikeCells.find((cell) => /[a-z]/i.test(cell) || /[.-]/.test(cell));
      if (bestOem) {
        result.oem_number = this.cleanCode(bestOem);
      }
    }

    if (!result.part_code || !this.isLikelyPartNumber(result.part_code)) {
      const bestPartCode = numericIdCells.sort(
        (a, b) => b.length - a.length || Number(b) - Number(a)
      )[0];
      if (bestPartCode) {
        result.part_code = this.cleanCode(bestPartCode);
      }
    }

    if (!result.brand || !this.looksLikeBrand(result.brand)) {
      const bestBrand = brandCells.find(
        (cell) => cell !== result.part_name && cell !== result.oem_number
      );
      if (bestBrand) {
        result.brand = bestBrand;
      }
    }

    if (
      !result.price_cash &&
      !result.price_bank &&
      !result.price_wholesale &&
      !result.price_wholesale_small &&
      !result.price_retail
    ) {
      const fallbackPrice = cells
        .map((cell) => this.parsePrice(cell))
        .find((price) => price !== null);
      if (fallbackPrice !== undefined) {
        result.price_cash = fallbackPrice;
      }
    }
  }

  static isCodeLike(value: any) {
    if (!value) return false;
    const cleaned = this.cleanCode(value);
    if (!cleaned) return false;
    if (/^\d+[.]\d+$/.test(cleaned)) return false;
    return /[0-9.\-/]/.test(cleaned) && /^[A-Z0-9][A-Z0-9.\-/]{4,}$/i.test(cleaned);
  }

  static isLikelyPartNumber(value: any) {
    if (!value) return false;
    const cleaned = String(value).trim();
    if (!/^\d{3,6}$/.test(cleaned)) return false;
    const number = Number(cleaned);
    return number >= 100 && number < 100000;
  }

  static looksLikePartName(value: any) {
    if (!value) return false;
    const cleaned = String(value).trim();
    if (cleaned.length < 4) return false;
    if (this.isCodeLike(cleaned)) return false;
    if (/^(اسم الصنف|رقم الصنف|الرقم|الشركة|عروض|الفاتورة|السعر)$/i.test(cleaned)) return false;
    return /[\u0600-\u06FF]/.test(cleaned) && /[A-Za-z\u0600-\u06FF]{3,}/.test(cleaned);
  }

  static looksLikeBrand(value: any) {
    if (!value) return false;
    const cleaned = String(value).trim();
    if (cleaned.length < 2 || cleaned.length > 20) return false;
    if (/\s{2,}/.test(cleaned)) return false;
    if (this.isLikelyPartNumber(cleaned) || this.isCodeLike(cleaned)) return false;
    return /^[A-Za-z\u0600-\u06FF-]+$/i.test(cleaned);
  }

  /**
   * استخراج البيانات المشتقة من الاسم
   * @param {String} name - اسم القطعة
   * @returns {Object} - {year, side, car_model, maker, part_type}
   */
  static extractDerived(name: any, explicitCarModel: any) {
    if (!name && !explicitCarModel) return {};
    const derived = {};

    const text = name || '';

    // السنة
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) (derived as any).year = parseInt(yearMatch[0], 10);

    // الجهة
    if (/\bLH\b|يسار/i.test(text)) (derived as any).side = 'LH';
    else if (/\bRH\b|يمين/i.test(text)) (derived as any).side = 'RH';

    // نوع القطعة
    for (const [type, keywords] of Object.entries(partTypes)) {
      if (Array.isArray(keywords) && keywords.some((k: any) => text.includes(k))) {
        (derived as any).part_type = type;
        break;
      }
    }

    // الصانع
    for (const [maker, keywords] of Object.entries(makerKeywords)) {
      if (Array.isArray(keywords) && keywords.some((k: any) => text.includes(k))) {
        (derived as any).maker = maker;
        break;
      }
    }

    // الموديل: إذا وُفر كعمود منفصل نستخدمه، وإلا نستخرجه من الاسم
    if (explicitCarModel) {
      (derived as any).car_model = explicitCarModel;
    } else if ((derived as any).maker) {
      const models = (carModels as any)[(derived as any).maker];
      if (Array.isArray(models)) {
        for (const model of models) {
          if (text.includes(model)) {
            (derived as any).car_model = model;
            break;
          }
        }
      }
    }

    return derived;
  }

  /**
   * إنشاء توقيع البحث
   * @param {Object} data - البيانات الموحدة
   * @returns {String} - توقيع البحث
   */
  static makeSignature(data: any) {
    const parts = [
      data.part_code,
      data.oem_number,
      data.part_name,
      data.brand,
      data.supplier_name,
      data.derived?.maker,
      data.derived?.car_model,
      data.derived?.part_type,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return parts.replace(/\s+/g, ' ').trim();
  }

  /**
   * التحقق من جودة الصف
   * @param {Object} normalized - البيانات الموحدة
   * @returns {Object} - {isValid, score, issues}
   */
  static validateRow(normalized: any) {
    const issues = [];

    if (!normalized.part_code && !normalized.oem_number) {
      issues.push('missing_identifier');
    }

    if (
      !normalized.part_name ||
      normalized.part_name.length < 3 ||
      !this.looksLikePartName(normalized.part_name)
    ) {
      issues.push('invalid_name');
    }

    if (
      !normalized.price_cash &&
      !normalized.price_bank &&
      !normalized.price_wholesale &&
      !normalized.price_wholesale_small &&
      !normalized.price_retail
    ) {
      issues.push('missing_price');
    }

    const score = 100 - issues.length * 25;

    return {
      isValid: issues.length === 0,
      score: Math.max(0, score),
      issues,
    };
  }
}

export { RowNormalizer };

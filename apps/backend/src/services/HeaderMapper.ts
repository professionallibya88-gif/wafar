import * as synonyms from '../config/column_synonyms.json';

/**
 * خدمة تعيين الأعمدة
 * تحول أسماء الأعمدة من PDF إلى الحقول الموحدة في قاعدة البيانات
 */
class HeaderMapper {
  /**
   * تعيين الأعمدة من العناوين الخام
   * @param {Array} headers - مصفوفة عناوين الأعمدة
   * @returns {Object} - خريطة {field: {column, originalName, confidence}}
   */
  static map(headers: any) {
    const mapping = {};
    const used = new Set();

    headers.forEach((header: any, index: any) => {
      const result = this.matchHeader(header);
      if (result && !used.has(result.field)) {
        (mapping as any)[result.field] = {
          column: index,
          originalName: header,
          confidence: result.confidence,
        };
        used.add(result.field);
      }
    });

    return mapping;
  }

  /**
   * مطابقة عنوان عمود واحد
   * @param {String} header - عنوان العمود
   * @returns {Object|null} - {field, confidence} أو null
   */
  static matchHeader(header: any) {
    const clean = this.normalize(header);
    if (!clean || clean.length === 0) return null;

    const ruleBasedMatch = this.getRuleBasedMatch(clean);
    if (ruleBasedMatch) return ruleBasedMatch;

    // محاولة 1: مطابقة مباشرة
    for (const [field, names] of Object.entries(synonyms)) {
      if (!Array.isArray(names)) continue;
      if ((names as any).map((n: any) => this.normalize(n)).includes(clean)) {
        return { field, confidence: 100 };
      }
    }

    // محاولة 2: احتواء (مع تفضيل الأطول لتجنب التشابك)
    let bestContains = null;
    for (const [field, names] of Object.entries(synonyms)) {
      if (!Array.isArray(names)) continue;
      for (const name of names as any) {
        const n = this.normalize(name);
        if (!n) continue;
        if (clean.includes(n) || n.includes(clean)) {
          const score = clean.length >= n.length ? 90 : 80;
          if (!bestContains || score > bestContains.confidence) {
            bestContains = { field, confidence: score, n };
          }
        }
      }
    }
    if (bestContains) return bestContains;

    // محاولة 3: تشابه بسيط (بدون مكتبة خارجية)
    let best = null;
    for (const [field, names] of Object.entries(synonyms)) {
      if (!Array.isArray(names)) continue;
      for (const name of names as any) {
        const normalizedName = this.normalize(name);
        if (!normalizedName) continue;
        const similarity = this.calculateSimilarity(clean, normalizedName);
        if (similarity > 0.75 && (!best || similarity > best.similarity)) {
          best = { field, confidence: Math.round(similarity * 100), similarity };
        }
      }
    }
    return best;
  }

  /**
   * تطبيع النص للمقارنة
   * @param {String} text - النص الأصلي
   * @returns {String} - النص المطبع
   */
  static normalize(text: any) {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFKC')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ـ/g, '')
      .replace(/[\u064B-\u065F]/g, '') // حذف التشكيل
      .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d: any) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48)) // تحويل أرقام هندية
      .replace(/\s+/g, ' ') // دمج المسافات المتعددة
      .replace(/[^a-z0-9\u0600-\u06FF]/g, ''); // حذف الرموز
  }

  static getRuleBasedMatch(clean: string) {
    if (clean === '#' || clean === 'no') {
      return { field: 'serial', confidence: 100 };
    }

    if (
      clean.includes('رقم') &&
      (clean.includes('اصلي') ||
        clean.includes('اصليه') ||
        clean.includes('الاصلي') ||
        clean.includes('االصلي') ||
        clean.includes('الصلي') ||
        clean.includes('oem') ||
        clean.includes('oe') ||
        clean.includes('وكيل') ||
        clean.includes('قطعهالاصليه'))
    ) {
      return { field: 'oem_number', confidence: 98 };
    }

    if (
      clean.includes('رقم') &&
      (clean.includes('صنف') ||
        clean.includes('قطعه') ||
        clean.includes('منتج') ||
        clean.includes('مرجع') ||
        clean.includes('ماده') ||
        clean.includes('كود'))
    ) {
      return { field: 'item_number', confidence: 98 };
    }

    if (
      clean.includes('كود') &&
      !clean.includes('اصلي') &&
      !clean.includes('الاصلي') &&
      !clean.includes('االصلي') &&
      !clean.includes('وكيل')
    ) {
      return { field: 'item_number', confidence: 92 };
    }

    return null;
  }

  /**
   * حساب التشابه بين نصين باستخدام مسافة ليفنشتاين (Levenshtein)
   * @param {String} a - النص الأول
   * @param {String} b - النص الثاني
   * @returns {Number} - نسبة التشابه (0-1)
   */
  static calculateSimilarity(a: any, b: any) {
    if (!a || !b) return 0;
    if (a === b) return 1;

    const lenA = a.length;
    const lenB = b.length;
    const maxLen = Math.max(lenA, lenB);

    if (maxLen === 0) return 0;

    const matrix: number[][] = [];
    for (let i = 0; i <= lenB; i++) matrix[i] = [i];
    for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

    for (let i = 1; i <= lenB; i++) {
      for (let j = 1; j <= lenA; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[lenB][lenA];
    return 1 - distance / maxLen;
  }

  /**
   * التحقق من جودة التعيين
   * @param {Object} mapping - خريطة التعيين
   * @returns {Object} - {isValid, score, missingFields}
   */
  static validateMapping(mapping: any) {
    // الحقول الإلزامية: يجب توفر معرف (رقم أو OEM أو كود) واسم وسعر
    const hasId = mapping.item_number || mapping.oem_number || mapping.part_code;
    const hasName = mapping.item_name || mapping.part_name;
    const hasPrice = mapping.price_cash || mapping.price_wholesale || mapping.price_bank;

    const missingFields = [];
    if (!hasId) missingFields.push('identifier');
    if (!hasName) missingFields.push('name');
    if (!hasPrice) missingFields.push('price');

    const score = Object.values(mapping).reduce((sum: any, m: any) => sum + (m.confidence || 0), 0);

    return {
      isValid: missingFields.length === 0,
      score: Math.round((score as any) / (Object.keys(mapping).length || 1)),
      missingFields,
    };
  }
}

export { HeaderMapper };

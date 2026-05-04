import { pdfFileRepository, partRepository } from '../repositories';
import { AppError, NotFoundError, BusinessError } from '../errors';
import { NodePDFProcessor } from './NodePDFProcessor';
import { PythonPDFProcessor } from './PythonPDFProcessor';
import { AWSTextractProcessor } from './AWSTextractProcessor';
import { OCRProcessor } from './OCRProcessor';
import { HeaderMapper } from './HeaderMapper';
import { RowNormalizer } from './RowNormalizer';
import { pdfProcessingProfileService } from './PDFProcessingProfileService';
import { vercelBlobService } from './VercelBlobService';
import { promises as fs } from 'fs';
import logger from '../config/logger';

export class PDFProcessor {
  private static toProcessingError(error: unknown, fallbackMessage: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error && error.message) {
      return new BusinessError(error.message, { reason: fallbackMessage });
    }

    return new BusinessError(fallbackMessage);
  }

  static processTablesWithNewPipeline(tablesResult: any): any[] {
    const finalParts: any[] = [];

    for (const table of tablesResult.tables || []) {
      const headers = table.headers || [];
      const rows = table.rows || [];

      const mapping = HeaderMapper.map(headers);

      rows.forEach((row: any, rowIndex: number) => {
        try {
          const normalized = RowNormalizer.normalize(row, mapping);
          const validation = RowNormalizer.validateRow(normalized);

          if (validation.isValid) {
            finalParts.push({
              part_code: normalized.part_code,
              oem_number: normalized.oem_number,
              part_name: normalized.part_name,
              brand: normalized.brand,
              origin_country: normalized.origin_country,
              quality_grade: normalized.quality_grade,
              price_cash: normalized.price_cash,
              price_bank: normalized.price_bank,
              price_wholesale: normalized.price_wholesale,
              price_wholesale_small: normalized.price_wholesale_small,
              price_retail: normalized.price_retail,
              supplier_name: normalized.supplier_name,
              quantity_available: normalized.stock,
              derived: (normalized as any).derived,
              search_signature: (normalized as any).search_signature,
              mapping_confidence:
                (mapping as any).item_number?.confidence ||
                (mapping as any).oem_number?.confidence ||
                0,
              raw_headers: headers,
              raw_row: row,
              page_number: table.page,
              table_index: table.table_index,
              row_index: rowIndex,
            });
          }
        } catch (error: any) {
          logger.warn('خطأ في معالجة صف:', error.message);
        }
      });
    }

    return finalParts;
  }

  static async processPDF(fileId: string, method: string): Promise<void> {
    const pdfFile = await pdfFileRepository.findById(fileId);
    if (!pdfFile) throw new NotFoundError('ملف PDF غير موجود');
    const pdfFileId = pdfFile.id;
    const pdfFilePath = pdfFile.file_path;
    const existingDocumentDate = pdfFile.document_date;
    const supplierId = pdfFile.supplier_id;

    if (!supplierId) {
      throw new BusinessError('تعذر معالجة الملف لعدم وجود مورد مرتبط به');
    }

    try {
      const profile = await pdfProcessingProfileService.getProfile(method);

      await pdfFileRepository.updateById(pdfFileId, {
        status: 'processing',
        progress_percent: 25,
        progress_message: 'جاري تحليل الملف واستخراج البيانات',
      });

      let metadataText = '';
      let metadataDocumentDate: string | undefined;

      if (!existingDocumentDate) {
        try {
          const metadataResult = await PythonPDFProcessor.extractMetadata(pdfFilePath);
          metadataText = this.normalizeExtractedText(String(metadataResult?.text || ''));
          metadataDocumentDate = this.extractDocumentDate(metadataText);
        } catch (metadataError: any) {
          logger.warn(`تعذر استخراج البيانات الوصفية للملف ${pdfFileId}: ${metadataError.message}`);
        }
      }

      let execution;
      try {
        execution = await this.executeExtractionMethod(
          pdfFilePath,
          profile.requestedMethod,
          profile.tableEngine
        );
      } catch (primaryError: any) {
        logger.warn(
          `فشل المحرك الأساسي ${profile.requestedMethod} أثناء معالجة الملف ${pdfFileId}: ${primaryError.message}`
        );

        if (!profile.enableAutoFallback) {
          throw this.toProcessingError(primaryError, 'فشل محرك المعالجة الأساسي');
        }

        execution = {
          result: { parts: [] },
          actualMethod: profile.requestedMethod,
        };
      }

      if (this.needsFallback(execution.result) && profile.enableAutoFallback) {
        for (const fallbackMethod of profile.fallbackChain) {
          try {
            logger.warn(
              `لم تنجح الطريقة ${execution.actualMethod} في استخراج النتائج المطلوبة، جاري تجربة ${fallbackMethod}`
            );
            execution = await this.executeExtractionMethod(
              pdfFilePath,
              fallbackMethod,
              profile.tableEngine
            );

            if (!this.needsFallback(execution.result)) {
              break;
            }
          } catch (fallbackError: any) {
            logger.warn(
              `فشل المحرك البديل ${fallbackMethod} أثناء معالجة الملف ${pdfFileId}: ${fallbackError.message}`
            );
          }
        }
      }

      let result = execution.result;
      let finalExtractionMethod = execution.actualMethod;

      if (this.needsFallback(result) && finalExtractionMethod !== 'ocr') {
        logger.warn(
          `لم يتم استخراج أي قطعة عبر ${finalExtractionMethod}، جاري تجربة OCR لـ ${pdfFileId}`
        );
        try {
          const ocrExecution = await this.executeExtractionMethod(
            pdfFilePath,
            'ocr',
            profile.tableEngine
          );
          result = ocrExecution.result;
          finalExtractionMethod = ocrExecution.actualMethod;
        } catch (ocrError: any) {
          logger.error(`فشل الاحتياط عبر OCR: ${ocrError.message}`);
          await pdfFileRepository.updateById(pdfFileId, {
            status: 'failed',
            error_message:
              ocrError.message ||
              'فشل استخراج البيانات من الملف. قد يكون الملف ممسوحاً ضوئياً وبدون نص قابل للاستخراج.',
          });
          throw this.toProcessingError(ocrError, 'فشل محرك OCR الاحتياطي');
        }
      }

      const finalParts = result.parts || [];
      const finalPageCount = result.pageCount || 0;
      const tablesCount =
        result.tablesCount || result.rawData?.count || result.rawData?.tables?.length || 0;

      logger.info(`Extracted ${finalParts.length} parts from PDF ${pdfFileId}`);

      // استخراج تاريخ الملف تلقائياً من النص إن لم يُدخل يدوياً
      let detectedDocumentDate: string | undefined;
      if (!existingDocumentDate) {
        const textToScan =
          metadataText ||
          result.rawText ||
          result.text ||
          String(result.rawData?.text || result.rawData?.rawText || '') ||
          JSON.stringify(result.rawData || '');
        detectedDocumentDate = this.extractDocumentDate(textToScan);
        detectedDocumentDate = detectedDocumentDate || metadataDocumentDate;
      }

      await pdfFileRepository.updateById(pdfFileId, {
        status: 'completed',
        extracted_data: result.rawData || null,
        page_count: finalPageCount,
        tables_count: tablesCount,
        parts_count: finalParts.length,
        extraction_method: finalExtractionMethod,
        progress_percent: 100,
        progress_message: 'اكتملت المعالجة بنجاح',
        ...(detectedDocumentDate ? { document_date: new Date(detectedDocumentDate) } : {}),
      });

      const rows = finalParts.map((partData: any) => {
        return {
          part_code:
            partData.partCode ||
            partData.code ||
            partData.part_code ||
            partData.item_number ||
            null,
          part_name:
            partData.partName ||
            partData.name ||
            partData.part_name ||
            partData.item_name ||
            'غير محدد',
          part_name_en: partData.partNameEn || null,
          category: partData.category || null,
          brand: partData.brand || null,
          origin_country: partData.originCountry || partData.origin_country || null,
          quality_grade: partData.qualityGrade || partData.quality_grade || 'unspecified',
          price: partData.price || null,
          price_cash: partData.price_cash || null,
          price_bank: partData.price_bank || null,
          price_wholesale: partData.price_wholesale || null,
          price_wholesale_small: partData.price_wholesale_small || null,
          currency: partData.currency || 'LYD',
          unit: partData.unit || null,
          in_stock: partData.inStock !== undefined ? partData.inStock : true,
          quantity_available: partData.quantityAvailable || partData.quantity_available || null,
          description: partData.description || null,
          specifications: partData.specifications || null,
          supplier_name_text: partData.supplier_name || null,
          row_data: partData.rawRow || partData.raw_row || null,
          item_number: partData.item_number || null,
          oem_number: partData.oem_number || null,
          derived: partData.derived || null,
          search_signature: partData.search_signature || null,
          mapping_confidence: partData.mapping_confidence || 0,
          raw_headers: partData.raw_headers || null,
          raw_row: partData.raw_row || null,
          row_index: partData.row_index || 0,
          page_number: partData.page_number || null,
          table_index: partData.table_index || 0,
          pdf_file_id: pdfFileId,
          supplier_id: supplierId,
        };
      });

      if (rows.length > 0) {
        const chunkSize = 100;
        let processed = 0;
        const totalRows = rows.length;

        for (let i = 0; i < totalRows; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          await partRepository.bulkCreate(chunk, { validate: true });
          processed += chunk.length;

          const saveProgress = Math.min(99, 70 + Math.floor((processed / totalRows) * 29));

          await pdfFileRepository.updateById(pdfFileId, {
            progress_percent: saveProgress,
            progress_message: `جاري حفظ القطع... (${processed}/${totalRows})`,
            parts_count: processed,
          });
        }
      }

      logger.info(`تم حفظ ${rows.length} قطعة في قاعدة البيانات للملف ${pdfFileId}`);

      // Upload to Vercel Blob if enabled
      let finalFilePath = pdfFilePath;
      if (process.env.USE_VERCEL_BLOB === 'true') {
        try {
          const vercelUrl = await vercelBlobService.uploadFile(pdfFilePath, pdfFile.original_name);
          finalFilePath = vercelUrl;
          await pdfFileRepository.updateById(pdfFileId, { file_path: finalFilePath });

          // Try to delete the local file since it's uploaded
          try {
            await fs.unlink(pdfFilePath);
            logger.info(`تم حذف الملف المحلي بعد الرفع لـ Vercel Blob: ${pdfFilePath}`);
          } catch (unlinkErr) {
            logger.warn(`فشل حذف الملف المحلي: ${pdfFilePath}`, unlinkErr);
          }
        } catch (uploadErr) {
          logger.error(`فشل رفع الملف لـ Vercel Blob: ${pdfFileId}`, uploadErr);
        }
      }
    } catch (error: any) {
      await pdfFileRepository.updateById(pdfFileId, {
        status: 'failed',
        error_message: error.message,
        progress_percent: 100,
        progress_message: 'فشلت المعالجة',
      });

      logger.error(`فشل معالجة PDF ${pdfFileId}:`, error.message);
      throw this.toProcessingError(error, 'فشلت معالجة ملف PDF');
    }
  }

  private static async executeExtractionMethod(
    filePath: string,
    method: string,
    tableEngine: string
  ): Promise<{ result: any; actualMethod: string }> {
    switch (method) {
      case 'python_ai': {
        const result = await PythonPDFProcessor.process(filePath, {
          mode: 'python_ai',
          engine: tableEngine,
        });
        return { result, actualMethod: 'python_ai' };
      }
      case 'python_pypdf': {
        try {
          const tablesResult = await PythonPDFProcessor.extractTables(filePath, {
            engine: tableEngine,
          });
          if (tablesResult?.tables?.length) {
            const newPipelineParts = this.processTablesWithNewPipeline(tablesResult);
            return {
              result: {
                parts: newPipelineParts,
                pageCount: 0,
                rawData: tablesResult,
                tablesCount: tablesResult.count || tablesResult.tables.length,
              },
              actualMethod: `python_tables:${tableEngine}`,
            };
          }
        } catch (tableError: any) {
          logger.warn(`فشل استخراج الجداول بمحرك ${tableEngine}: ${tableError.message}`);
        }

        const result = await PythonPDFProcessor.process(filePath, {
          mode: 'python_pypdf',
          engine: tableEngine,
        });
        return { result, actualMethod: 'python_pypdf' };
      }
      case 'aws_textract':
        return {
          result: await AWSTextractProcessor.process(filePath),
          actualMethod: 'aws_textract',
        };
      case 'ocr':
        return {
          result: await OCRProcessor.processPDFWithParts(filePath),
          actualMethod: 'ocr',
        };
      case 'node_pdf':
      default:
        return {
          result: await NodePDFProcessor.process(filePath),
          actualMethod: 'node_pdf',
        };
    }
  }

  private static needsFallback(result: any): boolean {
    return !result || !Array.isArray(result.parts) || result.parts.length === 0;
  }

  static extractSupplierFromPath(fileName: string | null): string | null {
    if (!fileName) return null;

    let name = fileName.replace(/\.pdf$/i, '');
    name = name.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_\d+/gi, '');
    name = name.replace(/_\d+$/, '');
    name = name.replace(/[_-]+/g, ' ').trim();

    if (name.length < 2 || /^\d+$/.test(name)) return null;

    const words = name.split(/\s+/).filter((w) => w.length > 1);
    return words.slice(0, 3).join(' ') || null;
  }

  static normalizeExtractedText(text: string): string {
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

    return text
      .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  static extractSupplierName(text: string): string | null {
    if (!text) return null;

    const lines = this.normalizeExtractedText(text)
      .split('\n')
      .map((line) => this.cleanSupplierCandidate(line))
      .filter(Boolean);
    const candidates = new Map<string, number>();

    const pushCandidate = (value: string, scoreBoost = 0) => {
      const candidate = this.cleanSupplierCandidate(value);
      if (!this.isLikelySupplierName(candidate)) {
        return;
      }

      const score = this.scoreSupplierCandidate(candidate) + scoreBoost;
      const currentScore = candidates.get(candidate) || 0;
      if (score > currentScore) {
        candidates.set(candidate, score);
      }
    };

    const labeledPatterns = [
      /(?:اسم\s+الشركة|اسم\s+المورد|الشركة\s+الموردة|المورد|Supplier|Company|Vendor|Manufacturer)\s*[:\-–]*\s*(.+)$/i,
      /^(?:for|by)\s+(.+)$/i,
      /^((?:شركة|محلات|ةكرش|تلاحم)\s+.+)$/i,
    ];

    for (const [index, line] of lines.slice(0, 20).entries()) {
      for (const pattern of labeledPatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          pushCandidate(match[1], 30 - index);
        }
      }

      if (this.isSupplierPrefixOnly(line)) {
        const mergedWithNext = this.mergeSupplierLines(line, lines[index + 1]);
        const mergedWithTwoLines = this.mergeSupplierLines(mergedWithNext, lines[index + 2]);
        pushCandidate(mergedWithNext, 35 - index);
        pushCandidate(mergedWithTwoLines, 28 - index);
      }
    }

    for (const [index, line] of lines.slice(0, 15).entries()) {
      if (line.match(/[\d]{4}/) || line.match(/[\d]{9,}/)) {
        continue;
      }

      pushCandidate(line, 20 - index);

      if (this.shouldMergeWithNextLine(line)) {
        pushCandidate(this.mergeSupplierLines(line, lines[index + 1]), 24 - index);
      }
    }

    const sortedCandidates = Array.from(candidates.entries()).sort((a, b) => b[1] - a[1]);
    return sortedCandidates[0]?.[0] || null;
  }

  static cleanSupplierCandidate(value: string): string {
    return value
      .replace(/^[\s:;,_\-–|]+/, '')
      .replace(/[\s:;,_\-–|]+$/, '')
      .replace(
        /^(?:اسم\s+الشركة|اسم\s+المورد|الشركة\s+الموردة|المورد|Supplier|Company|Vendor|Manufacturer)\s*[:\-–]*\s*/i,
        ''
      )
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  static isLikelySupplierName(value: string): boolean {
    if (!value || value.length < 3 || value.length > 120) {
      return false;
    }

    const lowerValue = value.toLowerCase();
    const blacklist = [
      'قائمة الأسعار',
      'الاسعار',
      'الأسعار',
      'قائمة اسعار',
      'catalog',
      'price list',
      'invoice',
      'quotation',
      'date',
      'page',
      'كتالوج',
      'فاتورة',
      'تاريخ',
      'صفحة',
      'رقم',
      'نقدي',
      'مصرف',
      'السعر',
      'اسم الصنف',
      'رقم الصنف',
      'البيان',
      'الكمية',
      'الطباعة',
    ];

    if (blacklist.some((word) => lowerValue.includes(word))) {
      return false;
    }

    // Check "قطع غيار" or "spare parts" only if it is standalone or not prefixed by "شركة"
    const hasSpareParts = lowerValue.includes('قطع غيار') || lowerValue.includes('spare parts');
    if (hasSpareParts && !/^(شركة|محلات|مؤسسة|معرض|وكالة|مركز)/.test(value.trim())) {
      return false;
    }

    if (this.isSupplierPrefixOnly(value)) {
      return false;
    }

    const lettersCount = (value.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
    const digitsCount = (value.match(/\d/g) || []).length;
    const wordsCount = value
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean).length;
    if (digitsCount > 0) {
      return false;
    }

    const hasCompanyPrefix = /^(?:شركة|محلات|مؤسسة|وكالة|معرض|مكتب)\s*/i.test(value.trim());
    const isUpperEnglishName = /^[A-Z][A-Z\s.&-]{3,}$/.test(value.trim());

    return lettersCount >= 3 && wordsCount >= 2 && (hasCompanyPrefix || isUpperEnglishName);
  }

  /**
   * استخراج تاريخ الملف من النص (أنماط شائعة في كتالوجات ليبيا)
   */
  static extractDocumentDate(text: string): string | undefined {
    if (!text) return undefined;

    const normalized = this.normalizeExtractedText(text);

    const labeledPatterns = [
      /(?:تاريخ\s+الطباعة|تاريخ\s+الإصدار|تاريخ\s+الملف|التاريخ|تاريخ|Date(?:\s+Printed)?|Print\s+Date)\s*[:\-–]?\s*(\d{1,4}[/\-.\s]\d{1,2}[/\-.\s]\d{1,4})/i,
      /(?:تاريخ\s+الطباعة|تاريخ\s+الإصدار|تاريخ\s+الملف|التاريخ|تاريخ)\s*[:\-–]?\s*(\d{1,2}[/\-.\s]\d{1,2}[/\-.\s]\d{2,4})/i,
    ];
    const rtlLabeledMatch = normalized.match(
      /(?:خيرا[تة]?|خيرات|ةكرش|ةكرشلا)\s*.*?(20\d{2}[/\-.\s]\d{1,2}[/\-.\s]\d{1,2}|\d{1,2}[/\-.\s]\d{1,2}[/\-.\s]20\d{2})/i
    );

    for (const pattern of labeledPatterns) {
      const labeledDateMatch = normalized.match(pattern);
      if (!labeledDateMatch?.[1]) {
        continue;
      }

      const parsed = this.parseDateCandidate(labeledDateMatch[1]);
      if (parsed) return parsed;
    }

    if (rtlLabeledMatch?.[1]) {
      const parsed = this.parseDateCandidate(rtlLabeledMatch[1]);
      if (parsed) return parsed;
    }

    const generalPatterns = [
      /\b(?:19|20)\d{2}[/\-.\s](?:0[1-9]|1[0-2])[/\-.\s](?:0[1-9]|[12]\d|3[01])\b/,
      /\b(?:0[1-9]|[12]\d|3[01])[/\-.\s](?:0[1-9]|1[0-2])[/\-.\s](?:19|20)\d{2}\b/,
      /\b(?:0[1-9]|[12]\d|3[01])[/\-.\s](?:0[1-9]|1[0-2])[/\-.\s](?:\d{2})\b/,
    ];

    const textStart = normalized.substring(0, 1000);
    for (const pattern of generalPatterns) {
      const match = textStart.match(pattern);
      if (!match) continue;
      const parsed = this.parseDateCandidate(match[0]);
      if (parsed) return parsed;
    }

    return undefined;
  }

  static parseDateCandidate(candidate: string): string | undefined {
    const cleaned = this.normalizeExtractedText(candidate)
      .replace(/[,.]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const isoMatch = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (isoMatch) {
      return this.buildIsoDate(isoMatch[1], isoMatch[2], isoMatch[3]);
    }

    const dayFirstMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dayFirstMatch) {
      return this.buildIsoDate(dayFirstMatch[3], dayFirstMatch[2], dayFirstMatch[1]);
    }

    const shortYear = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
    if (shortYear) {
      const fullYear = Number(shortYear[3]) < 50 ? `20${shortYear[3]}` : `19${shortYear[3]}`;
      return this.buildIsoDate(fullYear, shortYear[2], shortYear[1]);
    }

    const monthYearMatch = cleaned.match(/^(\d{1,2})[/-](\d{4})$/);
    if (monthYearMatch) {
      return this.buildIsoDate(monthYearMatch[2], monthYearMatch[1], '01');
    }

    const yearMonthMatch = cleaned.match(/^(\d{4})[/-](\d{1,2})$/);
    if (yearMonthMatch) {
      return this.buildIsoDate(yearMonthMatch[1], yearMonthMatch[2], '01');
    }

    const yearMatch = cleaned.match(/^(20\d{2})$/);
    if (yearMatch) {
      return this.buildIsoDate(yearMatch[1], '01', '01');
    }

    return undefined;
  }

  static buildIsoDate(year: string, month: string, day: string): string | undefined {
    const normalizedYear = Number(year);
    const normalizedMonth = Number(month);
    const normalizedDay = Number(day);

    if (
      !Number.isInteger(normalizedYear) ||
      !Number.isInteger(normalizedMonth) ||
      !Number.isInteger(normalizedDay) ||
      normalizedYear < 2000 ||
      normalizedYear > 2099 ||
      normalizedMonth < 1 ||
      normalizedMonth > 12 ||
      normalizedDay < 1 ||
      normalizedDay > 31
    ) {
      return undefined;
    }

    return `${normalizedYear}-${String(normalizedMonth).padStart(2, '0')}-${String(
      normalizedDay
    ).padStart(2, '0')}`;
  }

  static isSupplierPrefixOnly(value: string): boolean {
    return /^(?:شركة|محلات|مؤسسة|وكالة|معرض|مكتب|Supplier|Company)$/i.test(value.trim());
  }

  static shouldMergeWithNextLine(value: string): boolean {
    return (
      /^(?:شركة|محلات|مؤسسة|وكالة|معرض|مكتب)(?:\s|$)/i.test(value) ||
      this.isSupplierPrefixOnly(value)
    );
  }

  static mergeSupplierLines(firstLine: string, secondLine?: string): string {
    if (!secondLine) {
      return firstLine;
    }

    const secondCandidate = this.cleanSupplierCandidate(secondLine);
    if (!secondCandidate || !this.isLikelySupplierFragment(secondCandidate)) {
      return firstLine;
    }

    return this.cleanSupplierCandidate(`${firstLine} ${secondCandidate}`);
  }

  static isLikelySupplierFragment(value: string): boolean {
    if (!value || value.length < 2) {
      return false;
    }

    const lowerValue = value.toLowerCase();
    const blockedFragments = ['لقطع غيار', 'قطع غيار', 'العنوان', 'هاتف', 'الهاتف', 'العنوان:'];
    if (blockedFragments.some((word) => lowerValue.includes(word))) {
      return false;
    }

    return /[A-Za-z\u0600-\u06FF]/.test(value) && !/\d{3,}/.test(value);
  }

  static scoreSupplierCandidate(value: string): number {
    let score = 0;

    if (/^(?:شركة|محلات|مؤسسة|وكالة|معرض|مكتب)(?:\s|$)/i.test(value)) {
      score += 40;
    }

    if (/[\u0600-\u06FF]/.test(value)) {
      score += 20;
    }

    if (/^[A-Z\s.&-]+$/.test(value)) {
      score += 10;
    }

    const wordsCount = value
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean).length;

    if (wordsCount >= 2 && wordsCount <= 5) {
      score += 12;
    }

    if (wordsCount > 6) {
      score -= 10;
    }

    if (/[0-9]/.test(value)) {
      score -= 12;
    }

    return score;
  }
}

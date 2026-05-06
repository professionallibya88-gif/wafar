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
import type { PartCreationAttributes } from '../repositories/PartRepository';

type ExtractedTable = {
  headers?: unknown[];
  rows?: unknown[][];
  page?: number;
  table_index?: number;
};

type TablesExtractionResult = {
  tables?: ExtractedTable[];
  count?: number;
  text?: string;
  rawText?: string;
};

type ProcessedPartRow = {
  part_code?: string | null;
  oem_number?: string | null;
  part_name?: string | null;
  brand?: string | null;
  origin_country?: string | null;
  quality_grade?: string | null;
  price_cash?: number | null;
  price_bank?: number | null;
  price_wholesale?: number | null;
  price_wholesale_small?: number | null;
  price_retail?: number | null;
  supplier_name?: string | null;
  quantity_available?: number | null;
  derived?: Record<string, unknown>;
  search_signature?: string;
  mapping_confidence: number;
  raw_headers: unknown[];
  raw_row: unknown[];
  page_number?: number;
  table_index?: number;
  row_index: number;
};

type ExtractedPart = Record<string, unknown> & {
  partCode?: string | null;
  code?: string | null;
  part_code?: string | null;
  item_number?: string | null;
  partName?: string | null;
  name?: string | null;
  part_name?: string | null;
  item_name?: string | null;
  partNameEn?: string | null;
  category?: string | null;
  brand?: string | null;
  originCountry?: string | null;
  origin_country?: string | null;
  qualityGrade?: string | null;
  quality_grade?: string | null;
  price?: number | null;
  price_cash?: number | null;
  price_bank?: number | null;
  price_wholesale?: number | null;
  price_wholesale_small?: number | null;
  currency?: string | null;
  unit?: string | null;
  inStock?: boolean;
  quantityAvailable?: number | null;
  quantity_available?: number | null;
  description?: string | null;
  specifications?: unknown;
  supplier_name?: string | null;
  rawRow?: unknown;
  raw_row?: unknown;
  derived?: Record<string, unknown>;
  search_signature?: string;
  mapping_confidence?: number;
  raw_headers?: unknown[];
  row_index?: number;
  page_number?: number;
  table_index?: number;
  oem_number?: string | null;
};

type ExtractionResult = {
  parts?: ExtractedPart[];
  pageCount?: number;
  rawData?: TablesExtractionResult | Record<string, unknown> | null;
  tablesCount?: number;
  rawText?: string;
  text?: string;
};

type ExtractionExecution = {
  result: ExtractionResult;
  actualMethod: string;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const toOptionalNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const toQualityGrade = (value: unknown): PartCreationAttributes['quality_grade'] => {
  const allowed = new Set(['original', 'high', 'medium', 'low', 'unspecified']);
  const grade = typeof value === 'string' ? value : '';
  return (allowed.has(grade) ? grade : 'unspecified') as PartCreationAttributes['quality_grade'];
};

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

  static processTablesWithNewPipeline(tablesResult: TablesExtractionResult): ProcessedPartRow[] {
    const finalParts: ProcessedPartRow[] = [];

    for (const table of tablesResult.tables || []) {
      const headers = table.headers || [];
      const rows = table.rows || [];

      const mapping = HeaderMapper.map(headers);

      rows.forEach((row, rowIndex: number) => {
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
              derived: normalized.derived,
              search_signature: normalized.search_signature,
              mapping_confidence:
                mapping.item_number?.confidence || mapping.oem_number?.confidence || 0,
              raw_headers: headers,
              raw_row: Array.isArray(row) ? row : [row],
              page_number: table.page,
              table_index: table.table_index,
              row_index: rowIndex,
            });
          }
        } catch (error) {
          logger.warn('خطأ في معالجة صف:', getErrorMessage(error));
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
        } catch (metadataError) {
          logger.warn(
            `تعذر استخراج البيانات الوصفية للملف ${pdfFileId}: ${getErrorMessage(metadataError)}`
          );
        }
      }

      let execution: ExtractionExecution;
      try {
        execution = await this.executeExtractionMethod(
          pdfFilePath,
          profile.requestedMethod,
          profile.tableEngine
        );
      } catch (primaryError) {
        logger.warn(
          `فشل المحرك الأساسي ${profile.requestedMethod} أثناء معالجة الملف ${pdfFileId}: ${getErrorMessage(primaryError)}`
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
          } catch (fallbackError) {
            logger.warn(
              `فشل المحرك البديل ${fallbackMethod} أثناء معالجة الملف ${pdfFileId}: ${getErrorMessage(fallbackError)}`
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
        } catch (ocrError) {
          logger.error(`فشل الاحتياط عبر OCR: ${getErrorMessage(ocrError)}`);
          await pdfFileRepository.updateById(pdfFileId, {
            status: 'failed',
            error_message:
              getErrorMessage(ocrError) ||
              'فشل استخراج البيانات من الملف. قد يكون الملف ممسوحاً ضوئياً وبدون نص قابل للاستخراج.',
          });
          throw this.toProcessingError(ocrError, 'فشل محرك OCR الاحتياطي');
        }
      }

      const finalParts = result.parts || [];
      const finalPageCount = result.pageCount || 0;
      const rawData = result.rawData as
        | TablesExtractionResult
        | Record<string, unknown>
        | null
        | undefined;
      const rawDataCount = typeof rawData?.count === 'number' ? rawData.count : 0;
      const rawDataTables = Array.isArray(rawData?.tables) ? rawData.tables : [];
      const tablesCount = result.tablesCount || rawDataCount || rawDataTables.length || 0;

      logger.info(`Extracted ${finalParts.length} parts from PDF ${pdfFileId}`);

      // استخراج تاريخ الملف تلقائياً من النص إن لم يُدخل يدوياً
      let detectedDocumentDate: string | undefined;
      if (!existingDocumentDate) {
        const textToScan =
          metadataText ||
          result.rawText ||
          result.text ||
          String(rawData?.text || rawData?.rawText || '') ||
          JSON.stringify(rawData || '');
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

      const rows = finalParts.map((partData) => {
        return {
          part_code:
            partData.partCode ||
            partData.code ||
            partData.part_code ||
            partData.item_number ||
            undefined,
          part_name:
            partData.partName ||
            partData.name ||
            partData.part_name ||
            partData.item_name ||
            'غير محدد',
          part_name_en: toOptionalString(partData.partNameEn),
          category: toOptionalString(partData.category),
          brand: toOptionalString(partData.brand),
          origin_country: toOptionalString(partData.originCountry || partData.origin_country),
          quality_grade: toQualityGrade(partData.qualityGrade || partData.quality_grade),
          price: toOptionalNumber(partData.price),
          price_cash: toOptionalNumber(partData.price_cash),
          price_bank: toOptionalNumber(partData.price_bank),
          price_wholesale: toOptionalNumber(partData.price_wholesale),
          price_wholesale_small: toOptionalNumber(partData.price_wholesale_small),
          currency: partData.currency || 'LYD',
          unit: toOptionalString(partData.unit),
          in_stock: partData.inStock !== undefined ? partData.inStock : true,
          quantity_available: toOptionalNumber(
            partData.quantityAvailable || partData.quantity_available
          ),
          description: partData.description || undefined,
          specifications: partData.specifications || undefined,
          supplier_name_text: partData.supplier_name || undefined,
          row_data: partData.rawRow || partData.raw_row || undefined,
          item_number: partData.item_number || undefined,
          oem_number: partData.oem_number || undefined,
          derived: partData.derived || undefined,
          search_signature: partData.search_signature || undefined,
          mapping_confidence: partData.mapping_confidence || 0,
          raw_headers: partData.raw_headers || undefined,
          raw_row: partData.raw_row || undefined,
          row_index: partData.row_index || 0,
          page_number: partData.page_number || undefined,
          table_index: partData.table_index || 0,
          pdf_file_id: pdfFileId,
          supplier_id: supplierId,
        } satisfies PartCreationAttributes;
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
    } catch (error) {
      await pdfFileRepository.updateById(pdfFileId, {
        status: 'failed',
        error_message: getErrorMessage(error),
        progress_percent: 100,
        progress_message: 'فشلت المعالجة',
      });

      logger.error(`فشل معالجة PDF ${pdfFileId}:`, getErrorMessage(error));
      throw this.toProcessingError(error, 'فشلت معالجة ملف PDF');
    }
  }

  private static async executeExtractionMethod(
    filePath: string,
    method: string,
    tableEngine: string
  ): Promise<ExtractionExecution> {
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
        } catch (tableError) {
          logger.warn(`فشل استخراج الجداول بمحرك ${tableEngine}: ${getErrorMessage(tableError)}`);
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

  private static needsFallback(result: ExtractionResult | null | undefined): boolean {
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

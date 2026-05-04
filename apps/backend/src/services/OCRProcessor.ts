import { promises as fs } from 'fs';
import Tesseract from 'tesseract.js';
import pdf from 'pdf-parse';
import logger from '../config/logger';
import { NodePDFProcessor } from './NodePDFProcessor';
import { AppError, BusinessError } from '../errors';

type OCRProcessingOptions = {
  language?: string;
};

type OCRProgressEvent = {
  status: string;
  progress: number;
};

type OCRProcessResult = {
  text: string;
  lines: string[];
  confidence: number;
  processingTime: number;
  metadata: {
    method: 'ocr';
    language: string;
    processingTime: number;
  };
};

type OCRParsedPart = {
  partCode?: string;
  partName?: string;
  confidence?: number;
  [key: string]: unknown;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const toOcrProcessingError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return new BusinessError(error.message, { reason: 'ocr_processing_failed' });
  }

  return new BusinessError('فشلت معالجة OCR');
};

/**
 * معالج OCR لاستخراج النص من ملفات PDF الممسوحة ضوئياً
 * يستخدم Tesseract.js للتعرف على النص في الصور
 */
class OCRProcessor {
  /**
   * معالجة ملف PDF باستخدام OCR
   */
  static async process(
    filePath: string,
    options: OCRProcessingOptions = {}
  ): Promise<OCRProcessResult> {
    const startTime = Date.now();
    const { language = 'ara+eng' } = options;

    try {
      logger.info(`OCRProcessor: بدء معالجة الملف ${filePath}`);

      // محاولة استخراج النص أولاً باستخدام pdf-parse
      let text = '';
      try {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        text = pdfData.text;
      } catch (pdfError) {
        logger.warn(`pdf-parse failed: ${getErrorMessage(pdfError)}`);
      }

      // إذا لم يتم استخراج نص، نستخدم OCR على الصفحات
      if (!text || text.trim().length < 10) {
        logger.info('No text extracted with pdf-parse, using OCR on pages');
        try {
          const result = await Tesseract.recognize(filePath, language, {
            logger: (progressEvent: OCRProgressEvent) => {
              if (progressEvent.status === 'recognizing text') {
                logger.info(`OCR Progress: ${Math.round(progressEvent.progress * 100)}%`);
              }
            },
          });
          text = result.data.text;
        } catch (ocrError) {
          logger.error(`OCR failed: ${getErrorMessage(ocrError)}`);
          throw new BusinessError(
            'الملف PDF ممسوح ضوئياً ولا يمكن استخراج النص منه. يرجى استخدام ملف PDF يحتوي على نص قابل للاستخراج.',
            { reason: 'ocr_failed' }
          );
        }
      }

      const lines = text.split('\n').filter((line) => line.trim().length > 0);

      logger.info(`OCRProcessor: استخرج ${lines.length} سطر من النص`);

      const processingTime = Date.now() - startTime;

      return {
        text,
        lines,
        confidence: 80, // قيمة افتراضية
        processingTime,
        metadata: {
          method: 'ocr',
          language,
          processingTime,
        },
      };
    } catch (error) {
      logger.error(`OCRProcessor error: ${getErrorMessage(error)}`);
      throw toOcrProcessingError(error);
    }
  }

  /**
   * معالجة PDF واستخراج القطع باستخدام OCR
   */
  static async processPDFWithParts(filePath: string, options: OCRProcessingOptions = {}) {
    const ocrResult = await this.process(filePath, options);

    // استخدام نفس منطق التحليل من NodePDFProcessor
    const parts = [];
    const rawRows = [];

    for (const line of ocrResult.lines) {
      const part = NodePDFProcessor.parseLine(line) as OCRParsedPart | null;
      if (part && part.partCode && part.partName) {
        part.confidence = Math.min((part.confidence || 50) + ocrResult.confidence / 10, 100);
        parts.push(part);
        rawRows.push({ line, parsed: part });
      }
    }

    logger.info(`OCRProcessor: استخرج ${parts.length} قطعة من ${ocrResult.lines.length} سطر`);

    return {
      parts,
      pageCount: 1, // OCR لا يحدد عدد الصفحات بدقة
      rawData: {
        fullText: ocrResult.text,
        totalLines: ocrResult.lines.length,
        rawRows: rawRows.slice(0, 1000),
        ocrConfidence: ocrResult.confidence,
      },
      supplierName: NodePDFProcessor.extractSupplierName(ocrResult.text),
      metadata: {
        method: 'ocr',
        processingTime: ocrResult.processingTime,
        confidence: ocrResult.confidence,
        language: options.language || 'ara+eng',
      },
    };
  }
}

export { OCRProcessor };

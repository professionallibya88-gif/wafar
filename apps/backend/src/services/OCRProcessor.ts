import { promises as fs } from 'fs';
import Tesseract from 'tesseract.js';
import pdf from 'pdf-parse';
import logger from '../config/logger';
import { NodePDFProcessor } from './NodePDFProcessor';
import { AppError, BusinessError } from '../errors';

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
  static async process(filePath: any, options = {}) {
    const startTime = Date.now();
    const { language = 'ara+eng' } = options as any;

    try {
      logger.info(`OCRProcessor: بدء معالجة الملف ${filePath}`);

      // محاولة استخراج النص أولاً باستخدام pdf-parse
      let text = '';
      try {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        text = pdfData.text;
      } catch (pdfError) {
        logger.warn(`pdf-parse failed: ${(pdfError as any).message}`);
      }

      // إذا لم يتم استخراج نص، نستخدم OCR على الصفحات
      if (!text || text.trim().length < 10) {
        logger.info('No text extracted with pdf-parse, using OCR on pages');
        try {
          const result = await Tesseract.recognize(filePath, language, {
            logger: (m: any) => {
              if (m.status === 'recognizing text') {
                logger.info(`OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            },
          });
          text = result.data.text;
        } catch (ocrError) {
          logger.error(`OCR failed: ${(ocrError as any).message}`);
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
    } catch (error: any) {
      logger.error(`OCRProcessor error: ${error.message}`);
      throw toOcrProcessingError(error);
    }
  }

  /**
   * معالجة PDF واستخراج القطع باستخدام OCR
   */
  static async processPDFWithParts(filePath: any, options = {}) {
    const ocrResult = await this.process(filePath, options);

    // استخدام نفس منطق التحليل من NodePDFProcessor
    const parts = [];
    const rawRows = [];

    for (const line of ocrResult.lines) {
      const part = NodePDFProcessor.parseLine(line);
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
        language: (options as any).language || 'ara+eng',
      },
    };
  }
}

export { OCRProcessor };

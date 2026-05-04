import { promises as fs } from 'fs';
import logger from '../config/logger';
import { pdfFileRepository, partRepository } from '../repositories';
import { AppError, ExternalServiceError, NotFoundError, ValidationError } from '../errors';
import { addPDFProcessingJob, getPDFQueue } from '../queues/pdfQueue';
import { NodePDFProcessor } from './NodePDFProcessor';
import { PythonPDFProcessor } from './PythonPDFProcessor';
import { AWSTextractProcessor } from './AWSTextractProcessor';
import { OCRProcessor } from './OCRProcessor';
import { PDFProcessor } from './pdfProcessor';
import { aiProviderService } from './AIProviderService';
import { pdfProcessingProfileService } from './PDFProcessingProfileService';
import { validatePDFMagicBytes } from '../middleware/upload';
import { UploadedFile } from '../types';
import { vercelBlobService } from './VercelBlobService';

interface UploadPDFInput {
  userId?: string;
  file: UploadedFile;
  supplier_id: string;
  method?: string;
  document_date: string;
}

interface UploadBatchItemInput {
  supplier_id: string;
  method?: string;
  document_date: string;
}

interface CreatedPDFFileRecord {
  id: string;
  file_path: string;
  original_name: string;
  file_size: number;
  status: string;
  processing_method: string;
  document_date: string;
}

export class PDFService {
  private async cleanupUploadedFile(filePath?: string): Promise<void> {
    if (!filePath) {
      return;
    }

    try {
      await fs.unlink(filePath);
    } catch {
      // تجاهل
    }
  }

  private normalizeUploadError(error: unknown): { code: string; message: string } {
    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: 'تعذر رفع الملف حالياً',
    };
  }

  private sanitizePDFFile(file: unknown): Record<string, unknown> {
    const plainFile =
      typeof (file as Record<string, unknown>)?.toJSON === 'function'
        ? (file as { toJSON: () => Record<string, unknown> }).toJSON()
        : { ...(file as Record<string, unknown>) };
    if (!plainFile || typeof plainFile !== 'object') {
      return plainFile as Record<string, unknown>;
    }

    delete plainFile.file_path;
    delete plainFile.file_relative_path;

    if (plainFile.user && typeof plainFile.user === 'object') {
      plainFile.user = {
        id: (plainFile.user as Record<string, unknown>).id,
        full_name: (plainFile.user as Record<string, unknown>).full_name,
      };
    }

    return plainFile;
  }

  private sanitizePDFFileCollection(rows: unknown[] = []): Record<string, unknown>[] {
    return rows.map((row) => this.sanitizePDFFile(row));
  }

  async uploadPDF(data: UploadPDFInput): Promise<Record<string, unknown>> {
    const { userId, file, supplier_id, method, document_date } = data;
    if (!file) throw new ValidationError('يرجى اختيار ملف PDF');
    let pdfFile: CreatedPDFFileRecord | null = null;

    try {
      if (!supplier_id) throw new ValidationError('يرجى تحديد المورد');
      if (!document_date) throw new ValidationError('يرجى تحديد تاريخ المستند');

      if (!(await validatePDFMagicBytes(file.path))) {
        throw new ValidationError('الملف ليس PDF صحيحاً');
      }

      const profile = await pdfProcessingProfileService.getProfile(method);
      const processingMethod = profile.requestedMethod;

      const createData: Record<string, unknown> = {
        original_name: file.originalname,
        file_path: file.path,
        file_size: file.size,
        user_id: userId,
        supplier_id: supplier_id,
        processing_method: processingMethod,
        status: 'pending',
        document_date: document_date,
      };

      pdfFile = (await pdfFileRepository.create(createData)) as unknown as CreatedPDFFileRecord;

      // تطبيق نظام الإصدارات
      const previousVersions = await pdfFileRepository.findVersionsBySupplier(supplier_id);
      const maxVersion =
        previousVersions.length > 0
          ? Math.max(
              ...previousVersions.map((v: { version_number?: number }) => v.version_number || 0)
            )
          : 0;
      const versionNumber = maxVersion + 1;

      await pdfFileRepository.updateById(pdfFile.id, { version_number: versionNumber });
      await pdfFileRepository.markPreviousVersionsAsOld(supplier_id, pdfFile.id);

      const job = await addPDFProcessingJob(pdfFile.id, pdfFile.file_path, processingMethod);

      return {
        id: pdfFile.id,
        original_name: pdfFile.original_name,
        file_size: pdfFile.file_size,
        status: pdfFile.status,
        processing_method: pdfFile.processing_method,
        document_date: pdfFile.document_date,
        version_number: versionNumber,
        job_id: job.id,
      };
    } catch (error) {
      if (pdfFile?.id) {
        try {
          await pdfFileRepository.deleteById(pdfFile.id);
        } catch (cleanupError) {
          logger.error('تعذر تنظيف سجل الملف بعد فشل الرفع', {
            message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
            fileId: pdfFile.id,
          });
        }
      }

      await this.cleanupUploadedFile(file.path);
      throw error;
    }
  }

  async uploadPDFBatch(data: {
    userId?: string;
    files: UploadedFile[];
    items: UploadBatchItemInput[];
  }): Promise<Record<string, unknown>> {
    const { userId, files, items } = data;

    if (!Array.isArray(files) || files.length === 0) {
      throw new ValidationError('يرجى رفع ملف PDF واحد على الأقل');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('يرجى إرسال بيانات الملفات');
    }

    if (items.length !== files.length) {
      throw new ValidationError('عدد العناصر لا يطابق عدد الملفات المرفوعة');
    }

    const results: Record<string, unknown>[] = [];

    // المعالجة المتسلسلة تمنع تعارض الإصدارات عند رفع عدة ملفات للمورد نفسه.
    for (const [index, file] of files.entries()) {
      const item = items[index];

      try {
        const uploadedFile = await this.uploadPDF({
          userId,
          file,
          supplier_id: item.supplier_id,
          method: item.method,
          document_date: item.document_date,
        });

        results.push({
          index,
          success: true,
          status: 'queued',
          original_name: file.originalname,
          item: {
            supplier_id: item.supplier_id,
            document_date: item.document_date,
            method: item.method || null,
          },
          data: uploadedFile,
        });
      } catch (error) {
        logger.warn('فشل رفع ملف ضمن الدفعة', {
          index,
          fileName: file.originalname,
          supplierId: item.supplier_id,
          message: error instanceof Error ? error.message : String(error),
        });

        results.push({
          index,
          success: false,
          status: 'failed',
          original_name: file.originalname,
          item: {
            supplier_id: item.supplier_id,
            document_date: item.document_date,
            method: item.method || null,
          },
          error: this.normalizeUploadError(error),
        });
      }
    }

    const succeeded = results.filter((result) => result.success === true).length;
    const failed = results.length - succeeded;

    return {
      summary: {
        total: results.length,
        succeeded,
        failed,
        partial_success: succeeded > 0 && failed > 0,
      },
      results,
    };
  }

  async listUserFiles(options: {
    userId?: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<unknown> {
    if (!options.userId) {
      // If no user ID is provided (e.g., admin), we might want to list all files
      // but typically we should fall back to listAllFiles for admins.
      // We will call findAllWithPagination to be safe.
      const result = await pdfFileRepository.findAllWithPagination(options);
      return {
        rows: this.sanitizePDFFileCollection(result.rows),
        count: result.count,
      };
    }
    const result = await pdfFileRepository.findByUserWithPagination(
      options as { userId: string; status?: string; limit: number; offset: number }
    );
    return {
      rows: this.sanitizePDFFileCollection(result.rows),
      count: result.count,
    };
  }

  async getUserFile(data: { userId?: string; fileId: string }): Promise<unknown> {
    const pdfFile = data.userId
      ? await pdfFileRepository.findByIdAndUser(data.fileId, data.userId)
      : await pdfFileRepository.findById(data.fileId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');
    return this.sanitizePDFFile(pdfFile);
  }

  async getUserFileParts(options: {
    userId?: string;
    fileId: string;
    limit: number;
    offset: number;
    filters?: any;
  }): Promise<{ rows: Record<string, unknown>[]; count: number }> {
    const pdfFile = options.userId
      ? await pdfFileRepository.findByIdAndUserSimple(options.fileId, options.userId)
      : await pdfFileRepository.findById(options.fileId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');

    const result = await partRepository.findByPDFFileIdWithPagination({
      pdfFileId: options.fileId,
      limit: options.limit,
      offset: options.offset,
      filters: options.filters,
    });

    return {
      rows: result.rows.map((row) => {
        const rawPart = (typeof row?.toJSON === 'function'
          ? row.toJSON()
          : { ...row }) as unknown as Record<string, unknown>;
        const derived =
          rawPart.derived && typeof rawPart.derived === 'object'
            ? (rawPart.derived as Record<string, unknown>)
            : null;

        return {
          ...rawPart,
          car_model:
            (typeof rawPart.car_model === 'string' && rawPart.car_model) ||
            (derived && typeof derived.car_model === 'string' ? derived.car_model : null),
        };
      }),
      count: result.count,
    };
  }

  async deleteUserFile(data: { userId: string; fileId: string }): Promise<void> {
    const pdfFile = await pdfFileRepository.findByIdAndUserSimple(data.fileId, data.userId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');

    if (pdfFile.file_path) {
      await vercelBlobService.deleteFile(pdfFile.file_path);
    }

    await partRepository.deleteByPDFFileId(pdfFile.id);
    await pdfFileRepository.deleteById(pdfFile.id);
  }

  async extractMetadata(file: UploadedFile): Promise<Record<string, unknown>> {
    if (!file) throw new ValidationError('يرجى اختيار ملف PDF');
    if (!(await validatePDFMagicBytes(file.path))) {
      try {
        await fs.unlink(file.path);
      } catch {
        // ignore
      }
      throw new ValidationError('الملف ليس PDF صحيحاً');
    }

    try {
      const profile = await pdfProcessingProfileService.getProfile();
      const pythonMetadata = await this.tryExtractMetadataWithPython(file.path);
      const fallbackMetadata =
        !pythonMetadata.supplierName || !pythonMetadata.documentDate
          ? await this.tryExtractMetadataWithNode(file.path)
          : null;
      const aiMetadata =
        profile.aiEnabled &&
        profile.enableAiMetadata &&
        (!pythonMetadata.supplierName || !pythonMetadata.documentDate)
          ? await this.tryExtractMetadataWithAI(
              pythonMetadata.rawText || fallbackMetadata?.rawText || '',
              profile.aiPreferredProvider,
              profile.aiFallbackEnabled
            )
          : null;

      return {
        supplierName:
          pythonMetadata.supplierName ||
          fallbackMetadata?.supplierName ||
          aiMetadata?.supplierName ||
          '',
        documentDate:
          pythonMetadata.documentDate ||
          fallbackMetadata?.documentDate ||
          aiMetadata?.documentDate ||
          '',
        metadataSource: aiMetadata
          ? `${pythonMetadata.source}${fallbackMetadata ? '+node' : ''}+ai`
          : fallbackMetadata
            ? pythonMetadata.source === 'python'
              ? 'python+node_fallback'
              : fallbackMetadata.source
            : pythonMetadata.source,
      };
    } catch (error) {
      logger.error('Metadata extraction failed completely:', {
        message: error instanceof Error ? error.message : String(error),
        fileName: file.originalname,
      });
      throw new ExternalServiceError('تعذر استخراج اسم الشركة وتاريخ الملف حالياً');
    } finally {
      try {
        await fs.access(file.path);
        await fs.unlink(file.path);
      } catch {
        // ignore
      }
    }
  }

  private async tryExtractMetadataWithPython(
    filePath: string
  ): Promise<{ supplierName: string; documentDate: string; source: string; rawText: string }> {
    try {
      const response = await PythonPDFProcessor.extractMetadata(filePath);
      const pythonSupplierName = String(response?.supplierName || '').trim();
      const pythonDocumentDate = String(response?.documentDate || '').trim();
      const rawText = String(response?.text || '');
      const parsedFromText = this.extractMetadataFromRawText(rawText);

      return {
        supplierName: pythonSupplierName || parsedFromText.supplierName,
        documentDate: pythonDocumentDate || parsedFromText.documentDate,
        source: 'python',
        rawText,
      };
    } catch (error) {
      logger.warn('تعذر استخراج البيانات الوصفية عبر خدمة Python، سيتم استخدام البديل المحلي', {
        message: error instanceof Error ? error.message : String(error),
      });

      return {
        supplierName: '',
        documentDate: '',
        source: 'python_unavailable',
        rawText: '',
      };
    }
  }

  private async tryExtractMetadataWithNode(
    filePath: string
  ): Promise<{ supplierName: string; documentDate: string; source: string; rawText: string }> {
    const result = await NodePDFProcessor.process(filePath, {
      batchSize: 25,
      enableTableDetection: false,
      enableOCR: false,
      maxTextLength: 12000,
    });

    const extracted = this.extractMetadataFromRawText(String(result?.rawData?.fullText || ''));

    return {
      supplierName: extracted.supplierName || String(result?.supplierName || ''),
      documentDate: extracted.documentDate,
      source: 'node_fallback',
      rawText: String(result?.rawData?.fullText || ''),
    };
  }

  private extractMetadataFromRawText(rawText: string): {
    supplierName: string;
    documentDate: string;
  } {
    const text = PDFProcessor.normalizeExtractedText(rawText);

    return {
      supplierName: PDFProcessor.extractSupplierName(text) || '',
      documentDate: PDFProcessor.extractDocumentDate(text) || '',
    };
  }

  async reprocessFile(data: {
    userId: string;
    fileId: string;
    method?: string;
  }): Promise<Record<string, unknown>> {
    const { userId, fileId, method } = data;
    const pdfFile = await pdfFileRepository.findByIdAndUserSimple(fileId, userId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');

    return this.restartProcessing(pdfFile, method);
  }

  async deleteAnyFile(fileId: string): Promise<void> {
    const pdfFile = await pdfFileRepository.findById(fileId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');

    if (pdfFile.file_path) {
      await vercelBlobService.deleteFile(pdfFile.file_path);
    }

    await partRepository.deleteByPDFFileId(pdfFile.id);
    await pdfFileRepository.deleteById(pdfFile.id);
  }

  async reprocessAnyFile(data: {
    fileId: string;
    method?: string;
  }): Promise<Record<string, unknown>> {
    const { fileId, method } = data;
    const pdfFile = await pdfFileRepository.findById(fileId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');
    return this.restartProcessing(pdfFile, method);
  }

  async getUserFileJobStatus(data: {
    userId?: string;
    fileId: string;
  }): Promise<Record<string, unknown>> {
    const pdfFile = data.userId
      ? await pdfFileRepository.findByIdAndUserSimple(data.fileId, data.userId)
      : await pdfFileRepository.findById(data.fileId);
    if (!pdfFile) throw new NotFoundError('الملف غير موجود');

    return {
      id: pdfFile.id,
      status: pdfFile.status,
      progress_percent: pdfFile.progress_percent,
      progress_message: pdfFile.progress_message,
      parts_count: pdfFile.parts_count,
      page_count: pdfFile.page_count,
      tables_count: pdfFile.tables_count,
      error_message: pdfFile.error_message,
      processing_method: pdfFile.processing_method,
    };
  }

  private async restartProcessing(
    pdfFile: unknown,
    method?: string
  ): Promise<Record<string, unknown>> {
    const file = pdfFile as Record<string, unknown>;
    const processingMethod = method || (file.processing_method as string);

    await partRepository.deleteByPDFFileId(file.id as string);
    await pdfFileRepository.updateById(file.id as string, {
      status: 'pending',
      processing_method: processingMethod,
      error_message: null,
      progress_percent: 0,
      progress_message: null,
      tables_count: 0,
      page_count: null,
      parts_count: 0,
    });

    const job = await addPDFProcessingJob(
      file.id as string,
      file.file_path as string,
      processingMethod
    );

    return {
      id: file.id,
      processing_method: processingMethod,
      status: 'pending',
      job_id: job.id,
    };
  }

  async getJobStatus(jobId: string): Promise<unknown> {
    if (!jobId) throw new ValidationError('يرجى تحديد معرف المهمة');
    const queue = getPDFQueue();
    return queue.getJob(jobId);
  }

  async testMethod(data: {
    file: UploadedFile;
    method?: string;
  }): Promise<Record<string, unknown>> {
    const { file, method = 'node_pdf' } = data;
    if (!file) throw new ValidationError('يرجى اختيار ملف PDF للاختبار');

    try {
      const profile = await pdfProcessingProfileService.getProfile(method);
      interface ProcessorResult {
        parts?: unknown[];
        pageCount?: number;
        _method?: string;
        metadata?: {
          processingTime?: number;
          confidence?: number;
        };
      }

      let result: ProcessorResult;
      switch (method) {
        case 'python_ai':
          result = (await PythonPDFProcessor.process(file.path, {
            mode: 'python_ai',
            engine: profile.tableEngine,
          })) as ProcessorResult;
          break;
        case 'python_pypdf':
          result = (await PythonPDFProcessor.process(file.path, {
            mode: 'python_pypdf',
            engine: profile.tableEngine,
          })) as ProcessorResult;
          break;
        case 'aws_textract':
          result = (await AWSTextractProcessor.process(file.path)) as ProcessorResult;
          break;
        case 'ocr':
          result = (await OCRProcessor.processPDFWithParts(file.path)) as ProcessorResult;
          break;
        default:
          result = (await NodePDFProcessor.process(file.path)) as ProcessorResult;
      }

      return {
        method,
        parts_extracted: result.parts?.length || 0,
        page_count: result.pageCount || 0,
        processing_time: result.metadata?.processingTime || 0,
        confidence: result.metadata?.confidence || 0,
        extraction_method: result._method || method,
        sample_parts: result.parts?.slice(0, 5) || [],
      };
    } finally {
      try {
        if (file.path) {
          await fs.unlink(file.path);
        }
      } catch {
        // تجاهل
      }
    }
  }

  async healthCheck(): Promise<Record<string, unknown>> {
    const profile = await pdfProcessingProfileService.getProfile();
    const status = {
      node_pdf: true,
      python_pypdf: false,
      python_ai: false,
      aws_textract: false,
      ocr: true,
    };
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5051';
    status.python_pypdf = await PythonPDFProcessor.checkHealth(pythonServiceUrl);
    status.python_ai = status.python_pypdf;

    const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    status.aws_textract = !!(awsAccessKey && awsSecretKey);

    return {
      ...status,
      default_method: profile.defaultMethod,
      table_engine: profile.tableEngine,
      fallback_chain: profile.fallbackChain,
    };
  }

  async methodStats(): Promise<unknown> {
    return pdfFileRepository.getMethodStats();
  }

  async getUserStats(userId: string): Promise<unknown> {
    return pdfFileRepository.getUserStats(userId);
  }

  async listAllFiles(options: {
    limit: number;
    offset: number;
    status?: string;
    search?: string;
  }): Promise<unknown> {
    return pdfFileRepository.findAllWithPagination(options);
  }

  async listCatalogs(options: {
    limit: number;
    offset: number;
    latestOnly?: boolean;
  }): Promise<unknown> {
    const result = await pdfFileRepository.findCatalogsWithPagination({
      ...options,
      status: 'completed',
    });
    return {
      rows: this.sanitizePDFFileCollection(result.rows),
      count: result.count,
    };
  }

  async getVersionsBySupplier(supplierId: string): Promise<unknown> {
    const versions = await pdfFileRepository.findVersionsBySupplier(supplierId);
    return this.sanitizePDFFileCollection(versions);
  }

  private async tryExtractMetadataWithAI(
    rawText: string,
    preferredProvider: string,
    fallbackEnabled: boolean
  ): Promise<{ supplierName: string; documentDate: string; source: string } | null> {
    const normalizedText = PDFProcessor.normalizeExtractedText(rawText).slice(0, 8000);
    if (!normalizedText) {
      return null;
    }

    try {
      const result = await aiProviderService.process(
        {
          prompt: [
            'استخرج من النص التالي اسم الشركة الموردة وتاريخ المستند فقط.',
            'أعد النتيجة بصيغة JSON فقط بهذا الشكل:',
            '{"supplierName":"", "documentDate":""}',
            'إذا لم تتمكن من اكتشاف قيمة فاتركها فارغة.',
            '',
            normalizedText,
          ].join('\n'),
          jsonMode: true,
        },
        {
          preferredProvider,
          fallbackEnabled,
          operation: 'pdf_metadata_extraction',
        }
      );

      const parsed = this.safeParseAiJson(result.text);
      return {
        supplierName: String(parsed?.supplierName || '').trim(),
        documentDate: String(parsed?.documentDate || '').trim(),
        source: `ai_${result.provider}`,
      };
    } catch (error) {
      logger.warn('فشل تحسين البيانات الوصفية عبر الذكاء الاصطناعي', {
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private safeParseAiJson(text: string): Record<string, unknown> | null {
    if (!text) {
      return null;
    }

    const cleanedText = text
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleanedText);
    } catch {
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (!match) {
        return null;
      }

      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }
}

export const pdfService = new PDFService();

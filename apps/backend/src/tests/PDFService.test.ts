import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PDFService } from '../services/PDFService';
import { validatePDFMagicBytes } from '../middleware/upload';
import { PythonPDFProcessor } from '../services/PythonPDFProcessor';
import { NodePDFProcessor } from '../services/NodePDFProcessor';

jest.mock('../repositories', () => ({
  pdfFileRepository: {},
  partRepository: {},
  systemSettingRepository: {
    getValueByKey: jest.fn().mockImplementation(() => Promise.resolve('value')),
  },
}));

jest.mock('../queues/pdfQueue', () => ({
  addPDFProcessingJob: jest.fn(),
  getPDFQueue: jest.fn(),
}));

jest.mock('../middleware/upload', () => ({
  validatePDFMagicBytes: jest.fn(),
}));

jest.mock('../services/PythonPDFProcessor', () => ({
  PythonPDFProcessor: {
    extractMetadata: jest.fn(),
  },
}));

jest.mock('../services/NodePDFProcessor', () => ({
  NodePDFProcessor: {
    process: jest.fn(),
  },
}));

describe('PDFService.extractMetadata', () => {
  const service = new PDFService();
  const file = {
    path: 'C:/temp/test.pdf',
    originalname: 'test.pdf',
    size: 1024,
    mimetype: 'application/pdf',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (validatePDFMagicBytes as any).mockResolvedValue(true);
  });

  it('يستخدم البديل المحلي عند تعذر خدمة Python ويعيد اسم المورد والتاريخ', async () => {
    (PythonPDFProcessor.extractMetadata as any).mockRejectedValue(new Error('python unavailable'));
    (NodePDFProcessor.process as any).mockResolvedValue({
      rawData: {
        fullText: 'Company: BOURG ALKHAIR\nDate: 2026/02/04',
      },
      supplierName: 'BOURG ALKHAIR',
    });

    const result = await service.extractMetadata(file);

    expect(result).toEqual(
      expect.objectContaining({
        supplierName: 'BOURG ALKHAIR',
        documentDate: '2026-02-04',
        metadataSource: 'node_fallback',
      })
    );
  });

  it('يكمل الحقول الناقصة من البديل المحلي حتى عند نجاح Python جزئيا', async () => {
    (PythonPDFProcessor.extractMetadata as any).mockResolvedValue({
      text: 'التاريخ 04/02/2026',
    });
    (NodePDFProcessor.process as any).mockResolvedValue({
      rawData: {
        fullText: 'Company: BOURG ALKHAIR\nDate: 2026/02/04',
      },
      supplierName: 'BOURG ALKHAIR',
    });

    const result = await service.extractMetadata(file);

    expect(result).toEqual(
      expect.objectContaining({
        supplierName: 'BOURG ALKHAIR',
        documentDate: '2026-02-04',
        metadataSource: 'python+node_fallback',
      })
    );
  });

  it('يعتمد اسم الشركة القادم مباشرة من خدمة Python حتى لو كان النص يحتوي قائمة الأسعار', async () => {
    (PythonPDFProcessor.extractMetadata as any).mockResolvedValue({
      supplierName: 'شركة القمة الدولية',
      documentDate: '2026-04-16',
      text: 'قائمة الأسعار\nتاريخ الطباعة: 16/04/2026',
    });

    const result = await service.extractMetadata(file);

    expect(result).toEqual(
      expect.objectContaining({
        supplierName: 'شركة القمة الدولية',
        documentDate: '2026-04-16',
        metadataSource: 'python',
      })
    );
    expect(NodePDFProcessor.process).not.toHaveBeenCalled();
  });

  it('يرفض رفع الملف إذا كان اسم المورد غير محدد', async () => {
    await expect(
      service.uploadPDF({
        userId: 'user-1',
        file,
        supplier_id: '',
        document_date: '2026-04-16',
      } as any)
    ).rejects.toThrow('يرجى تحديد المورد');
  });

  it('يرفض رفع الملف إذا كان تاريخ المستند غير محدد', async () => {
    await expect(
      service.uploadPDF({
        userId: 'user-1',
        file,
        supplier_id: '11111111-1111-1111-1111-111111111111',
        document_date: '',
      } as any)
    ).rejects.toThrow('يرجى تحديد تاريخ المستند');
  });
});

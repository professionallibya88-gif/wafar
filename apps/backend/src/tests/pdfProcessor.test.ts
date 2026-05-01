import { describe, expect, it } from '@jest/globals';
import { PDFProcessor } from '../services/pdfProcessor';

describe('PDFProcessor metadata extraction', () => {
  const extractedHeaderText = `
ﺘﺎﺭﻴﺦ ﺍﻝﻔﺎﺘﻭﺭﺓ
ﻋﺭﻭﺽ
☺♠♣♦♥د−♠♠
:ﺍﻝﺘﺎﺭﻴﺦ04/02/2026
ﻝﺒﻴﻊ ﻗﻁﻊ ﻏﻴﺎﺭ ﺍﻝﺴﻴﺎﺭﺍﺕ ﺍﻝﺤﺩﻴﺜﺔ
BOURG ALKHAIR
☺ﻣﺤﻼﺕ   ـﺮﺝ ﺍﻟﺨ
ﻡ
`;

  const normalizedMetadataText = `
:التاريخ04/02/2026
لبيع قطع غيار السيارات الحديثة
BOURG ALKHAIR
محلات برج الخير
`;

  it('يستخرج التاريخ الصحيح من الترويسة ولا يلتقط سنوات الموديلات داخل الجدول', () => {
    const text = `
${normalizedMetadataText}
7230
استرتيشة برونطي امامي سفلية هونداي توسان2017
06
126.000
`;

    expect(PDFProcessor.extractDocumentDate(text)).toBe('2026-02-04');
  });

  it('يستخرج التاريخ من صيغة تاريخ الطباعة', () => {
    const text = `
تاريخ الطباعة: 15-08-2025
`;
    expect(PDFProcessor.extractDocumentDate(text)).toBe('2025-08-15');
  });

  it('يستخرج اسم المورد من النص العربي بعد التطبيع', () => {
    expect(PDFProcessor.extractSupplierName(normalizedMetadataText)).toBe('محلات برج الخير');
  });

  it('يستخرج اسم المورد لشركة القمة الدولية', () => {
    expect(PDFProcessor.extractSupplierName('شركة القمة الدولية')).toBe('شركة القمة الدولية');
  });

  it('يدمج اسم الشركة عندما يأتي على سطرين متتاليين', () => {
    const text = `
شركة
القمة الدولية
لقطع غيار السيارات
تاريخ الطباعة : 16/04/2026
`;

    expect(PDFProcessor.extractSupplierName(text)).toBe('شركة القمة الدولية');
    expect(PDFProcessor.extractDocumentDate(text)).toBe('2026-04-16');
  });

  it('يرفض استخدام وصف النشاط كاسم مورد', () => {
    expect(PDFProcessor.extractSupplierName('لبيع قطع غيار السيارات الحديثة')).toBeNull();
  });

  it('يرفض التقاط ترويسة الجدول كاسم شركة', () => {
    expect(PDFProcessor.extractSupplierName('نقدي مصرف الشركة الصنف')).toBeNull();
  });

  it('يرفض التقاط عبارة قائمة الأسعار حتى مع لاحقة إضافية', () => {
    expect(PDFProcessor.extractSupplierName('قائمة الأسعارX')).toBeNull();
  });

  it('يفضل اسم الشركة الصحيح عند وجود قائمة الأسعار في نفس النص', () => {
    const text = `
شركة
القمة الدولية
قائمة الأسعار
تاريخ الطباعة: 16/04/2026
`;
    expect(PDFProcessor.extractSupplierName(text)).toBe('شركة القمة الدولية');
  });

  it('يتعامل مع النص الخام المستخرج من الملف الحقيقي دون كسر', () => {
    expect(PDFProcessor.extractDocumentDate(extractedHeaderText)).toBe('2026-02-04');
  });
});

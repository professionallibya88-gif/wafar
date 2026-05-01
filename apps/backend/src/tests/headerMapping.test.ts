import { describe, it, expect } from '@jest/globals';
import { HeaderMapper } from '../services/HeaderMapper';
import { RowNormalizer } from '../services/RowNormalizer';

describe('HeaderMapper - أعمدة PDF المستخرجة من الصور', () => {
  it('يجب أن يتعرف على أعمدة الجدول 1 (م, الصنف, كود الصنف, الجهاز, المصنع, قطع غيار, الوكيل, كود الوكيل, جملة 16, جملة 3)', () => {
    const headers = [
      'م',
      'الصنف',
      'كود الصنف',
      'الجهاز',
      'المصنع',
      'قطع غيار',
      'الوكيل',
      'كود الوكيل',
      'جملة 16',
      'جملة 3',
    ];
    const mapping = HeaderMapper.map(headers) as any;

    expect(mapping.item_number).toBeDefined(); // م
    expect(mapping.item_name).toBeDefined(); // الصنف
    expect(mapping.oem_number).toBeDefined(); // كود الوكيل
    expect(mapping.car_model).toBeDefined(); // الجهاز
    expect(mapping.brand).toBeDefined(); // المصنع
    expect(mapping.supplier_name).toBeDefined(); // الوكيل
    expect(mapping.price_wholesale).toBeDefined(); // جملة 16 أو جملة 3
    expect(HeaderMapper.validateMapping(mapping).score).toBeGreaterThan(50);
  });

  it('يجب أن يتعرف على أعمدة الجدول 2 (م, الكود, الصنف, الوكيل, كود الوكيل, جملة 16, جملة 3)', () => {
    const headers = ['م', 'الكود', 'الصنف', 'الوكيل', 'كود الوكيل', 'جملة 16', 'جملة 3'];
    const mapping = HeaderMapper.map(headers) as any;

    expect(mapping.item_number).toBeDefined();
    expect(mapping.item_name).toBeDefined();
    expect(mapping.oem_number).toBeDefined();
    expect(mapping.supplier_name).toBeDefined();
    expect(mapping.price_wholesale).toBeDefined();
    expect(HeaderMapper.validateMapping(mapping).isValid).toBe(true);
  });

  it('يجب أن يتعرف على أعمدة الجدول 3 (م, الصنف, جهاز, كود الجهاز, قطع الغيار, الوكيل, كود الوكيل, جملة 16, جملة 3)', () => {
    const headers = [
      'م',
      'الصنف',
      'جهاز',
      'كود الجهاز',
      'قطع الغيار',
      'الوكيل',
      'كود الوكيل',
      'جملة 16',
      'جملة 3',
    ];
    const mapping = HeaderMapper.map(headers) as any;

    expect(mapping.item_number).toBeDefined();
    expect(mapping.item_name).toBeDefined();
    expect(mapping.car_model).toBeDefined();
    expect(mapping.oem_number).toBeDefined();
    expect(mapping.supplier_name).toBeDefined();
    expect(mapping.price_wholesale).toBeDefined();
  });

  it('يجب أن يتعرف على "كود الوكيل" كـ oem_number بدقة 100%', () => {
    const result = HeaderMapper.matchHeader('كود الوكيل');
    expect(result).not.toBeNull();
    expect(result!.field).toBe('oem_number');
    expect(result!.confidence).toBe(100);
  });

  it('يجب أن يتعرف على "الرقم األصلي" كـ oem_number حتى مع اختلافات التطبيع', () => {
    const result = HeaderMapper.matchHeader('الرقم األصلي');
    expect(result).not.toBeNull();
    expect(result!.field).toBe('oem_number');
    expect(result!.confidence).toBeGreaterThanOrEqual(98);
  });

  it('يجب أن يتعرف على "No" كرقم تسلسلي', () => {
    const result = HeaderMapper.matchHeader('No');
    expect(result).not.toBeNull();
    expect(result!.field).toBe('serial');
  });

  it('يجب أن يتعرف على "الوكيل" كـ supplier_name بدقة 100%', () => {
    const result = HeaderMapper.matchHeader('الوكيل');
    expect(result).not.toBeNull();
    expect(result!.field).toBe('supplier_name');
    expect(result!.confidence).toBe(100);
  });

  it('يجب أن يتعرف على "جملة 16" كـ price_wholesale', () => {
    const result = HeaderMapper.matchHeader('جملة 16');
    expect(result).not.toBeNull();
    expect(result!.field).toBe('price_wholesale');
  });

  it('يجب أن يحول الأرقام الهندية إلى عربية في normalize', () => {
    const normalized = HeaderMapper.normalize('١٢٣');
    expect(normalized).toBe('123');
  });
});

describe('RowNormalizer - تنظيف صفوف PDF', () => {
  it('يجب أن يُنتج part_name و part_code بدلاً من item_name و item_number', () => {
    const mapping = {
      item_number: { column: 0 },
      item_name: { column: 1 },
      oem_number: { column: 2 },
      price_wholesale: { column: 3 },
      supplier_name: { column: 4 },
    };
    const row = ['123', 'فلتر زيت', 'OEM-456', '150', 'شركة الاحساء'];
    const normalized = RowNormalizer.normalize(row, mapping);

    expect(normalized.part_code).toBe('123');
    expect(normalized.part_name).toBe('فلتر زيت');
    expect(normalized.oem_number).toBe('OEM-456');
    expect(normalized.price_wholesale).toBe(150);
    expect(normalized.supplier_name).toBe('شركة الاحساء');
    expect(normalized).not.toHaveProperty('item_number');
    expect(normalized).not.toHaveProperty('item_name');
  });

  it('يجب أن ينظف الكود من المسافات والنقاط الزائدة', () => {
    const code = RowNormalizer.cleanCode(' . ABC-123 . ');
    expect(code).toBe('ABC-123');
  });

  it('يجب أن يصلح الصف المنزاح بحيث يعيد OEM واسم الصنف ورقم الصنف إلى حقولها الصحيحة', () => {
    const mapping = {
      price_cash: { column: 0 },
      oem_number: { column: 1 },
      brand: { column: 2 },
      item_name: { column: 3 },
      item_number: { column: 4 },
    };
    const row = [
      '1350.000',
      '',
      '',
      'C1000.56500',
      '',
      '',
      'MOBIS',
      'اسكاتال C3000 هونداي سوناتة 2016',
      '',
      '9672',
      '27',
      '',
    ];
    const normalized = RowNormalizer.normalize(row, mapping);

    expect(normalized.price_cash).toBe(1350);
    expect(normalized.oem_number).toBe('C1000.56500');
    expect(normalized.part_code).toBe('9672');
    expect(normalized.part_name).toBe('اسكاتال C3000 هونداي سوناتة 2016');
    expect(normalized.brand).toBe('MOBIS');
    expect(RowNormalizer.validateRow(normalized).isValid).toBe(true);
  });

  it('يجب أن يستخرج car_model من العمود المنفصل إن وُجد', () => {
    const mapping = {
      item_name: { column: 0 },
      car_model: { column: 1 },
    };
    const row = ['فلتر زيت', 'تويوتا كورولا'];
    const normalized = RowNormalizer.normalize(row, mapping);

    expect((normalized as any).derived.car_model).toBe('تويوتا كورولا');
  });

  it('يجب أن يكون التحقق من الصف صحيحاً مع الحقول الجديدة', () => {
    const valid = {
      part_code: '123',
      part_name: 'فلتر زيت',
      price_cash: 150,
    };
    const result = RowNormalizer.validateRow(valid);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);

    const invalid = {
      part_code: null,
      oem_number: null,
      part_name: 'ab',
      price_cash: null,
    };
    const result2 = RowNormalizer.validateRow(invalid);
    expect(result2.isValid).toBe(false);
    expect(result2.issues).toContain('missing_identifier');
    expect(result2.issues).toContain('invalid_name');
    expect(result2.issues).toContain('missing_price');
  });
});

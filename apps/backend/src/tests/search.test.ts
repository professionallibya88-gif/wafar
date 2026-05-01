import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SmartSearch } from '../services/SmartSearch';
import { searchService } from '../services/SearchService';
import { partRepository } from '../repositories';

// Mock repositories
jest.mock('../repositories', () => ({
  partRepository: {
    smartSearchExactMatch: jest.fn(),
    smartSearchByName: jest.fn(),
    smartSearchByDerived: jest.fn(),
    buildWhereFromFilters: jest.fn(),
    searchWithPagination: jest.fn(),
    findForExport: jest.fn(),
    findDistinctCategories: jest.fn(),
    findDistinctBrands: jest.fn(),
  },
  searchHistoryRepository: {
    create: jest.fn(),
    findByUserWithPagination: jest.fn(),
  },
}));

describe('SmartSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectType', () => {
    it('يجب أن يتعرف على OEM numbers', () => {
      expect(SmartSearch.detectType('ABC-1234')).toBe('oem');
      expect(SmartSearch.detectType('MDL-5678.9')).toBe('oem');
    });

    it('يجب أن يتعرف على item numbers', () => {
      expect(SmartSearch.detectType('123')).toBe('item_number');
      expect(SmartSearch.detectType('42')).toBe('item_number');
    });

    it('يجب أن يصنف النصوص كأسماء', () => {
      expect(SmartSearch.detectType('فلتر زيت')).toBe('name');
      expect(SmartSearch.detectType('brake pad toyota')).toBe('name');
    });
  });

  describe('searchByOEM', () => {
    it('يجب أن يعيد نتائج مصنفة بشكل صحيح مع الحقول الجديدة', async () => {
      const mockResults = [
        {
          id: '1',
          part_name: 'فلتر زيت',
          part_code: 'FIL-001',
          oem_number: 'ABC-1234',
          price_cash: 150,
          price_bank: 155,
          brand: 'تويوتا',
          origin_country: 'اليابان',
          quantity_available: 25,
          in_stock: true,
          quality_grade: 'original',
          supplier: { name: 'شركة الاحساء' },
          supplier_id: 's1',
          pdf_file_id: 'f1',
        },
      ];

      (partRepository.smartSearchExactMatch as any).mockResolvedValue(mockResults);

      const result = await SmartSearch.searchByOEM('ABC-1234', {});

      expect(result.type).toBe('oem');
      expect(result.groups[0].part_code).toBe('FIL-001');
      expect(result.groups[0].suppliers[0].origin_country).toBe('اليابان');
      expect(result.groups[0].suppliers[0].quantity_available).toBe(25);
      expect(result.groups[0].suppliers[0].in_stock).toBe(true);
    });
  });

  describe('groupByName', () => {
    it('يجب أن يجمع القطع حسب الاسم مع الحقول الجديدة', () => {
      const results = [
        {
          part_name: 'فلتر زيت',
          part_code: 'FIL-001',
          oem_number: 'ABC-1234',
          item_number: '1001',
          price_cash: 150,
          brand: 'تويوتا',
          origin_country: 'اليابان',
          quantity_available: 25,
          in_stock: true,
          quality_grade: 'original',
          supplier: { name: 'شركة الاحساء' },
          supplier_id: 's1',
          id: 'p1',
          pdf_file_id: 'f1',
        },
        {
          part_name: 'فلتر زيت',
          part_code: 'FIL-002',
          oem_number: 'ABC-1234',
          item_number: '1002',
          price_cash: 130,
          brand: 'هيونداي',
          origin_country: 'كوريا',
          quantity_available: 10,
          in_stock: true,
          quality_grade: 'high',
          supplier: { name: 'شركة طرابلس' },
          supplier_id: 's2',
          id: 'p2',
          pdf_file_id: 'f2',
        },
      ];

      const groups = SmartSearch.groupByName(results);

      expect(groups).toHaveLength(1);
      expect(groups[0].part_name).toBe('فلتر زيت');
      expect(groups[0].part_code).toBe('FIL-001');
      expect(groups[0].suppliers).toHaveLength(2);
      expect(groups[0].suppliers[0].origin_country).toBe('اليابان');
      expect(groups[0].suppliers[1].quantity_available).toBe(10);
      expect(groups[0].cheapest).toBe(130);
    });
  });
});

describe('SearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('legacySearch', () => {
    it('يجب أن يبني where clause ويُرجع نتائج مع الترقيم', async () => {
      const mockWhere = { part_name: { ilike: '%فلتر%' } };
      const mockRows = [{ id: '1', part_name: 'فلتر زيت', price_cash: 150 }];

      (partRepository.buildWhereFromFilters as any).mockReturnValue(mockWhere);
      (partRepository.searchWithPagination as any).mockResolvedValue({ rows: mockRows, count: 1 });

      const result = await searchService.legacySearch({
        userId: 'u1',
        query: 'فلتر',
        filters: { type: 'name' },
        pagination: { limit: 20, offset: 0 },
        sort: { field: 'part_name', order: 'ASC' },
      });

      expect(partRepository.buildWhereFromFilters).toHaveBeenCalledWith({
        q: 'فلتر',
        type: 'name',
      });
      expect(result.rows).toEqual(mockRows);
      expect(result.count).toBe(1);
    });
  });
});

// اختبار التكامل: التأكد من عدم وجود item_name المهجّر
describe('تكامل PartRepository + SmartSearch', () => {
  it('يجب أن تستخدم part_name في جميع استعلامات البحث', () => {
    const searchCode = SmartSearch.toString();
    const partRepoCode = partRepository.toString();

    // نتحقق من أنه لا يوجد item_name كحقل مباشر في الاستعلامات
    // (قد يُستخدم item_name في التعليقات أو المتغيرات، لكن ليس في الاستعلامات)
    const forbiddenPatterns = ['item_name: {', "'item_name'", '`item_name`'];

    for (const pattern of forbiddenPatterns) {
      expect(searchCode).not.toContain(pattern);
      expect(partRepoCode).not.toContain(pattern);
    }
  });
});

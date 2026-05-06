import ExcelJS from 'exceljs';
import { partRepository, searchHistoryRepository } from '../repositories';
import { SmartSearch } from './SmartSearch';

export interface SearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  quality_grade?: string;
  supplier_id?: string | number;
  pdf_file_id?: string | number;
  min_price?: string | number;
  max_price?: string | number;
  in_stock?: string | boolean;
  [key: string]: unknown;
}

export interface LegacySearchParams {
  userId?: string | number;
  query?: string;
  filters?: SearchFilters;
  pagination: {
    limit: number;
    offset: number;
  };
  sort?: {
    field?: string;
    order?: string;
  };
}

export interface HistorySearchParams {
  userId: string;
  limit: number;
  offset: number;
}

interface SearchPartRecord {
  part_code?: string | null;
  part_name?: string | null;
  part_name_en?: string | null;
  category?: string | null;
  brand?: string | null;
  origin_country?: string | null;
  quality_grade?: string | null;
  price?: number | string | null;
  currency?: string | null;
  in_stock?: boolean | null;
}

interface DistinctCategoryRecord {
  category?: string | null;
}

interface DistinctBrandRecord {
  brand?: string | null;
}

export interface ExportPart extends SearchPartRecord {
  supplier?: {
    name: string;
  };
}

const ALLOWED_SORT_FIELDS = ['part_name', 'part_code', 'price', 'quality_grade', 'created_at'];

/**
 * خدمة البحث الرئيسية (ذكي، تقليدي، تصدير، مقارنة)
 */
class SearchService {
  /**
   * البحث الذكي
   */
  async smartSearch(q: string, filters: SearchFilters = {}) {
    return SmartSearch.search(q, filters);
  }

  /**
   * البحث المشتق
   */
  async derivedSearch(criteria: Record<string, unknown>, filters: SearchFilters = {}) {
    const results = await SmartSearch.searchByDerived(criteria, filters);
    return { results, total: results.length };
  }

  /**
   * البحث القديم مع ترقيم وتسجيل في السجل
   */
  async legacySearch({ userId, query, filters, pagination, sort }: LegacySearchParams) {
    const where = partRepository.buildWhereFromFilters({ q: query, ...filters });

    const sortField =
      sort?.field && ALLOWED_SORT_FIELDS.includes(sort.field) ? sort.field : 'part_name';
    const sortDir =
      sort?.order && ['ASC', 'DESC'].includes(sort.order.toUpperCase())
        ? sort.order.toUpperCase()
        : 'ASC';

    const { rows, count } = await partRepository.searchWithPagination({
      where,
      sortField,
      sortDir,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    if (query && userId) {
      await searchHistoryRepository.create({
        user_id: userId,
        query,
        search_type: 'name',
        filters,
        results_count: count,
      });
    }

    return { rows, count };
  }

  /**
   * مقارنة قطع
   */
  async compare(partIds: string[]) {
    return partRepository.findManyByIds(partIds);
  }

  /**
   * سجل البحث
   */
  async getHistory({ userId, limit, offset }: HistorySearchParams) {
    return searchHistoryRepository.findByUserWithPagination({ userId, limit, offset });
  }

  /**
   * الفئات الفريدة
   */
  async getCategories() {
    const records = await partRepository.findDistinctCategories();
    return records
      .map((record) => (record as DistinctCategoryRecord).category)
      .filter((category): category is string => Boolean(category));
  }

  /**
   * الماركات الفريدة
   */
  async getBrands() {
    const records = await partRepository.findDistinctBrands();
    return records
      .map((record) => (record as DistinctBrandRecord).brand)
      .filter((brand): brand is string => Boolean(brand));
  }

  /**
   * تصدير نتائج البحث إلى Excel
   */
  async exportToExcel(filters: SearchFilters = {}) {
    const where = partRepository.buildWhereFromFilters(filters);
    const parts = (await partRepository.findForExport(where)) as ExportPart[];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('قطع الغيار');

    worksheet.columns = [
      { header: 'الكود', key: 'code' },
      { header: 'الاسم', key: 'name' },
      { header: 'الاسم الانجليزي', key: 'nameEn' },
      { header: 'الفئة', key: 'category' },
      { header: 'الماركة', key: 'brand' },
      { header: 'بلد المنشأ', key: 'origin' },
      { header: 'الجودة', key: 'quality' },
      { header: 'السعر', key: 'price' },
      { header: 'العملة', key: 'currency' },
      { header: 'الشركة الموردة', key: 'supplier' },
      { header: 'التوفر', key: 'stock' },
    ];

    parts.forEach((p: ExportPart) => {
      worksheet.addRow({
        code: p.part_code,
        name: p.part_name,
        nameEn: p.part_name_en || '',
        category: p.category || '',
        brand: p.brand || '',
        origin: p.origin_country || '',
        quality: p.quality_grade,
        price: p.price || '',
        currency: p.currency,
        supplier: p.supplier ? p.supplier.name : '',
        stock: p.in_stock ? 'متوفر' : 'غير متوفر',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export const searchService = new SearchService();

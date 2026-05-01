import ExcelJS from 'exceljs';
import { partRepository, searchHistoryRepository } from '../repositories';
import { SmartSearch } from './SmartSearch';

const ALLOWED_SORT_FIELDS = ['part_name', 'part_code', 'price', 'quality_grade', 'created_at'];

/**
 * خدمة البحث الرئيسية (ذكي، تقليدي، تصدير، مقارنة)
 */
class SearchService {
  /**
   * البحث الذكي
   */
  async smartSearch(q: any, filters: any) {
    return SmartSearch.search(q, filters);
  }

  /**
   * البحث المشتق
   */
  async derivedSearch(criteria: any, filters: any) {
    const results = await SmartSearch.searchByDerived(criteria, filters);
    return { results, total: results.length };
  }

  /**
   * البحث القديم مع ترقيم وتسجيل في السجل
   */
  async legacySearch({ userId, query, filters, pagination, sort }: any) {
    const where = partRepository.buildWhereFromFilters({ q: query, ...filters });

    const sortField = ALLOWED_SORT_FIELDS.includes(sort?.field) ? sort.field : 'part_name';
    const sortDir = ['ASC', 'DESC'].includes(sort?.order?.toUpperCase())
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
  async compare(partIds: any) {
    return partRepository.findManyByIds(partIds);
  }

  /**
   * سجل البحث
   */
  async getHistory({ userId, limit, offset }: any) {
    return searchHistoryRepository.findByUserWithPagination({ userId, limit, offset });
  }

  /**
   * الفئات الفريدة
   */
  async getCategories() {
    const records = await partRepository.findDistinctCategories();
    return records.map((r: any) => r.category);
  }

  /**
   * الماركات الفريدة
   */
  async getBrands() {
    const records = await partRepository.findDistinctBrands();
    return records.map((r: any) => r.brand);
  }

  /**
   * تصدير نتائج البحث إلى Excel
   */
  async exportToExcel(filters: any) {
    const where = partRepository.buildWhereFromFilters(filters);
    const parts = await partRepository.findForExport(where);

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

    parts.forEach((p: any) => {
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

import {
  partRepository,
  supplierRepository,
  pdfFileRepository,
  PartRecord,
  SupplierRecord,
  PartCreationAttributes,
} from '../repositories';
import { buildPublicSettingsFallback } from '../config/systemSettings';
import { NotFoundError, ValidationError } from '../errors';

const ALLOWED_SORT_FIELDS = [
  'part_name',
  'part_code',
  'price_cash',
  'brand',
  'category',
  'quality_grade',
  'created_at',
] as const;

type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type SortDirection = 'ASC' | 'DESC';

interface ListPartsOptions {
  q?: string;
  category?: string;
  brand?: string;
  quality_grade?: string;
  supplier_id?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string | boolean;
  limit: number;
  offset: number;
  sortField?: string;
  sortDir?: string;
}

type PartMutationInput = Partial<PartCreationAttributes> & {
  supplier_id?: string | null;
};

const parseNullableNumber = (value: unknown): number | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) {
    throw new ValidationError('القيمة الرقمية غير صالحة');
  }

  return parsedValue;
};

const sanitizeText = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue || null;
};

export class PartAdminService {
  async listParts(options: ListPartsOptions): Promise<{ rows: PartRecord[]; count: number }> {
    const sortField = ALLOWED_SORT_FIELDS.includes(options.sortField as SortField)
      ? (options.sortField as SortField)
      : 'created_at';
    const sortDir: SortDirection = options.sortDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return partRepository.searchWithPagination({
      where: partRepository.buildWhereFromFilters({
        q: options.q,
        category: options.category,
        brand: options.brand,
        quality_grade: options.quality_grade,
        supplier_id: options.supplier_id,
        min_price: options.min_price,
        max_price: options.max_price,
        in_stock: options.in_stock,
      }),
      sortField,
      sortDir,
      limit: options.limit,
      offset: options.offset,
    });
  }

  async getFilterOptions(): Promise<{
    categories: string[];
    brands: string[];
    suppliers: SupplierRecord[];
    qualityGrades: string[];
  }> {
    const [categories, brands, suppliers] = await Promise.all([
      partRepository.findDistinctCategories(),
      partRepository.findDistinctBrands(),
      supplierRepository.findAll(
        { is_active: true },
        {
          attributes: ['id', 'name'],
          order: [['name', 'ASC']],
        }
      ),
    ]);

    const fallbackSettings = buildPublicSettingsFallback();
    const qualityGrades =
      fallbackSettings?.general?.quality_grade_options?.split(',').filter(Boolean) || [];

    return {
      categories: categories
        .map((item) => item.category)
        .filter((item): item is string => Boolean(item)),
      brands: brands.map((item) => item.brand).filter((item): item is string => Boolean(item)),
      suppliers: suppliers as SupplierRecord[],
      qualityGrades: qualityGrades.length
        ? qualityGrades
        : ['original', 'high', 'medium', 'low', 'unspecified'],
    };
  }

  async createPart(data: PartMutationInput): Promise<PartRecord> {
    await this.ensureSupplierExists(data.supplier_id);

    const payload = await this.buildPartPayload(data, false);
    return partRepository.create(payload);
  }

  async updatePart(id: string, data: PartMutationInput): Promise<PartRecord> {
    const existingPart = await partRepository.findById(id, {
      include: [
        { association: 'pdfFile', attributes: ['id', 'original_name'] },
        { association: 'supplier', attributes: ['id', 'name'] },
      ],
    });
    if (!existingPart) {
      throw new NotFoundError('قطعة الغيار غير موجودة');
    }

    await this.ensureSupplierExists(data.supplier_id);

    const payload = await this.buildPartPayload(data, true);
    const updatedPart = await partRepository.updateById(id, payload);
    if (!updatedPart) {
      throw new NotFoundError('قطعة الغيار غير موجودة');
    }

    return updatedPart;
  }

  async deletePart(id: string): Promise<void> {
    const deleted = await partRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('قطعة الغيار غير موجودة');
    }
  }

  private async ensureSupplierExists(supplierId?: string | null): Promise<void> {
    if (!supplierId) {
      return;
    }

    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new ValidationError('المورد المحدد غير موجود');
    }
  }

  private async buildPartPayload(
    data: PartMutationInput,
    isUpdate: boolean
  ): Promise<Record<string, unknown>> {
    const normalizedPartName = sanitizeText(data.part_name);
    if (!isUpdate && !normalizedPartName) {
      throw new ValidationError('اسم القطعة مطلوب');
    }

    const normalizedPayload: Record<string, unknown> = {
      part_code: sanitizeText(data.part_code),
      item_number: sanitizeText(data.item_number),
      oem_number: sanitizeText(data.oem_number),
      part_name: normalizedPartName,
      part_name_en: sanitizeText(data.part_name_en),
      category: sanitizeText(data.category),
      brand: sanitizeText(data.brand),
      origin_country: sanitizeText(data.origin_country),
      quality_grade: data.quality_grade,
      currency: sanitizeText(data.currency) || 'LYD',
      unit: sanitizeText(data.unit),
      description: sanitizeText(data.description),
      supplier_name_text: sanitizeText(data.supplier_name_text),
      supplier_id: data.supplier_id || null,
      row_index: data.row_index ?? 0,
      table_index: data.table_index ?? 0,
      mapping_confidence: data.mapping_confidence ?? 0,
      in_stock:
        data.in_stock === undefined ? (isUpdate ? undefined : true) : Boolean(data.in_stock),
    };

    const price = parseNullableNumber(data.price);
    const priceCash = parseNullableNumber(data.price_cash);
    const priceBank = parseNullableNumber(data.price_bank);
    const priceWholesale = parseNullableNumber(data.price_wholesale);
    const priceWholesaleSmall = parseNullableNumber(data.price_wholesale_small);
    const quantityAvailable = parseNullableNumber(data.quantity_available);

    if (price !== undefined) normalizedPayload.price = price;
    if (priceCash !== undefined) normalizedPayload.price_cash = priceCash;
    if (priceBank !== undefined) normalizedPayload.price_bank = priceBank;
    if (priceWholesale !== undefined) normalizedPayload.price_wholesale = priceWholesale;
    if (priceWholesaleSmall !== undefined) {
      normalizedPayload.price_wholesale_small = priceWholesaleSmall;
    }
    if (quantityAvailable !== undefined) normalizedPayload.quantity_available = quantityAvailable;

    if (!isUpdate) {
      const latestPdfFile = await this.getFallbackPdfFileId();
      normalizedPayload.pdf_file_id = data.pdf_file_id || latestPdfFile;
    }

    return Object.fromEntries(
      Object.entries(normalizedPayload).filter(([, value]) => value !== undefined)
    );
  }

  private async getFallbackPdfFileId(): Promise<string> {
    const latestPdfFile = await pdfFileRepository.findOne({
      order: [['created_at', 'DESC']],
      attributes: ['id'],
    });

    if (!latestPdfFile) {
      throw new ValidationError('لا يمكن إنشاء قطعة جديدة قبل وجود ملف PDF واحد على الأقل');
    }

    return String(latestPdfFile.id);
  }
}

export const partAdminService = new PartAdminService();

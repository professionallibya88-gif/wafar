import { Op, WhereOptions } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Part, PartAttributes, PartCreationAttributes } from '../database/models/Part';
import { Supplier } from '../database/models/Supplier';
import { PDFFile } from '../database/models/PDFFile';

export type PartRecord = Part;
export { PartAttributes, PartCreationAttributes };

const fileDetailPartAttributes = [
  'id',
  'row_index',
  'page_number',
  'table_index',
  'part_code',
  'item_number',
  'oem_number',
  'part_name',
  'origin_country',
  'quality_grade',
  'brand',
  'price',
  'price_cash',
  'price_bank',
  'price_wholesale',
  'price_wholesale_small',
  'in_stock',
  'quantity_available',
  'derived',
  'mapping_confidence',
] as const;

type PartFilters = {
  q?: string;
  category?: string;
  brand?: string;
  quality_grade?: string;
  supplier_id?: string | number;
  pdf_file_id?: string | number;
  min_price?: string | number;
  max_price?: string | number;
  in_stock?: boolean | string;
  maker?: string;
  car_model?: string;
  part_type?: string;
  year?: string | number;
  side?: string;
};

type PartSearchWhere = WhereOptions<PartAttributes>;
type JsonDerivedFilter = {
  maker?: string;
  car_model?: string;
  part_type?: string;
  year?: string | number;
  side?: string;
};

export class PartRepository extends BaseRepository<Part> {
  constructor() {
    super(Part);
  }

  buildWhereFromFilters(filters: PartFilters = {}): PartSearchWhere {
    const {
      q,
      category,
      brand,
      quality_grade,
      supplier_id,
      pdf_file_id,
      min_price,
      max_price,
      in_stock,
    } = filters;
    const where: Record<string | symbol, unknown> = {};

    if (q) {
      where[Op.or] = [
        { part_name: { [Op.iLike]: `%${q}%` } },
        { part_code: { [Op.iLike]: `%${q}%` } },
        { part_name_en: { [Op.iLike]: `%${q}%` } },
        { oem_number: { [Op.iLike]: `%${q}%` } },
        { item_number: { [Op.iLike]: `%${q}%` } },
        { supplier_name_text: { [Op.iLike]: `%${q}%` } },
      ];
    }

    if (category) where.category = category;
    if (brand) where.brand = { [Op.iLike]: `%${brand}%` };
    if (quality_grade) where.quality_grade = quality_grade;
    if (supplier_id) where.supplier_id = supplier_id;
    if (pdf_file_id) where.pdf_file_id = pdf_file_id;
    if (in_stock === 'true' || in_stock === true) {
      where.in_stock = true;
    } else if (in_stock === 'false' || in_stock === false) {
      where.in_stock = false;
    }

    if (min_price || max_price) {
      const disjunction = ((where[Op.or] as object[] | undefined) || []).slice();
      const priceWhere: Record<string | symbol, number> = {};
      if (min_price) priceWhere[Op.gte] = parseFloat(String(min_price));
      if (max_price) priceWhere[Op.lte] = parseFloat(String(max_price));
      disjunction.push(
        { price_cash: priceWhere },
        { price_bank: priceWhere },
        { price_wholesale: priceWhere },
        { price_wholesale_small: priceWhere }
      );
      where[Op.or] = disjunction;
    }

    return where as PartSearchWhere;
  }

  async searchWithPagination(options: {
    where: PartSearchWhere;
    sortField: string;
    sortDir: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: Part[]; count: number }> {
    return this.model.findAndCountAll({
      where: options.where,
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'category'] },
        { model: PDFFile, as: 'pdfFile', attributes: ['id', 'original_name'] },
      ],
      order: [[options.sortField, options.sortDir]],
      limit: options.limit,
      offset: options.offset,
    });
  }

  async findManyByIds(ids: string[]): Promise<Part[]> {
    return this.model.findAll({
      where: { id: { [Op.in]: ids } },
      include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
    });
  }

  async findByPDFFileIdWithPagination(options: {
    pdfFileId: string;
    limit: number;
    offset: number;
    filters?: PartFilters;
  }): Promise<{ rows: Part[]; count: number }> {
    const { pdfFileId, limit, offset, filters = {} } = options;

    const where = {
      ...this.buildWhereFromFilters(filters),
      pdf_file_id: pdfFileId,
    };

    return this.model.findAndCountAll({
      where,
      attributes: fileDetailPartAttributes as unknown as string[],
      order: [
        ['page_number', 'ASC'],
        ['table_index', 'ASC'],
        ['row_index', 'ASC'],
        ['created_at', 'ASC'],
      ],
      limit,
      offset,
    });
  }

  async findDistinctCategories(): Promise<Part[]> {
    return this.model.findAll({
      attributes: ['category'],
      group: ['category'],
      where: { category: { [Op.ne]: null } } as unknown as PartSearchWhere,
      order: [['category', 'ASC']],
    });
  }

  async findDistinctBrands(): Promise<Part[]> {
    return this.model.findAll({
      attributes: ['brand'],
      group: ['brand'],
      where: { brand: { [Op.ne]: null } } as unknown as PartSearchWhere,
      order: [['brand', 'ASC']],
    });
  }

  async findForExport(where: PartSearchWhere): Promise<Part[]> {
    return this.model.findAll({
      where,
      include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
      order: [['part_name', 'ASC']],
      limit: 5000,
    });
  }

  applySmartSearchFilters(filters: PartFilters): PartSearchWhere {
    const where: Record<string | symbol, unknown> = {};
    const derivedContains: JsonDerivedFilter = {};

    if (filters.supplier_id) {
      where.supplier_id = filters.supplier_id;
    }

    if (filters.pdf_file_id) {
      where.pdf_file_id = filters.pdf_file_id;
    }

    if (filters.brand) {
      where.brand = { [Op.iLike]: `%${filters.brand}%` };
    }

    if (filters.quality_grade) {
      where.quality_grade = filters.quality_grade;
    }

    if (filters.min_price !== undefined) {
      where.price_cash = { [Op.gte]: filters.min_price };
    }

    if (filters.max_price !== undefined) {
      const priceCashFilter =
        (where.price_cash as Record<string | symbol, string | number | undefined> | undefined) ||
        {};
      if (Object.keys(priceCashFilter).length > 0) {
        priceCashFilter[Op.lte] = filters.max_price;
        where.price_cash = priceCashFilter;
      } else {
        where.price_cash = { [Op.lte]: filters.max_price };
      }
    }

    if (filters.maker) {
      derivedContains.maker = filters.maker;
    }

    if (filters.car_model) {
      derivedContains.car_model = filters.car_model;
    }

    if (Object.keys(derivedContains).length > 0) {
      where.derived = { [Op.contains]: derivedContains };
    }

    return where as PartSearchWhere;
  }

  async smartSearchUnified(query: string, filters: PartFilters): Promise<Part[]> {
    const where = this.applySmartSearchFilters(filters) as Record<string | symbol, unknown>;

    // Split query into terms for better matching
    const terms = query.split(/\s+/).filter(Boolean);

    if (terms.length > 1) {
      where[Op.and] = terms.map((term) => ({
        [Op.or]: [
          { part_name: { [Op.iLike]: `%${term}%` } },
          { part_code: { [Op.iLike]: `%${term}%` } },
          { oem_number: { [Op.iLike]: `%${term}%` } },
          { item_number: { [Op.iLike]: `%${term}%` } },
          { search_signature: { [Op.iLike]: `%${term}%` } },
          { brand: { [Op.iLike]: `%${term}%` } },
        ],
      }));
    } else {
      where[Op.or] = [
        { part_name: { [Op.iLike]: `%${query}%` } },
        { part_code: { [Op.iLike]: `%${query}%` } },
        { oem_number: { [Op.iLike]: `%${query}%` } },
        { item_number: { [Op.iLike]: `%${query}%` } },
        { search_signature: { [Op.iLike]: `%${query}%` } },
        { brand: { [Op.iLike]: `%${query}%` } },
      ];
    }

    return this.model.findAll({
      where: where as PartSearchWhere,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: PDFFile,
          as: 'pdfFile',
          attributes: ['id', 'original_name', 'status'],
        },
      ],
      order: [['price_cash', 'ASC']],
      limit: 200,
    });
  }

  async smartSearchExactMatch(
    field: keyof Pick<
      PartAttributes,
      'part_code' | 'oem_number' | 'item_number' | 'part_name' | 'search_signature' | 'brand'
    >,
    value: string,
    filters: PartFilters
  ): Promise<Part[]> {
    const where = { [field]: value, ...this.applySmartSearchFilters(filters) } as PartSearchWhere;

    return this.model.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: PDFFile,
          as: 'pdfFile',
          attributes: ['id', 'original_name', 'status'],
        },
      ],
      order: [['price_cash', 'ASC']],
      limit: 100,
    });
  }

  async smartSearchByName(
    name: string,
    filters: PartFilters,
    isTrigram: boolean = false
  ): Promise<Part[]> {
    const where = this.applySmartSearchFilters(filters) as Record<string | symbol, unknown>;

    if (isTrigram) {
      where[Op.or] = [
        { part_name: { [Op.iLike]: `%${name}%` } },
        { search_signature: { [Op.iLike]: `%${name}%` } },
      ];
    } else {
      where.part_name = { [Op.iLike]: `%${name}%` };
    }

    return this.model.findAll({
      where: where as PartSearchWhere,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name'],
        },
        {
          model: PDFFile,
          as: 'pdfFile',
          attributes: ['id', 'original_name', 'status'],
        },
      ],
      order: isTrigram ? [['part_name', 'ASC']] : [['price_cash', 'ASC']],
      limit: 50,
    });
  }

  async smartSearchByDerived(criteria: JsonDerivedFilter, filters: PartFilters): Promise<Part[]> {
    const where: Record<string | symbol, unknown> = {};
    const derivedContains: JsonDerivedFilter = {};

    if (criteria.maker) {
      derivedContains.maker = criteria.maker;
    }

    if (criteria.car_model) {
      derivedContains.car_model = criteria.car_model;
    }

    if (criteria.part_type) {
      derivedContains.part_type = criteria.part_type;
    }

    if (criteria.year) {
      derivedContains.year = criteria.year;
    }

    if (criteria.side) {
      derivedContains.side = criteria.side;
    }

    if (Object.keys(derivedContains).length > 0) {
      where.derived = { [Op.contains]: derivedContains };
    }

    Object.assign(where, this.applySmartSearchFilters(filters));

    return this.model.findAll({
      where: where as PartSearchWhere,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name'],
        },
        {
          model: PDFFile,
          as: 'pdfFile',
          attributes: ['id', 'original_name', 'status'],
        },
      ],
      order: [['price_cash', 'ASC']],
      limit: 100,
    });
  }

  async deleteByPDFFileId(pdfFileId: string): Promise<number> {
    return this.model.destroy({ where: { pdf_file_id: pdfFileId } });
  }
}

export const partRepository = new PartRepository();

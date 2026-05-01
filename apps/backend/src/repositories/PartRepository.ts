import { Op } from 'sequelize';
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

export class PartRepository extends BaseRepository<Part> {
  constructor() {
    super(Part);
  }

  buildWhereFromFilters(filters: any = {}): any {
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
    const where: any = {};

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
      where[Op.or] = where[Op.or] || [];
      const priceWhere: any = {};
      if (min_price) priceWhere[Op.gte] = parseFloat(min_price);
      if (max_price) priceWhere[Op.lte] = parseFloat(max_price);
      where[Op.or].push(
        { price_cash: priceWhere },
        { price_bank: priceWhere },
        { price_wholesale: priceWhere },
        { price_wholesale_small: priceWhere }
      );
    }

    return where;
  }

  async searchWithPagination(options: {
    where: any;
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
    filters?: any;
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
      where: { category: { [Op.not]: null as any } },
      order: [['category', 'ASC']],
    });
  }

  async findDistinctBrands(): Promise<Part[]> {
    return this.model.findAll({
      attributes: ['brand'],
      group: ['brand'],
      where: { brand: { [Op.not]: null as any } },
      order: [['brand', 'ASC']],
    });
  }

  async findForExport(where: any): Promise<Part[]> {
    return this.model.findAll({
      where,
      include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
      order: [['part_name', 'ASC']],
      limit: 5000,
    });
  }

  applySmartSearchFilters(filters: any): any {
    const where: any = {};

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
      if (where.price_cash) {
        where.price_cash[Op.lte] = filters.max_price;
      } else {
        where.price_cash = { [Op.lte]: filters.max_price };
      }
    }

    if (filters.maker) {
      where.derived = {
        [Op.contains]: { maker: filters.maker },
      };
    }

    if (filters.car_model) {
      if (where.derived) {
        where.derived[Op.contains].car_model = filters.car_model;
      } else {
        where.derived = { [Op.contains]: { car_model: filters.car_model } };
      }
    }

    return where;
  }

  async smartSearchUnified(query: string, filters: any): Promise<Part[]> {
    const where = this.applySmartSearchFilters(filters);

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
      limit: 200,
    });
  }

  async smartSearchExactMatch(field: string, value: string, filters: any): Promise<Part[]> {
    const where = { [field]: value, ...this.applySmartSearchFilters(filters) };

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

  async smartSearchByName(name: string, filters: any, isTrigram: boolean = false): Promise<Part[]> {
    const where = this.applySmartSearchFilters(filters);

    if (isTrigram) {
      where[Op.or] = [
        { part_name: { [Op.iLike]: `%${name}%` } },
        { search_signature: { [Op.iLike]: `%${name}%` } },
      ];
    } else {
      where.part_name = { [Op.iLike]: `%${name}%` };
    }

    return this.model.findAll({
      where,
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

  async smartSearchByDerived(criteria: any, filters: any): Promise<Part[]> {
    const where: any = {};

    if (criteria.maker) {
      where.derived = { [Op.contains]: { maker: criteria.maker } };
    }

    if (criteria.car_model) {
      if (where.derived) {
        where.derived[Op.contains].car_model = criteria.car_model;
      } else {
        where.derived = { [Op.contains]: { car_model: criteria.car_model } };
      }
    }

    if (criteria.part_type) {
      if (where.derived) {
        where.derived[Op.contains].part_type = criteria.part_type;
      } else {
        where.derived = { [Op.contains]: { part_type: criteria.part_type } };
      }
    }

    if (criteria.year) {
      if (where.derived) {
        where.derived[Op.contains].year = criteria.year;
      } else {
        where.derived = { [Op.contains]: { year: criteria.year } };
      }
    }

    if (criteria.side) {
      if (where.derived) {
        where.derived[Op.contains].side = criteria.side;
      } else {
        where.derived = { [Op.contains]: { side: criteria.side } };
      }
    }

    Object.assign(where, this.applySmartSearchFilters(filters));

    return this.model.findAll({
      where,
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

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface PartAttributes {
  id: string;
  row_index: number;
  page_number?: number;
  table_index: number;
  raw_headers?: any;
  raw_row?: any;
  part_code?: string;
  item_number?: string;
  oem_number?: string;
  part_name?: string;
  part_name_en?: string;
  category?: string;
  brand?: string;
  origin_country?: string;
  quality_grade: 'original' | 'high' | 'medium' | 'low' | 'unspecified';
  price?: number;
  price_cash?: number;
  price_bank?: number;
  price_wholesale?: number;
  price_wholesale_small?: number;
  currency: string;
  unit?: string;
  in_stock: boolean;
  quantity_available?: number;
  description?: string;
  specifications?: any;
  supplier_name_text?: string;
  row_data?: any;
  derived?: {
    year?: string;
    side?: string;
    car_model?: string;
    maker?: string;
    part_type?: string;
  };
  search_signature?: string;
  search_vector?: string;
  mapping_confidence: number;
  pdf_file_id: string;
  supplier_id?: string;
}

export interface PartCreationAttributes extends Optional<
  PartAttributes,
  | 'id'
  | 'row_index'
  | 'table_index'
  | 'quality_grade'
  | 'currency'
  | 'in_stock'
  | 'mapping_confidence'
> {}

export class Part extends Model<PartAttributes, PartCreationAttributes> implements PartAttributes {
  public id!: string;
  public row_index!: number;
  public page_number?: number;
  public table_index!: number;
  public raw_headers?: any;
  public raw_row?: any;
  public part_code?: string;
  public item_number?: string;
  public oem_number?: string;
  public part_name?: string;
  public part_name_en?: string;
  public category?: string;
  public brand?: string;
  public origin_country?: string;
  public quality_grade!: 'original' | 'high' | 'medium' | 'low' | 'unspecified';
  public price?: number;
  public price_cash?: number;
  public price_bank?: number;
  public price_wholesale?: number;
  public price_wholesale_small?: number;
  public currency!: string;
  public unit?: string;
  public in_stock!: boolean;
  public quantity_available?: number;
  public description?: string;
  public specifications?: any;
  public supplier_name_text?: string;
  public row_data?: any;
  public derived?: {
    year?: string;
    side?: string;
    car_model?: string;
    maker?: string;
    part_type?: string;
  };
  public search_signature?: string;
  public search_vector?: string;
  public mapping_confidence!: number;
  public pdf_file_id!: string;
  public supplier_id?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return Part.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        row_index: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        page_number: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        table_index: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        raw_headers: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        raw_row: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        part_code: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        item_number: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        oem_number: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        part_name: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        part_name_en: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        brand: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        origin_country: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        quality_grade: {
          type: DataTypes.ENUM('original', 'high', 'medium', 'low', 'unspecified'),
          defaultValue: 'unspecified',
        },
        price: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: true,
        },
        price_cash: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: true,
        },
        price_bank: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: true,
        },
        price_wholesale: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: true,
        },
        price_wholesale_small: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: true,
        },
        currency: {
          type: DataTypes.STRING(10),
          defaultValue: 'LYD',
        },
        unit: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        in_stock: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        quantity_available: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        specifications: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        row_data: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        derived: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        search_signature: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        search_vector: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        mapping_confidence: {
          type: DataTypes.SMALLINT,
          defaultValue: 0,
        },
        pdf_file_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        supplier_name_text: {
          type: DataTypes.STRING(300),
          allowNull: true,
          comment: 'اسم الوكيل المستخرج من ملف PDF',
        },
        supplier_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Part',
        tableName: 'parts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
        indexes: [
          { fields: ['part_code'] },
          { fields: ['item_number'] },
          { fields: ['oem_number'] },
          { fields: ['part_name'] },
          { fields: ['category'] },
          { fields: ['brand'] },
          { fields: ['quality_grade'] },
          { fields: ['price'] },
          { fields: ['price_cash'] },
          { fields: ['price_bank'] },
          { fields: ['in_stock'] },
          { fields: ['search_signature'] },
          {
            name: 'parts_category_brand_idx',
            fields: ['category', 'brand'],
          },
          {
            name: 'parts_quality_stock_idx',
            fields: ['quality_grade', 'in_stock'],
          },
          {
            name: 'parts_price_range_idx',
            fields: ['price_cash'],
          },
          {
            name: 'parts_search_index',
            using: 'GIN',
            fields: [Sequelize.fn('to_tsvector', 'arabic', Sequelize.col('part_name'))],
          },
          {
            name: 'parts_code_search_index',
            using: 'GIN',
            fields: [Sequelize.fn('to_tsvector', 'simple', Sequelize.col('part_code'))],
          },
          {
            name: 'parts_item_search_index',
            using: 'GIN',
            fields: [Sequelize.fn('to_tsvector', 'simple', Sequelize.col('item_number'))],
          },
          {
            name: 'parts_oem_search_index',
            using: 'GIN',
            fields: [Sequelize.fn('to_tsvector', 'simple', Sequelize.col('oem_number'))],
          },
          {
            name: 'parts_derived_jsonb_idx',
            using: 'GIN',
            fields: ['derived'],
          },
        ],
      }
    );
  }
}

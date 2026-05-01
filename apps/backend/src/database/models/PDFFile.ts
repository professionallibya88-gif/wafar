import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface PDFFileAttributes {
  id: string;
  original_name: string;
  file_path: string;
  file_relative_path?: string;
  file_size: number;
  page_count?: number;
  processing_method: 'python_ai' | 'python_pypdf' | 'node_pdf' | 'aws_textract' | 'table_extractor';
  extraction_method?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percent: number;
  progress_message?: string;
  tables_count: number;
  extracted_data?: any;
  error_message?: string;
  parts_count: number;
  user_id?: string;
  supplier_id?: string;
  document_date?: Date;
  version_number: number;
  is_latest_version: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PDFFileCreationAttributes extends Optional<
  PDFFileAttributes,
  | 'id'
  | 'processing_method'
  | 'status'
  | 'progress_percent'
  | 'tables_count'
  | 'parts_count'
  | 'version_number'
  | 'is_latest_version'
> {}

export class PDFFile
  extends Model<PDFFileAttributes, PDFFileCreationAttributes>
  implements PDFFileAttributes
{
  public id!: string;
  public original_name!: string;
  public file_path!: string;
  public file_relative_path?: string;
  public file_size!: number;
  public page_count?: number;
  public processing_method!:
    | 'python_ai'
    | 'python_pypdf'
    | 'node_pdf'
    | 'aws_textract'
    | 'table_extractor';
  public extraction_method?: string;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public progress_percent!: number;
  public progress_message?: string;
  public tables_count!: number;
  public extracted_data?: any;
  public error_message?: string;
  public parts_count!: number;
  public user_id?: string;
  public supplier_id?: string;
  public document_date?: Date;
  public version_number!: number;
  public is_latest_version!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return PDFFile.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        original_name: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        file_path: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        file_relative_path: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: 'المسار النسبي للملف (للأمان)',
        },
        file_size: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        page_count: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        processing_method: {
          type: DataTypes.ENUM(
            'python_ai',
            'python_pypdf',
            'node_pdf',
            'aws_textract',
            'table_extractor'
          ),
          allowNull: false,
          defaultValue: 'node_pdf',
        },
        extraction_method: {
          type: DataTypes.STRING(30),
          allowNull: true,
          comment: 'طريقة الاستخراج الفعلية المستخدمة',
        },
        status: {
          type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
          defaultValue: 'pending',
        },
        progress_percent: {
          type: DataTypes.SMALLINT,
          defaultValue: 0,
          comment: 'نسبة التقدم (0-100)',
        },
        progress_message: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'رسالة التقدم الحالية',
        },
        tables_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: 'عدد الجداول المستخرجة',
        },
        extracted_data: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        error_message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        parts_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        supplier_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'suppliers',
            key: 'id',
          },
        },
        document_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          comment: 'تاريخ الملف من الشركة الموردة',
        },
        version_number: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
          comment: 'رقم إصدار الملف للمورد',
        },
        is_latest_version: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          comment: 'هل هذا أحدث إصدار للمورد',
        },
      },
      {
        sequelize,
        modelName: 'PDFFile',
        tableName: 'pdf_files',
        indexes: [
          { fields: ['status'] },
          { fields: ['processing_method'] },
          { fields: ['extraction_method'] },
          { fields: ['progress_percent'] },
          { fields: ['supplier_id'] },
          { fields: ['is_latest_version'] },
          {
            name: 'pdf_files_created_at_idx',
            fields: [{ name: 'created_at', order: 'DESC' }],
          },
          {
            name: 'pdf_files_doc_date_idx',
            fields: ['document_date'],
          },
          {
            name: 'pdf_files_supplier_version_idx',
            fields: ['supplier_id', 'version_number'],
          },
        ],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

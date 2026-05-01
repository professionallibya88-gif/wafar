import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface AIProcessingLogAttributes {
  id: string;
  ai_provider_id: string | null;
  pdf_file_id: string | null;
  provider_type: string;
  model: string;
  operation: string;
  status: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  latency_ms: number;
  request_payload_size: number;
  response_payload_size: number;
  error_message: string | null;
  metadata: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIProcessingLogCreationAttributes extends Optional<
  AIProcessingLogAttributes,
  'id'
> {}

export class AIProcessingLog
  extends Model<AIProcessingLogAttributes, AIProcessingLogCreationAttributes>
  implements AIProcessingLogAttributes
{
  public id!: string;
  public ai_provider_id!: string | null;
  public pdf_file_id!: string | null;
  public provider_type!: string;
  public model!: string;
  public operation!: string;
  public status!: string;
  public input_tokens!: number;
  public output_tokens!: number;
  public estimated_cost!: number;
  public latency_ms!: number;
  public request_payload_size!: number;
  public response_payload_size!: number;
  public error_message!: string | null;
  public metadata!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return AIProcessingLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        ai_provider_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        pdf_file_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        provider_type: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING(200),
          allowNull: false,
          defaultValue: '',
        },
        operation: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'pending',
        },
        input_tokens: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        output_tokens: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        estimated_cost: {
          type: DataTypes.DECIMAL(12, 8),
          allowNull: false,
          defaultValue: 0,
        },
        latency_ms: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        request_payload_size: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        response_payload_size: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        error_message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: '{}',
        },
      },
      {
        sequelize,
        modelName: 'AIProcessingLog',
        tableName: 'ai_processing_logs',
        indexes: [
          { fields: ['ai_provider_id'] },
          { fields: ['pdf_file_id'] },
          { fields: ['provider_type'] },
          { fields: ['status'] },
          { fields: ['operation'] },
          { fields: ['created_at'] },
        ],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface AIProviderAttributes {
  id: string;
  name: string;
  provider_type: string;
  api_key: string;
  base_url: string;
  default_model: string;
  enabled: boolean;
  priority: number;
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  rate_limit_requests_per_minute: number;
  timeout_seconds: number;
  max_tokens: number;
  temperature: number;
  metadata: string;
  last_health_check_at: Date | null;
  last_health_status: string | null;
  failure_count: number;
  success_count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIProviderCreationAttributes extends Optional<AIProviderAttributes, 'id'> {}

export class AIProvider
  extends Model<AIProviderAttributes, AIProviderCreationAttributes>
  implements AIProviderAttributes
{
  public id!: string;
  public name!: string;
  public provider_type!: string;
  public api_key!: string;
  public base_url!: string;
  public default_model!: string;
  public enabled!: boolean;
  public priority!: number;
  public cost_per_1k_input_tokens!: number;
  public cost_per_1k_output_tokens!: number;
  public rate_limit_requests_per_minute!: number;
  public timeout_seconds!: number;
  public max_tokens!: number;
  public temperature!: number;
  public metadata!: string;
  public last_health_check_at!: Date | null;
  public last_health_status!: string | null;
  public failure_count!: number;
  public success_count!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return AIProvider.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        provider_type: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        api_key: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        base_url: {
          type: DataTypes.STRING(500),
          allowNull: false,
          defaultValue: '',
        },
        default_model: {
          type: DataTypes.STRING(200),
          allowNull: false,
          defaultValue: '',
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        priority: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        cost_per_1k_input_tokens: {
          type: DataTypes.DECIMAL(10, 6),
          allowNull: false,
          defaultValue: 0,
        },
        cost_per_1k_output_tokens: {
          type: DataTypes.DECIMAL(10, 6),
          allowNull: false,
          defaultValue: 0,
        },
        rate_limit_requests_per_minute: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 60,
        },
        timeout_seconds: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 60,
        },
        max_tokens: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 4096,
        },
        temperature: {
          type: DataTypes.DECIMAL(3, 2),
          allowNull: false,
          defaultValue: 0.1,
        },
        metadata: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: '{}',
        },
        last_health_check_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_health_status: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        failure_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        success_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'AIProvider',
        tableName: 'ai_providers',
        indexes: [
          { fields: ['provider_type'] },
          { fields: ['enabled'] },
          { fields: ['priority'] },
          { fields: ['provider_type', 'enabled'] },
        ],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

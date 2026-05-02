import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface ActivityLogAttributes {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  admin_id?: string;
  user_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLogCreationAttributes extends Optional<
  ActivityLogAttributes,
  'id' | 'created_at' | 'updated_at'
> {}

export class ActivityLog
  extends Model<ActivityLogAttributes, ActivityLogCreationAttributes>
  implements ActivityLogAttributes
{
  declare id: string;
  declare action: string;
  declare entity_type: string;
  declare entity_id?: string;
  declare admin_id?: string;
  declare user_id?: string;
  declare details?: Record<string, unknown>;
  declare ip_address?: string;
  declare user_agent?: string;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    return ActivityLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        entity_type: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        entity_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        admin_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        details: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        ip_address: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'ActivityLog',
        tableName: 'activity_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{ fields: ['action'] }, { fields: ['created_at'] }],
      }
    );
  }
}

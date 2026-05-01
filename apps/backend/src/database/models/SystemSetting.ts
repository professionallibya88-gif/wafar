import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SystemSettingAttributes {
  id: string;
  key: string;
  value?: string;
  category?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'id'> {}

export class SystemSetting
  extends Model<SystemSettingAttributes, SystemSettingCreationAttributes>
  implements SystemSettingAttributes
{
  public id!: string;
  public key!: string;
  public value?: string;
  public category?: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return SystemSetting.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        key: {
          type: DataTypes.STRING(200),
          allowNull: false,
          unique: true,
        },
        value: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'SystemSetting',
        tableName: 'system_settings',
        indexes: [{ unique: true, fields: ['key'] }, { fields: ['category'] }],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

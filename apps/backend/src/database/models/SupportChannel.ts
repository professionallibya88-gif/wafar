import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SupportChannelAttributes {
  id: string;
  name: string;
  type: 'whatsapp' | 'phone' | 'link';
  value: string;
  is_active: boolean;
  icon?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface SupportChannelCreationAttributes extends Optional<
  SupportChannelAttributes,
  'id' | 'is_active' | 'icon' | 'created_at' | 'updated_at'
> {}

export class SupportChannel
  extends Model<SupportChannelAttributes, SupportChannelCreationAttributes>
  implements SupportChannelAttributes
{
  declare id: string;
  declare name: string;
  declare type: 'whatsapp' | 'phone' | 'link';
  declare value: string;
  declare is_active: boolean;
  declare icon?: string;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize) {
    return SupportChannel.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'اسم القناة مطلوب' },
          },
        },
        type: {
          type: DataTypes.ENUM('whatsapp', 'phone', 'link'),
          allowNull: false,
        },
        value: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'قيمة القناة مطلوبة' },
          },
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        icon: {
          type: DataTypes.STRING(100),
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
        deleted_at: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'SupportChannel',
        tableName: 'support_channels',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      }
    );
  }
}

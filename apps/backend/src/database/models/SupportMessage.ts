import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SupportMessageAttributes {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  content: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface SupportMessageCreationAttributes extends Optional<
  SupportMessageAttributes,
  'id' | 'created_at' | 'updated_at'
> {}

export class SupportMessage
  extends Model<SupportMessageAttributes, SupportMessageCreationAttributes>
  implements SupportMessageAttributes
{
  declare id: string;
  declare ticket_id: string;
  declare sender_id: string;
  declare sender_type: 'user' | 'admin';
  declare content: string;

  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize) {
    return SupportMessage.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        ticket_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'support_tickets',
            key: 'id',
          },
        },
        sender_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        sender_type: {
          type: DataTypes.ENUM('user', 'admin'),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'SupportMessage',
        tableName: 'support_messages',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      }
    );
  }
}

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SupportTicketAttributes {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'closed' | 'resolved';
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface SupportTicketCreationAttributes extends Optional<
  SupportTicketAttributes,
  'id' | 'status' | 'created_at' | 'updated_at'
> {}

export class SupportTicket
  extends Model<SupportTicketAttributes, SupportTicketCreationAttributes>
  implements SupportTicketAttributes
{
  declare id: string;
  declare user_id: string;
  declare subject: string;
  declare status: 'open' | 'closed' | 'resolved';

  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date;

  static initModel(sequelize: Sequelize) {
    return SupportTicket.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        subject: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('open', 'closed', 'resolved'),
          defaultValue: 'open',
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'SupportTicket',
        tableName: 'support_tickets',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      }
    );
  }
}

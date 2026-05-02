import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface OrderItemAttributes {
  id: string;
  order_id: string;
  part_id: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemCreationAttributes extends Optional<
  OrderItemAttributes,
  'id' | 'created_at' | 'updated_at'
> {}

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  declare id: string;
  declare order_id: string;
  declare part_id: string;
  declare quantity: number;
  declare unit_price: number;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    return OrderItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        order_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'orders',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        part_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'parts',
            key: 'id',
          },
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        unit_price: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: false,
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
        modelName: 'OrderItem',
        tableName: 'order_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{ fields: ['order_id'] }, { fields: ['part_id'] }],
      }
    );
  }
}

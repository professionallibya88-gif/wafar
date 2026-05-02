import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface OrderAttributes {
  id: string;
  order_number: string;
  retailer_id: string;
  supplier_id: string;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderCreationAttributes extends Optional<
  OrderAttributes,
  'id' | 'status' | 'total_amount' | 'created_at' | 'updated_at'
> {}

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  declare id: string;
  declare order_number: string;
  declare retailer_id: string;
  declare supplier_id: string;
  declare status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  declare total_amount: number;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    return Order.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        order_number: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        retailer_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        supplier_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'suppliers',
            key: 'id',
          },
        },
        status: {
          type: DataTypes.ENUM('pending', 'processing', 'ready', 'completed', 'cancelled'),
          defaultValue: 'pending',
        },
        total_amount: {
          type: DataTypes.DECIMAL(12, 3),
          allowNull: false,
          defaultValue: 0,
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
        modelName: 'Order',
        tableName: 'orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          { fields: ['order_number'] },
          { fields: ['retailer_id'] },
          { fields: ['supplier_id'] },
          { fields: ['status'] },
        ],
      }
    );
  }
}

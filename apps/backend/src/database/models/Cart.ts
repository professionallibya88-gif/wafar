import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { CartItem } from './CartItem';

export interface CartAttributes {
  id: string;
  user_id: string;
  status: 'active' | 'abandoned' | 'completed';
  created_at: Date;
  updated_at: Date;
  items?: CartItem[];
}

export interface CartCreationAttributes extends Optional<
  CartAttributes,
  'id' | 'status' | 'created_at' | 'updated_at'
> {}

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  declare id: string;
  declare user_id: string;
  declare status: 'active' | 'abandoned' | 'completed';
  declare created_at: Date;
  declare updated_at: Date;
  declare items?: CartItem[];

  static initModel(sequelize: Sequelize) {
    return Cart.init(
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
        status: {
          type: DataTypes.ENUM('active', 'abandoned', 'completed'),
          defaultValue: 'active',
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
        modelName: 'Cart',
        tableName: 'carts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{ fields: ['user_id'] }, { fields: ['status'] }],
      }
    );
  }
}

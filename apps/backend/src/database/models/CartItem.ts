import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { Part } from './Part';

export interface CartItemAttributes {
  id: string;
  cart_id: string;
  part_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  part?: Part;
}

export interface CartItemCreationAttributes extends Optional<
  CartItemAttributes,
  'id' | 'quantity' | 'created_at' | 'updated_at'
> {}

export class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  declare id: string;
  declare cart_id: string;
  declare part_id: string;
  declare quantity: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare part?: Part;

  static initModel(sequelize: Sequelize) {
    return CartItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        cart_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'carts',
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
          onDelete: 'CASCADE',
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
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
        modelName: 'CartItem',
        tableName: 'cart_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          { fields: ['cart_id'] },
          { fields: ['part_id'] },
          { unique: true, fields: ['cart_id', 'part_id'] }, // Prevent duplicate parts in same cart
        ],
      }
    );
  }
}

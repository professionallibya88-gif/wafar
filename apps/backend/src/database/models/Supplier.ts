import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SupplierAttributes {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  category: 'automotive' | 'pharmaceutical' | 'industrial' | 'other';
  is_active: boolean;
  user_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierCreationAttributes extends Optional<
  SupplierAttributes,
  'id' | 'category' | 'is_active'
> {}

export class Supplier
  extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes
{
  public id!: string;
  public name!: string;
  public phone?: string;
  public email?: string;
  public address?: string;
  public category!: 'automotive' | 'pharmaceutical' | 'industrial' | 'other';
  public is_active!: boolean;
  public user_id?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return Supplier.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'اسم الشركة الموردة مطلوب' },
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        category: {
          type: DataTypes.ENUM('automotive', 'pharmaceutical', 'industrial', 'other'),
          defaultValue: 'automotive',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        modelName: 'Supplier',
        tableName: 'suppliers',
        indexes: [{ fields: ['category'] }, { fields: ['is_active'] }],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  full_name: string;
  phone: string;
  password?: string; // Optional for selection responses
  avatar_url?: string;
  role: 'retailer' | 'supplier';
  is_active: boolean;
  balance: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  'id' | 'role' | 'is_active' | 'balance' | 'created_at' | 'updated_at' | 'avatar_url'
> {
  password?: string;
}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare full_name: string;
  declare phone: string;
  declare password: string;
  declare avatar_url?: string;
  declare role: 'retailer' | 'supplier';
  declare is_active: boolean;
  declare balance: number;
  declare last_login?: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date;

  declare save: (_options?: unknown) => Promise<this>;
  declare destroy: (_options?: unknown) => Promise<void>;

  static initModel(sequelize: Sequelize) {
    return User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        full_name: {
          type: DataTypes.STRING(200),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'الاسم الكامل مطلوب' },
            len: { args: [3, 200], msg: 'الاسم يجب أن يكون بين 3 و 200 حرف' },
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: { name: 'phone', msg: 'رقم الهاتف مسجل مسبقا' },
          validate: {
            notEmpty: { msg: 'رقم الهاتف مطلوب' },
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'كلمة المرور مطلوبة' },
            len: { args: [6, 100], msg: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
          },
        },
        avatar_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM('retailer', 'supplier'),
          defaultValue: 'retailer',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        balance: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
        },
        last_login: {
          type: DataTypes.DATE,
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
        modelName: 'User',
        tableName: 'users',
        indexes: [{ unique: true, fields: ['phone'] }],
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      }
    );
  }
}

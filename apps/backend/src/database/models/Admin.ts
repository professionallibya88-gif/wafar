import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface AdminAttributes {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  password?: string; // Optional for selection responses
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface AdminCreationAttributes extends Optional<
  AdminAttributes,
  'id' | 'role' | 'is_active' | 'created_at' | 'updated_at'
> {
  password?: string;
}

export class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  declare id: string;
  declare full_name: string;
  declare email?: string;
  declare phone?: string;
  declare password: string;
  declare role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  declare is_active: boolean;
  declare last_login?: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date;

  declare save: (_options?: unknown) => Promise<this>;
  declare destroy: (_options?: unknown) => Promise<void>;

  static initModel(sequelize: Sequelize) {
    return Admin.init(
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
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: { name: 'email', msg: 'البريد الإلكتروني مسجل مسبقا' },
          validate: {
            isEmail: { msg: 'البريد الإلكتروني غير صالح' },
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
          unique: { name: 'phone', msg: 'رقم الهاتف مسجل مسبقا' },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'كلمة المرور مطلوبة' },
            len: { args: [6, 100], msg: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
          },
        },
        role: {
          type: DataTypes.ENUM('super_admin', 'admin', 'editor', 'viewer'),
          defaultValue: 'editor',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
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
        modelName: 'Admin',
        tableName: 'admins',
        indexes: [{ unique: true, fields: ['email'] }],
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        validate: {
          eitherEmailOrPhone() {
            if (!this.email && !this.phone) {
              throw new Error('يجب إدخال البريد الإلكتروني أو رقم الهاتف');
            }
          },
        },
      }
    );
  }
}

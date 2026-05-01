import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface PaymentAttributes {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method:
    | 'recharge_madar'
    | 'recharge_libyana'
    | 'bank_transfer'
    | 'money_transfer_sarad'
    | 'money_transfer_tadawul'
    | 'money_transfer_egypt'
    | 'money_transfer_other';
  payment_details?: any;
  status: 'pending' | 'approved' | 'rejected';
  subscription_id?: string;
  transaction_reference?: string;
  notes?: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes extends Optional<
  PaymentAttributes,
  'id' | 'currency' | 'status'
> {}

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: string;
  public user_id!: string;
  public amount!: number;
  public currency!: string;
  public payment_method!:
    | 'recharge_madar'
    | 'recharge_libyana'
    | 'bank_transfer'
    | 'money_transfer_sarad'
    | 'money_transfer_tadawul'
    | 'money_transfer_egypt'
    | 'money_transfer_other';
  public payment_details?: any;
  public status!: 'pending' | 'approved' | 'rejected';
  public subscription_id?: string;
  public transaction_reference?: string;
  public notes?: string;
  public admin_notes?: string;
  public reviewed_by?: string;
  public reviewed_at?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return Payment.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        currency: {
          type: DataTypes.STRING(10),
          defaultValue: 'LYD',
        },
        payment_method: {
          type: DataTypes.ENUM(
            'recharge_madar',
            'recharge_libyana',
            'bank_transfer',
            'money_transfer_sarad',
            'money_transfer_tadawul',
            'money_transfer_egypt',
            'money_transfer_other'
          ),
          allowNull: false,
        },
        payment_details: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected'),
          defaultValue: 'pending',
        },
        subscription_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'subscriptions', key: 'id' },
        },
        transaction_reference: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        admin_notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reviewed_by: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'admins', key: 'id' },
        },
        reviewed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Payment',
        tableName: 'payments',
        indexes: [
          { fields: ['status'] },
          { fields: ['payment_method'] },
          { fields: [{ name: 'created_at', order: 'DESC' }] },
        ],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SubscriptionAttributes {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'cancelled';
  auto_renew: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionCreationAttributes extends Optional<
  SubscriptionAttributes,
  'id' | 'status' | 'auto_renew'
> {}

export class Subscription
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes
{
  public id!: string;
  public user_id!: string;
  public plan_id!: string;
  public start_date!: Date;
  public end_date!: Date;
  public status!: 'active' | 'expired' | 'cancelled';
  public auto_renew!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return Subscription.init(
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
        plan_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'subscription_plans', key: 'id' },
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('active', 'expired', 'cancelled'),
          defaultValue: 'active',
        },
        auto_renew: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Subscription',
        tableName: 'subscriptions',
        indexes: [{ fields: ['status'] }, { fields: ['end_date'] }],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

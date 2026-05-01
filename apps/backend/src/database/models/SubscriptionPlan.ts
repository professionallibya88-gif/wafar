import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export type SubscriptionPlanType = 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
export type SubscriptionPlanRole = 'admin' | 'retailer' | 'supplier';

export interface SubscriptionPlanPermissions {
  compare_parts: boolean;
  export_results: boolean;
  upload_pdf: boolean;
  view_saved_searches: boolean;
  priority_support: boolean;
}

export interface SubscriptionPlanAttributes {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  plan_type: SubscriptionPlanType;
  color_hex: string;
  allowed_roles?: SubscriptionPlanRole[];
  permissions?: SubscriptionPlanPermissions;
  duration_days: number;
  price: number;
  currency: string;
  max_searches_per_day?: number;
  max_pdf_uploads?: number;
  can_compare: boolean;
  can_export: boolean;
  max_comparisons_per_day?: number;
  is_active: boolean;
  sort_order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionPlanCreationAttributes extends Optional<
  SubscriptionPlanAttributes,
  'id' | 'price' | 'currency' | 'can_compare' | 'can_export' | 'is_active' | 'sort_order'
> {}

export class SubscriptionPlan
  extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes>
  implements SubscriptionPlanAttributes
{
  public id!: string;
  public name!: string;
  public name_ar!: string;
  public description?: string;
  public plan_type!: SubscriptionPlanType;
  public color_hex!: string;
  public allowed_roles?: SubscriptionPlanRole[];
  public permissions?: SubscriptionPlanPermissions;
  public duration_days!: number;
  public price!: number;
  public currency!: string;
  public max_searches_per_day?: number;
  public max_pdf_uploads?: number;
  public can_compare!: boolean;
  public can_export!: boolean;
  public max_comparisons_per_day?: number;
  public is_active!: boolean;
  public sort_order!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return SubscriptionPlan.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        name_ar: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        plan_type: {
          type: DataTypes.ENUM('free', 'basic', 'professional', 'enterprise', 'custom'),
          allowNull: false,
          defaultValue: 'basic',
        },
        color_hex: {
          type: DataTypes.STRING(7),
          allowNull: false,
          defaultValue: '#2563EB',
        },
        allowed_roles: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: ['retailer', 'supplier'],
        },
        permissions: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {
            compare_parts: false,
            export_results: false,
            upload_pdf: true,
            view_saved_searches: true,
            priority_support: false,
          },
        },
        duration_days: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        currency: {
          type: DataTypes.STRING(10),
          defaultValue: 'LYD',
        },
        max_searches_per_day: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        max_pdf_uploads: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        can_compare: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        can_export: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        max_comparisons_per_day: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        sort_order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'SubscriptionPlan',
        tableName: 'subscription_plans',
        indexes: [{ fields: ['is_active'] }, { fields: ['sort_order'] }],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

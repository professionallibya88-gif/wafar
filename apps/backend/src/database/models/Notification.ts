import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface NotificationAttributes {
  id: string;
  user_id: string;
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'order'
    | 'payment'
    | 'subscription'
    | 'system'
    | 'message';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  read_at?: Date;
  action_url?: string;
  action_text?: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationCreationAttributes extends Optional<
  NotificationAttributes,
  'id' | 'type' | 'data' | 'is_read' | 'icon' | 'priority'
> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public user_id!: string;
  public type!:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'order'
    | 'payment'
    | 'subscription'
    | 'system'
    | 'message';
  public title!: string;
  public message!: string;
  public data?: any;
  public is_read!: boolean;
  public read_at?: Date;
  public action_url?: string;
  public action_text?: string;
  public icon!: string;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return Notification.init(
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
        type: {
          type: DataTypes.ENUM(
            'info',
            'success',
            'warning',
            'error',
            'order',
            'payment',
            'subscription',
            'system',
            'message'
          ),
          defaultValue: 'info',
        },
        title: {
          type: DataTypes.STRING(500),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'عنوان الإشعار مطلوب' },
          },
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'نص الإشعار مطلوب' },
          },
        },
        data: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
        is_read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        read_at: {
          type: DataTypes.DATE,
        },
        action_url: {
          type: DataTypes.STRING(500),
        },
        action_text: {
          type: DataTypes.STRING(100),
        },
        icon: {
          type: DataTypes.STRING(50),
          defaultValue: 'bell',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
          defaultValue: 'medium',
        },
      },
      {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        indexes: [
          { fields: ['is_read'] },
          { fields: [{ name: 'created_at', order: 'DESC' }] },
          {
            name: 'notifications_read_created_idx',
            fields: ['is_read', { name: 'created_at', order: 'DESC' }],
          },
          { fields: ['priority'] },
        ],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

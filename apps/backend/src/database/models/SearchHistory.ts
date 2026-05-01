import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface SearchHistoryAttributes {
  id: string;
  user_id: string;
  query: string;
  search_type: 'code' | 'name' | 'category' | 'advanced';
  filters?: any;
  results_count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchHistoryCreationAttributes extends Optional<
  SearchHistoryAttributes,
  'id' | 'search_type' | 'results_count'
> {}

export class SearchHistory
  extends Model<SearchHistoryAttributes, SearchHistoryCreationAttributes>
  implements SearchHistoryAttributes
{
  public id!: string;
  public user_id!: string;
  public query!: string;
  public search_type!: 'code' | 'name' | 'category' | 'advanced';
  public filters?: any;
  public results_count!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    return SearchHistory.init(
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
        query: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        search_type: {
          type: DataTypes.ENUM('code', 'name', 'category', 'advanced'),
          defaultValue: 'name',
        },
        filters: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        results_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'SearchHistory',
        tableName: 'search_histories',
        indexes: [
          { fields: ['query'] },
          { fields: [{ name: 'created_at', order: 'DESC' }] },
          {
            name: 'search_history_created_idx',
            fields: [{ name: 'created_at', order: 'DESC' }],
          },
        ],
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

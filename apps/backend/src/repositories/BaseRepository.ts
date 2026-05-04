import {
  Model,
  ModelStatic,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  CountOptions,
  WhereOptions,
  Transaction,
} from 'sequelize';
import { ValidationError } from '../errors';

export class BaseRepository<M extends Model> {
  protected model: ModelStatic<M>;

  constructor(model: ModelStatic<M>) {
    if (!model) {
      throw new ValidationError('BaseRepository requires a Sequelize model');
    }
    this.model = model;
  }

  async create(data: Record<string, unknown>, options?: CreateOptions): Promise<M> {
    return this.model.create(data as never, options);
  }

  async bulkCreate(data: Record<string, unknown>[], options?: CreateOptions): Promise<M[]> {
    return this.model.bulkCreate(data as never, options);
  }

  async findById(id: string | number, options?: FindOptions): Promise<M | null> {
    return this.model.findByPk(id, options);
  }

  async findOne(where: WhereOptions = {}, options?: FindOptions): Promise<M | null> {
    return this.model.findOne({ where, ...options });
  }

  async findAll(where: WhereOptions = {}, options?: FindOptions): Promise<M[]> {
    return this.model.findAll({ where, ...options });
  }

  async findAndCountAll(
    where: WhereOptions = {},
    options?: FindOptions
  ): Promise<{ rows: M[]; count: number }> {
    return this.model.findAndCountAll({ where, ...options });
  }

  async count(where: WhereOptions = {}, options?: CountOptions): Promise<number> {
    return this.model.count({ where, ...options });
  }

  async updateById(
    id: string | number,
    data: Record<string, unknown>,
    options?: Omit<UpdateOptions, 'where'>
  ): Promise<M | null> {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    await record.update(data as never, options);
    return record;
  }

  async updateWhere(
    where: WhereOptions,
    data: Record<string, unknown>,
    options?: UpdateOptions
  ): Promise<number> {
    const [affectedCount] = await this.model.update(data as never, { where, ...options });
    return affectedCount;
  }

  async deleteById(id: string | number): Promise<boolean> {
    const record = await this.model.findByPk(id);
    if (!record) return false;
    await record.destroy();
    return true;
  }

  async deleteWhere(where: WhereOptions, options?: DestroyOptions): Promise<number> {
    return this.model.destroy({ where, ...options });
  }

  async findOrCreate(
    where: WhereOptions,
    defaults: Record<string, unknown> = {}
  ): Promise<[M, boolean]> {
    return this.model.findOrCreate({ where, defaults: defaults as never });
  }

  async exists(where: WhereOptions): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async sum(field: string, where: WhereOptions = {}): Promise<number | null> {
    return this.model.sum(field, { where });
  }

  async transaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
    if (!this.model.sequelize) {
      throw new Error('Sequelize instance not found on model');
    }
    return this.model.sequelize.transaction(callback);
  }

  get sequelize() {
    return this.model.sequelize;
  }
}

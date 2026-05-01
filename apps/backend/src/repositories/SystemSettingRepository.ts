import { BaseRepository } from './BaseRepository';
import { SystemSetting, SystemSettingCreationAttributes } from '../database/models/SystemSetting';

export class SystemSettingRepository extends BaseRepository<SystemSetting> {
  constructor() {
    super(SystemSetting);
  }

  async getValueByKey(key: string, defaultValue: string | null = null): Promise<string | null> {
    const setting = await this.model.findOne({ where: { key } });
    return setting ? setting.value || null : defaultValue;
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    return this.model.findOne({ where: { key } });
  }

  async upsert(data: SystemSettingCreationAttributes): Promise<SystemSetting> {
    const [setting] = await this.model.upsert(data);
    return setting;
  }

  async destroyAll(): Promise<number> {
    return this.model.destroy({ where: {}, truncate: true });
  }

  async bulkCreate(data: SystemSettingCreationAttributes[]): Promise<SystemSetting[]> {
    return this.model.bulkCreate(data);
  }
}

export const systemSettingRepository = new SystemSettingRepository();

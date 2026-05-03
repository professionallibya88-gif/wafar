import { sequelize } from '../database';

class SystemRepository {
  async checkDatabaseConnection(): Promise<void> {
    await sequelize.authenticate();
  }
}

export const systemRepository = new SystemRepository();

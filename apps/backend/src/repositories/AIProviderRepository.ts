import { BaseRepository } from './BaseRepository';
import { AIProvider } from '../database/models/AIProvider';
export class AIProviderRepository extends BaseRepository<AIProvider> {
  constructor() {
    super(AIProvider);
  }

  async findEnabled(orderByPriority = true): Promise<AIProvider[]> {
    if (orderByPriority) {
      return this.model.findAll({
        where: { enabled: true },
        order: [['priority', 'ASC']],
      });
    }
    return this.model.findAll({ where: { enabled: true } });
  }

  async findByType(providerType: string): Promise<AIProvider[]> {
    return this.model.findAll({
      where: { provider_type: providerType, enabled: true },
      order: [['priority', 'ASC']],
    });
  }

  async findByIdWithDetails(id: string): Promise<AIProvider | null> {
    return this.model.findByPk(id);
  }

  async updateHealthStatus(
    id: string,
    status: string,
    failureCount?: number,
    successCount?: number
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      last_health_check_at: new Date(),
      last_health_status: status,
    };
    if (typeof failureCount === 'number') {
      updateData.failure_count = failureCount;
    }
    if (typeof successCount === 'number') {
      updateData.success_count = successCount;
    }
    await this.model.update(updateData, { where: { id } });
  }

  async incrementCounters(id: string, isSuccess: boolean): Promise<void> {
    const provider = await this.findById(id);
    if (!provider) return;
    if (isSuccess) {
      await provider.increment('success_count');
    } else {
      await provider.increment('failure_count');
    }
  }

  async getStats(): Promise<unknown> {
    const total = await this.model.count();
    const enabled = await this.model.count({ where: { enabled: true } });
    const byType = await this.model.sequelize?.query(
      `SELECT provider_type, COUNT(*) as count FROM ai_providers GROUP BY provider_type`,
      { type: 'SELECT' }
    );
    return { total, enabled, byType: byType || [] };
  }
}

export const aiProviderRepository = new AIProviderRepository();

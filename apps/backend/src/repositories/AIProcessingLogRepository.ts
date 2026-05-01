import { BaseRepository } from './BaseRepository';
import { AIProcessingLog } from '../database/models/AIProcessingLog';
import { WhereOptions } from 'sequelize';

export class AIProcessingLogRepository extends BaseRepository<AIProcessingLog> {
  constructor() {
    super(AIProcessingLog);
  }

  async findByProvider(
    providerId: string,
    limit = 50,
    offset = 0
  ): Promise<{ rows: AIProcessingLog[]; count: number }> {
    return this.model.findAndCountAll({
      where: { ai_provider_id: providerId } as WhereOptions,
      order: [['created_at', 'DESC']] as [string, string][],
      limit,
      offset,
    });
  }

  async findByPDFFile(pdfFileId: string): Promise<AIProcessingLog[]> {
    return this.model.findAll({
      where: { pdf_file_id: pdfFileId } as WhereOptions,
      order: [['created_at', 'DESC']] as [string, string][],
    });
  }

  async findByStatus(status: string, limit = 100): Promise<AIProcessingLog[]> {
    return this.model.findAll({
      where: { status } as WhereOptions,
      order: [['created_at', 'DESC']] as [string, string][],
      limit,
    });
  }

  async getStatsByProvider(): Promise<unknown> {
    const sequelize = this.model.sequelize;
    if (!sequelize) return [];

    const results = await sequelize.query(
      `SELECT
        provider_type,
        model,
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failure_count,
        AVG(latency_ms) as avg_latency_ms,
        SUM(estimated_cost) as total_cost,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens
      FROM ai_processing_logs
      GROUP BY provider_type, model
      ORDER BY total_requests DESC`,
      { type: 'SELECT' }
    );
    return results || [];
  }

  async getDailyStats(days = 7): Promise<unknown> {
    const sequelize = this.model.sequelize;
    if (!sequelize) return [];

    const results = await sequelize.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
        SUM(estimated_cost) as total_cost,
        AVG(latency_ms) as avg_latency
      FROM ai_processing_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC`,
      { type: 'SELECT' }
    );
    return results || [];
  }

  async getTotalCost(): Promise<number> {
    const result = await this.model.sum('estimated_cost');
    return (result as number) || 0;
  }
}

export const aiProcessingLogRepository = new AIProcessingLogRepository();

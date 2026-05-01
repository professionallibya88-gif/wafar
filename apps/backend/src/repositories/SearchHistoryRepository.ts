import { BaseRepository } from './BaseRepository';
import { SearchHistory } from '../database/models/SearchHistory';

export class SearchHistoryRepository extends BaseRepository<SearchHistory> {
  constructor() {
    super(SearchHistory);
  }

  async findByUserWithPagination(options: {
    userId: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: SearchHistory[]; count: number }> {
    const { userId, limit, offset } = options;
    return this.model.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }
}

export const searchHistoryRepository = new SearchHistoryRepository();

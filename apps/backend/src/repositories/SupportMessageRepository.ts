import { BaseRepository } from './BaseRepository';
import { SupportMessage } from '../database/models';

export class SupportMessageRepository extends BaseRepository<SupportMessage> {
  constructor() {
    super(SupportMessage);
  }

  async findByTicketId(ticket_id: string) {
    return this.findAndCountAll({
      where: { ticket_id },
      order: [['created_at', 'ASC']],
    });
  }
}

export const supportMessageRepository = new SupportMessageRepository();

import { BaseRepository } from './BaseRepository';
import { SupportTicket, SupportMessage, User } from '../database/models';

export class SupportTicketRepository extends BaseRepository<SupportTicket> {
  constructor() {
    super(SupportTicket);
  }

  async findAllWithDetails(options: any = {}) {
    const { status, user_id, limit, offset, order } = options;
    const where: any = {};

    if (status) where.status = status;
    if (user_id) where.user_id = user_id;

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: order || [['updated_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'phone'] }],
    });
  }

  async findByIdWithMessages(id: string) {
    return this.findOne(
      { id },
      {
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name', 'phone'] },
          {
            model: SupportMessage,
            as: 'messages',
            order: [['created_at', 'ASC']],
          },
        ],
      }
    );
  }
}

export const supportTicketRepository = new SupportTicketRepository();

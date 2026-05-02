import { BaseRepository } from './BaseRepository';
import { SupportTicket, SupportMessage, User } from '../database/models';
import { Op } from 'sequelize';

export class SupportTicketRepository extends BaseRepository<SupportTicket> {
  constructor() {
    super(SupportTicket);
  }

  async findAllWithDetails(options: any = {}) {
    const { status, user_id, search, limit, offset, order } = options;
    const where: any = {};

    if (status) where.status = status;
    if (user_id) where.user_id = user_id;

    if (search) {
      where[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { '$user.full_name$': { [Op.iLike]: `%${search}%` } },
        { '$user.phone$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    return this.findAndCountAll(where, {
      limit,
      offset,
      order: order || [['updated_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'phone', 'role'] }],
    });
  }

  async findByIdWithMessages(id: string) {
    return this.findOne(
      { id },
      {
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name', 'phone'] },
          { model: SupportMessage, as: 'messages' },
        ],
        order: [[{ model: SupportMessage, as: 'messages' }, 'created_at', 'ASC']],
      }
    );
  }
}

export const supportTicketRepository = new SupportTicketRepository();

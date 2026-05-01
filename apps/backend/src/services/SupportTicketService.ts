import { supportTicketRepository, supportMessageRepository } from '../repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors';

export class SupportTicketService {
  async getUserTickets(user_id: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const options = {
      user_id,
      status: query.status,
      limit,
      offset,
    };

    return supportTicketRepository.findAllWithDetails(options);
  }

  async getAdminTickets(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const options = {
      status: query.status,
      user_id: query.user_id,
      limit,
      offset,
    };

    return supportTicketRepository.findAllWithDetails(options);
  }

  async getTicketDetails(ticket_id: string, user_id?: string, isAdmin: boolean = false) {
    const ticket = await supportTicketRepository.findByIdWithMessages(ticket_id);

    if (!ticket) {
      throw new NotFoundError('التذكرة غير موجودة');
    }

    if (!isAdmin && ticket.user_id !== user_id) {
      throw new ForbiddenError('لا تملك صلاحية لعرض هذه التذكرة');
    }

    return ticket;
  }

  async createTicket(user_id: string, subject: string, messageContent: string) {
    if (!subject || !messageContent) {
      throw new ValidationError('موضوع التذكرة ومحتوى الرسالة مطلوبان');
    }

    const ticket = await supportTicketRepository.create({
      user_id,
      subject,
      status: 'open',
    });

    const message = await supportMessageRepository.create({
      ticket_id: ticket.id,
      sender_id: user_id,
      sender_type: 'user',
      content: messageContent,
    });

    return {
      ...ticket.toJSON(),
      messages: [message.toJSON()],
    };
  }

  async addReply(
    ticket_id: string,
    sender_id: string,
    sender_type: 'user' | 'admin',
    content: string
  ) {
    if (!content) {
      throw new ValidationError('محتوى الرسالة مطلوب');
    }

    const ticket = await supportTicketRepository.findById(ticket_id);
    if (!ticket) {
      throw new NotFoundError('التذكرة غير موجودة');
    }

    if (sender_type === 'user' && ticket.user_id !== sender_id) {
      throw new ForbiddenError('لا تملك صلاحية للرد على هذه التذكرة');
    }

    if (ticket.status === 'closed') {
      throw new ValidationError('لا يمكن الرد على تذكرة مغلقة');
    }

    const message = await supportMessageRepository.create({
      ticket_id,
      sender_id,
      sender_type,
      content,
    });

    // Update ticket updated_at by performing a dummy update or status change if needed
    await supportTicketRepository.updateById(ticket_id, {
      status: sender_type === 'admin' ? 'resolved' : 'open',
    });

    return message;
  }

  async updateTicketStatus(ticket_id: string, status: 'open' | 'closed' | 'resolved') {
    const ticket = await supportTicketRepository.findById(ticket_id);
    if (!ticket) {
      throw new NotFoundError('التذكرة غير موجودة');
    }

    await supportTicketRepository.updateById(ticket_id, { status });

    return supportTicketRepository.findById(ticket_id);
  }
}

export const supportTicketService = new SupportTicketService();

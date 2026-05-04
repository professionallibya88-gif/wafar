import { supportTicketRepository, supportMessageRepository } from '../repositories';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors';
import { NotificationHelper } from './NotificationHelper';
import { getIO } from '../socket';
import logger from '../config/logger';

type SupportTicketQuery = {
  page?: string;
  limit?: string;
  status?: string;
  user_id?: string;
  search?: string;
};

export class SupportTicketService {
  async getUserTickets(user_id: string, query: SupportTicketQuery) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const options = {
      user_id,
      status: typeof query.status === 'string' ? query.status : undefined,
      limit,
      offset,
    };

    return supportTicketRepository.findAllWithDetails(options);
  }

  async getAdminTickets(query: SupportTicketQuery) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const options = {
      status: typeof query.status === 'string' ? query.status : undefined,
      user_id: typeof query.user_id === 'string' ? query.user_id : undefined,
      search: typeof query.search === 'string' ? query.search : undefined,
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

    const fullTicket = {
      ...ticket.toJSON(),
      messages: [message.toJSON()],
    };

    // إرسال إشعار للمشرفين
    try {
      getIO().to('admins').emit('new_ticket', fullTicket);
    } catch (err) {
      logger.error('Socket error:', err instanceof Error ? err.message : String(err));
    }

    return fullTicket;
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

    const newStatus = sender_type === 'admin' ? 'open' : 'open';

    // Update ticket updated_at by performing a dummy update or status change if needed
    await supportTicketRepository.updateById(ticket_id, {
      status: newStatus,
    });

    // Notify user if admin replied
    if (sender_type === 'admin') {
      await NotificationHelper.sendTicketReplyNotification(
        ticket.user_id,
        ticket.id,
        ticket.subject
      );
    }

    // إرسال إشعار لحظي عبر WebSocket
    try {
      const io = getIO();
      const messageData = message.toJSON();

      if (sender_type === 'admin') {
        io.to(`user_${ticket.user_id}`).emit('ticket_reply', messageData);
      } else {
        io.to('admins').emit('ticket_reply', messageData);
      }
    } catch (err) {
      logger.error('Socket error:', err instanceof Error ? err.message : String(err));
    }

    return message;
  }

  async updateTicketStatus(ticket_id: string, status: 'open' | 'closed' | 'resolved') {
    const ticket = await supportTicketRepository.findById(ticket_id);
    if (!ticket) {
      throw new NotFoundError('التذكرة غير موجودة');
    }

    if (ticket.status !== status) {
      await supportTicketRepository.updateById(ticket_id, { status });
      await NotificationHelper.sendTicketStatusNotification(
        ticket.user_id,
        ticket.id,
        ticket.subject,
        status
      );

      // إرسال إشعار لحظي عبر WebSocket
      try {
        getIO().to(`user_${ticket.user_id}`).emit('ticket_status_changed', {
          ticket_id,
          status,
        });
        getIO().to('admins').emit('ticket_status_changed', {
          ticket_id,
          status,
        });
      } catch (err) {
        logger.error('Socket error:', err instanceof Error ? err.message : String(err));
      }
    }

    return supportTicketRepository.findById(ticket_id);
  }
}

export const supportTicketService = new SupportTicketService();

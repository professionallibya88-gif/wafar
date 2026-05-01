import { BaseRepository } from './BaseRepository';
import { Notification, NotificationAttributes } from '../database/models/Notification';

export type NotificationRecord = Notification;
export { NotificationAttributes };

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(Notification);
  }

  async findByUser(
    userId: string,
    filters: {
      is_read?: boolean;
      type?: string;
      priority?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    const { is_read, type, priority, limit = 20, offset = 0 } = filters;

    const where: any = { user_id: userId };
    if (is_read !== undefined) where.is_read = is_read;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    return this.model.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.count({ where: { user_id: userId, is_read: false } });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Notification | null> {
    return this.model.findOne({ where: { id, user_id: userId } });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const [affected] = await this.model.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );
    return affected;
  }

  async deleteReadByUser(userId: string): Promise<number> {
    return this.model.destroy({ where: { user_id: userId, is_read: true } });
  }
}

export const notificationRepository = new NotificationRepository();

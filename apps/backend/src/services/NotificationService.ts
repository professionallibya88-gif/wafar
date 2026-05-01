import {
  notificationRepository,
  userRepository,
  NotificationRecord,
  NotificationAttributes,
} from '../repositories';
import { NotFoundError } from '../errors';

type NotificationType = NotificationAttributes['type'];
type NotificationPriority = NotificationAttributes['priority'];

interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
  action_url?: string;
  action_text?: string;
  icon?: string;
  priority?: NotificationPriority;
}

interface NotificationFilters {
  is_read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

type NotificationOptions = Omit<NotificationPayload, 'user_id' | 'title' | 'message'>;

/**
 * خدمة الإشعارات
 * تعتمد على Repositories وترمي AppError عند الحاجة
 * مُصدَّرة كـ instance للسماح بالاستخدام كدوال ثابتة من الخارج
 */
class NotificationService {
  /**
   * إنشاء إشعار جديد
   */
  async createNotification(data: NotificationPayload): Promise<NotificationRecord> {
    return notificationRepository.create({
      user_id: data.user_id,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      data: data.data || {},
      action_url: data.action_url,
      action_text: data.action_text,
      icon: data.icon || 'bell',
      priority: data.priority || 'medium',
    });
  }

  /**
   * إشعار مستخدم واحد
   */
  async notifyUser(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: NotificationOptions = {}
  ): Promise<NotificationRecord> {
    return this.createNotification({ user_id: userId, type, title, message, ...options });
  }

  /**
   * قائمة إشعارات المستخدم مع فلاتر
   */
  async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<NotificationRecord[]> {
    return notificationRepository.findByUser(userId, filters);
  }

  /**
   * عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }

  /**
   * تعليم إشعار كمقروء
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationRecord> {
    const notification = await notificationRepository.findByIdAndUser(notificationId, userId);
    if (!notification) throw new NotFoundError('الإشعار غير موجود');
    const updatedNotification = await notificationRepository.updateById(notification.id, {
      is_read: true,
      read_at: new Date(),
    });
    if (!updatedNotification) throw new NotFoundError('الإشعار غير موجود');
    return updatedNotification;
  }

  /**
   * تعليم جميع إشعارات المستخدم كمقروءة
   */
  async markAllAsRead(userId: string): Promise<number> {
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const notification = await notificationRepository.findByIdAndUser(notificationId, userId);
    if (!notification) throw new NotFoundError('الإشعار غير موجود');
    await notificationRepository.deleteById(notification.id);
    return true;
  }

  /**
   * حذف الإشعارات المقروءة للمستخدم
   */
  async deleteReadNotifications(userId: string): Promise<number> {
    return notificationRepository.deleteReadByUser(userId);
  }

  /**
   * جلب إشعار محدد
   */
  async getNotificationById(notificationId: string, userId: string): Promise<NotificationRecord> {
    const notification = await notificationRepository.findByIdAndUser(notificationId, userId);
    if (!notification) throw new NotFoundError('الإشعار غير موجود');
    return notification;
  }

  /**
   * إرسال إشعار لجميع المستخدمين النشطين
   */
  async notifyAllUsers(
    title: string,
    message: string,
    options: NotificationOptions = {}
  ): Promise<NotificationRecord[]> {
    const users = await userRepository.findAllActive();
    return Promise.all(
      users.map((user) =>
        this.createNotification({
          user_id: user.id,
          type: options.type || 'system',
          title,
          message,
          ...options,
        })
      )
    );
  }

  /**
   * إرسال إشعار لمجموعة مستخدمين
   */
  async notifyMultipleUsers(
    userIds: string[],
    title: string,
    message: string,
    options: NotificationOptions = {}
  ): Promise<NotificationRecord[]> {
    return Promise.all(
      userIds.map((userId) =>
        this.createNotification({
          user_id: userId,
          type: options.type || 'system',
          title,
          message,
          ...options,
        })
      )
    );
  }
}

export const notificationService = new NotificationService();

import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/ApiResponse';
import { notificationService } from '../services/NotificationService';
import { AuthenticatedRequest } from '../types';

const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const parseStringQuery = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value : undefined;
};

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const notifications = await notificationService.getUserNotifications(userId, {
    is_read: parseBooleanQuery(req.query.is_read),
    type: parseStringQuery(req.query.type) as
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
      | 'order'
      | 'payment'
      | 'subscription'
      | 'system'
      | 'message'
      | undefined,
    priority: parseStringQuery(req.query.priority) as
      | 'low'
      | 'medium'
      | 'high'
      | 'urgent'
      | undefined,
    limit: parseInt(String(req.query.limit), 10) || 20,
    offset: parseInt(String(req.query.offset), 10) || 0,
  });
  return success(res, { data: notifications });
});

export const unreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.id);
  return success(res, { data: { count } });
});

export const getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notificationId = req.params.id as string;
  const notification = await notificationService.getNotificationById(notificationId, req.user!.id);
  return success(res, { data: notification });
});

export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notificationId = req.params.id as string;
  const notification = await notificationService.markAsRead(notificationId, req.user!.id);
  return success(res, { data: notification, message: 'تم تعليم الإشعار كمقروء' });
});

export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const count = await notificationService.markAllAsRead(req.user!.id);
  return success(res, { data: { count }, message: `تم تعليم ${count} إشعار كمقروء` });
});

export const deleteById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notificationId = req.params.id as string;
  await notificationService.deleteNotification(notificationId, req.user!.id);
  return success(res, { message: 'تم حذف الإشعار بنجاح' });
});

export const deleteRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const count = await notificationService.deleteReadNotifications(req.user!.id);
  return success(res, { data: { count }, message: `تم حذف ${count} إشعار مقروء` });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await notificationService.createNotification(req.body);
  return created(res, { data: notification, message: 'تم إنشاء الإشعار بنجاح' });
});

export const broadcast = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, message, ...options } = req.body;
  const notifications = await notificationService.notifyAllUsers(title, message, options);
  return created(res, {
    data: notifications,
    message: `تم إرسال الإشعار لـ ${notifications.length} مستخدم`,
  });
});

export const batch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { user_ids, title, message, ...options } = req.body;
  const notifications = await notificationService.notifyMultipleUsers(
    user_ids,
    title,
    message,
    options
  );
  return created(res, {
    data: notifications,
    message: `تم إرسال الإشعار لـ ${notifications.length} مستخدم`,
  });
});

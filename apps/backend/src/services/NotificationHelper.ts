import { notificationService } from './NotificationService';
import logger from '../config/logger';
import { adminRepository } from '../repositories/AdminRepository';
import type { NotificationAttributes } from '../repositories/NotificationRepository';

export class NotificationHelper {
  static async sendWelcomeNotification(userId: string, userName: string): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'success',
        'مرحباً بك في منصة وفر',
        `أهلاً بك ${userName}، نحن سعداء بانضمامك إلينا. ابدأ باستكشاف المنصة الآن.`,
        {
          icon: 'sparkles',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send welcome notification:', error);
    }
  }

  static async sendLoginNotification(userId: string, deviceInfo: any = {}): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'info',
        'تم تسجيل الدخول بنجاح',
        `تم تسجيل الدخول إلى حسابك من جهاز جديد.`,
        {
          data: deviceInfo,
          icon: 'lock-closed',
          priority: 'low',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send login notification:', error);
    }
  }

  static async sendSubscriptionCreatedNotification(
    userId: string,
    planName: string,
    expiryDate: string
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'success',
        'تم تفعيل اشتراكك بنجاح',
        `تم تفعيل اشتراك ${planName} بنجاح. ينتهي اشتراكك في ${expiryDate}.`,
        {
          action_url: '/subscriptions',
          action_text: 'عرض الاشتراك',
          icon: 'check-circle',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send subscription notification:', error);
    }
  }

  static async sendSubscriptionExpiringNotification(
    userId: string,
    planName: string,
    daysLeft: number
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'warning',
        'اشتراكك قارب على الانتهاء',
        `اشتراك ${planName} سينتهي خلال ${daysLeft} يوم. قم بتجديده لتجنب انقطاع الخدمة.`,
        {
          action_url: '/subscriptions',
          action_text: 'تجديد الاشتراك',
          icon: 'exclamation-triangle',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send subscription expiring notification:', error);
    }
  }

  static async sendSubscriptionExpiredNotification(
    userId: string,
    planName: string
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'error',
        'انتهى اشتراكك',
        `اشتراك ${planName} قد انتهى. قم بتجديده للاستمرار في الاستفادة من الخدمة.`,
        {
          action_url: '/subscriptions',
          action_text: 'تجديد الاشتراك',
          icon: 'exclamation-circle',
          priority: 'urgent',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send subscription expired notification:', error);
    }
  }

  static async sendPaymentCreatedNotification(
    userId: string,
    amount: number,
    paymentMethod: string
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'info',
        'تم استلام طلب دفع جديد',
        `تم استلام طلب دفع بقيمة ${amount} ريال عبر ${paymentMethod}. جاري مراجعة الطلب.`,
        {
          action_url: '/payments',
          action_text: 'عرض المدفوعات',
          icon: 'credit-card',
          priority: 'medium',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send payment notification:', error);
    }
  }

  static async sendPaymentApprovedNotification(userId: string, amount: number): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'success',
        'تم قبول دفعتك',
        `تم قبول دفعتك بقيمة ${amount} ريال وإضافتها إلى رصيدك.`,
        {
          action_url: '/payments',
          action_text: 'عرض المدفوعات',
          icon: 'check-circle',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send payment approved notification:', error);
    }
  }

  static async sendPaymentRejectedNotification(userId: string, reason: string): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'error',
        'تم رفض دفعتك',
        `تم رفض دفعتك للسبب التالي: ${reason}. يرجى المحاولة مرة أخرى.`,
        {
          action_url: '/payments',
          action_text: 'عرض المدفوعات',
          icon: 'x-circle',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send payment rejected notification:', error);
    }
  }

  static async sendPDFUploadedNotification(userId: string, fileName: string): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'success',
        'تم رفع الملف بنجاح',
        `تم رفع ملف ${fileName} بنجاح. جاري معالجته.`,
        {
          action_url: '/files',
          action_text: 'عرض الملفات',
          icon: 'document-arrow-up',
          priority: 'medium',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send PDF uploaded notification:', error);
    }
  }

  static async sendPDFProcessedNotification(
    userId: string,
    fileName: string,
    partsCount: number
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'success',
        'اكتملت معالجة الملف',
        `تم معالجة ملف ${fileName} بنجاح. تم استخراج ${partsCount} قطعة.`,
        {
          action_url: '/files',
          action_text: 'عرض الملف',
          icon: 'check-circle',
          priority: 'medium',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send PDF processed notification:', error);
    }
  }

  static async sendPDFProcessingFailedNotification(
    userId: string,
    fileName: string,
    error: string
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'error',
        'فشلت معالجة الملف',
        `فشلت معالجة ملف ${fileName}. الخطأ: ${error}`,
        {
          action_url: '/files',
          action_text: 'إعادة المحاولة',
          icon: 'x-circle',
          priority: 'high',
        }
      );
    } catch (err: any) {
      logger.error('Failed to send PDF processing failed notification:', err);
    }
  }

  static async sendProfileUpdatedNotification(userId: string): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'success',
        'تم تحديث الملف الشخصي',
        'تم تحديث معلومات ملفك الشخصي بنجاح.',
        {
          action_url: '/profile',
          action_text: 'عرض الملف',
          icon: 'user',
          priority: 'low',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send profile updated notification:', error);
    }
  }

  static async sendPasswordChangedNotification(userId: string): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'info',
        'تم تغيير كلمة المرور',
        'تم تغيير كلمة المرور بنجاح. إذا لم تقم بهذا الإجراء، يرجى التواصل مع الدعم فوراً.',
        {
          icon: 'key',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send password changed notification:', error);
    }
  }

  static async sendTicketReplyNotification(
    userId: string,
    ticketId: string,
    subject: string
  ): Promise<void> {
    try {
      await notificationService.notifyUser(
        userId,
        'info',
        'رد جديد على تذكرتك',
        `قام فريق الدعم الفني بالرد على تذكرتك: "${subject}".`,
        {
          action_url: `/support?ticket=${ticketId}`,
          action_text: 'عرض التذكرة',
          icon: 'chat-bubble-left-right',
          priority: 'high',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send ticket reply notification:', error);
    }
  }

  static async sendTicketStatusNotification(
    userId: string,
    ticketId: string,
    subject: string,
    newStatus: string
  ): Promise<void> {
    try {
      const statusMap: Record<string, string> = {
        open: 'مفتوحة',
        resolved: 'تم الحل',
        closed: 'مغلقة',
      };
      const statusAr = statusMap[newStatus] || newStatus;

      await notificationService.notifyUser(
        userId,
        'info',
        'تحديث حالة التذكرة',
        `تم تغيير حالة تذكرتك "${subject}" إلى: ${statusAr}.`,
        {
          action_url: `/support?ticket=${ticketId}`,
          action_text: 'عرض التذكرة',
          icon: 'ticket',
          priority: 'medium',
        }
      );
    } catch (error: any) {
      logger.error('Failed to send ticket status notification:', error);
    }
  }

  static async sendSystemNotification(
    title: string,
    message: string,
    priority: NotificationAttributes['priority'] = 'medium'
  ): Promise<void> {
    try {
      const admins = await adminRepository.findAllActive();

      // Assuming notificationService currently works with users,
      // in a real-world scenario, you might need a separate admin notification table.
      // But for now, we'll use the existing one to not break the schema.
      await Promise.all(
        admins.map((admin: any) =>
          notificationService.notifyUser(admin.id, 'system', title, message, { priority })
        )
      );
    } catch (error: any) {
      logger.error('Failed to send system notification:', error);
    }
  }

  static async sendSystemErrorNotification(error: string, _details: any = {}): Promise<void> {
    try {
      await this.sendSystemNotification('خطأ في النظام', `حدث خطأ في النظام: ${error}`, 'urgent');
    } catch (err: any) {
      logger.error('Failed to send system error notification:', err);
    }
  }
}

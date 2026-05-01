// نقطة تصدير موحدة للمستودعات بصيغة TypeScript

import { userRepository } from './UserRepository';
import { adminRepository } from './AdminRepository';
import { supplierRepository, SupplierRecord, SupplierAttributes } from './SupplierRepository';
import { pdfFileRepository } from './PDFFileRepository';
import {
  partRepository,
  PartRecord,
  PartAttributes,
  PartCreationAttributes,
} from './PartRepository';
import { paymentRepository } from './PaymentRepository';
import { subscriptionRepository } from './SubscriptionRepository';
import { subscriptionPlanRepository } from './SubscriptionPlanRepository';
import { searchHistoryRepository } from './SearchHistoryRepository';
import {
  notificationRepository,
  NotificationRecord,
  NotificationAttributes,
} from './NotificationRepository';
import { systemSettingRepository } from './SystemSettingRepository';
import { aiProviderRepository } from './AIProviderRepository';
import { aiProcessingLogRepository } from './AIProcessingLogRepository';
import { supportChannelRepository } from './SupportChannelRepository';
import { supportTicketRepository } from './SupportTicketRepository';
import { supportMessageRepository } from './SupportMessageRepository';

export {
  userRepository,
  adminRepository,
  supplierRepository,
  SupplierRecord,
  SupplierAttributes,
  pdfFileRepository,
  partRepository,
  PartRecord,
  PartAttributes,
  PartCreationAttributes,
  paymentRepository,
  subscriptionRepository,
  subscriptionPlanRepository,
  searchHistoryRepository,
  notificationRepository,
  NotificationRecord,
  NotificationAttributes,
  systemSettingRepository,
  aiProviderRepository,
  aiProcessingLogRepository,
  supportChannelRepository,
  supportTicketRepository,
  supportMessageRepository,
};

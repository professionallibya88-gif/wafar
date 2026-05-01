import { sequelize } from '../index';
import { User } from './User';
import { Admin } from './Admin';
import { Supplier } from './Supplier';
import { PDFFile } from './PDFFile';
import { Part } from './Part';
import { Notification } from './Notification';
import { SubscriptionPlan } from './SubscriptionPlan';
import { Subscription } from './Subscription';
import { Payment } from './Payment';
import { SearchHistory } from './SearchHistory';
import { SystemSetting } from './SystemSetting';
import { AIProvider } from './AIProvider';
import { AIProcessingLog } from './AIProcessingLog';
import { SupportChannel } from './SupportChannel';
import { SupportTicket } from './SupportTicket';
import { SupportMessage } from './SupportMessage';

// تهيئة النماذج أولاً
User.initModel(sequelize);
Admin.initModel(sequelize);
Supplier.initModel(sequelize);
PDFFile.initModel(sequelize);
Part.initModel(sequelize);
Notification.initModel(sequelize);
SubscriptionPlan.initModel(sequelize);
Subscription.initModel(sequelize);
Payment.initModel(sequelize);
SearchHistory.initModel(sequelize);
SystemSetting.initModel(sequelize);
AIProvider.initModel(sequelize);
AIProcessingLog.initModel(sequelize);
SupportChannel.initModel(sequelize);
SupportTicket.initModel(sequelize);
SupportMessage.initModel(sequelize);

// إعداد العلاقات (Relationships)
// User -> PDFFile
User.hasMany(PDFFile, { foreignKey: 'user_id', as: 'pdfFiles' });
PDFFile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> SearchHistory
User.hasMany(SearchHistory, { foreignKey: 'user_id', as: 'searchHistories' });
SearchHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Subscription
User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Payment
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Supplier
User.hasOne(Supplier, { foreignKey: 'user_id', as: 'supplier' });
Supplier.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Supplier -> PDFFile
Supplier.hasMany(PDFFile, { foreignKey: 'supplier_id', as: 'pdfFiles' });
PDFFile.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// Supplier -> Part
Supplier.hasMany(Part, { foreignKey: 'supplier_id', as: 'parts' });
Part.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// PDFFile -> Part
PDFFile.hasMany(Part, { foreignKey: 'pdf_file_id', as: 'parts' });
Part.belongsTo(PDFFile, { foreignKey: 'pdf_file_id', as: 'pdfFile' });

// SubscriptionPlan -> Subscription
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'plan_id', as: 'subscriptions' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id', as: 'plan' });

// Subscription -> Payment
Subscription.hasMany(Payment, { foreignKey: 'subscription_id', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// Payment -> Admin (reviewer)
Payment.belongsTo(Admin, { foreignKey: 'reviewed_by', as: 'reviewer' });
Admin.hasMany(Payment, { foreignKey: 'reviewed_by', as: 'reviewedPayments' });

// User -> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// SupportTicket -> User
User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'supportTickets' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// SupportMessage -> SupportTicket
SupportTicket.hasMany(SupportMessage, { foreignKey: 'ticket_id', as: 'messages' });
SupportMessage.belongsTo(SupportTicket, { foreignKey: 'ticket_id', as: 'ticket' });

export {
  User,
  Admin,
  Supplier,
  PDFFile,
  Part,
  SubscriptionPlan,
  Subscription,
  Payment,
  SearchHistory,
  SystemSetting,
  Notification,
  AIProvider,
  AIProcessingLog,
  SupportChannel,
  SupportTicket,
  SupportMessage,
};

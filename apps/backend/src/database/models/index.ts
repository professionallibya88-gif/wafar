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
import { ActivityLog } from './ActivityLog';
import { Cart } from './Cart';
import { CartItem } from './CartItem';
import { Order } from './Order';
import { OrderItem } from './OrderItem';

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
ActivityLog.initModel(sequelize);
Cart.initModel(sequelize);
CartItem.initModel(sequelize);
Order.initModel(sequelize);
OrderItem.initModel(sequelize);

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

// Cart Relationships
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

Part.hasMany(CartItem, { foreignKey: 'part_id', as: 'cartItems' });
CartItem.belongsTo(Part, { foreignKey: 'part_id', as: 'part' });

// Order Relationships
User.hasMany(Order, { foreignKey: 'retailer_id', as: 'retailerOrders' });
Order.belongsTo(User, { foreignKey: 'retailer_id', as: 'retailer' });

Supplier.hasMany(Order, { foreignKey: 'supplier_id', as: 'supplierOrders' });
Order.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Part.hasMany(OrderItem, { foreignKey: 'part_id', as: 'orderItems' });
OrderItem.belongsTo(Part, { foreignKey: 'part_id', as: 'part' });

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
  ActivityLog,
  Cart,
  CartItem,
  Order,
  OrderItem,
  sequelize,
};

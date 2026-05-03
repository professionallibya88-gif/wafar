/**
 * نقطة تصدير موحدة لجميع قواعد التحقق
 */
import * as admin from './adminValidator';
import * as supplier from './supplierValidator';
import * as pdf from './pdfValidator';
import * as search from './searchValidator';
import * as notification from './notificationValidator';
import * as payment from './paymentValidator';
import * as user from './userValidator';
import * as auth from './authValidator';
import * as cart from './cartValidator';
import * as settings from './settingsValidator';
import * as aiProvider from './aiProviderValidator';

export {
  admin,
  supplier,
  pdf,
  search,
  notification,
  payment,
  user,
  auth,
  cart,
  settings,
  aiProvider,
};

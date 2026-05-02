// إعادة تصدير موحد (للحفاظ على التوافق مع الاستيرادات القديمة)
// الملفات الحقيقية الآن تحت services/api/*.js
import http from "./http";

export {
  authAPI,
  adminAuthAPI,
  userAPI,
  pdfAPI,
  searchAPI,
  subscriptionAPI,
  paymentAPI,
  supplierAPI,
  adminAPI,
  settingsAPI,
  processingAPI,
  notificationAPI,
  aiProviderAPI,
  supportAPI,
  cartAPI,
  orderAPI,
} from "./api/index";

export default http;

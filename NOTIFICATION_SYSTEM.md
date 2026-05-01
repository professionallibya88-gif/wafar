# نظام الإشعارات

## نظرة عامة
نظام إشعارات متكامل وشامل يوفر إمكانية إرسال واستقبال الإشعارات للمستخدمين في المنصة.

## المكونات

### الخلفية (Backend)

#### 1. نموذج قاعدة البيانات (Notification)
- الموقع: `backend/src/database/models/Notification.js`
- الحقول:
  - `id`: معرف الإشعار (UUID)
  - `user_id`: معرف المستخدم
  - `type`: نوع الإشعار (info, success, warning, error, order, payment, subscription, system, message)
  - `title`: عنوان الإشعار
  - `message`: نص الإشعار
  - `data`: بيانات إضافية (JSONB)
  - `is_read`: حالة القراءة
  - `read_at`: تاريخ القراءة
  - `action_url`: رابط الإجراء
  - `action_text`: نص زر الإجراء
  - `icon`: أيقونة الإشعار
  - `priority`: الأولوية (low, medium, high, urgent)

#### 2. خدمة الإشعارات (NotificationService)
- الموقع: `backend/src/services/NotificationService.js`
- الوظائف:
  - `createNotification()`: إنشاء إشعار جديد
  - `notifyUser()`: إرسال إشعار لمستخدم محدد
  - `getUserNotifications()`: جلب إشعارات مستخدم
  - `getUnreadCount()`: جلب عدد الإشعارات غير المقروءة
  - `markAsRead()`: تعليم إشعار كمقروء
  - `markAllAsRead()`: تعليم جميع الإشعارات كمقروءة
  - `deleteNotification()`: حذف إشعار
  - `deleteReadNotifications()`: حذف الإشعارات المقروءة
  - `getNotificationById()`: جلب إشعار بواسطة معرفه
  - `notifyAllUsers()`: إرسال إشعار للجميع (للمسؤولين)
  - `notifyMultipleUsers()`: إرسال إشعار لمجموعة مستخدمين

#### 3. مسارات API (notificationRoutes)
- الموقع: `backend/src/routes/notificationRoutes.js`
- المسارات:
  - `GET /api/notifications`: جلب جميع الإشعارات
  - `GET /api/notifications/unread-count`: جلب عدد الإشعارات غير المقروءة
  - `GET /api/notifications/:id`: جلب إشعار محدد
  - `PUT /api/notifications/:id/read`: تعليم إشعار كمقروء
  - `PUT /api/notifications/read-all`: تعليم جميع الإشعارات كمقروءة
  - `DELETE /api/notifications/:id`: حذف إشعار
  - `DELETE /api/notifications/read`: حذف الإشعارات المقروءة
  - `POST /api/notifications`: إنشاء إشعار (للمسؤولين)
  - `POST /api/notifications/broadcast`: إرسال إشعار للجميع (للمسؤولين)
  - `POST /api/notifications/batch`: إرسال إشعار لمجموعة (للمسؤولين)

#### 4. مساعد الإشعارات التلقائية (NotificationHelper)
- الموقع: `backend/src/services/NotificationHelper.js`
- الوظائف:
  - `sendWelcomeNotification()`: إرسال إشعار ترحيبي
  - `sendLoginNotification()`: إرسال إشعار تسجيل الدخول
  - `sendSubscriptionCreatedNotification()`: إشعار إنشاء اشتراك
  - `sendSubscriptionExpiringNotification()`: إشعار قرب انتهاء الاشتراك
  - `sendSubscriptionExpiredNotification()`: إشعار انتهاء الاشتراك
  - `sendPaymentCreatedNotification()`: إشعار إنشاء دفع
  - `sendPaymentApprovedNotification()`: إشعار قبول الدفع
  - `sendPaymentRejectedNotification()`: إشعار رفض الدفع
  - `sendPDFUploadedNotification()`: إشعار رفع ملف PDF
  - `sendPDFProcessedNotification()`: إشعار اكتمال معالجة الملف
  - `sendPDFProcessingFailedNotification()`: إشعار فشل المعالجة
  - `sendProfileUpdatedNotification()`: إشعار تحديث الملف الشخصي
  - `sendPasswordChangedNotification()`: إشعار تغيير كلمة المرور
  - `sendSystemNotification()`: إشعار نظام للمسؤولين
  - `sendSystemErrorNotification()`: إشعار خطأ النظام

### الواجهة الأمامية (Frontend)

#### 1. مخزن الإشعارات (notificationStore)
- الموقع: `frontend/src/stores/notification.js`
- الحالة:
  - `notifications`: قائمة الإشعارات
  - `unreadCount`: عدد الإشعارات غير المقروءة
  - `loading`: حالة التحميل
  - `error`: رسالة الخطأ
  - `isOpen`: حالة فتح القائمة
- الوظائف:
  - `fetchNotifications()`: جلب الإشعارات
  - `fetchUnreadCount()`: جلب عدد الإشعارات غير المقروءة
  - `fetchNotificationById()`: جلب إشعار محدد
  - `markAsRead()`: تعليم إشعار كمقروء
  - `markAllAsRead()`: تعليم جميع الإشعارات كمقروءة
  - `deleteNotification()`: حذف إشعار
  - `deleteReadNotifications()`: حذف الإشعارات المقروءة
  - `toggleNotifications()`: فتح/إغلاق القائمة
  - `addNotification()`: إضافة إشعار جديد
  - `refresh()`: إعادة تحميل الإشعارات

#### 2. مكون جرس الإشعارات (NotificationBell)
- الموقع: `frontend/src/components/NotificationBell.vue`
- الوظائف:
  - عرض جرس الإشعارات مع شارة العدد
  - فتح/إغلاق قائمة الإشعارات
  - عرض قائمة الإشعارات
  - تعليم جميع الإشعارات كمقروءة

#### 3. مكون قائمة الإشعارات (NotificationList)
- الموقع: `frontend/src/components/NotificationList.vue`
- الوظائف:
  - عرض قائمة الإشعارات
  - تعليم إشعار كمقروء
  - حذف إشعار
  - عرض تفاصيل الإشعار

#### 4. مكون تفاصيل الإشعار (NotificationDetail)
- الموقع: `frontend/src/components/NotificationDetail.vue`
- الوظائف:
  - عرض تفاصيل الإشعار في مودال
  - تعليم الإشعار كمقروء
  - حذف الإشعار
  - التنقل لرابط الإجراء

#### 5. صفحة عرض الإشعارات (NotificationsView)
- الموقع: `frontend/src/views/NotificationsView.vue`
- الوظائف:
  - عرض جميع إشعارات المستخدم
  - فلترة الإشعارات حسب النوع والحالة والأولوية
  - تعليم الكل كمقروء
  - حذف الإشعارات المقروءة
  - تحديث تلقائي (Polling كل 30 ثانية)
  - تحميل المزيد (Pagination)

#### 6. صفحة إدارة الإشعارات للمسؤولين (AdminNotificationsView)
- الموقع: `frontend/src/views/AdminNotificationsView.vue`
- الوظائف:
  - إنشاء إشعار لمستخدم محدد
  - بث إشعار لجميع المستخدمين
  - إرسال إشعار لمجموعة مستخدمين
  - اختيار المستخدمين من قائمة
  - تخصيص نوع وأولوية الإشعار

## الاستخدام

### إنشاء إشعار من الخلفية

```javascript
const NotificationService = require('../services/NotificationService');

// إرسال إشعار لمستخدم محدد
await NotificationService.notifyUser(
  userId,
  'info',
  'عنوان الإشعار',
  'نص الإشعار',
  {
    action_url: '/some-page',
    action_text: 'عرض التفاصيل',
    priority: 'high'
  }
);

// إرسال إشعار للجميع (للمسؤولين)
await NotificationService.notifyAllUsers(
  'عنوان الإشعار',
  'نص الإشعار',
  {
    type: 'system',
    priority: 'urgent'
  }
);
```

### استخدام الإشعارات من الواجهة الأمامية

```javascript
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

// جلب الإشعارات
await notificationStore.fetchNotifications();

// جلب عدد الإشعارات غير المقروءة
await notificationStore.fetchUnreadCount();

// تعليم إشعار كمقروء
await notificationStore.markAsRead(notificationId);

// تعليم جميع الإشعارات كمقروءة
await notificationStore.markAllAsRead();

// حذف إشعار
await notificationStore.deleteNotification(notificationId);
```

### استخدام مساعد الإشعارات التلقائية

```javascript
const NotificationHelper = require('../services/NotificationHelper');

// إرسال إشعار ترحيبي
await NotificationHelper.sendWelcomeNotification(userId, userName);

// إرسال إشعار تسجيل الدخول
await NotificationHelper.sendLoginNotification(userId, deviceInfo);

// إرسال إشعار إنشاء اشتراك
await NotificationHelper.sendSubscriptionCreatedNotification(userId, planName, expiryDate);

// إرسال إشعار قبول الدفع
await NotificationHelper.sendPaymentApprovedNotification(userId, amount);

// إرسال إشعار نظام للمسؤولين
await NotificationHelper.sendSystemNotification(title, message, priority);
```

## أنواع الإشعارات

- `info`: معلومات عامة
- `success`: نجاح عملية
- `warning`: تحذير
- `error`: خطأ
- `order`: طلب
- `payment`: دفع
- `subscription`: اشتراك
- `system`: نظام
- `message`: رسالة

## مستويات الأولوية

- `low`: منخفضة
- `medium`: متوسطة
- `high`: عالية
- `urgent`: عاجلة

## التكامل مع التخطيطات

تم إضافة مكون الإشعارات إلى:
- `DashboardLayout.vue`: تخطيط لوحة التحكم
- `AdminLayout.vue`: تخطيط لوحة المدير

## الملاحظات

- جميع النصوص باللغة العربية
- التصميم يدعم RTL
- استخدام أيقونات Heroicons فقط
- لا إيموجي في الواجهة
- الأرقام بالعربية (123)

## الميزات الإضافية

### التحديث التلقائي (Polling)
- يتم تحديث عدد الإشعارات غير المقروءة تلقائياً كل 30 ثانية
- يمكن تخصيص الفترة الزمنية حسب الحاجة

### الإشعارات التلقائية
- يتم إرسال إشعارات تلقائية عند أحداث مهمة:
  - تسجيل مستخدم جديد
  - تسجيل الدخول
  - إنشاء/تجديد/انتهاء الاشتراك
  - إنشاء/قبول/رفض الدفع
  - رفع/معالجة ملفات PDF
  - تحديث الملف الشخصي
  - تغيير كلمة المرور
  - أخطاء النظام

### الصفحات المخصصة
- `/notifications`: صفحة عرض جميع إشعارات المستخدم
- `/admin/notifications`: صفحة إدارة الإشعارات للمسؤولين

### التكامل مع القوائم
- تم إضافة رابط الإشعارات في قائمة DashboardLayout
- تم إضافة رابط الإشعارات في قائمة AdminLayout
- زر جرس الإشعارات في شريط التنقل العلوي

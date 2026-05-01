# Separate Admin and User Accounts Spec

## Why
حالياً، يستخدم النظام نفس جدول قاعدة البيانات (`users`) ونفس مسار المصادقة لكل من المديرين (Admins) والمستخدمين العاديين (Retailers/Suppliers). هذا يؤدي إلى خطر أمني وإمكانية دخول حساب المدير كحساب مستخدم عادي، بالإضافة إلى عدم وجود استقلالية كاملة بين لوحة التحكم وموقع الويب كما هو متبع في المنصات العالمية المتقدمة.

## What Changes
- **BREAKING**: فصل جدول المستخدمين `users` بإنشاء جدول جديد `admins` للمديرين.
- **BREAKING**: إزالة الدور `admin` من حقل `role` في جدول `users`.
- إنشاء مسارات مصادقة خاصة بالمديرين `POST /api/admin/auth/login` مع خدمة `AdminAuthService`.
- تحديث طبقة Middleware (`auth.ts`) لتدعم التحقق من حسابات المديرين بشكل مستقل عن المستخدمين (عبر `adminAuth` و `userAuth`).
- تحديث لوحة التحكم (Frontend):
  - تخصيص صفحة تسجيل الدخول للوحة التحكم لتستخدم API المصادقة الخاص بالمديرين.
  - إزالة أي خيارات تخص المديرين (مثل الترقية لمدير أو فلترة المديرين) من قسم "إدارة المستخدمين".
  - إنشاء قسم جديد ومستقل بالكامل "إدارة المديرين" (Admins Management) للتحكم بحسابات الإدارة.
- منع توجيه أو دخول أي حساب مدير إلى موقع الويب (الخاص بالمستخدمين العاديين) والعكس.

## Impact
- Affected specs: Authentication, User Management, Admin Dashboard.
- Affected code:
  - `apps/backend/src/database/models/User.ts`
  - `apps/backend/src/database/models/Admin.ts` (New)
  - `apps/backend/src/repositories/UserRepository.ts`
  - `apps/backend/src/repositories/AdminRepository.ts` (New)
  - `apps/backend/src/services/AuthService.ts`
  - `apps/backend/src/services/AdminAuthService.ts` (New)
  - `apps/backend/src/controllers/adminAuthController.ts` (New)
  - `apps/backend/src/routes/adminAuthRoutes.ts` (New)
  - `apps/backend/src/middleware/auth.ts`
  - `apps/frontend/src/router/index.js`
  - `apps/frontend/src/stores/auth.js`
  - `apps/frontend/src/views/admin/AdminUsersView.vue`
  - `apps/frontend/src/views/admin/AdminAdminsView.vue` (New)

## ADDED Requirements
### Requirement: Independent Admin Authentication
The system SHALL provide an independent authentication mechanism for admins.

#### Scenario: Admin login
- **WHEN** an admin attempts to login to the dashboard.
- **THEN** the system uses the `admins` table to verify credentials and issues an admin-specific JWT.

### Requirement: Admin Management Section
The system SHALL provide a dedicated section in the dashboard to manage admin accounts independently.

## MODIFIED Requirements
### Requirement: User Management Section
The dashboard's User Management section SHALL only display and manage regular users (retailers and suppliers), with no ability to create or assign admin roles.

## REMOVED Requirements
### Requirement: Shared Authentication
**Reason**: Security risk and architectural coupling between admins and users.
**Migration**: Admins will now use `adminAuthRoutes` and the `admins` table. Users will use the existing `authRoutes` and the `users` table without the `admin` role.

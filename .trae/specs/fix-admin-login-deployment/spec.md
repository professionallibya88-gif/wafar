# Fix Admin Login Deployment Spec

## Why
عند رفع المشروع إلى بيئات الإنتاج مثل Railway أو Vercel، يفشل تسجيل دخول الإدارة لأن قاعدة البيانات لا يتم تهيئتها (Seed) وتحديثها (Migrate) بشكل تلقائي عند الإقلاع، مما يعني أن حساب الإدارة غير موجود. بالإضافة إلى ذلك، كلمة المرور الافتراضية ثابتة كـ `000000` في الكود بدلاً من قراءتها من المتغيرات البيئية `ADMIN_PASSWORD` كما هو مذكور في الوثائق.

## What Changes
- تحديث `AdminRepository.ts` لقراءة كلمة المرور من المتغير البيئي `ADMIN_PASSWORD` مع إبقاء `000000` كقيمة احتياطية.
- تعديل سكربت `start` في `apps/backend/package.json` ليتضمن تشغيل أوامر التهجير والتهيئة (`db:migrate:prod` و `db:seed:prod`) قبل تشغيل الخادم.
- تحديث `railway.toml` لاستخدام `npm start` كأمر إقلاع بدلاً من تشغيل الخادم مباشرة، لضمان تشغيل عمليات التهيئة والتهجير.

## Impact
- Affected code: `apps/backend/src/repositories/AdminRepository.ts`, `apps/backend/package.json`, `railway.toml`

## MODIFIED Requirements
### Requirement: Admin Login in Production
**Reason**: لضمان عمل لوحة التحكم بشكل صحيح ومباشر بعد الرفع، يجب تهيئة حساب الإدارة تلقائياً عند الإقلاع.
**Migration**: تم دمج أوامر التهجير والتهيئة ضمن سكربت الإقلاع الرسمي.
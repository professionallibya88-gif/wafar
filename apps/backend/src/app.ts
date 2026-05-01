import express from 'express';
import { applySecurity } from './bootstrap/security';
import { applyMiddleware } from './bootstrap/middleware';
import { applyRateLimiting } from './bootstrap/rateLimiting';
import { applyRoutes } from './bootstrap/routes';
import { createSessionMiddleware } from './config/session';

/**
 * إنشاء تطبيق Express مع جميع الطبقات مركبة بالترتيب الصحيح
 * يُصدَّر لاستخدام في الاختبارات وفي server.js
 */
const createApp = async () => {
  const app = express();

  applySecurity(app);
  applyMiddleware(app);
  applyRateLimiting(app);

  try {
    const sessionMiddleware = await createSessionMiddleware();
    app.use(sessionMiddleware);
  } catch {
    // تجاهل فشل الجلسات حتى لا يتوقف الإقلاع في البيئات التي لا تتوفر فيها Redis
  }

  applyRoutes(app);

  return app;
};

export { createApp };

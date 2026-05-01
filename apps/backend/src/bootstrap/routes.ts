import { Application } from 'express';
import routes from '../routes';
import { errorHandler, notFound } from '../middleware/errorHandler';

/**
 * تثبيت المسارات ومعالجة الأخطاء
 * يجب استدعاؤها بعد applySecurity و applyMiddleware
 * @param app - تطبيق Express
 */
const applyRoutes = (app: Application) => {
  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
};

export { applyRoutes };

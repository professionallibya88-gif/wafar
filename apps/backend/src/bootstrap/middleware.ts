import express, { Application, Request, Response } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

/**
 * إعداد الميدلوير العامة: compression + logging + body parsers + static
 * @param app - تطبيق Express
 */
const applyMiddleware = (app: Application) => {
  // ضغط الاستجابات
  app.use(
    compression({
      filter: (req: Request, res: Response) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
      threshold: 1024,
    })
  );

  // تسجيل الطلبات
  app.use(morgan('combined'));

  // قراءة body
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ملفات ثابتة
  app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
};

export { applyMiddleware };

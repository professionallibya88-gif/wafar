import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import sanitizeHtml from 'sanitize-html';
import { Application, Request, Response, NextFunction } from 'express';

/**
 * إعداد طبقات الأمان: helmet + cors + hpp + xss sanitizer
 * @param app - تطبيق Express
 */
const isDev = process.env.NODE_ENV !== 'production';

const applySecurity = (app: Application) => {
  // helmet + CSP + HSTS (مخفف في التطوير)
  if (isDev) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        hsts: false,
      })
    );
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      })
    );
  }

  // تنظيف XSS من body (مع استبعاد الحقول الحساسة)
  const SENSITIVE_FIELDS = ['password', 'phone', 'new_password', 'confirm_password'];
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.body) {
      for (const key of Object.keys(req.body)) {
        if (typeof req.body[key] === 'string' && !SENSITIVE_FIELDS.includes(key)) {
          req.body[key] = sanitizeHtml(req.body[key]);
        }
      }
    }
    next();
  });

  // HTTP Parameter Pollution
  app.use(hpp());

  // CORS
  const defaultOrigins = ['https://waffer.com', 'https://wafar-frontend.vercel.app'];
  const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
    credentials: true,
  };
  app.use(cors(corsOptions));
};

export { applySecurity };

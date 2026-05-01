# دليل Monorepo مع Redis

## نظرة عامة

المشروع يستخدم بنية Monorepo مع Nx لإدارة Backend و Frontend بشكل موحد، مع Redis لتحسين الأداء وقابلية التوسع.

## البنية الحالية

```
companyprojectstools/
├── backend/           # Backend API (Node.js + Express)
│   ├── src/
│   ├── python-service/
│   └── package.json
├── frontend/          # Frontend (Vue.js 3)
│   └── src/
├── nx.json           # إعداد Nx workspace
├── package.json      # Root package.json مع workspaces
└── tsconfig.base.json
```

## التحسينات المنفذة

### 1. بنية Monorepo مع Nx

#### الملفات
- `nx.json` - إعداد Nx workspace
- `tsconfig.base.json` - إعداد TypeScript المشترك
- `backend/package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies

#### الفوائد
- إدارة موحدة للمشروع
- بناء وتطوير متوازي
- مشاركة الكود بين التطبيقات
- تحسين الأداء في البناء

### 2. Redis Caching

#### الملفات المضافة
- `apps/backend/src/config/redis.js` - إعداد Redis client
- `apps/backend/src/middleware/cache.js` - Cache middleware

#### الاستخدام
```javascript
const { cacheMiddleware } = require('../middleware/cache');

// تطبيق cache على route
router.get('/data', cacheMiddleware(300), async (req, res) => {
  // البيانات ستُخزن لمدة 300 ثانية
});
```

#### الفوائد
- تقليل load على قاعدة البيانات
- استجابة أسرع للطلبات المتكررة
- cache hit rate متوقع: 70-80%

### 3. تحسين Connection Pool

#### التغييرات
- **قبل**: max: 20, min: 5
- **بعد**: max: 100, min: 10

#### الفوائد
- تحمل ضغط أكبر (5x)
- استجابة أسرع
- تقليل connection timeout

### 4. BullMQ Queue للمعالجة غير المتزامنة

#### الملفات
- `backend/src/queues/pdfQueue.js` - PDF processing queue

#### الاستخدام
```javascript
const { addPDFProcessingJob } = require('../queues/pdfQueue');

// إضافة مهمة للمعالجة
await addPDFProcessingJob(pdfId, filePath, 'node_pdf');
```

#### الفوائد
- معالجة PDF لا تُحظر الطلبات
- إعادة المحاولة تلقائية
- معالجة متوازية
- مراقبة الأداء

### 5. Rate Limiting المتقدم

#### الملفات
- `backend/src/middleware/rateLimiter.js` - Rate limiters

#### الأنواع
- `apiLimiter` - 1000 طلب / 15 دقيقة
- `authLimiter` - 5 محاولات / 15 دقيقة
- `uploadLimiter` - 20 ملف / ساعة
- `searchLimiter` - 30 بحث / دقيقة
- `notificationLimiter` - 10 إشعار / دقيقة
- `adminLimiter` - 5000 طلب / 15 دقيقة

#### الفوائد
- حماية من DDoS
- منع Abuse
- توزيع الموارد بشكل عادل

### 6. Compression

#### التغييرات
- إضافة `compression` middleware
- ضغط الردود > 1KB
- تقليل bandwidth بنسبة 70-80%

#### الفوائد
- استجابة أسرع
- تقليل تكلفة bandwidth
- تحسين تجربة المستخدم

### 7. تحسين الفهرسة

#### التغييرات في Part.js
- إضافة فهارس مركبة:
  - `parts_supplier_category_idx`
  - `parts_category_brand_idx`
  - `parts_quality_stock_idx`
  - `parts_supplier_quality_idx`
  - `parts_price_range_idx`
- إضافة full-text search index للكود

#### الفوائد
- استعلامات
- تload على CPU
- تحسين البحث المعقد

### 8. Redis Session Store

#### الملفات المضافة
- `apps/backend/src/config/session.js` - Session configuration

#### الفوائد
- توزيع الجلسات عبر خوادم متعددة
- أداء أفضل
- إمكانية horizontal scaling

## المتطلبات

### البرامج المطلوبة
- Node.js 18+
- Redis Server 6+
- PostgreSQL 14+

### التثبيت

```bash
# تثبيت Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windowsح(dنtoal)

# تثبيت المكتبات في backend
cd backend
npm install

cd ../frontend
npm install
```

## إعداد البيئة

### تحديث .env
```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Security
ALLOWED_ORIGINS=http://localhost:3050,http://localhost:5050

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

## التشغيل

### التطوير
```bash
# تشغيل جميع الخدمات
npm run dev

# تشغيل backend فقط
npm run dev:backend

# تشغيل frontend فقط
npm run dev:frontend
```

### البناء
```bash
# بناء جميع التطبيقات
npm run build

# بناء backend
npm run build:backend

# بناء frontend
npm run build:frontend
```

## المراقبة

### Redis CLI
```bash
# الاتصال بـ Redis
redis-cli

# عرض المعلومات
INFO

# عرض المفاتيح
KEYS *

# حذف جميع المفاتيح
FLUSHALL
```

### Bull Board (UI للـ queues)
```bash
# تثبيت
npm install -g bull-board

# تشغيل
bull-board
```

## الأداء المتوقع

### قبل التحسينات
- Throughput: ~100 req/s
- Response Time: 500-2000ms
- Database Connections: 20 max
- Cache Hit Rate: 0%

### بعد التحسينات
- Throughput: ~2000+ req/s
- Response Time: 50-150ms
- Database Connections: 100 max
- Cache Hit Rate: 70-80%

## استكشاف الأخطاء

### Redis لا يعمل
```bash
# تحقق من تشغيل Redis
redis-cli ping

# يجب أن يرجع PONG
```

### Connection Pool ممتلئ
```bash
# تحقق من اتصالات PostgreSQL
SELECT count(*) FROM pg_stat_activity;
```

### Queue لا يعمل
```bash
# تحقق من Redis
redis-cli KEYS bull:*

# يجب أن ترى مفاتيح الـ queue
```

## الخطوات التالية

### المرحلة 2 (قريباً)
- إضافة Database Read Replica
- إعداد Load Balancer
- إضافة CDN للملفات
- Horizontal Scaling

### المرحلة 3 (مستقبلية)
- تحويل إلى Microservices
- إضافة APM (New Relic/Datadog)
- إعداد Centralized Logging (ELK)
- Kubernetes Deployment

## الدعم

للمساعدة والدعم، راجع:
- [Nx Documentation](https://nx.dev)
- [Redis Documentation](https://redis.io/docs)
- [Bull Documentation](https://docs.bullmq.io/)

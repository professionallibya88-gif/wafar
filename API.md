# توثيق API - API Documentation

## Base URL
```
http://localhost:5050/api
```

## المصادقة

جميع الطلبات (باستثناء المصادقة) تتطلب JWT token في الـ header:

```
Authorization: Bearer <token>
```

## Endpoints

### المصادقة (Authentication)

#### POST /auth/register
تسجيل مستخدم جديد

**Body:**
```json
{
  "full_name": "الاسم الكامل",
  "phone": "0912345678",
  "password": "Password@123",
  "role": "retailer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
تسجيل الدخول

**Body:**
```json
{
  "phone": "0912345678",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/logout
تسجيل الخروج

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

### المستخدم (User)

#### GET /user/profile
الحصول على بيانات المستخدم الحالي

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "الاسم",
    "phone": "0912345678",
    "role": "retailer",
    "balance": 1000
  }
}
```

#### PUT /user/profile
تحديث بيانات المستخدم

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "full_name": "الاسم الجديد"
}
```

#### PUT /user/password
تغيير كلمة المرور

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "current_password": "CurrentPass@123",
  "new_password": "NewPass@123"
}
```

### ملفات PDF (PDF)

#### POST /pdf/upload
رفع ملف PDF

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `file`: ملف PDF
- `supplier_id`: (اختياري) معرف المورد

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "original_name": "file.pdf",
    "status": "processing"
  }
}
```

#### GET /pdf
جلب جميع ملفات PDF

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: رقم الصفحة (الافتراضي: 1)
- `limit`: عدد النتائج (الافتراضي: 20)
- `status`: حالة الملف (processing, completed, failed)

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [ ... ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

#### GET /pdf/:id
جلب تفاصيل ملف PDF

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "original_name": "file.pdf",
    "status": "completed",
    "extracted_data": { ... },
    "parts_count": 50
  }
}
```

#### DELETE /pdf/:id
حذف ملف PDF

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "تم حذف الملف بنجاح"
}
```

#### POST /pdf/test-method
اختبار طريقة معالجة PDF (للإدارة فقط)

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `file`: ملف PDF
- `method`: طريقة المعالجة (node_pdf, python_pypdf, python_ai, aws_textract)

**Response:**
```json
{
  "success": true,
  "message": "تم اختبار الطريقة بنجاح",
  "data": {
    "method": "node_pdf",
    "parts_extracted": 50,
    "page_count": 10,
    "processing_time": 2500,
    "confidence": 85,
    "sample_parts": [
      { "partCode": "ABC123", "partName": "جزء المحرك", "price": 150 }
    ]
  }
}
```

#### GET /pdf/health-check
فحص صحة خدمات معالجة PDF (للإدارة فقط)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "node_pdf": true,
    "python_pypdf": true,
    "python_ai": true,
    "aws_textract": false
  }
}
```

#### GET /pdf/method-stats
الحصول على إحصائيات استخدام طرق المعالجة (للإدارة فقط)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "processing_method": "node_pdf",
      "count": 150,
      "avg_parts": 45.5
    },
    {
      "processing_method": "python_pypdf",
      "count": 80,
      "avg_parts": 52.3
    }
  ]
}
```

### البحث (Search)

#### POST /search
البحث في القطع

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "query": "كود أو اسم القطعة",
  "type": "code",
  "category": "القائمة",
  "brand": "العلامة التجارية",
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parts": [ ... ],
    "total": 150,
    "page": 1,
    "totalPages": 8
  }
}
```

#### GET /search/history
جلب سجل البحث

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [ ... ]
  }
}
```

### الاشتراكات (Subscriptions)

#### GET /subscriptions/plans
جلب خطط الاشتراك

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [ ... ]
  }
}
```

#### GET /subscriptions/my
جلب اشتراكي الحالي

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": { ... }
  }
}
```

#### POST /subscriptions/subscribe
الاشتراك في خطة

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "plan_id": "uuid"
}
```

### المدفوعات (Payments)

#### POST /payments
إنشاء دفع

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "plan_id": "uuid",
  "amount": 100,
  "method": "bank_transfer",
  "receipt_image": "base64_image"
}
```

#### GET /payments
جلب المدفوعات

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [ ... ]
  }
}
```

### الإشعارات (Notifications)

#### GET /notifications
جلب الإشعارات

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `is_read`: حالة القراءة (true/false)
- `type`: نوع الإشعار
- `priority`: الأولوية (low, medium, high, urgent)
- `limit`: عدد النتائج

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [ ... ]
  }
}
```

#### GET /notifications/unread-count
جلب عدد الإشعارات غير المقروءة

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### PUT /notifications/:id/read
تعليم إشعار كمقروء

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": { ... }
  }
}
```

#### PUT /notifications/read-all
تعليم جميع الإشعارات كمقروءة

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "تم تعليم جميع الإشعارات كمقروءة"
}
```

#### DELETE /notifications/:id
حذف إشعار

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "تم حذف الإشعار بنجاح"
}
```

### المدير (Admin)

#### GET /admin/users
جلب جميع المستخدمين

**Headers:** `Authorization: Bearer <token>` (admin only)

#### PUT /admin/users/:id/activate
تفعيل مستخدم

**Headers:** `Authorization: Bearer <token>` (admin only)

#### PUT /admin/users/:id/deactivate
تعطيل مستخدم

**Headers:** `Authorization: Bearer <token>` (admin only)

#### GET /admin/payments/pending
جلب المدفوعات المعلقة

**Headers:** `Authorization: Bearer <token>` (admin only)

#### PUT /admin/payments/:id/approve
قبول دفع

**Headers:** `Authorization: Bearer <token>` (admin only)

#### PUT /admin/payments/:id/reject
رفض دفع

**Headers:** `Authorization: Bearer <token>` (admin only)

## رموز الخطأ

| Code | الوصف |
|------|-------|
| 200 | نجاح |
| 201 | تم الإنشاء بنجاح |
| 400 | طلب غير صالح |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 429 | طلبات كثيرة |
| 500 | خطأ في الخادم |

## Health Check (فحص الصحة)

### GET /health
فحص صحة بسيط للسيرفر

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-04-19T00:00:00.000Z",
  "service": "waffer-backend"
}
```

### GET /health/detailed
فحص صحة شامل مع جميع الخدمات

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-04-19T00:00:00.000Z",
  "service": "waffer-backend",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "اتصال قاعدة البيانات سليم"
    },
    "redis": {
      "status": "healthy",
      "message": "اتصال Redis سليم",
      "stats": {
        "total_connections_received": "1000",
        "total_commands_processed": "5000",
        "keyspace_hits": "3000",
        "keyspace_misses": "2000"
      }
    },
    "queue": {
      "status": "healthy",
      "message": "Bull Queue سليم",
      "stats": {
        "waiting": 5,
        "active": 2,
        "completed": 100,
        "failed": 1
      }
    }
  }
}
```

### GET /health/memory
فحص استخدام الذاكرة

**Response:**
```json
{
  "success": true,
  "memory": {
    "rss": "150 MB",
    "heapTotal": "100 MB",
    "heapUsed": "60 MB",
    "external": "10 MB"
  },
  "uptime": "3600 seconds"
}
```

## Cache Management (إدارة التخزين المؤقت - للمسؤولين فقط)

### DELETE /admin/cache/all
مسح جميع الـ cache

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم مسح جميع الـ cache بنجاح"
}
```

### DELETE /admin/cache/user/:userId
مسح cache مستخدم معين

**Response:**
```json
{
  "success": true,
  "message": "تم مسح cache للمستخدم 123 بنجاح"
}
```

### DELETE /admin/cache/api/:path
مسح cache لـ API معين

**Response:**
```json
{
  "success": true,
  "message": "تم مسح cache للـ API /api/search بنجاح"
}
```

### DELETE /admin/cache/search
مسح cache البحث

**Response:**
```json
{
  "success": true,
  "message": "تم مسح cache البحث بنجاح"
}
```

### DELETE /admin/cache/metadata
مسح cache الفئات والماركات

**Response:**
```json
{
  "success": true,
  "message": "تم مسح cache الفئات والماركات بنجاح"
}
```

## Queue Management (إدارة Bull Queue - للمسؤولين فقط)

### GET /admin/queue/stats
الحصول على إحصائيات الـ queue

**Response:**
```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 100,
    "failed": 1,
    "delayed": 0,
    "total": 108
  }
}
```

### GET /admin/queue/jobs?state=waiting&page=1&limit=20
الحصول على قائمة المهام

**Query Parameters:**
- `state`: waiting, active, completed, failed, delayed (default: waiting)
- `page`: رقم الصفحة (default: 1)
- `limit`: عدد المهام في الصفحة (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_id",
        "name": "process-pdf",
        "data": { "pdfId": 1, "filePath": "/path/to/file.pdf" },
        "progress": 50,
        "state": "active",
        "attempts": 1,
        "failedReason": null
      }
    ],
    "state": "waiting",
    "count": 1
  }
}
```

### GET /admin/queue/jobs/:jobId
الحصول على حالة مهمة معينة

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "progress": 50,
    "data": { "pdfId": 1 },
    "result": null,
    "failedReason": null
  }
}
```

### POST /admin/queue/jobs/:jobId/retry
إعادة محاولة مهمة فاشلة

**Response:**
```json
{
  "success": true,
  "message": "تم إعادة محاولة المهمة بنجاح"
}
```

### DELETE /admin/queue/jobs/:jobId
حذف مهمة

**Response:**
```json
{
  "success": true,
  "message": "تم حذف المهمة بنجاح"
}
```

### DELETE /admin/queue/completed
مسح جميع المهام المكتملة

**Response:**
```json
{
  "success": true,
  "message": "تم مسح 100 مهمة مكتملة"
}
```

### DELETE /admin/queue/failed
مسح جميع المهام الفاشلة

**Response:**
```json
{
  "success": true,
  "message": "تم مسح 1 مهمة فاشلة"
}
```

### POST /admin/queue/pause
إيقاف الـ queue مؤقتاً

**Response:**
```json
{
  "success": true,
  "message": "تم إيقاف الـ queue مؤقتاً"
}
```

### POST /admin/queue/resume
استئناف الـ queue

**Response:**
```json
{
  "success": true,
  "message": "تم استئناف الـ queue"
}
```

## System Stats (إحصائيات النظام - للمسؤولين فقط)

### GET /admin/system-stats
الحصول على إحصائيات النظام المتقدمة

**Response:**
```json
{
  "success": true,
  "data": {
    "redis": {
      "status": "available",
      "keys": 150,
      "totalConnectionsReceived": "1000",
      "totalCommandsProcessed": "5000",
      "keyspaceHits": "3000",
      "keyspaceMisses": "2000"
    },
    "queue": {
      "status": "available",
      "waiting": 5,
      "active": 2,
      "completed": 100,
      "failed": 1
    },
    "database": {
      "totalUsers": 50,
      "totalSuppliers": 20,
      "totalParts": 1000,
      "totalPDFs": 100,
      "totalPayments": 200,
      "activeSubscriptions": 30
    },
    "system": {
      "uptime": 3600,
      "memory": {
        "rss": "150 MB",
        "heapTotal": "100 MB",
        "heapUsed": "60 MB"
      },
      "cpu": { "user": 123456, "system": 789012 }
    },
    "timestamp": "2026-04-19T00:00:00.000Z"
  }
}
```

## مثال على استخدام API

```javascript
// تسجيل الدخول
const login = async () => {
  const response = await fetch('http://localhost:5050/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '0912345678',
      password: 'Password@123'
    })
  });

  const data = await response.json();
  const token = data.data.token;

  return token;
};

// البحث
const search = async (token, query) => {
  const response = await fetch('http://localhost:5050/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: query,
      type: 'code',
      page: 1,
      limit: 20
    })
  });

  return await response.json();
};

// فحص صحة السيرفر
const checkHealth = async () => {
  const response = await fetch('http://localhost:5050/api/health');
  return await response.json();
};

// فحص صحة شامل
const checkDetailedHealth = async () => {
  const response = await fetch('http://localhost:5050/api/health/detailed');
  return await response.json();
};

// مسح cache البحث (للمسؤولين)
const clearSearchCache = async (adminToken) => {
  const response = await fetch('http://localhost:5050/api/admin/cache/search', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};

// الحصول على إحصائيات الـ queue (للمسؤولين)
const getQueueStats = async (adminToken) => {
  const response = await fetch('http://localhost:5050/api/admin/queue/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};

// الحصول على إحصائيات النظام (للمسؤولين)
const getSystemStats = async (adminToken) => {
  const response = await fetch('http://localhost:5050/api/admin/system-stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};

// إعادة محاولة مهمة فاشلة (للمسؤولين)
const retryJob = async (adminToken, jobId) => {
  const response = await fetch(`http://localhost:5050/api/admin/queue/jobs/${jobId}/retry`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};
```

## Monitoring Endpoints (للمسؤولين)

### الحصول على Metrics

```bash
curl http://localhost:5050/api/admin/monitoring/metrics \
  -H "Authorization: Bearer <admin_token>"
```

**مثال برمجي:**
```javascript
// الحصول على metrics المراقبة
const getMonitoringMetrics = async (adminToken) => {
  const response = await fetch('http://localhost:5050/api/admin/monitoring/metrics', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};
```

### الحصول على حالة المراقبة

```bash
curl http://localhost:5050/api/admin/monitoring/health \
  -H "Authorization: Bearer <admin_token>"
```

**مثال برمجي:**
```javascript
// الحصول على حالة المراقبة
const getMonitoringHealth = async (adminToken) => {
  const response = await fetch('http://localhost:5050/api/admin/monitoring/health', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};
```

### الحصول على تقرير الأداء

```bash
curl http://localhost:5050/api/admin/monitoring/performance?timeRange=60000 \
  -H "Authorization: Bearer <admin_token>"
```

**مثال برمجي:**
```javascript
// الحصول على تقرير الأداء
const getPerformanceReport = async (adminToken, timeRange = 60000) => {
  const response = await fetch(`http://localhost:5050/api/admin/monitoring/performance?timeRange=${timeRange}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  return await response.json();
};
```

## التغييرات في الإصدار 2.1

### تحديثات هندسية

1. **تحديث Redis Client لـ v4 API**
   - استخدام Redis v4 API الصحيح
   - إضافة event handlers متقدمة
   - إضافة graceful shutdown

2. **استبدال Bull بـ BullMQ**
   - BullMQ v5 يدعم Redis v4
   - فصل Queue و Worker
   - إضافة concurrency و limiter

3. **تحسين Cache Operations**
   - استخدام SCAN بدلاً من KEYS
   - إضافة batch processing
   - تجنب حظر السيرفر

4. **Redis Rate Limiting**
   - استخدام rate-limiter-flexible
   - Redis store للتخزين الموزع
   - Insurance limiter كـ fallback

5. **Session Store**
   - تطبيق Redis session store
   - Secure cookies في الإنتاج
   - Rolling sessions

6. **Monitoring Endpoints**
   - `/api/admin/monitoring/metrics`
   - `/api/admin/monitoring/health`
   - `/api/admin/monitoring/performance`

7. **Graceful Shutdown**
   - إغلاق آمن لجميع الخدمات
   - معالجة SIGTERM و SIGINT
   - Timeout 10 ثواني

8. **Redis Connection Pool**
   - RedisConnectionPool class
   - acquire/release pattern
   - إحصائيات الـ pool

9. **Cache Invalidation التلقائي**
   - مسح cache تلقائياً عند تحديث البيانات
   - دعم Parts, PDFs, Suppliers

10. **تحقق من حجم الملف**
    - حد أقصى 50MB
    - تحقق من وجود الملف على القرص

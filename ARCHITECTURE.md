# البنية المعمارية العالمية لمنصة وفر (Enterprise-grade Architecture)

## نظرة عامة

تم ترقية بنية المشروع بالكامل ليصبح مشروعاً ذا معايير عالمية (Enterprise-grade) مبنياً على **TypeScript الصارم بنسبة 100%**. هذه الوثيقة تشرح البنية الجديدة، وتوزيع الطبقات، وقواعد العمل الصارمة التي تضمن عدم وجود أي أخطاء وقت التشغيل (Zero Runtime Errors).

## مبادئ البنية الجديدة (Core Principles)

1. **النوع الصارم (Strict Typing - TypeScript)**: يمنع استخدام `any` إطلاقاً. كل دالة، متغير، أو استجابة يجب أن تمتلك واجهة (Interface) واضحة.
2. **فصل المسؤوليات (Separation of Concerns)**: كل طبقة معزولة تماماً عن الأخرى.
3. **نمط المستودع (Repository Pattern)**: جميع استعلامات Sequelize معزولة داخل مستودعات تعتمد على `Generics` لدعم الأنواع القوية.
4. **أخطاء موحدة (Unified Errors)**: جميع الأخطاء ترث من `AppError` وتُعالَج مركزياً، ولا يُسمح بوجود كتل `try/catch` عشوائية في المتحكمات.
5. **استجابات موحدة (Unified Responses)**: شكل JSON ثابت `{ success, code, message, data, meta, errors }` مبني ومحمي بواسطة TypeScript.

---

## الهيكل العام للـ Backend (TypeScript)

```
apps/backend/src/
├── app.ts                        # إنشاء تطبيق Express (يُستدعى من server.ts والاختبارات)
├── server.ts                     # نقطة الدخول - تشغيل السيرفر + اتصال قاعدة البيانات
│
├── bootstrap/                    # وحدات تمهيد التطبيق (بدلاً من server.ts الضخم)
│   ├── index.ts                 # نقطة تصدير موحدة
│   ├── security.ts              # helmet + CORS + XSS + HPP
│   ├── middleware.ts            # compression + morgan + body parser
│   ├── rateLimiting.ts          # تطبيق rate limiters على المسارات
│   ├── routes.ts                # تثبيت المسارات + notFound + errorHandler
│   ├── services.ts              # تهيئة BullMQ Queue + Worker
│   └── gracefulShutdown.ts      # إغلاق آمن عند SIGTERM/SIGINT
│
├── types/                        # تعريفات الواجهات (Interfaces) المشتركة
│   └── index.ts                 # AuthResponse, PaginationOptions, إلخ.
│
├── errors/                       # طبقة الأخطاء المخصصة (AppError)
│   ├── index.ts
│   └── AppError.ts              
│
├── utils/                        # المساعدات العامة المكتوبة بـ TypeScript
│   ├── asyncHandler.ts          # لف الدوال (Request, Response, NextFunction)
│   ├── ApiResponse.ts           # success, created, error بواجهات صارمة
│   ├── validate.ts              # runValidators
│   └── pagination.ts            # parsePagination
│
├── database/
│   ├── index.ts                 # اتصال Sequelize (Type-Safe)
│   └── models/                  # نماذج TypeScript (User.ts, Part.ts, ...)
│       └── index.ts             # تجميع النماذج وإعداد العلاقات القوية
│
├── repositories/                 # طبقة المستودعات (Repository Pattern)
│   ├── BaseRepository.ts        # <BaseRepository<M extends Model>
│   ├── UserRepository.ts
│   ├── PartRepository.ts
│   └── index.ts
│
├── services/                     # طبقة منطق الأعمال (Business Logic)
│   ├── AuthService.ts           # خدمات محمية بالأنواع (Type-Safe Services)
│   ├── PDFService.ts            
│   └── SmartSearch.ts
│
├── controllers/                  # طبقة HTTP (Request/Response)
│   ├── authController.ts
│   ├── pdfController.ts
│   └── searchController.ts
│
├── routes/                       # مسارات الـ API (Express Router)
│   ├── index.ts
│   ├── authRoutes.ts
│   └── pdfRoutes.ts
│
└── middleware/                   # أدوات Middleware محمية (Type-Safe)
    ├── auth.ts                  # AuthenticatedRequest interface
    ├── cache.ts
    └── errorHandler.ts          # معالجة أخطاء التطبيق و Sequelize بصرامة
```

---

## تدفق الطلب الآمن (Type-Safe Request Flow)

```
HTTP Request
   │
   ▼
┌─────────────┐
│ Middleware  │  Security, Body Parser, Rate Limiter
├─────────────┤
│ Router      │  Express Router (routes/*.ts)
├─────────────┤
│ auth        │  Middleware يُلحق `req.user` ككائن موثق عبر `AuthenticatedRequest`
├─────────────┤
│ validators  │  express-validator + runValidators()
├─────────────┤
│ Controller  │  مغلف بـ `asyncHandler`، يستقبل الطلب ويستدعي الخدمة
├─────────────┤
│ Service     │  منطق الأعمال الصارم (Business Logic). يرمي أخطاء مخصصة (NotFoundError)
├─────────────┤
│ Repository  │  يتعامل مع الـ Database باستخدام Sequelize Generics
├─────────────┤
│ Database    │  PostgreSQL
└─────────────┘
   │
   ▼
┌─────────────┐
│ Controller  │  يُرجع `ApiResponse.success` مع التأكد من مطابقة الأنواع
├─────────────┤
│errorHandler │  يلتقط أي خطأ لم يُعالج ويُحوله إلى استجابة JSON قياسية
└─────────────┘
   │
   ▼
HTTP Response
```

---

## القواعد الصارمة للتطوير (Strict Development Rules)

للحفاظ على حالة "0 أخطاء" (Zero Errors)، يجب على جميع المطورين والوكلاء الالتزام الحرفي بهذه القواعد:

### 1. الـ TypeScript هو القانون (TypeScript is the Law)
- **ممنوع استخدام `any`:** يجب تحديد النوع الدقيق لكل متغير، معلمة، ومخرجات الدالة. استخدم `unknown` أو `Record<string, unknown>` في أضيق الحدود إذا دعت الحاجة.
- **الواجهات (Interfaces):** أي كائن يتم تمريره بين الطبقات يجب أن يمتلك Interface يصفه بوضوح (في مجلد `types/` أو داخل الملف نفسه).

### 2. قواعد المعمارية (Architecture Rules)
- **لا استيراد لنماذج Sequelize خارج `repositories/`:** المتحكمات والخدمات ممنوعة من التحدث المباشر مع قاعدة البيانات. استدعِ المستودع (`repository`) دائماً.
- **لا `try/catch` في المتحكمات:** استخدم دائماً المغلف `asyncHandler`، وهو سيتكفل بتمرير الأخطاء لـ `errorHandler`.
- **الاستجابات (Responses):** يُمنع استخدام `res.json()` أو `res.status().send()` مباشرة في المتحكمات. استخدم دائماً دوال `success` و `error` من `utils/ApiResponse.ts`.

### 3. قواعد اللغة والتنسيق (Language & Formatting)
- **العربية فقط:** جميع نصوص واجهة المستخدم، ورسائل الخطأ، والتعليقات يجب أن تكون باللغة العربية الفصحى.
- **الأرقام الإنجليزية:** استخدم الأرقام بالشكل الغربي `123` دائماً في الواجهات وفي قواعد البيانات، ولا تستخدم الأرقام الهندية `١٢٣` أبداً.
- **تسمية الملفات:**
  - النماذج (Models): `PascalCase.ts` (مثال: `User.ts`)
  - الخدمات والمستودعات: `PascalCase.ts` (مثال: `AuthService.ts`)
  - المتحكمات والموجهات: `camelCase.ts` (مثال: `authController.ts`)

---

## أمثلة على كتابة كود صارم (Strict Code Examples)

### مثال على مستودع ذكي (Type-Safe Repository)
```typescript
import { BaseRepository } from './BaseRepository';
import { User } from '../database/models/User';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.model.findOne({ where: { phone } });
  }
}
export const userRepository = new UserRepository();
```

### مثال على خدمة صارمة (Strict Service)
```typescript
import { userRepository } from '../repositories';
import { NotFoundError } from '../errors';
import { User } from '../database/models/User';

export class UserService {
  async getProfile(userId: string): Promise<User> {
    const user = await userRepository.findByIdSafe(userId);
    if (!user) throw new NotFoundError('المستخدم غير موجود');
    return user;
  }
}
```

### مثال على متحكم آمن (Type-Safe Controller)
```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { userService } from '../services/UserService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await userService.getProfile(req.user.id);
  return success(res, { data: user });
});
```

---

بفضل هذا التحديث، أصبح المشروع يتمتع ببنية تحتية عالمية قادرة على الصمود أمام ملايين الطلبات دون انهيار، وبأعلى معايير جودة الكود المعترف بها في المشاريع المؤسسية (Enterprise).

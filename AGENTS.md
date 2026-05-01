# Repository Guidelines

## نظرة عامة على المشروع

**منصة وفر** - منصة متخصصة في قطع غيار السيارات للسوق الليبي. الواجهة والنصوص والرسائل بالعربية الفصحى بالكامل مع اتجاه RTL.

## Project Structure & Module Organization

Nx monorepo with two workspaces under `apps/`: `apps/backend/` and `apps/frontend/`.

**البنية المعمارية** — راجع `ARCHITECTURE.md` للتفاصيل الكاملة.

**Backend** (`apps/backend/src/`):
- `app.js` — Express app factory (used by server.js and tests)
- `server.js` — نقطة الدخول وتشغيل السيرفر
- `bootstrap/` — وحدات تمهيد مُقسَّمة (security, middleware, rateLimiting, routes, services, gracefulShutdown)
- `errors/` — أصناف أخطاء مخصصة: `AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `BusinessError`, ...
- `utils/` — `asyncHandler`, `ApiResponse` (success/created/error), `validate` (runValidators), `pagination`
- `repositories/` — طبقة قاعدة البيانات (Repository Pattern). `BaseRepository` + 10 مستودعات متخصصة. **جميع استعلامات Sequelize تمر هنا فقط**
- `services/` — طبقة منطق الأعمال (AuthService, UserService, PDFService, SearchService, NotificationService, ...). تستخدم Repositories حصراً
- `controllers/` — طبقة HTTP. تستخدم `asyncHandler` و `ApiResponse`. لا منطق أعمال هنا
- `validators/` — قواعد `express-validator` مُجمَّعة حسب المجال
- `routes/` — تعريف المسارات فقط. `authRoutes.js` مثلاً أصبح 15 سطراً بدلاً من 209
- `middleware/` — `auth` (JWT + userRepository)، `errorHandler` (يدعم AppError + Sequelize + JWT + Multer)، `rateLimiter`, `cache`, `upload`
- `config/` — Redis pool, session, logger
- `database/models/` — نماذج Sequelize (User, Supplier, Part, PDFFile, Subscription, SubscriptionPlan, Payment, SearchHistory, Notification, SystemSetting)
- `queues/pdfQueue.js` — BullMQ queue (يستخدم Repositories الآن)
- `python-service/app.py` — Flask microservice for OCR/AI PDF parsing (port 5051)

**Frontend** (`apps/frontend/src/`):

- `services/http.js` — عميل axios موحد مع interceptors (401 → clearSession + redirect)
- `services/storage.js` — طبقة تغليف `localStorage` (`authStorage`, `themeStorage`)
- `services/api/` — واجهات API مقسمة حسب المجال (auth, user, pdf, search, ...)
- `services/api.js` — إعادة تصدير للتوافق العكسي
- `stores/` — Pinia stores (`auth`, `notification`, `theme`) — لا تتعامل مع `localStorage` مباشرة، بل عبر `storage.js`
- `components/base/` — design system (BaseButton, BaseModal, BaseInput, ...)
- `components/icons/AppIcon.vue` — single icon wrapper for `@heroicons/vue` — **exclusively for icons, no emojis**
- `components/layout/` — `DashboardNavbar.vue`, `DashboardSidebar.vue`, `DashboardBottomNav.vue`
- `composables/` — `useDashboardMenu`, `useSidebarState`, `useIcons`, `usePageTransition`, `useSiteFont`
- `layouts/` — `AdminLayout.vue`, `DashboardLayout.vue` (نحيف، يعتمد على المكونات والـ composables)

**تدفق الطلب**: Route → validator (`runValidators`) → Controller (`asyncHandler`) → Service → Repository → DB. الأخطاء تُرمى كـ `AppError` وتُعالَج مركزياً في `errorHandler`.

**شكل الاستجابة الموحد**: `{ success, code, message, data, meta, errors }` (راجع `ARCHITECTURE.md`).

## Build, Test, and Development Commands

```bash
# From repo root
npm run dev              # run backend + frontend in parallel (Nx)
npm run dev:backend      # backend only
npm run dev:frontend     # frontend only
npm run build            # build both
npm run test             # run all tests
npm run lint             # lint all workspaces

# From backend/
npm run dev              # nodemon src/server.js
npm run dev:all          # backend + python-service concurrently
npm run db:migrate       # run DB migrations
npm run db:seed          # seed initial data
npm run test             # jest
npm run lint             # eslint src/**/*.js
npm run format           # prettier --write

# From frontend/
npm run dev              # vite (port 3050)
npm run build            # vite build
```

Run a single backend test file:
```bash
cd backend && npx jest src/tests/auth.test.js
```

**Service ports**: Frontend `3050` | Backend API `5050` | Python service `5051`

## Coding Style & Naming Conventions

- **Variable/function names**: English, camelCase
- **Comments**: Arabic only
- **UI text / error messages**: Arabic only
- **Numbers**: Western digits only `123` — never Arabic-Indic `١٢٣`
- **No emojis** anywhere; icons must use `AppIcon.vue` wrapping `@heroicons/vue`
- **No `any` type** (strict, even in JS — avoid loose typing patterns)
- **Database**: all table and column names `snake_case`; timestamps as `created_at`, `updated_at`, `deleted_at`
- Backend formatter: Prettier — single quotes, semi, 100 print width, 2 spaces, LF line endings
- Backend linter: ESLint (`eslint:recommended` + `prettier`); `prefer-const` and `no-var` enforced
- Frontend: TailwindCSS utility classes; font `Tajawal`; all pages `dir="rtl"`

## Testing Guidelines

Framework: **Jest** (backend only). Test files match `backend/tests/**/*.test.js`.

```bash
cd backend && npm test
cd backend && npm run test:watch
```

Coverage collected from `src/**/*.js` (excluding `src/tests/**`).

## Infrastructure & Environment

- **Database**: PostgreSQL only — SQLite is forbidden
- **Cache/Queue**: Redis (ioredis) + BullMQ; Redis required at runtime
- **Auth**: JWT (`jsonwebtoken`) + bcrypt password hashing
- **File uploads**: multer; size limit enforced via `MAX_FILE_SIZE` env var
- **No Docker** — run services directly on host

Required env vars (copy `backend/.env.example` → `backend/.env`):
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `SESSION_SECRET`, `PYTHON_SERVICE_URL`

Default PDF processing method set via `DEFAULT_PDF_METHOD` (`python_pypdf` | `python_ai` | `node_pdf` | `aws_textract`).

## Agent / AI Contributor Rules

- All chat and responses must be in Arabic
- No Docker, no SQLite
- No emojis in code, templates, or comments
- Icons: `@heroicons/vue` through `AppIcon.vue` only
- Numbers in UI: Western `123`, never `١٢٣`
- All UI direction: RTL
- Do not start servers — the developer handles that

## Architectural Rules (Strict)

- **Repository-only DB access**: استيراد نماذج Sequelize ممنوع خارج `repositories/`. الخدمات والمتحكمات والموجهات تستخدم المستودعات حصراً.
- **No try/catch in controllers**: المتحكمات تستخدم `asyncHandler` ودوال `ApiResponse` (`success`, `created`). الأخطاء تُعالَج في `errorHandler` مركزياً.
- **Throw AppError subclasses**: الخدمات ترمي `NotFoundError` / `ValidationError` / `ConflictError` / `BusinessError` / ... بدلاً من `new Error(...)` أو `res.status(...)`.
- **Validators outside routes**: قواعد `express-validator` تُعرَّف في `validators/` وتُستدعى عبر `runValidators(rules)`.
- **Response shape**: استجابات JSON بشكل `{ success, code?, message?, data?, meta?, errors? }` — استخدم `ApiResponse.success/created/error` و `buildPaginationMeta`.
- **Frontend storage layer**: متاجر Pinia لا تتعامل مع `localStorage` مباشرة. تستخدم `services/storage.js` (`authStorage`, `themeStorage`).
- **Component size discipline**: التخطيطات الكبيرة تُقسَّم إلى `components/layout/*` + `composables/*` (راجع `DashboardLayout.vue`).

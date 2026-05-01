# مهام التطوير (Tasks)

- [ ] Task 1: إعدادات محرك الذكاء الاصطناعي في قاعدة البيانات والـ API
  - [ ] SubTask 1.1: إضافة مفاتيح الإعدادات الافتراضية للذكاء الاصطناعي (`ai_provider`, `openrouter_api_key`, `google_api_key`, `openai_api_key`, `ai_model_name`) في مزامنة البيانات (Seeder).
  - [ ] SubTask 1.2: إنشاء وحدة تحكم (Controller) ومسارات (Routes) للحصول على وتحديث إعدادات الذكاء الاصطناعي (`GET /api/settings/ai`, `PUT /api/settings/ai`).
- [ ] Task 2: تطوير محرك المعالجة بالذكاء الاصطناعي (`AIPDFProcessor.ts`)
  - [ ] SubTask 2.1: بناء آلية الاتصال بمزود OpenAI (يدعم OpenAI, OpenRouter, DeepSeek عبر تغيير الـ Base URL).
  - [ ] SubTask 2.2: بناء آلية الاتصال بمزود Google Gemini API.
  - [ ] SubTask 2.3: تحديث `PDFProcessor.ts` لتوجيه المعالجة بالذكاء الاصطناعي إلى `AIPDFProcessor.ts` عند اختيار طريقة `global_ai`.
- [ ] Task 3: إنشاء واجهة تحكم محرك الذكاء الاصطناعي (Frontend)
  - [ ] SubTask 3.1: إنشاء متجر Pinia أو خدمة API لإدارة إعدادات الذكاء الاصطناعي.
  - [ ] SubTask 3.2: بناء صفحة `AIEngineSettings.vue` مع قائمة منسدلة (Dropdown) للمزودين (OpenRouter, Google, OpenAI)، وحقول مفاتيح الـ API، واسم النموذج (Model Name).
  - [ ] SubTask 3.3: إضافة رابط "محرك الذكاء الاصطناعي" في الشريط الجانبي (Sidebar) للوحة التحكم.
- [ ] Task 4: دمج خيار الذكاء الاصطناعي في واجهات الرفع والمعالجة
  - [ ] SubTask 4.1: تحديث مكون الرفع `UploadPDF.vue` ومكونات المعالجة لإضافة خيار "محرك الذكاء الاصطناعي العالمي (Global AI)" ضمن قائمة طرق المعالجة.
  - [ ] SubTask 4.2: التأكد من أن الـ Worker في الخلفية يتلقى طريقة المعالجة `global_ai` وينفذها بنجاح.

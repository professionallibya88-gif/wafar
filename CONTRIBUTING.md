# المساهمة في المشروع

شكراً لاهتمامك بالمساهمة في منصة وفر.

## كيفية المساهمة

### 1. Fork المشروع

أنشئ نسخة من المشروع في حسابك.

### 2. إنشاء فرع جديد

```bash
git checkout -b feature/your-feature-name
```

### 3. إجراء التغييرات

- اتبع قواعد المشروع المذكورة أدناه
- تأكد من أن الكود يعمل بشكل صحيح
- أضف اختبارات إذا أمكن

### 4. Commit التغييرات

```bash
git commit -m "Add: feature description"
```

### 5. Push إلى الفرع

```bash
git push origin feature/your-feature-name
```

### 6. إنشاء Pull Request

اشرح التغييرات التي أجريتها وسببها.

## قواعد المشروع

### اللغة
- جميع النصوص بالعربية
- التعليقات بالعربية
- رسائل الخطأ بالعربية
- أسماء المتغيرات والدوال بالإنجليزية

### التنسيق
- اتجاه RTL
- الخط Tajawal
- أرقام عربية (123) وليس هندية (١٢٣)
- لا camelCase في النصوص العربية

### الأيقونات
- استخدام Heroicons فقط
- لا إيموجي في الواجهة

### قاعدة البيانات
- الجداول snake_case
- الحقول snake_case
- المفاتيح الخارجية snake_case
- timestamps: created_at, updated_at, deleted_at

### الأمان
- JWT للمصادقة
- تشفير كلمات المرور بـ bcrypt
- التحقق من البيانات
- حماية من SQL injection

## التقنيات المستخدمة

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- Python Flask لمعالجة PDF

### Frontend
- Vue.js 3
- Vite
- TailwindCSS
- Pinia
- Vue Router

## الاختبار

قبل إرسال Pull Request:
- تأكد من أن الكود يعمل بدون أخطاء
- اختبر الميزات المضافة
- تأكد من أن التصميم متجاوب

## التواصل

لأي استفسارات، تواصل مع فريق التطوير.

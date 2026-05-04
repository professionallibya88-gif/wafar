# Tasks
- [x] Task 1: تصميم وتنفيذ Bootstrap Shell موحد لأول تحميل للتطبيق.
  - [x] SubTask 1.1: تحديد نقطة الحقن المبكرة في `index.html` و`main.js`
  - [x] SubTask 1.2: تعريف بنية shell وألوانه وسلوكه مع الثيم
  - [x] SubTask 1.3: إزالة الـ shell بعد جاهزية التطبيق الأولى بشكل منظم

- [x] Task 2: تقديم تهيئة الثيم ومنع وميض الألوان والخلفيات.
  - [x] SubTask 2.1: نقل حسم `dark/light/system` إلى ما قبل `mount`
  - [x] SubTask 2.2: مواءمة `index.html` مع الثيم الابتدائي الحقيقي
  - [x] SubTask 2.3: تعطيل انتقالات الألوان في أول رسم ثم تفعيلها بعد الاستقرار

- [x] Task 3: إعادة تنظيم تحميل الإعدادات العامة والخطوط لتقليل إعادة الرسم.
  - [x] SubTask 3.1: إزالة التكرار في تحميل الإعدادات العامة
  - [x] SubTask 3.2: اعتماد تطبيق خط آمن تدريجي بدلاً من تحديث جميع العناصر دفعة واحدة
  - [x] SubTask 3.3: فصل ما هو حرج لأول رسم عما يمكن تحميله لاحقاً

- [x] Task 4: بناء نظام انتقالات صفحات موحد ومركزي على مستوى المشروع.
  - [x] SubTask 4.1: توحيد `AuthLayout` و`DashboardLayout` و`AdminLayout` على نفس محرك الانتقالات
  - [x] SubTask 4.2: تعريف سياسة انتقال مركزية باستخدام `route.meta`
  - [x] SubTask 4.3: تحسين اتجاهات الانتقال ودعم `prefers-reduced-motion`

- [x] Task 5: تحويل الخلفيات الثقيلة في صفحات المصادقة إلى Progressive Enhancement.
  - [x] SubTask 5.1: إنشاء خلفية ثابتة أساسية تظهر فوراً
  - [x] SubTask 5.2: تأخير أو تحسين تفعيل المشهد البصري الثقيل بدون وميض
  - [x] SubTask 5.3: ضبط تسلسل ظهور النصوص والطبقات لمنع القفز البصري

- [x] Task 6: توحيد سياسة التحميل داخل الصفحات والمكونات.
  - [x] SubTask 6.1: تحديد متى يُستخدم Bootstrap Shell ومتى يُستخدم Skeleton ومتى يُستخدم Blocking Overlay
  - [x] SubTask 6.2: توحيد المكونات الأساسية للحالات التحميلية في الـ design system
  - [x] SubTask 6.3: تطبيق السياسة على المسارات الحرجة أولاً مثل المصادقة والصفحات الرئيسية

- [x] Task 7: التحقق النهائي من الاستقرار البصري والأداء.
  - [x] SubTask 7.1: التحقق من اختفاء الشاشة الفارغة في أول تحميل
  - [x] SubTask 7.2: التحقق من اختفاء وميض الثيم والخلفيات
  - [x] SubTask 7.3: التحقق من سلاسة التنقل واتساقه بين الأقسام
  - [x] SubTask 7.4: تشغيل `lint` وفحص الواجهات الحرجة يدوياً

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 2
- Task 5 depends on Task 2
- Task 6 depends on Task 1, Task 2, Task 4
- Task 7 depends on Task 1, Task 2, Task 3, Task 4, Task 5, Task 6

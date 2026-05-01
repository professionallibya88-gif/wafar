# Tasks
- [x] Task 1: فحص وتحسين التخطيطات الأساسية (Layouts)
  - [x] SubTask 1.1: مراجعة `DashboardLayout.vue` و `AdminLayout.vue` وتأكيد التجاوب.
  - [x] SubTask 1.2: تحسين سلوك الشريط الجانبي (Sidebar) على شاشات الموبايل (Drawer/Off-canvas).
  - [x] SubTask 1.3: تحسين قوائم التنقل العلوية والسفلية (Navbar & BottomNav).

- [x] Task 2: تحسين الفلاتر ومكونات البحث
  - [x] SubTask 2.1: مراجعة مكونات الفلاتر في صفحة البحث (SearchView).
  - [x] SubTask 2.2: تحويل الفلاتر إلى تصميم قابل للطي (Collapsible) أو نافذة منبثقة (Modal/Offcanvas) على الموبايل.

- [x] Task 3: تحسين الجداول وقوائم البيانات
  - [x] SubTask 3.1: مراجعة كافة الجداول (DataTables) وإضافة خاصية التمرير الأفقي أو تحويلها إلى بطاقات (Cards) في الشاشات الصغيرة.
  - [x] SubTask 3.2: التأكد من وضوح النصوص والأزرار داخل الجداول.

- [x] Task 4: مراجعة المكونات الأساسية (Base Components)
  - [x] SubTask 4.1: مراجعة `BaseModal` لضمان توافقه مع الموبايل (Full screen أو عرض مناسب).
  - [x] SubTask 4.2: مراجعة أحجام الأزرار وحقول الإدخال (`BaseInput`, `BaseButton`) لتكون قابلة للمس (Touch-friendly).

- [x] Task 5: فحص شامل لكافة الصفحات
  - [x] SubTask 5.1: فحص صفحات الإدارة (Admin views).
  - [x] SubTask 5.2: فحص صفحات الموردين (Supplier views).
  - [x] SubTask 5.3: التأكد من عدم وجود خروج عن إطار الشاشة (Horizontal Overflow) في كامل التطبيق.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 5] depends on [Task 1], [Task 2], [Task 3], [Task 4]

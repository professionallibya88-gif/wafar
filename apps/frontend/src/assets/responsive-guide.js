/**
 * دليل نظام التجاوب العالمي - Global Responsive System Guide
 *
 * هذا الملف يحتوي على جميع المعلومات حول نظام التجاوب الموحد
 */

// ================================================
// BREAKPOINTS المستعملة في منصة وفر
// ================================================

/*
  - xs: 480px    (الهواتف الصغيرة)
  - sm: 640px    (الهواتف)
  - md: 768px    (الهواتف الكبيرة / الأجهزة اللوحية الصغيرة)
  - lg: 1024px   (الأجهزة اللوحية)
  - xl: 1280px   (اللابتوبات الصغيرة)
  - 2xl: 1536px  (أجهزة سطح المكتب)
  - 3xl: 1920px  (الشاشات الكبيرة جداً)
*/

// ================================================
// أمثلة على الاستخدام
// ================================================

// 1. استخدام Breakpoints في HTML
/*
  <div class="text-sm sm:text-base md:text-lg lg:text-xl">
    نص متجاوب
  </div>
*/

// 2. استخدام Grid System المتجاوب
/*
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div>عنصر 1</div>
    <div>عنصر 2</div>
    <div>عنصر 3</div>
    <div>عنصر 4</div>
  </div>
*/

// 3. استخدام الـ Classes الجاهزة
/*
  <div class="responsive-container">
    محتوى متجاوب
  </div>

  <div class="responsive-padding">
    Padding متجاوب
  </div>

  <button class="touch-target">
    زر محسن للمس
  </button>
*/

// 4. استخدام Sidebar المتجاوب
/*
  <aside class="sidebar-desktop">
    Sidebar يظهر فقط على الشاشات الكبيرة
  </aside>

  <div class="mobile-bottom-nav">
    Bottom Navigation يظهر فقط على الموبايل
  </div>
*/

// 5. إخفاء/إظهار حسب الجهاز
/*
  <div class="mobile-only">
    يظهر فقط على الموبايل
  </div>

  <div class="tablet-up">
    يظهر على التابلت وأكبر
  </div>

  <div class="desktop-only">
    يظهر فقط على الديسكتوب
  </div>
*/

// ================================================
// مكونات Layout الرئيسية
// ================================================

// AdminLayout.vue
// - شريط علوي متجاوب
// - Sidebar قابل للطي على الموبايل
// - Bottom Navigation للموبايل
// - Overlay عند فتح Sidebar على الموبايل

// DashboardLayout.vue
// - نفس ميزات AdminLayout
// - تصميم فاتح بدلاً من الداكن

// ================================================
// نصائح مهمة
// ================================================

/*
  1. دائماً استخدم Mobile-First Approach
     - ابدأ بالتصميم للموبايل
     - ثم أضف التحسينات للشاشات الأكبر

  2. استخدم Touch Targets بحجم 44x44px على الأقل
     - class="touch-target" أو "touch-target-lg"

  3. اختبر على أحجام شاشات مختلفة
     - استخدام Chrome DevTools Device Mode
     - اختبار على أجهزة حقيقية

  4. استخدم Responsive Classes الجاهزة
     - responsive-container
     - responsive-padding
     - responsive-gap
     - responsive-text-*

  5. احترم Safe Area Insets
     - للأجهزة ذات الشق (Notch)
     - استخدم safe-area-inset-top, safe-area-inset-bottom

  6. دعم Reduced Motion
     - النظام يدعم prefers-reduced-motion تلقائياً
     - الحركات تُعطّل للمستخدمين الذين يفضلون ذلك

  7. طلباعة الصفحة
     - استخدم class="no-print" لإخفاء العناصر عند الطلباعة
     - استخدم class="print-only" لإظهار عناصر فقط عند الطلباعة
*/

// ================================================
// Classes متوفرة في responsive.css
// ================================================

/*
  - Responsive Containers:
    .responsive-container
    .container-fluid

  - Responsive Typography:
    .responsive-text-xs
    .responsive-text-sm
    .responsive-text-base
    .responsive-text-lg
    .responsive-text-xl
    .responsive-text-2xl

  - Responsive Spacing:
    .responsive-padding
    .responsive-gap

  - Touch Optimizations:
    .touch-target
    .touch-target-lg
    .touch-optimized

  - Device Visibility:
    .mobile-only
    .tablet-up
    .desktop-only

  - Responsive Layouts:
    .mobile-stack
    .mobile-row
    .mobile-grid-*

  - Special Features:
    .safe-area-inset-*
    .landscape-compact
    .no-print
    .print-only
*/

// ================================================
// أفضل الممارسات
// ================================================

/*
  1. الـ Layouts:
     - استخدم الـ Layouts الجاهزة (AdminLayout, DashboardLayout)
     - لا تعدلها مباشرة، استخدم الـ Props

  2. الـ Components:
     - صمم المكونات لتكون متجاوبة من البداية
     - استخدم Tailwind breakpoints

  3. الـ Images:
     - استخدم responsive-image classes
     - حدد aspect-ratio مناسب

  4. الـ Forms:
     - استخدم input classes المتجاوبة
     - تأكد من أن الحقول سهلة اللمس على الموبايل

  5. الـ Tables:
     - استخدم table-responsive للتمرير الأفقي
     - فكر في عرض البيانات كـ Cards على الموبايل

  6. الـ Navigation:
     - استخدم Bottom Navigation على الموبايل
     - استخدم Sidebar على الديسكتوب
*/

// ================================================
// اختبار التجاوب
// ================================================

/*
  1. Chrome DevTools:
     - افتح DevTools (F12)
     - اضغط على Toggle Device Toolbar
     - اختر أجهزة مختلفة

  2. Breakpoints للاختبار:
     - 375px - iPhone SE
     - 414px - iPhone 11 Pro Max
     - 768px - iPad
     - 1024px - iPad Pro
     - 1440px - Desktop

  3. اختبار اللمس:
     - استخدم Device Mode
     - فعّل Touch Simulation
     - اختبر جميع الأزرار والروابط

  4. اختبار الاتجاه:
     - جرّب Portrait و Landscape
     - تأكد من عدم وجود مشاكل
*/

export default {
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    "3xl": "1920px",
  },
};

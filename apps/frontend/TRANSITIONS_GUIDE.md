# دليل نظام الانتقالات البصرية - منصة وفر

## نظرة عامة

تم إنشاء نظام انتقالات بصرية شامل ومتكامل يغطي جميع جوانب التنقل في المشروع، مع دعم كامل لاتجاه RTL (من اليمين لليسار).

## المكونات المتاحة

### 1. PageTransition - انتقالات الصفحات

مكون للتعامل مع الانتقالات بين الصفحات المختلفة.

**الخصائص:**
- `type`: نوع الانتقال (fade, slide, scale, bounce)
- `direction`: اتجاه الانتقال (forward, back)
- `mode`: وضع الانتقال (in-out, out-in)

**الاستخدام:**
```vue
<template>
  <PageTransition type="slide" direction="forward">
    <router-view />
  </PageTransition>
</template>

<script setup>
import { PageTransition } from '@/components/transitions';
</script>
```

**الأنواع المتاحة:**
- `slide`: انتقال انزلاقي (الافتراضي)
- `fade`: انتقال تلاشي
- `scale`: انتقال تكبير/تصغير
- `bounce`: انتقال مع ارتداد

### 2. SectionTransition - انتقالات الأقسام

مكون للتعامل مع الانتقالات بين الأقسام داخل نفس الصفحة.

**الخصائص:**
- `type`: نوع الانتقال (fade, slide-up, slide-down, scale)
- `delay`: تأخير الانتقال بالمللي ثانية
- `mode`: وضع الانتقال (out-in, in-out)

**الاستخدام:**
```vue
<template>
  <div class="space-y-8">
    <SectionTransition type="fade" :delay="0">
      <div class="header">...</div>
    </SectionTransition>

    <SectionTransition type="slide-up" :delay="100">
      <div class="content">...</div>
    </SectionTransition>

    <SectionTransition type="slide-up" :delay="200">
      <div class="footer">...</div>
    </SectionTransition>
  </div>
</template>

<script setup>
import { SectionTransition } from '@/components/transitions';
</script>
```

**الأنواع المتاحة:**
- `fade`: تلاشي بسيط
- `slide-up`: انزلاق من الأسفل للأعلى
- `slide-down`: انزلاق من الأعلى للأسفل
- `scale`: تكبير/تصغير

### 3. ListTransition - انتقالات القوائم

مكون للتعامل مع الانتقالات بين عناصر القوائم.

**الخصائص:**
- `type`: نوع الانتقال (list, shuffle, fade)
- `containerClass`: كلاس CSS للحاوية

**الاستخدام:**
```vue
<template>
  <ListTransition type="list" containerClass="space-y-3">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </ListTransition>
</template>

<script setup>
import { ListTransition } from '@/components/transitions';
</script>
```

**الأنواع المتاحة:**
- `list`: انتقال قائمة مع انزلاق
- `shuffle`: انتقال مع تغيير الحجم
- `fade`: تلاشي بسيط

### 4. usePageTransition - Composable

دالة مساعدة لتحديد نوع الانتقال تلقائياً بناءً على المسار.

**الاستخدام:**
```vue
<script setup>
import { usePageTransition } from '@/composables/usePageTransition';

const { transitionProps, transitionDirection } = usePageTransition();
</script>

<template>
  <PageTransition v-bind="transitionProps">
    <router-view />
  </PageTransition>
</template>
```

**المنطق التلقائي:**
- الانتقال من/إلى صفحات المصادقة → `scale`
- الانتقال من/إلى لوحة المدير → `fade`
- الانتقال إلى صفحة تفاصيل → `slide`
- الافتراضي → `slide`

## التصدير الموحد

يمكن استيراد جميع المكونات من مكان واحد:

```javascript
import { PageTransition, SectionTransition, ListTransition } from '@/components/transitions';
```

## الدعم RTL

جميع الانتقالات تدعم اتجاه RTL تلقائياً:
- في RTL: الانتقالات تتم من اليمين لليسار
- في LTR: الانتقالات تتم من اليسار ليمين
- يتم تحديد الاتجاه تلقائياً بناءً على `dir="rtl"` أو `dir="ltr"`

## أمثلة الاستخدام

### مثال 1: صفحة رئيسية مع أقسام متتالية

```vue
<template>
  <div class="space-y-8">
    <SectionTransition type="fade" :delay="0">
      <Header />
    </SectionTransition>

    <SectionTransition type="slide-up" :delay="100">
      <StatsCards />
    </SectionTransition>

    <SectionTransition type="slide-up" :delay="200">
      <QuickActions />
    </SectionTransition>

    <SectionTransition type="slide-up" :delay="300">
      <RecentActivity />
    </SectionTransition>
  </div>
</template>
```

### مثال 2: قائمة ديناميكية

```vue
<template>
  <ListTransition type="list" containerClass="space-y-3">
    <div v-for="item in items" :key="item.id" class="card">
      {{ item.name }}
    </div>
  </ListTransition>
</template>
```

### مثال 3: انتقالات الصفحات التلقائية

```vue
<template>
  <PageTransition v-bind="transitionProps">
    <router-view />
  </PageTransition>
</template>

<script setup>
import { usePageTransition } from '@/composables/usePageTransition';
import { PageTransition } from '@/components/transitions';

const { transitionProps } = usePageTransition();
</script>
```

## التخصيص

### تخصيص سرعة الانتقال

يمكن تخصيص سرعة الانتقال من خلال تعديل CSS Variables في `main.css`:

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### تخصيص منحنى الحركة (Easing)

```css
:root {
  --spring-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --spring-smooth: cubic-bezier(0.23, 1, 0.32, 1);
}
```

## الملفات المضافة

1. `frontend/src/components/transitions/PageTransition.vue`
2. `frontend/src/components/transitions/SectionTransition.vue`
3. `frontend/src/components/transitions/ListTransition.vue`
4. `frontend/src/components/transitions/index.js`
5. `frontend/src/composables/usePageTransition.js`
6. تحديثات في `frontend/src/assets/main.css`
7. تحديثات في `frontend/src/App.vue` - إضافة PageTransition حول router-view
8. تحديثات في `frontend/src/layouts/DashboardLayout.vue` - إزالة animate-fade-in-up
9. تحديثات في `frontend/src/layouts/AdminLayout.vue` - إزالة animate-fade-in-up
10. تحديثات في `frontend/src/views/dashboard/HomeView.vue` - استخدام SectionTransition

## البنية الحالية

- **App.vue**: يحتوي على PageTransition حول router-view الرئيسي
- **DashboardLayout**: يحتوي على router-view للصفحات الفرعية فقط
- **AdminLayout**: يحتوي على router-view للصفحات الفرعية فقط
- **الصفحات الداخلية**: تستخدم SectionTransition للأقسام

## الملاحظات

- جميع الانتقالات تستخدم GPU acceleration للأداء الأمثل
- الانتقالات متجاوبة وتعمل على جميع الأجهزة
- دعم كامل للوضع المظلم
- دعم كامل للتصميم المتجاوب
- الانتقالات لا تؤثر على SEO (تتم على جانب العميل فقط)
- تم تحسين النظام لتقليل المسافات في الانتقالات لجعلها أكثر سلاسة
- تم إصلاح مشاكل positioning باستخدام CSS فقط بدلاً من JavaScript
- PageTransition موجود في App.vue فقط حول router-view الرئيسي

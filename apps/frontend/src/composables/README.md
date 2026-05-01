# Composables الموحدة

هذا المجلد يحتوي على composables موحدة لاستخدامها في جميع مكونات Vue.js.

## usePagination

مقوم لإدارة الصفحات بشكل موحد.

### الاستخدام

```javascript
import { usePagination } from "@/composables/usePagination";

const {
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  changePage,
  nextPage,
  prevPage,
  setTotalItems,
} = usePagination(20);

// عند جلب البيانات
const loadData = async () => {
  const response = await api.get("/items", {
    page: currentPage.value,
    limit: pageSize.value,
  });
  setTotalItems(response.data.total);
};
```

## المكونات الموحدة

### BaseActionButton

مكون زر موحد مع خيارات متعددة.

#### الاستخدام

```vue
<BaseActionButton variant="primary" @click="handleAction">
  حفظ
</BaseActionButton>

<BaseActionButton variant="accent" icon="Plus" @click="createItem">
  إضافة عنصر
</BaseActionButton>

<BaseActionButton variant="danger" :loading="loading" @click="deleteItem">
  حذف
</BaseActionButton>
```

### الخيارات المتاحة

- `variant`: primary, secondary, accent, danger, success, ghost
- `loading`: حالة التحميل
- `icon`: اسم الأيقونة
- `disabled`: تعطيل الزر

## المزايا

- **توحيد الكود**: استخدام نفس الأنماط في جميع المكونات
- **سهولة الصيانة**: تغيير في مكان واحد يؤثر على كل المشروع
- **تقليل التكرار**: لا حاجة لإعادة كتابة نفس الكود
- **تحسين القراءة**: الكود أكثر وضوحاً وسهولة في الفهم

<template>
  <div class="page-shell space-y-6">
    <BaseToast />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="page-title">إدارة قطع الغيار</h1>
        <p class="page-subtitle">
          بحث متقدم، فلاتر دقيقة، وتعديل مباشر على قاعدة البيانات
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <BaseButton @click="loadParts" :disabled="loading" variant="secondary" size="sm">
          <AppIcon name="ArrowPath" size="md" :customClass="loading ? 'animate-spin' : ''" />
          تحديث
        </BaseButton>
        <BaseButton @click="exportResults" :disabled="exporting" variant="secondary" size="sm">
          <AppIcon name="ArrowDownTray" size="md" :customClass="exporting ? 'animate-pulse' : ''" />
          تصدير
        </BaseButton>
        <BaseButton @click="openCreateModal" variant="primary" size="sm">
          <AppIcon name="Plus" size="md" />
          إضافة قطعة
        </BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="bg-layer-stats rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-neutral-900/40">
            <AppIcon name="Squares2X2" size="xl" customClass="text-brand-600 dark:text-neutral-300" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">إجمالي النتائج</p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">{{ totalParts }}</p>
          </div>
        </div>
      </div>
      <div class="bg-layer-stats rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <AppIcon name="CheckCircle" size="xl" customClass="text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">متوفر حالياً</p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">{{ inStockCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-layer-stats rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <AppIcon name="Funnel" size="xl" customClass="text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">فلاتر مفعلة</p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">{{ activeFilterCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-layer-card rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-6">
        <div class="xl:col-span-2">
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            بحث عام
          </label>
          <div class="relative">
            <input
            v-model="filters.q"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="اسم القطعة، الكود، OEM، أو المورد..."
          />
            <AppIcon
              name="MagnifyingGlass"
              size="md"
              customClass="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            الفئة
          </label>
          <select
            v-model="filters.category"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">كل الفئات</option>
            <option v-for="category in filterOptions.categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            العلامة
          </label>
          <select
            v-model="filters.brand"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">كل العلامات</option>
            <option v-for="brand in filterOptions.brands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            الجودة
          </label>
          <select
            v-model="filters.quality_grade"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">كل الدرجات</option>
            <option
              v-for="grade in filterOptions.qualityGrades"
              :key="grade"
              :value="grade"
            >
              {{ qualityLabel(grade) }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            المورد
          </label>
          <select
            v-model="filters.supplier_id"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">كل الموردين</option>
            <option
              v-for="supplier in filterOptions.suppliers"
              :key="supplier.id"
              :value="supplier.id"
            >
              {{ supplier.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-6">
        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            أقل سعر
          </label>
          <input
            v-model="filters.min_price"
            type="number"
            min="0"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="0"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            أعلى سعر
          </label>
          <input
            v-model="filters.max_price"
            type="number"
            min="0"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="0"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            حالة التوفر
          </label>
          <select
            v-model="filters.in_stock"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">الكل</option>
            <option value="true">متوفر</option>
            <option value="false">غير متوفر</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            ترتيب حسب
          </label>
          <select
            v-model="filters.sort_field"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="created_at">الأحدث</option>
            <option value="part_name">الاسم</option>
            <option value="part_code">الكود</option>
            <option value="price_cash">السعر النقدي</option>
            <option value="brand">العلامة</option>
            <option value="category">الفئة</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            الاتجاه
          </label>
          <select
            v-model="filters.sort_dir"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="DESC">تنازلي</option>
            <option value="ASC">تصاعدي</option>
          </select>
        </div>

        <div class="flex items-end gap-3">
          <BaseButton class="flex-1" variant="secondary" @click="resetFilters">
            <AppIcon name="XMark" size="md" />
            مسح הפلاتر
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="panel-table overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1100px]">
          <thead class="bg-brand-50 dark:bg-neutral-900">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">القطعة</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">التصنيف</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">المورد</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">الأسعار</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">التوفر</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">الملف</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-neutral-500">
                جاري تحميل البيانات...
              </td>
            </tr>
            <tr
              v-for="part in parts"
              v-else
              :key="part.id"
              class="transition-colors hover:bg-brand-50/60 dark:hover:bg-neutral-900/40"
            >
              <td class="px-4 py-4 align-top">
                <div class="space-y-1">
                  <p class="font-semibold text-neutral-900 dark:text-white">
                    {{ part.part_name || "بدون اسم" }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    الكود: {{ part.part_code || "-" }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    OEM: {{ part.oem_number || "-" }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="space-y-2">
                  <BaseBadge variant="info" size="sm">{{ part.category || "غير مصنف" }}</BaseBadge>
                  <p class="text-sm text-neutral-700 dark:text-neutral-300">
                    {{ part.brand || "بدون علامة" }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ qualityLabel(part.quality_grade) }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {{ part.supplier?.name || part.supplier_name_text || "-" }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ part.origin_country || "غير محدد" }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                  <p>نقداً: {{ formatCurrency(part.price_cash, part.currency) }}</p>
                  <p>مصرف: {{ formatCurrency(part.price_bank, part.currency) }}</p>
                  <p>جملة: {{ formatCurrency(part.price_wholesale, part.currency) }}</p>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="space-y-2">
                  <BaseBadge :variant="part.in_stock ? 'success' : 'error'" size="sm">
                    {{ part.in_stock ? "متوفر" : "غير متوفر" }}
                  </BaseBadge>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    الكمية: {{ part.quantity_available ?? "-" }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <p class="max-w-[160px] truncate text-sm text-neutral-700 dark:text-neutral-300">
                  {{ part.pdfFile?.original_name || "غير مرتبط" }}
                </p>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="flex flex-wrap gap-2">
                  <BaseButton size="sm" variant="secondary" @click="openEditModal(part)">
                    تعديل
                  </BaseButton>
                  <BaseButton
                    size="sm"
                    variant="danger"
                    @click="removePart(part)"
                    :disabled="savingPart"
                  >
                    حذف
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && parts.length === 0">
              <td colspan="7" class="px-4 py-16 text-center">
                <div class="mx-auto flex max-w-md flex-col items-center">
                  <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-neutral-900/50">
                    <AppIcon name="ArchiveBox" size="2xl" customClass="text-brand-600 dark:text-neutral-300" />
                  </div>
                  <p class="text-lg font-semibold text-neutral-900 dark:text-white">
                    لا توجد نتائج مطابقة
                  </p>
                  <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    جرّب تعديل الفلاتر أو إضافة قطعة جديدة إلى قاعدة البيانات.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex flex-col gap-3 border-t border-neutral-200 px-6 py-4 text-sm dark:border-neutral-800 lg:flex-row lg:items-center lg:justify-between"
      >
        <p class="text-neutral-600 dark:text-neutral-400">
          عرض {{ pageStart }} - {{ pageEnd }} من {{ totalParts }} نتيجة
        </p>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" size="sm" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            السابق
          </BaseButton>
          <span class="px-3 text-neutral-600 dark:text-neutral-400">
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            التالي
          </BaseButton>
        </div>
      </div>
    </div>

    <BaseModal v-model:show="showModal" :title="editingId ? 'تعديل قطعة الغيار' : 'إضافة قطعة جديدة'" size="xl">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            اسم القطعة
          </label>
          <input
            v-model="form.part_name"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="أدخل اسم القطعة"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">كود القطعة</label>
          <input v-model="form.part_code" class="form-input" placeholder="P-001" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">رقم OEM</label>
          <input v-model="form.oem_number" class="form-input" placeholder="OEM-123" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">رقم الصنف</label>
          <input v-model="form.item_number" class="form-input" placeholder="ITEM-01" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">العلامة</label>
          <input v-model="form.brand" class="form-input" placeholder="Toyota" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">الفئة</label>
          <input v-model="form.category" class="form-input" placeholder="فرامل" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">بلد المنشأ</label>
          <input v-model="form.origin_country" class="form-input" placeholder="اليابان" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">المورد</label>
          <select v-model="form.supplier_id" class="form-input">
            <option value="">بدون ربط</option>
            <option
              v-for="supplier in filterOptions.suppliers"
              :key="supplier.id"
              :value="supplier.id"
            >
              {{ supplier.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">اسم المورد النصي</label>
          <input v-model="form.supplier_name_text" class="form-input" placeholder="اسم المورد داخل الملف" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">درجة الجودة</label>
          <select v-model="form.quality_grade" class="form-input">
            <option
              v-for="grade in filterOptions.qualityGrades"
              :key="grade"
              :value="grade"
            >
              {{ qualityLabel(grade) }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">العملة</label>
          <input v-model="form.currency" class="form-input" placeholder="LYD" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">سعر نقدي</label>
          <input v-model="form.price_cash" type="number" min="0" step="0.001" class="form-input" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">سعر مصرف</label>
          <input v-model="form.price_bank" type="number" min="0" step="0.001" class="form-input" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">سعر الجملة</label>
          <input v-model="form.price_wholesale" type="number" min="0" step="0.001" class="form-input" />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">الكمية المتاحة</label>
          <input v-model="form.quantity_available" type="number" min="0" class="form-input" />
        </div>

        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">الوصف</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="وصف مختصر للقطعة"
          />
        </div>

        <div class="md:col-span-2 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 dark:bg-neutral-900/40">
          <input v-model="form.in_stock" type="checkbox" class="h-5 w-5 rounded text-brand-600 focus:ring-brand-500" />
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">القطعة متوفرة حالياً</span>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <BaseButton variant="secondary" @click="closeModal">إلغاء</BaseButton>
          <BaseButton @click="savePart" :disabled="savingPart">
            <AppIcon name="Check" size="md" />
            {{ savingPart ? "جاري الحفظ..." : "حفظ" }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { adminAPI, searchAPI } from "@/services/api";
import { formatCurrency } from "@/utils/currency";
import { BaseBadge, BaseButton, BaseModal, BaseToast } from "@/components/base";
import { AppIcon } from "@/components/icons";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";

const loading = ref(false);
const exporting = ref(false);
const savingPart = ref(false);
const showModal = ref(false);
const editingId = ref("");
const parts = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalParts = ref(0);
const totalPages = ref(1);

const filterOptions = ref({
  categories: [],
  brands: [],
  suppliers: [],
  qualityGrades: ["original", "high", "medium", "low", "unspecified"],
});

const defaultFilters = () => ({
  q: "",
  category: "",
  brand: "",
  quality_grade: "",
  supplier_id: "",
  min_price: "",
  max_price: "",
  in_stock: "",
  sort_field: "created_at",
  sort_dir: "DESC",
});

const filters = reactive(defaultFilters());

useAutoApplyFilters(
  () => [
    filters.q,
    filters.category,
    filters.brand,
    filters.quality_grade,
    filters.supplier_id,
    filters.min_price,
    filters.max_price,
    filters.in_stock,
    filters.sort_field,
    filters.sort_dir,
  ],
  () => loadParts(),
  {
    delay: 500,
    resetPage: () => {
      currentPage.value = 1;
    },
  }
);

const createDefaultForm = () => ({
  part_name: "",
  part_code: "",
  oem_number: "",
  item_number: "",
  brand: "",
  category: "",
  origin_country: "",
  supplier_id: "",
  supplier_name_text: "",
  quality_grade: "unspecified",
  currency: "LYD",
  price_cash: "",
  price_bank: "",
  price_wholesale: "",
  quantity_available: "",
  description: "",
  in_stock: true,
});

const form = reactive(createDefaultForm());

const inStockCount = computed(() => parts.value.filter((part) => part.in_stock).length);
const activeFilterCount = computed(() =>
  Object.entries(filters).filter(
    ([key, value]) =>
      !["sort_field", "sort_dir"].includes(key) &&
      value !== "" &&
      value !== null &&
      value !== undefined
  ).length
);
const pageStart = computed(() => (totalParts.value ? (currentPage.value - 1) * pageSize.value + 1 : 0));
const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalParts.value));

const qualityLabel = (value) =>
  ({
    original: "أصلي",
    high: "عالية",
    medium: "متوسطة",
    low: "اقتصادية",
    unspecified: "غير محددة",
  })[value] || "غير محددة";



const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const buildParams = () => {
  const params = {
    page: currentPage.value,
    limit: pageSize.value,
    sort_field: filters.sort_field,
    sort_dir: filters.sort_dir,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params[key] = value;
    }
  });

  return params;
};

const loadFilterOptions = async () => {
  try {
    const response = await adminAPI.getPartFilterOptions();
    filterOptions.value = {
      categories: response.data?.data?.categories || [],
      brands: response.data?.data?.brands || [],
      suppliers: response.data?.data?.suppliers || [],
      qualityGrades: response.data?.data?.qualityGrades || filterOptions.value.qualityGrades,
    };
  } catch (_error) {
    window.$toast.error("تعذر تحميل خيارات الفلاتر");
  }
};

const loadParts = async () => {
  loading.value = true;
  try {
    const response = await adminAPI.getParts(buildParams());
    parts.value = response.data?.data?.parts || [];
    totalParts.value = response.data?.meta?.total || 0;
    totalPages.value = response.data?.meta?.totalPages || 1;
  } catch (_error) {
    window.$toast.error("تعذر تحميل قطع الغيار");
  } finally {
    loading.value = false;
  }
};



const resetFilters = async () => {
  Object.assign(filters, defaultFilters());
  currentPage.value = 1;
  // loadParts() will be triggered automatically by useAutoApplyFilters
};

const changePage = async (page) => {
  if (page < 1 || page > totalPages.value) {
    return;
  }

  currentPage.value = page;
  await loadParts();
};

const resetForm = () => {
  Object.assign(form, createDefaultForm());
  editingId.value = "";
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const openCreateModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (part) => {
  editingId.value = part.id;
  Object.assign(form, {
    part_name: part.part_name || "",
    part_code: part.part_code || "",
    oem_number: part.oem_number || "",
    item_number: part.item_number || "",
    brand: part.brand || "",
    category: part.category || "",
    origin_country: part.origin_country || "",
    supplier_id: part.supplier_id || "",
    supplier_name_text: part.supplier_name_text || "",
    quality_grade: part.quality_grade || "unspecified",
    currency: part.currency || "LYD",
    price_cash: part.price_cash ?? "",
    price_bank: part.price_bank ?? "",
    price_wholesale: part.price_wholesale ?? "",
    quantity_available: part.quantity_available ?? "",
    description: part.description || "",
    in_stock: Boolean(part.in_stock),
  });
  showModal.value = true;
};

const savePart = async () => {
  if (!form.part_name.trim()) {
    window.$toast.error("اسم القطعة مطلوب");
    return;
  }

  const payload = {
    part_name: form.part_name,
    part_code: form.part_code || null,
    oem_number: form.oem_number || null,
    item_number: form.item_number || null,
    brand: form.brand || null,
    category: form.category || null,
    origin_country: form.origin_country || null,
    supplier_id: form.supplier_id || null,
    supplier_name_text: form.supplier_name_text || null,
    quality_grade: form.quality_grade,
    currency: form.currency || "LYD",
    price_cash: normalizeNumber(form.price_cash),
    price_bank: normalizeNumber(form.price_bank),
    price_wholesale: normalizeNumber(form.price_wholesale),
    quantity_available: normalizeNumber(form.quantity_available),
    description: form.description || null,
    in_stock: form.in_stock,
  };

  savingPart.value = true;
  try {
    if (editingId.value) {
      await adminAPI.updatePart(editingId.value, payload);
      window.$toast.success("تم تحديث قطعة الغيار بنجاح");
    } else {
      await adminAPI.createPart(payload);
      window.$toast.success("تمت إضافة قطعة الغيار بنجاح");
    }

    closeModal();
    await Promise.all([loadParts(), loadFilterOptions()]);
  } catch (error) {
    const message = error?.response?.data?.message || "تعذر حفظ البيانات";
    window.$toast.error(message);
  } finally {
    savingPart.value = false;
  }
};

const removePart = async (part) => {
  const confirmed = await window.$confirm(`هل تريد حذف القطعة "${part.part_name || "بدون اسم"}"؟`);
  if (!confirmed) {
    return;
  }

  try {
    await adminAPI.deletePart(part.id);
    window.$toast.success("تم حذف قطعة الغيار");
    await Promise.all([loadParts(), loadFilterOptions()]);
  } catch (_error) {
    window.$toast.error("تعذر حذف قطعة الغيار");
  }
};

const exportResults = async () => {
  exporting.value = true;
  try {
    const response = await searchAPI.exportResults(buildParams());
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "parts-export.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (_error) {
    window.$toast.error("تعذر تصدير النتائج");
  } finally {
    exporting.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadFilterOptions(), loadParts()]);
});
</script>

<style scoped>
.form-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(229 229 229);
  background: white;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: rgb(23 23 23);
}

.form-input:focus {
  outline: none;
  border-color: rgb(59 130 246);
  box-shadow: 0 0 0 2px rgb(59 130 246 / 0.2);
}

.dark .form-input {
  border-color: rgb(64 64 64);
  background: rgb(38 38 38);
  color: white;
}
</style>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
          تفاصيل الملف
        </h1>
        <p class="mt-1 text-neutral-500 dark:text-neutral-400">
          معلومات ملف PDF المرفوع
        </p>
      </div>
      <BaseButton @click="$router.push('/files')" variant="outline">
        <template #iconLeft>
          <AppIcon name="ArrowLeft" size="sm" />
        </template>
        العودة إلى الملفات
      </BaseButton>
    </div>

    <!-- File Info Card -->
    <div
      v-if="fileData"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden"
    >
      <div class="p-6 lg:p-8">
        <div
          class="flex items-start gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-700"
        >
          <div
            class="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center"
          >
            <AppIcon
              name="Document"
              size="2xl"
              customClass="text-brand-600 dark:text-neutral-400"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
              {{ fileData.original_name }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {{ formatSize(fileData.file_size) }}
            </p>
          </div>
          <span
            :class="'px-4 py-2 rounded-full text-sm font-medium ' + (getFileStatusVariant(fileData.status) === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : getFileStatusVariant(fileData.status) === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : getFileStatusVariant(fileData.status) === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : getFileStatusVariant(fileData.status) === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300')"
          >
            {{ getFileStatusLabel(fileData.status) }}
          </span>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div
            class="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center"
          >
            <div class="text-2xl font-bold text-brand-600 dark:text-neutral-400">
              {{ fileData.parts_count || 0 }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              القطع
            </div>
          </div>
          <div
            class="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center"
          >
            <div class="text-2xl font-bold text-brand-600 dark:text-neutral-400">
              {{ fileData.page_count || "-" }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              الصفحات
            </div>
          </div>
          <div
            class="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center"
          >
            <div
              class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {{ fileData.processing_method || "-" }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              الطريقة
            </div>
          </div>
          <div
            class="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center"
          >
            <div class="text-sm text-neutral-700 dark:text-neutral-300">
              {{
                fileData.document_date
                  ? new Date(fileData.document_date).toLocaleDateString("ar-LY")
                  : "-"
              }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              تاريخ الملف
            </div>
          </div>
          <div
            class="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center"
          >
            <div class="text-sm text-neutral-700 dark:text-neutral-300">
              {{
                fileData.createdAt
                  ? new Date(fileData.createdAt).toLocaleDateString("ar-LY")
                  : "-"
              }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              تاريخ الرفع
            </div>
          </div>
          <div
            class="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center"
          >
            <div
              class="text-sm font-bold"
              :class="
                fileData.is_latest_version
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              "
            >
              {{ fileData.version_number || 1 }}
              <span v-if="fileData.is_latest_version" class="text-xs mr-1"
                >(أحدث)</span
              >
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              الإصدار
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Extracted Parts Card -->
    <div
      v-if="fileData"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden"
    >
      <div
        class="px-6 py-5 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between"
      >
        <h2
          class="font-semibold text-neutral-900 dark:text-white flex items-center gap-2"
        >
          <AppIcon
            name="Folder"
            size="md"
            customClass="text-neutral-400 dark:text-neutral-500"
          />
          القطع المستخرجة
        </h2>
        <span
          class="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full"
          >{{ partsMeta.total || 0 }} قطعة</span
        >
      </div>

      <!-- Filters Section -->
      <div class="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <AppIcon name="MagnifyingGlass" size="sm" customClass="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              v-model="filters.q"
              @input="applyFilters"
              type="text"
              placeholder="ابحث بالاسم، الكود، أو رقم OEM..."
              class="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white transition-shadow"
            />
          </div>
          <!-- Toggle Advanced Filters -->
          <BaseButton @click="showAdvancedFilters = !showAdvancedFilters" variant="outline" class="shrink-0">
            <template #iconLeft>
              <AppIcon name="AdjustmentsHorizontal" size="sm" />
            </template>
            فلاتر متقدمة
          </BaseButton>
        </div>

        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">الشركة/العلامة</label>
            <input v-model="filters.brand" type="text" placeholder="اسم الشركة..." class="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-brand-500 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">الجودة</label>
            <select v-model="filters.quality_grade" @change="applyFilters" class="form-select">
              <option value="">الكل</option>
              <option value="original">أصلي</option>
              <option value="high">جيد</option>
              <option value="medium">متوسط</option>
              <option value="low">اقتصادي</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">التوفر</label>
            <select v-model="filters.in_stock" class="form-select">
              <option value="">الكل</option>
              <option value="true">متوفر فقط</option>
              <option value="false">غير متوفر</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">السعر الأدنى</label>
            <input v-model="filters.min_price" type="number" min="0" placeholder="0.00" class="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-brand-500 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">السعر الأعلى</label>
            <input v-model="filters.max_price" type="number" min="0" placeholder="0.00" class="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-brand-500 dark:text-white" />
          </div>
        </div>
        
        <!-- Active Filters & Clear Button -->
        <div v-if="hasActiveFilters" class="flex justify-end pt-2">
          <button @click="clearFilters" class="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
            <AppIcon name="XMark" size="xs" />
            مسح الفلاتر
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                OEM / الكود
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                الاسم
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                الشركة/المنشأ
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                التوفر
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                الأسعار
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-700">
            <tr
              v-for="part in parts"
              :key="part.id"
              class="hover:bg-brand-50/50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {{ part.oem_number || part.part_code || part.item_number || "-" }}
                  </span>
                  <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {{ secondaryCode(part) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {{ part.part_name || "-" }}
                <div v-if="part.car_model" class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <AppIcon name="Truck" size="xs" class="inline-block mr-1" />
                  {{ part.car_model }}
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div class="flex flex-col gap-1">
                  <span v-if="part.brand" class="font-medium text-neutral-800 dark:text-neutral-300">{{ part.brand }}</span>
                  <span v-if="part.origin_country" class="text-xs text-neutral-500">{{ part.origin_country }}</span>
                  <BaseBadge
                    v-if="part.quality_grade && part.quality_grade !== 'unspecified'"
                    :variant="qualityVariant(part.quality_grade)"
                    size="xs"
                    class="w-fit mt-1"
                  >
                    {{ qualityLabel(part.quality_grade) }}
                  </BaseBadge>
                  <span v-if="!part.brand && !part.origin_country">-</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="mt-1">
                  <span
                    v-if="part.quantity_available !== null && part.quantity_available !== undefined"
                    class="text-xs text-neutral-500"
                  >
                    الكمية: {{ part.quantity_available }}
                  </span>
                  <span
                    v-else-if="part.in_stock === true"
                    class="text-green-600 dark:text-green-400 text-xs font-medium"
                  >متوفر</span>
                  <span
                    v-else-if="part.in_stock === false"
                    class="text-red-600 dark:text-red-400 text-xs font-medium"
                  >غير متوفر</span>
                  <span v-else class="text-neutral-400">-</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex flex-col gap-1">
                  <span v-if="displayCashPrice(part)" class="text-sm font-bold text-neutral-900 dark:text-white">
                    نقدي: {{ formatCurrency(displayCashPrice(part)) }}
                  </span>
                  <span v-if="part.price_bank" class="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    مصرف: {{ formatCurrency(part.price_bank) }}
                  </span>
                  <span v-if="part.price_wholesale" class="text-xs text-neutral-500 dark:text-neutral-400">
                    جملة: {{ formatCurrency(part.price_wholesale) }}
                  </span>
                  <span
                    v-if="!displayCashPrice(part) && !part.price_bank && !part.price_wholesale"
                    class="text-neutral-400"
                  >-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="partsLoading" class="text-center py-12">
          <div
            class="w-10 h-10 border-4 border-brand-200 dark:border-neutral-800 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-neutral-500 dark:text-neutral-400">جاري تحميل القطع...</p>
        </div>
        <div
          v-else-if="partsError"
          class="text-center py-12 text-neutral-500 dark:text-neutral-400"
        >
          <p>{{ partsError }}</p>
          <div class="mt-4">
            <BaseButton @click="loadParts(partsPage)" variant="outline">
              إعادة تحميل القطع
            </BaseButton>
          </div>
        </div>
        <div v-else-if="!parts.length" class="text-center py-12">
          <AppIcon
            name="Folder"
            size="3xl"
            customClass="text-neutral-300 dark:text-neutral-600 mx-auto mb-3"
          />
          <p class="text-neutral-500 dark:text-neutral-400">
            لا توجد قطع مستخرجة
          </p>
        </div>
      </div>
      <div
        v-if="partsMeta.totalPages > 1"
        class="px-6 py-4 border-t border-neutral-100 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          صفحة {{ partsMeta.page }} من {{ partsMeta.totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="partsPage <= 1 || partsLoading"
            @click="changePartsPage(partsPage - 1)"
          >
            السابق
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="partsPage >= partsMeta.totalPages || partsLoading"
            @click="changePartsPage(partsPage + 1)"
          >
            التالي
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-12"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-brand-200 dark:border-neutral-800 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-neutral-500 dark:text-neutral-400">
          جاري تحميل البيانات...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="loadError"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-12"
    >
      <div class="text-center space-y-4">
        <p class="text-neutral-700 dark:text-neutral-300">
          {{ loadError }}
        </p>
        <div class="flex items-center justify-center gap-3">
          <BaseButton @click="loadFile" variant="primary">
            إعادة المحاولة
          </BaseButton>
          <BaseButton @click="$router.push('/files')" variant="outline">
            العودة إلى ملفاتي
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { pdfAPI } from "@/services/api";
import { BaseButton, BaseBadge } from "@/components/base";
import { AppIcon } from "@/components/icons";
import { formatCurrency } from "@/utils/currency";
import { getFileStatusLabel, getFileStatusVariant } from "@/utils/statusLabels";

const route = useRoute();
const router = useRouter();
const fileData = ref(null);
const parts = ref([]);
const partsPage = ref(1);
const partsLimit = 50;
const partsMeta = ref({
  total: 0,
  page: 1,
  limit: partsLimit,
  totalPages: 0,
});
const partsLoading = ref(false);
const partsError = ref("");
const isLoading = ref(true);
const loadError = ref("");
let redirectTimer = null;

// Filters State
const showAdvancedFilters = ref(false);
const filters = ref({
  q: "",
  brand: "",
  quality_grade: "",
  in_stock: "",
  min_price: "",
  max_price: "",
});
let filterTimeout = null;

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some((v) => v !== "");
});

const applyFilters = () => {
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    loadParts(1);
  }, 500);
};

const clearFilters = () => {
  filters.value = {
    q: "",
    brand: "",
    quality_grade: "",
    in_stock: "",
    min_price: "",
    max_price: "",
  };
  loadParts(1);
};

const clearRedirectTimer = () => {
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
};

const loadParts = async (page = 1) => {
  partsLoading.value = true;
  partsError.value = "";

  try {
    // Build params dynamically to remove empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters.value).filter((entry) => entry[1] !== "")
    );
    
    const params = {
      page,
      limit: partsLimit,
      ...activeFilters
    };
    
    const res = await pdfAPI.getParts(route.params.id, params);
    const payload = res?.data?.data;
    const meta = res?.data?.meta;

    parts.value = (payload?.parts || []).map(normalizePartForView);
    partsPage.value = meta?.page || page;
    partsMeta.value = {
      total: meta?.total || 0,
      page: meta?.page || page,
      limit: meta?.limit || partsLimit,
      totalPages: meta?.totalPages || 0,
    };
  } catch (e) {
    parts.value = [];
    partsMeta.value = {
      total: 0,
      page,
      limit: partsLimit,
      totalPages: 0,
    };
    partsError.value = "تعذر تحميل القطع حالياً. حاول مرة أخرى.";
  } finally {
    partsLoading.value = false;
  }
};

const loadFile = async () => {
  clearRedirectTimer();
  isLoading.value = true;
  loadError.value = "";
  fileData.value = null;
  parts.value = [];
  partsPage.value = 1;
  partsError.value = "";
  partsMeta.value = {
    total: 0,
    page: 1,
    limit: partsLimit,
    totalPages: 0,
  };

  try {
    const res = await pdfAPI.getFile(route.params.id);
    const payload = res?.data?.data;

    if (!payload) {
      loadError.value = "تعذر تحميل بيانات الملف حالياً.";
      return;
    }

    fileData.value = payload;
    await loadParts(1);
  } catch (e) {
    const status = e?.response?.status;

    if (status === 404) {
      loadError.value =
        "الملف غير موجود أو لا تملك صلاحية الوصول إليه. سيتم تحويلك إلى صفحة ملفاتي خلال 3 ثوانٍ.";
      redirectTimer = setTimeout(() => {
        router.push("/files");
      }, 3000);
    } else if (status === 403) {
      loadError.value = "لا تملك صلاحية الوصول إلى هذا الملف.";
    } else {
      loadError.value = "حدث خطأ أثناء تحميل تفاصيل الملف. حاول مرة أخرى.";
    }
  } finally {
    isLoading.value = false;
  }
};

const changePartsPage = (page) => {
  if (page < 1 || page > partsMeta.value.totalPages || page === partsPage.value) {
    return;
  }

  loadParts(page);
};

const normalizePartForView = (part) => {
  const derived =
    part?.derived && typeof part.derived === "object" ? part.derived : {};

  return {
    ...part,
    car_model: part?.car_model || derived?.car_model || null,
    quality_grade: part?.quality_grade || "unspecified",
  };
};

const secondaryCode = (part) => {
  if (part?.oem_number) {
    return part?.part_code || part?.item_number || "";
  }

  if (part?.part_code && part?.item_number && part.part_code !== part.item_number) {
    return part.item_number;
  }

  return "";
};

const displayCashPrice = (part) => part?.price_cash ?? part?.price ?? null;

onMounted(loadFile);

watch(
  () => route.params.id,
  () => {
    loadFile();
  }
);

onBeforeUnmount(() => {
  clearRedirectTimer();
});

const formatSize = (b) =>
  b < 1024 * 1024
    ? (b / 1024).toFixed(1) + "KB"
    : (b / 1024 / 1024).toFixed(1) + "MB";


const qualityLabel = (q) => {
  const m = {
    original: "أصلي",
    high: "جيد",
    medium: "متوسط",
    low: "اقتصادي",
    unspecified: "غير محدد",
  };
  return m[q] || q;
};

const qualityVariant = (q) => {
  const m = {
    original: "success",
    high: "info",
    medium: "warning",
    low: "error",
    unspecified: "default",
  };
  return m[q] || "default";
};
</script>

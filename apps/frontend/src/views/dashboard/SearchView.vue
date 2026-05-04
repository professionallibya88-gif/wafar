<template>
  <div class="page-shell">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
          البحث عن قطع الغيار
        </h1>
        <p class="mt-1 text-neutral-500 dark:text-neutral-400">
          ابحث في جميع ملفات PDF المرفوعة للعثور
          على أفضل الأسعار
        </p>
      </div>
      <BaseButton
        v-if="results.length > 0"
        @click="exportResults"
        variant="success"
        size="sm"
      >
        <template #iconLeft>
          <AppIcon name="ArrowDownTray" size="sm" />
        </template>
        تصدير إكسل
      </BaseButton>
    </div>

    <!-- Search Card -->
    <div class="panel-card p-4 xs:p-6 lg:p-8">
      <!-- Search Bar -->
      <div class="flex flex-col md:flex-row gap-3 xs:gap-4">
        <div class="flex-1 relative">
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400 dark:text-neutral-500"
          >
            <AppIcon name="Search" size="lg" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full pr-12 pl-4 py-3.5 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:bg-white dark:focus:bg-neutral-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 transition-all duration-200"
            placeholder="ابحث باسم القطعة أو الرقم أو الرقم الأصلي أو رقم OEM..."
          />
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <BaseButton
            @click="showFilters = !showFilters"
            variant="outline"
            size="lg"
            class="w-full md:w-auto justify-center"
          >
            <AppIcon name="AdjustmentsHorizontal" size="lg" />
            <span class="hidden sm:inline mr-1">فلاتر</span>
          </BaseButton>
        </div>
      </div>
      
      <!-- Search Intelligence Info -->
      <div v-if="searchType && !loading" class="mt-3 text-sm text-brand-600 dark:text-brand-400 flex items-center gap-2">
        <AppIcon name="Sparkles" size="sm" />
        <span>{{ searchTypeLabels[searchType] || 'بحث متقدم' }}</span>
      </div>

      <!-- Advanced Filters -->
      <Teleport to="body" :disabled="!useMobileFiltersPortal">
        <Transition name="filter-transition">
          <div
            v-if="showFilters"
            class="fixed inset-0 z-[140] flex flex-col justify-end md:static md:z-auto md:block md:justify-start"
          >
            <!-- Mobile Backdrop -->
            <div
              class="absolute inset-0 bg-black/50 backdrop-blur-sm md:hidden"
              @click="showFilters = false"
            ></div>

            <!-- Content Wrapper -->
            <div
              class="filter-content relative w-full bg-white dark:bg-neutral-900 md:bg-transparent rounded-t-3xl md:rounded-none p-5 md:p-0 md:mt-6 md:pt-6 md:border-t md:border-neutral-200 md:dark:border-neutral-700 max-h-[85vh] md:max-h-none overflow-y-auto custom-scrollbar shadow-2xl md:shadow-none flex flex-col"
            >
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 md:mb-5 pb-4 md:pb-0 border-b border-neutral-100 dark:border-neutral-800 md:border-0 shrink-0">
              <h3 class="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <AppIcon name="Funnel" size="sm" />
                تصفية متقدمة
              </h3>
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                <button @click="clearFilters" class="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors">
                  إعادة ضبط الفلاتر
                </button>
                <!-- Mobile Close Button -->
                <button @click="showFilters = false" class="md:hidden p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <AppIcon name="XMark" size="md" />
                </button>
              </div>
            </div>
            
            <!-- Filters Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-6 md:pb-0 shrink-0">
              <!-- Brand Searchable Dropdown -->
              <div class="relative" v-click-outside="() => showBrandDropdown = false">
                <label
                  class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >العلامة التجارية (الماركة)</label
                >
                <div class="relative">
                  <input
                    v-model="brandSearch"
                    @focus="showBrandDropdown = true"
                    @input="showBrandDropdown = true"
                    type="text"
                    class="w-full pr-10 pl-10 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="ابحث عن ماركة..."
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AppIcon name="MagnifyingGlass" size="sm" class="text-neutral-400" />
                  </div>
                  <button v-if="filters.brand || brandSearch" @click.stop="clearBrand" class="absolute inset-y-0 left-0 flex items-center pl-3">
                     <AppIcon name="XMark" size="sm" class="text-neutral-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                
                <div v-if="showBrandDropdown" class="absolute z-[80] w-full mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  <div v-if="filteredBrands.length === 0" class="p-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">لا توجد نتائج مطابقة</div>
                  <button
                    v-for="brand in filteredBrands"
                    :key="brand"
                    @click="selectBrand(brand)"
                    class="w-full text-right px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors border-b border-neutral-100 dark:border-neutral-700/50 last:border-0"
                    :class="{'bg-brand-50 dark:bg-neutral-700 text-brand-600 dark:text-brand-400 font-bold': filters.brand === brand}"
                  >
                    {{ brand }}
                  </button>
                </div>
              </div>

              <!-- Quality Grade -->
              <div>
                <label
                  class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >درجة الجودة</label
                >
                <div class="relative">
                  <BaseSelect
  v-model="filters.quality_grade"
  select-class="form-select"
  :options="[
    { label: 'جميع الدرجات', value: '' },
    { label: 'أصلي', value: 'original' },
    { label: 'جيد', value: 'high' },
    { label: 'متوسط', value: 'medium' },
    { label: 'اقتصادي', value: 'low' },
  ]"
/>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AppIcon name="ShieldCheck" size="sm" class="text-neutral-400" />
                  </div>
                </div>
              </div>

              <!-- Min Price -->
              <div>
                <label
                  class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >السعر الأدنى</label
                >
                <div class="relative">
                  <input
                    v-model="filters.min_price"
                    type="number"
                    min="0"
                    class="w-full pr-10 pl-12 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="0"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AppIcon name="CurrencyDollar" size="sm" class="text-neutral-400" />
                  </div>
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm font-medium">د.ل</span>
                </div>
              </div>

              <!-- Max Price -->
              <div>
                <label
                  class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >السعر الأعلى</label
                >
                <div class="relative">
                  <input
                    v-model="filters.max_price"
                    type="number"
                    min="0"
                    class="w-full pr-10 pl-12 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="غير محدد"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AppIcon name="CurrencyDollar" size="sm" class="text-neutral-400" />
                  </div>
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm font-medium">د.ل</span>
                </div>
              </div>

              <!-- PDF File Selection -->
              <div class="sm:col-span-2 lg:col-span-4">
                <label
                  class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >البحث في ملف محدد</label
                >
                <div class="relative">
                  <BaseSelect
  v-model="filters.pdf_file_id"
  select-class="form-select"
  :options="[
    { label: 'جميع الملفات (البحث الشامل)', value: '' },
    ...(availableFiles || []).map(file => ({ label: `${file.original_name} (${file.supplier?.name || 'مورد غير معروف'}) - ${new Date(file.created_at).toLocaleDateString('ar-LY')}`, value: file.id })),
  ]"
/>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AppIcon name="DocumentText" size="sm" class="text-neutral-400" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Apply Button -->
            <div class="md:hidden mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
               <BaseButton @click="showFilters = false" class="w-full" variant="primary" size="lg">
                 عرض النتائج
               </BaseButton>
            </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="panel-card overflow-hidden p-6">
      <BaseSkeleton type="table" :rows="8" usage="table" />
    </div>

    <!-- Results -->
    <div v-else-if="flatResults.length > 0" class="panel-table">
      <div
        class="p-4 lg:p-6 border-b border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <BaseBadge variant="primary" size="lg">
            {{ totalResults }} نتيجة
          </BaseBadge>
        </div>
        <BaseButton @click="selectAll" variant="outline" size="sm" class="w-full sm:w-auto justify-center">
          <template #iconLeft>
            <AppIcon name="CheckCircle" size="sm" />
          </template>
          تحديد الكل
        </BaseButton>
      </div>
      
      <div class="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalResults" :totalPages="totalPages" />
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-neutral-50 dark:bg-neutral-900/60">
            <tr>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-10"
              >
                <input
                  type="checkbox"
                  v-model="selectAllChecked"
                  @change="toggleSelectAll"
                  class="rounded border-neutral-300 dark:border-neutral-600"
                />
              </th>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                OEM / الكود
              </th>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                اسم القطعة
              </th>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden md:table-cell"
              >
                الشركة/المنشأ
              </th>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                المورد (التوفر)
              </th>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                نقدي
              </th>
              <th
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden sm:table-cell"
              >
                مصرف / جملة
              </th>
              <th
                v-if="isEnabled('cart')"
                class="px-3 xs:px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                <!-- إجراءات السلة -->
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <tr
              v-for="part in paginatedResults"
              :key="part._key"
              class="hover:bg-brand-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <td class="px-3 xs:px-4 py-3 xs:py-4">
                <input
                  v-if="part.part_id"
                  type="checkbox"
                  :value="part.part_id"
                  v-model="selectedParts"
                  class="rounded border-neutral-300 dark:border-neutral-600"
                />
              </td>
              <td class="px-3 xs:px-4 py-3 xs:py-4">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {{ part.oem_number || "-" }}
                  </span>
                  <span class="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {{ part.part_code || part.item_number || "" }}
                  </span>
                </div>
              </td>
              <td class="px-3 xs:px-4 py-3 xs:py-4">
                <div class="text-sm font-medium text-neutral-900 dark:text-white">
                  {{ part.part_name }}
                </div>
                <div v-if="part.car_model" class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                  <AppIcon name="Truck" size="xs" />
                  {{ part.car_model }}
                </div>
              </td>
              <td class="px-3 xs:px-4 py-3 xs:py-4 hidden md:table-cell">
                <div class="flex flex-col gap-1">
                  <span v-if="part.brand && part.brand !== '-'" class="text-sm text-neutral-800 dark:text-neutral-300 font-medium">{{ part.brand }}</span>
                  <span v-if="part.origin_country && part.origin_country !== '-'" class="text-xs text-neutral-500 dark:text-neutral-400">{{ part.origin_country }}</span>
                  <BaseBadge v-if="part.quality && part.quality !== '-'" :variant="qualityVariant(part.quality)" size="xs" class="w-fit mt-1">
                    {{ qualityLabel(part.quality) }}
                  </BaseBadge>
                  <span v-if="(!part.brand || part.brand === '-') && (!part.origin_country || part.origin_country === '-')" class="text-neutral-400">-</span>
                </div>
              </td>
              <td class="px-3 xs:px-4 py-3 xs:py-4">
                <div class="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {{ part.supplier_name_text || part.supplier_name || "-" }}
                </div>
                <div class="mt-1">
                  <span
                    v-if="part.quantity_available !== null && part.quantity_available !== undefined"
                    class="text-xs text-neutral-500"
                  >
                    الكمية: {{ part.quantity_available }}
                  </span>
                  <span
                    v-else-if="part.in_stock === true"
                    class="text-green-600 dark:text-green-400 text-xs"
                  >متوفر</span>
                  <span
                    v-else-if="part.in_stock === false"
                    class="text-red-600 dark:text-red-400 text-xs"
                  >غير متوفر</span>
                </div>
              </td>
              <td class="px-3 xs:px-4 py-3 xs:py-4">
                <span class="text-sm font-bold text-neutral-900 dark:text-white">
                  {{ formatCurrency(part.price_cash, 'د.ل') }}
                </span>
                <div v-if="part.cheapest && part.most_expensive && !part.price_cash" class="text-xs text-neutral-500 mt-1">
                  {{ formatCurrency(part.cheapest, '') }} - {{ formatCurrency(part.most_expensive, 'د.ل') }}
                </div>
              </td>
              <td class="px-3 xs:px-4 py-3 xs:py-4 hidden sm:table-cell">
                <div class="flex flex-col gap-1">
                  <span v-if="part.price_bank" class="text-sm text-neutral-700 dark:text-neutral-300">
                    مصرف: {{ formatCurrency(part.price_bank, 'د.ل') }}
                  </span>
                  <span v-if="part.price_wholesale" class="text-xs text-neutral-500 dark:text-neutral-400">
                    جملة: {{ formatCurrency(part.price_wholesale, 'د.ل') }}
                  </span>
                  <span v-if="!part.price_bank && !part.price_wholesale" class="text-neutral-400">-</span>
                </div>
              </td>
              <td v-if="isEnabled('cart')" class="px-3 xs:px-4 py-3 xs:py-4">
                <BaseButton
                  v-if="part.part_id"
                  @click="addToCart(part.part_id)"
                  variant="success"
                  size="sm"
                  class="rounded-full !p-2"
                  title="إضافة للسلة"
                >
                  <AppIcon name="Plus" size="sm" />
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalResults" :totalPages="totalPages" />
      </div>
    </div>

    <!-- Empty Results -->
    <div v-else-if="searched && results.length === 0" class="panel-card p-16 text-center">
      <div
        class="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-2xl mx-auto mb-6 flex items-center justify-center"
      >
        <AppIcon
          name="MagnifyingGlass"
          size="2xl"
          customClass="text-neutral-400 dark:text-neutral-500"
        />
      </div>
      <h3 class="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
        لم يتم العثور على نتائج
      </h3>
      <p class="text-neutral-500 dark:text-neutral-400">
        جرب تغيير كلمات البحث أو استخدام فلاتر
        مختلفة
      </p>
    </div>

    <!-- Compare Button (Fixed) -->
    <Transition name="slide-up">
      <div
        v-if="isEnabled('compare') && selectedParts.length >= 2"
        class="fixed bottom-6 left-6 z-40 safe-area-inset-bottom"
      >
        <BaseButton
          @click="compareSelected"
          variant="success"
          size="lg"
          class="shadow-xl shadow-green-500/30 rounded-full px-6 xs:px-8"
        >
          <template #iconLeft>
            <AppIcon name="ChartBar" size="md" />
          </template>
          <span class="hidden xs:inline"
            >مقارنة ({{ selectedParts.length }})</span
          >
          <span class="xs:hidden">مقارنة</span>
        </BaseButton>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatCurrency } from "@/utils/currency";
import { searchAPI, pdfAPI } from "@/services/api";
import { BaseButton, BaseBadge, BaseToast, BaseSelect, BasePagination } from "@/components/base";
import BaseSkeleton from "@/components/base/BaseSkeleton.vue";
import { AppIcon } from "@/components/icons";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";
import { useFeatureFlags } from "@/composables/useFeatureFlags";
import { vClickOutside } from "@/utils/directives";
import { useCartStore } from "@/stores/cart";

const route = useRoute();
const router = useRouter();
const { isEnabled } = useFeatureFlags();
const cartStore = useCartStore();

const searchQuery = ref(route.query.q || "");
const loading = ref(false);
const searched = ref(false);
const results = ref([]);
const totalResults = ref(0);
const currentPage = ref(1);
watch(pageSize, () => {
  totalPages.value = Math.max(1, Math.ceil(flatResults.value.length / pageSize.value));
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});
const totalPages = ref(1);
const selectedParts = ref([]);
const selectAllChecked = ref(false);
const showFilters = ref(false);
const pageSize = ref(20);
const useMobileFiltersPortal = ref(typeof window !== "undefined" ? window.innerWidth < 768 : true);

const updateMobileFiltersPortal = () => {
  useMobileFiltersPortal.value = window.innerWidth < 768;
};

// Brand Dropdown State
const availableBrands = ref([]);
const availableFiles = ref([]);
const brandSearch = ref("");
const showBrandDropdown = ref(false);

const filteredBrands = computed(() => {
  if (!brandSearch.value) return availableBrands.value;
  const q = brandSearch.value.toLowerCase();
  return availableBrands.value.filter(b => b.toLowerCase().includes(q));
});

const selectBrand = (brand) => {
  filters.value.brand = brand;
  brandSearch.value = brand;
  showBrandDropdown.value = false;
};

// Update filter when user types custom text
watch(brandSearch, (val) => {
  if (val !== filters.value.brand) {
    filters.value.brand = val;
  }
});

const clearBrand = () => {
  filters.value.brand = "";
  brandSearch.value = "";
  showBrandDropdown.value = false;
};

const filters = ref({
  brand: "",
  quality_grade: "",
  min_price: "",
  max_price: "",
  pdf_file_id: "",
});

const clearFilters = () => {
  clearBrand();
  filters.value.quality_grade = "";
  filters.value.min_price = "";
  filters.value.max_price = "";
  filters.value.pdf_file_id = "";
  // doSearch() will be triggered automatically
};

let latestSearchRequestId = 0;

useAutoApplyFilters(
  () => [
    searchQuery.value,
    filters.value.brand,
    filters.value.quality_grade,
    filters.value.min_price,
    filters.value.max_price,
    filters.value.pdf_file_id,
  ],
  () => {
    if (!searchQuery.value.trim()) {
      results.value = [];
      searched.value = false;
      totalResults.value = 0;
      totalPages.value = 1;
      latestSearchRequestId += 1;
      return;
    }
    currentPage.value = 1;
    doSearch();
  },
  { delay: 500 }
);

const loadBrands = async () => {
  try {
    const res = await searchAPI.getBrands();
    availableBrands.value = res.data?.data || [];
  } catch (error) {
    console.error("Failed to load brands:", error);
  }
};

const loadFiles = async () => {
  try {
    const res = await pdfAPI.getCatalogs({ limit: 1000 });
    availableFiles.value = res.data?.data?.catalogs || [];
  } catch (error) {
    console.error("Failed to load catalogs:", error);
  }
};

onMounted(() => {
  updateMobileFiltersPortal();
  window.addEventListener("resize", updateMobileFiltersPortal);
  loadBrands();
  loadFiles();
  if (route.query.q) {
    doSearch();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateMobileFiltersPortal);
});



const flatResults = computed(() => {
  const flat = [];
  for (const item of results.value) {
    const base = {
      part_name: item.part_name || "-",
      part_code: item.part_code || "",
      oem_number: item.oem_number || "",
      item_number: item.item_number || "",
      cheapest: item.cheapest,
      most_expensive: item.most_expensive,
    };

    if (Array.isArray(item.suppliers) && item.suppliers.length > 0) {
      item.suppliers.forEach((supplier, index) => {
        flat.push({
          ...base,
          supplier_name: supplier.supplier || "-",
          supplier_name_text: supplier.supplier_name_text || null,
          supplier_id: supplier.supplier_id,
          price_cash: supplier.price_cash,
          price_bank: supplier.price_bank,
          price_wholesale: supplier.price_wholesale,
          price_wholesale_small: supplier.price_wholesale_small,
          brand: supplier.brand || "-",
          origin_country: supplier.origin_country || "-",
          car_model: supplier.car_model || null,
          quantity_available: supplier.quantity_available,
          in_stock: supplier.in_stock,
          quality: supplier.quality || "-",
          part_id: supplier.part_id,
          _key:
            `${item.oem_number || item.item_number || item.part_name || "part"}-` +
            `${supplier.part_id || supplier.supplier_id || index}`,
        });
      });
    } else {
      flat.push({
        ...base,
        supplier_name: "-",
        supplier_name_text: null,
        price_cash: null,
        price_bank: null,
        price_wholesale: null,
        price_wholesale_small: null,
        brand: "-",
        origin_country: "-",
        car_model: null,
        quantity_available: null,
        in_stock: null,
        quality: "-",
        part_id: null,
        _key: base.oem_number || base.item_number || base.part_name,
      });
    }
  }
  return flat;
});

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return flatResults.value.slice(start, start + pageSize.value);
});

watch(flatResults, (items) => {
  totalResults.value = items.length;
  totalPages.value = Math.max(1, Math.ceil(items.length / pageSize.value));
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const searchType = ref("");
const searchTypeLabels = {
  unified: "بحث ذكي شامل عبر جميع الحقول",
  oem: "بحث برقم المصنع (OEM)",
  item_number: "بحث برقم القطعة",
  name: "بحث باسم القطعة"
};

const doSearch = async () => {
  if (!searchQuery.value.trim()) return;
  loading.value = true;
  searched.value = true;
  selectedParts.value = [];
  selectAllChecked.value = false;
  searchType.value = "";
  const requestId = ++latestSearchRequestId;
  try {
    const params = {
      q: searchQuery.value.trim(),
      ...filters.value,
    };
    const res = await searchAPI.smart(params);
    if (requestId !== latestSearchRequestId) {
      return;
    }
    
    const data = res.data?.data;
    if (data) {
      results.value = data.groups || [];
      searchType.value = data.type || data.search_type || "";
    } else {
      results.value = [];
    }
    
    currentPage.value = 1;
  } catch (e) {
    if (requestId !== latestSearchRequestId) {
      return;
    }
    window.$toast.error("حدث خطأ أثناء البحث");
  } finally {
    if (requestId === latestSearchRequestId) {
      loading.value = false;
    }
  }
};

const toggleSelectAll = () => {
  const ids = paginatedResults.value.map((p) => p.part_id).filter(Boolean);
  selectedParts.value = selectAllChecked.value ? ids : [];
};

const selectAll = () => {
  const ids = flatResults.value.map((p) => p.part_id).filter(Boolean);
  selectedParts.value = ids;
  selectAllChecked.value = true;
};

const compareSelected = () => {
  if (selectedParts.value.length < 2) return;
  router.push({
    path: "/compare",
    query: { ids: selectedParts.value.join(",") },
  });
};

const addToCart = async (partId) => {
  if (!isEnabled('cart')) return;
  await cartStore.addItem(partId, 1);
};

const exportResults = async () => {
  try {
    const res = await searchAPI.exportResults({
      q: searchQuery.value.trim(),
      ...filters.value,
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "search_results.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    window.$toast.error("خطأ في تصدير النتائج");
  }
};

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

<style scoped>
.filter-transition-enter-active,
.filter-transition-leave-active {
  transition: opacity 0.3s ease;
}

.filter-transition-enter-from,
.filter-transition-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .filter-transition-enter-active .filter-content,
  .filter-transition-leave-active .filter-content {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .filter-transition-enter-from .filter-content,
  .filter-transition-leave-to .filter-content {
    transform: translateY(100%);
  }
}

@media (min-width: 768px) {
  .filter-transition-enter-active,
  .filter-transition-leave-active {
    transition: all 0.3s ease;
  }
  .filter-transition-enter-from,
  .filter-transition-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

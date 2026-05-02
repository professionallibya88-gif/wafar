<template>
  <div class="page-shell">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          الكتالوجات
        </h1>
        <p class="page-subtitle">
          جميع كتالوجات قطع الغيار المتاحة
          للبحث
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <label
          class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
        >
          <input
            v-model="latestOnly"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            @change="fetchCatalogs"
          />
          أحدث الإصدارات فقط
        </label>
      </div>
    </div>

    <!-- Catalogs Table Card -->
    <div
      class="panel-table"
    >
      <div v-if="catalogs.length > 0" class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الشركة الموردة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                اسم الملف
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                عدد القطع
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                تاريخ الملف
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                تاريخ الرفع
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الإصدار
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                رفعه
              </th>
            </tr>
          </thead>
          <TransitionGroup name="list" tag="tbody" class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="catalog in catalogs"
                :key="catalog.id"
                class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                @click="$router.push('/files/' + catalog.id)"
              >
                <td class="px-4 py-4">
                  <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    <div
                      class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <AppIcon
                        name="BuildingOffice"
                        class="w-5 h-5 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{
                      catalog.supplier?.name || "غير محدد"
                    }}</span>
                  </div>
                </td>
                <td
                  class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]"
                >
                  {{ catalog.original_name }}
                </td>
                <td
                  class="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {{ catalog.parts_count || 0 }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{
                    catalog.document_date
                      ? formatDate(catalog.document_date)
                      : "-"
                  }}
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(catalog.createdAt) }}
                </td>
                <td class="px-4 py-4">
                  <span
                    v-if="
                      catalog.version_number > 1 || !catalog.is_latest_version
                    "
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="
                      catalog.is_latest_version
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    "
                  >
                    v{{ catalog.version_number }}
                    <span v-if="catalog.is_latest_version" class="mr-1"
                      >(أحدث)</span
                    >
                  </span>
                  <span v-else class="text-sm text-gray-400 dark:text-gray-500"
                    >-</span
                  >
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ catalog.user?.full_name || "-" }}
                </td>
              </tr>
            </TransitionGroup>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2"
      >
        <button
          v-for="p in totalPages"
          :key="p"
          @click.stop="goToPage(p)"
          :class="[
            'w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200',
            p === currentPage
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
              : 'bg-brand-50 dark:bg-gray-700 text-brand-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-600',
          ]"
        >
          {{ p }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="catalogs.length === 0 && !loading" class="text-center py-16">
        <div
          class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl mx-auto mb-6 flex items-center justify-center"
        >
          <AppIcon
            name="BookOpen"
            class="w-10 h-10 text-gray-400 dark:text-gray-500"
          />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          لا توجد كتالوجات
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          لم يتم رفع أي كتالوجات مكتملة بعد
        </p>
        <BaseButton @click="$router.push('/upload')" variant="primary">
          <template #iconLeft>
            <AppIcon name="cloud-arrow-up" class="w-4 h-4" />
          </template>
          رفع كتالوج جديد
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div
          class="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">
          جاري تحميل الكتالوجات...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { pdfAPI } from "@/services/api";
import { BaseButton } from "@/components/base";
import { AppIcon } from "@/components/icons";

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const catalogs = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const latestOnly = ref(true);

const fetchCatalogs = async () => {
  loading.value = true;
  try {
    const res = await pdfAPI.getCatalogs({
      page: currentPage.value,
      limit: 20,
      latest_only: latestOnly.value,
    });
    catalogs.value = res.data?.data?.catalogs || [];
    const meta = res.data?.meta;
    totalPages.value = meta?.totalPages || 1;
  } catch (e) {
    // تجاهل
  } finally {
    loading.value = false;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchCatalogs();
};

onMounted(fetchCatalogs);

watch(latestOnly, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

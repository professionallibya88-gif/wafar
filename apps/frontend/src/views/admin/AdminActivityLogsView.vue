<template>
  <div class="space-y-6">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          سجلات النشاط
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          تتبع جميع الأنشطة في النظام
        </p>
      </div>
      <div class="flex gap-3">
        <select
          v-model="actionFilter"
          class="form-select"
        >
          <option value="">جميع الإجراءات</option>
          <option value="create">إنشاء</option>
          <option value="update">تعديل</option>
          <option value="delete">حذف</option>
          <option value="login">تسجيل دخول</option>
          <option value="logout">تسجيل خروج</option>
        </select>
        <div class="relative">
          <input
            v-model="search"
            class="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="بحث..."
          />
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-brand-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                المستخدم
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                الإجراء
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                التفاصيل
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                IP
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-brand-50 dark:bg-neutral-900/50 rounded-lg flex items-center justify-center"
                  >
                    <AppIcon
                      name="User"
                      size="sm"
                      customClass="text-brand-600 dark:text-neutral-400"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ log.user_name || "غير معروف" }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ log.user_email || "" }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getActionClass(log.action)"
                >
                  {{ getActionLabel(log.action) }}
                </span>
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate"
              >
                {{ log.description || "-" }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono"
              >
                {{ log.ip_address || "-" }}
              </td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                {{ formatTime(log.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="logs.length === 0" class="text-center py-16">
          <AppIcon
            name="Document"
            size="3xl"
            customClass="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            لا توجد سجلات
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          عرض {{ (currentPage - 1) * pageSize + 1 }} إلى
          {{ Math.min(currentPage * pageSize, totalLogs) }} من
          {{ totalLogs }} سجل
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >صفحة {{ currentPage }} من {{ totalPages }}</span
          >
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseToast } from "@/components/base";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";

const logs = ref([]);
const search = ref("");
const actionFilter = ref("");

// Pagination
const currentPage = ref(1);
const pageSize = ref(50);
const totalLogs = ref(0);
const totalPages = ref(1);

onMounted(() => loadLogs());

useAutoApplyFilters(
  () => [search.value, actionFilter.value],
  () => loadLogs(),
  {
    delay: 400,
    resetPage: () => {
      currentPage.value = 1;
    },
  }
);

const loadLogs = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (search.value) params.search = search.value;
    if (actionFilter.value) params.action = actionFilter.value;
    const res = await adminAPI.getActivityLogs(params);
    logs.value = res.data?.data?.logs || [];
    totalLogs.value = res.data?.data?.total || 0;
    totalPages.value = res.data?.data?.totalPages || 1;
  } catch (e) {
    window.$toast.error("خطأ في جلب السجلات");
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadLogs();
  }
};

const getActionLabel = (action) =>
  ({
    create: "إنشاء",
    update: "تعديل",
    delete: "حذف",
    login: "تسجيل دخول",
    logout: "تسجيل خروج",
    upload: "رفع ملف",
    download: "تحميل ملف",
  })[action] || action;

const getActionClass = (action) =>
  ({
    create:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    update: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    delete: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    login:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    logout: "bg-brand-50 dark:bg-gray-700 text-brand-700 dark:text-gray-300",
    upload:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    download:
      "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
  })[action] || "bg-brand-50 dark:bg-gray-700 text-brand-700 dark:text-gray-300";

const formatTime = (timestamp) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("ar-LY");
};
</script>

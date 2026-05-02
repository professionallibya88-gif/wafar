<template>
  <div class="page-shell">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          ملفات PDF
        </h1>
        <p class="page-subtitle">
          إدارة ملفات PDF المرفوعة
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <BaseSelect
  v-model="statusFilter"
  select-class="form-select w-full sm:w-auto"
  :options="[
    { label: 'جميع الحالات', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'جاري المعالجة', value: 'processing' },
    { label: 'مكتمل', value: 'completed' },
    { label: 'فشل', value: 'failed' },
  ]"
/>
        <div class="relative w-full sm:w-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث بالاسم..."
            class="w-full sm:w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <Transition name="slide-fade">
      <div
        v-if="selectedFiles.length > 0"
        class="bg-brand-600 dark:bg-brand-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn"
      >
        <div class="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <AppIcon name="CheckCircle" size="lg" color="white" />
          <span class="text-white font-medium">
            تم تحديد {{ selectedFiles.length }} ملف
          </span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <BaseButton
            @click="reprocessSelected"
            :disabled="processing"
            variant="secondary"
            size="sm"
            class="bg-white/20 hover:bg-white/30 text-white border-0 w-full sm:w-auto justify-center"
          >
            <AppIcon name="ArrowPath" size="sm" color="white" />
            إعادة معالجة
          </BaseButton>
          <BaseButton
            @click="deleteSelected"
            :disabled="processing"
            variant="danger"
            size="sm"
            class="w-full sm:w-auto justify-center"
          >
            <AppIcon name="Trash" size="sm" color="white" />
            حذف المحدد
          </BaseButton>
          <button
            @click="clearSelection"
            class="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="إلغاء التحديد"
          >
            <AppIcon name="XMark" size="sm" color="white" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Files Table Card -->
    <div class="panel-table">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-brand-50 dark:bg-gray-900">
            <tr>
              <th class="table-head w-12">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  @change="toggleSelectAll"
                  class="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 dark:text-brand-400 focus:ring-brand-500 cursor-pointer"
                />
              </th>
              <th class="table-head">
                الملف
              </th>
              <th class="table-head">
                المستخدم
              </th>
              <th class="table-head">
                الطريقة
              </th>
              <th class="table-head">
                الحالة
              </th>
              <th class="table-head">
                القطع
              </th>
              <th class="table-head">
                التاريخ
              </th>
              <th class="table-head">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="f in filteredFiles"
              :key="f.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-brand-50/50 dark:bg-brand-900/20': isSelected(f.id) }"
            >
              <td class="px-4 py-4">
                <input
                  type="checkbox"
                  :checked="isSelected(f.id)"
                  @change="toggleSelect(f.id)"
                  :disabled="f.status === 'processing'"
                  class="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-brand-600 dark:text-brand-400 focus:ring-brand-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </td>
              <td class="px-4 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <div
                    class="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <AppIcon
                      name="Document"
                      size="lg"
                      customClass="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]"
                    :title="f.original_name"
                    >{{ f.original_name }}</span
                  >
                </div>
              </td>
              <td class="table-cell text-neutral-600 dark:text-neutral-300">
                {{ f.user?.full_name || "-" }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <BaseBadge
                  variant="default"
                  size="sm"
                  class="whitespace-nowrap"
                >
                  {{ getProcessingMethodLabel(f.processing_method) }}
                </BaseBadge>
              </td>
              <td class="px-4 py-4">
                <span
                  :class="'text-xs px-3 py-1.5 rounded-full font-medium ' + (getFileStatusVariant(f.status) === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' : getFileStatusVariant(f.status) === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : getFileStatusVariant(f.status) === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : getFileStatusVariant(f.status) === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300')"
                  >{{ getFileStatusLabel(f.status) }}</span
                >
              </td>
              <td class="px-4 py-4">
                <span
                  class="text-sm font-semibold text-brand-600 dark:text-neutral-400"
                  >{{ f.parts_count }}</span
                >
              </td>
              <td class="table-cell text-neutral-600 dark:text-neutral-300">
                {{ new Date(f.created_at || f.createdAt || Date.now()).toLocaleDateString("ar-LY") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="reprocessFile(f.id)"
                    :disabled="f.status === 'processing'"
                    class="text-brand-700 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-300 text-sm bg-brand-100 dark:bg-neutral-900/40 hover:bg-brand-200 dark:hover:bg-brand-800/60 px-4 py-2 min-h-[44px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إعادة معالجة
                  </button>
                  <button
                    @click="deleteFile(f.id)"
                    class="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredFiles.length === 0" class="text-center py-16">
          <AppIcon
            name="Document"
            size="3xl"
            customClass="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            لا توجد ملفات
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          عرض {{ (currentPage - 1) * pageSize + 1 }} إلى
          {{ Math.min(currentPage * pageSize, totalFiles) }} من
          {{ totalFiles }} ملف
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span class="text-sm text-neutral-600 dark:text-neutral-400">
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>
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
import { ref, computed, onMounted } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseBadge, BaseButton, BaseToast, BaseSelect } from "@/components/base";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";
import { getFileStatusLabel, getFileStatusVariant, getProcessingMethodLabel } from "@/utils/statusLabels";

const files = ref([]);
const searchQuery = ref("");
const statusFilter = ref("");
const selectedFiles = ref([]);
const processing = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);
const totalFiles = ref(0);
const totalPages = ref(1);

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value;
  return files.value.filter((fileItem) =>
    fileItem.original_name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

useAutoApplyFilters(
  () => [searchQuery.value, statusFilter.value],
  () => loadFiles(),
  {
    delay: 400,
    resetPage: () => {
      currentPage.value = 1;
    },
  }
);

const allSelected = computed(() => {
  return filteredFiles.value.length > 0 && filteredFiles.value.every((fileItem) => isSelected(fileItem.id));
});

const someSelected = computed(() => {
  return selectedFiles.value.length > 0;
});

const isSelected = (id) => selectedFiles.value.includes(id);

const toggleSelect = (id) => {
  const idx = selectedFiles.value.indexOf(id);
  if (idx === -1) {
    selectedFiles.value.push(id);
  } else {
    selectedFiles.value.splice(idx, 1);
  }
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    filteredFiles.value.forEach((fileItem) => {
      if (fileItem.status !== "processing") {
        const selectedIndex = selectedFiles.value.indexOf(fileItem.id);
        if (selectedIndex !== -1) selectedFiles.value.splice(selectedIndex, 1);
      }
    });
  } else {
    filteredFiles.value.forEach((fileItem) => {
      if (fileItem.status !== "processing" && !isSelected(fileItem.id)) {
        selectedFiles.value.push(fileItem.id);
      }
    });
  }
};

const clearSelection = () => {
  selectedFiles.value = [];
};

onMounted(async () => {
  try {
    loadFiles();
  } catch (error) { /* ignore */ }
});

const loadFiles = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (statusFilter.value) params.status = statusFilter.value;
    const response = await adminAPI.getAllFiles(params);
    files.value = response.data?.data?.files || [];
    totalFiles.value = response.data?.meta?.total || 0;
    totalPages.value = response.data?.meta?.totalPages || 1;
    clearSelection();
  } catch (error) { /* ignore */ }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadFiles();
  }
};

const reprocessFile = async (id) => {
  try {
    await adminAPI.reprocessFile(id, {});
    window.$toast.success("تم بدء إعادة المعالجة");
    loadFiles();
  } catch (error) {
    window.$toast.error("خطأ في إعادة المعالجة");
  }
};

const deleteFile = async (id) => {
  const confirmed = await window.$confirm("هل أنت متأكد من حذف هذا الملف؟");
  if (!confirmed) return;
  try {
    await adminAPI.deleteFile(id);
    window.$toast.success("تم حذف الملف بنجاح");
    loadFiles();
  } catch (error) {
    window.$toast.error("خطأ في الحذف");
  }
};

const runBulkFileAction = async ({
  action,
  successMessage,
  partialMessage,
}) => {
  processing.value = true;
  let successCount = 0;
  let failureCount = 0;

  for (const fileId of selectedFiles.value) {
    try {
      await action(fileId);
      successCount++;
    } catch (error) {
      failureCount++;
    }
  }

  processing.value = false;
  clearSelection();

  if (failureCount === 0) {
    window.$toast.success(successMessage(successCount));
  } else {
    window.$toast.warning(partialMessage(successCount, failureCount));
  }

  loadFiles();
};

const reprocessSelected = async () => {
  if (selectedFiles.value.length === 0) return;
  await runBulkFileAction({
    action: (fileId) => adminAPI.reprocessFile(fileId, {}),
    successMessage: (successCount) => `تم إعادة معالجة ${successCount} ملف بنجاح`,
    partialMessage: (successCount, failureCount) =>
      `تم معالجة ${successCount} ملف، فشل ${failureCount} ملف`,
  });
};

const deleteSelected = async () => {
  if (selectedFiles.value.length === 0) return;
  const confirmed = await window.$confirm(`هل أنت متأكد من حذف ${selectedFiles.value.length} ملفات محددة؟`);
  if (!confirmed) return;
  await runBulkFileAction({
    action: (fileId) => adminAPI.deleteFile(fileId),
    successMessage: (successCount) => `تم حذف ${successCount} ملف بنجاح`,
    partialMessage: (successCount, failureCount) =>
      `تم حذف ${successCount} ملف، فشل ${failureCount} ملف`,
  });
};


</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

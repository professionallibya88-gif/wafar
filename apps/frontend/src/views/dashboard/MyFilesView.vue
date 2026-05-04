<template>
  <div class="page-shell">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          ملفاتي المرفوعة
        </h1>
        <p class="page-subtitle">
          إدارة وتتبع ملفات PDF المرفوعة
        </p>
      </div>
      <BaseButton
        v-if="isEnabled('upload')"
        @click="$router.push('/upload')"
        variant="primary"
        class="w-full sm:w-auto justify-center"
      >
        <template #iconLeft>
          <AppIcon name="plus" class="w-4 h-4" />
        </template>
        رفع ملف جديد
      </BaseButton>
    </div>

    <!-- Files Table Card -->
    <div class="panel-table">
      <div v-if="files.length > 0" class="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalFiles" :totalPages="totalPages" />
      </div>
      <div v-if="files.length > 0" class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-neutral-50 dark:bg-neutral-900/60">
            <tr>
              <th
                class="table-head"
              >
                اسم الملف
              </th>
              <th
                class="table-head"
              >
                الحجم
              </th>
              <th
                class="table-head"
              >
                طريقة المعالجة
              </th>
              <th
                class="table-head"
              >
                الحالة
              </th>
              <th
                class="table-head"
              >
                عدد القطع
              </th>
              <th
                class="table-head"
              >
                تاريخ الملف
              </th>
              <th
                class="table-head"
              >
                تاريخ الرفع
              </th>
              <th
                class="table-head"
              >
                الإصدار
              </th>
              <th
                class="table-head"
              >
                إجراءات
              </th>
            </tr>
          </thead>
          <TransitionGroup name="list" tag="tbody" class="divide-y divide-neutral-200 dark:divide-neutral-700">
              <tr
                v-for="file in files"
                :key="file.id"
                class="hover:bg-brand-50 dark:hover:bg-neutral-800/70 transition-colors"
              >
                <td class="px-4 py-4">
                  <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    <div
                      class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <AppIcon
                        name="document"
                        class="w-5 h-5 text-red-600 dark:text-red-400"
                      />
                    </div>
                    <span
                      class="font-medium text-neutral-900 dark:text-neutral-100 truncate lg:max-w-[150px]"
                      >{{ file.original_name }}</span
                    >
                  </div>
                </td>
                <td class="table-cell">
                  {{ formatSize(file.file_size) }}
                </td>
                <td class="table-cell">
                  {{ getProcessingMethodLabel(file.processing_method) }}
                </td>
                <td class="px-4 py-4">
                  <BaseBadge
                    :variant="getFileStatusVariant(file.status)"
                    size="sm"
                    dot
                  >
                    {{ getFileStatusLabel(file.status) }}
                  </BaseBadge>
                </td>
                <td
                  class="px-4 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {{ file.parts_count || 0 }}
                </td>
                <td class="table-cell text-neutral-500 dark:text-neutral-400">
                  {{
                    file.document_date ? formatDate(file.document_date) : "-"
                  }}
                </td>
                <td class="table-cell text-neutral-500 dark:text-neutral-400">
                  {{ formatDate(file.createdAt) }}
                </td>
                <td class="px-4 py-4">
                  <span
                    v-if="file.version_number > 1"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700 dark:bg-neutral-900/30 dark:text-neutral-300"
                  >
                    v{{ file.version_number }}
                  </span>
                  <span v-else class="text-sm text-neutral-400 dark:text-neutral-500"
                    >-</span
                  >
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <BaseButton
                      @click="$router.push('/files/' + file.id)"
                      variant="ghost"
                      size="xs"
                    >
                      عرض
                    </BaseButton>
                    <button
                      @click="confirmDelete(file)"
                      class="p-2 text-neutral-400 dark:text-neutral-500 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-lg transition-colors"
                    >
                      <AppIcon name="trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </TransitionGroup>
        </table>
      </div>
      <div v-if="files.length > 0" class="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalFiles" :totalPages="totalPages" />
      </div>

      <!-- Empty State -->
      <div v-else class="panel-empty">
        <div
          class="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mx-auto mb-6 flex items-center justify-center"
        >
          <AppIcon
            name="folder-open"
            class="w-10 h-10 text-neutral-400 dark:text-neutral-500"
          />
        </div>
        <h3 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          لا توجد ملفات
        </h3>
        <p class="text-neutral-500 dark:text-neutral-400 mb-6">
          ابدأ برفع أول ملف PDF لاستخراج قطع الغيار
        </p>
        <BaseButton
          v-if="isEnabled('upload')"
          @click="$router.push('/upload')"
          variant="primary"
        >
          <template #iconLeft>
            <AppIcon name="cloud-arrow-up" class="w-4 h-4" />
          </template>
          رفع ملف PDF
        </BaseButton>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :show="showDeleteModal"
      @update:show="showDeleteModal = $event"
      :title="'حذف الملف'"
      size="sm"
      @close="showDeleteModal = false"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <AppIcon
            name="exclamation-triangle"
            class="w-8 h-8 text-red-600 dark:text-red-400"
          />
        </div>
        <p class="text-neutral-600 dark:text-neutral-300 mb-2">
          هل أنت متأكد من حذف هذا الملف؟
        </p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ fileToDelete?.original_name }}
        </p>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <BaseButton
            @click="showDeleteModal = false"
            variant="secondary"
            class="flex-1"
            >إلغاء</BaseButton
          >
          <BaseButton
            @click="deleteFileConfirmed"
            variant="danger"
            class="flex-1"
            :loading="deleting"
            >حذف</BaseButton
          >
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { pdfAPI } from "@/services/api";
import { BaseButton, BaseBadge, BaseModal, BasePagination } from "@/components/base";
import { AppIcon } from "@/components/icons";
import { useFeatureFlags } from "@/composables/useFeatureFlags";
import { getFileStatusLabel, getFileStatusVariant, getProcessingMethodLabel } from "@/utils/statusLabels";

// Helper functions - تعريف الدوال المساعدة في البداية
const formatDate = (d) =>
  new Date(d).toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const formatSize = (b) =>
  b < 1024 * 1024
    ? (b / 1024).toFixed(1) + " KB"
    : (b / 1024 / 1024).toFixed(1) + " MB";


const { isEnabled } = useFeatureFlags();
const files = ref([]);
const totalFiles = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const pageSize = ref(20);
const showDeleteModal = ref(false);
const fileToDelete = ref(null);
const deleting = ref(false);

const loadFiles = async () => {
  try {
    const res = await pdfAPI.getFiles({ page: currentPage.value, limit: pageSize.value });
    files.value = res.data?.data?.files || [];
    totalFiles.value = res.data?.data?.pagination?.total || 0;
    totalPages.value = res.data?.data?.pagination?.pages || 1;
  } catch (error) { /* ignore */ }
};

onMounted(() => {
  loadFiles();
});

watch([currentPage, pageSize], () => {
  loadFiles();
});

const confirmDelete = (file) => {
  fileToDelete.value = file;
  showDeleteModal.value = true;
};

const deleteFileConfirmed = async () => {
  if (!fileToDelete.value) return;
  deleting.value = true;
  try {
    await pdfAPI.deleteFile(fileToDelete.value.id);
    files.value = files.value.filter((f) => f.id !== fileToDelete.value.id);
    showDeleteModal.value = false;
    fileToDelete.value = null;
  } catch (error) { /* ignore */ } finally {
    deleting.value = false;
  }
};
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

<template>
  <div class="page-shell-content">
    <!-- Header -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
          رفع ملف PDF
        </h1>
        <p class="mt-1 text-neutral-500 dark:text-neutral-400">
          ارفع كتالوجات الموردين لاستخراج قطع
          الغيار تلقائياً
        </p>
      </div>
    </div>

    <!-- Info Card -->
    <div
      class="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <AppIcon
            name="information-circle"
            class="w-4 h-4 text-blue-600 dark:text-blue-400"
          />
        </div>
        <div>
          <h3
            class="font-semibold text-neutral-900 dark:text-white mb-0.5 text-sm"
          >
            كيف يعمل؟
          </h3>
          <p
            class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed"
          >
            ارفع كتالوجات PDF لاستخراج قطع الغيار
            تلقائيا باستخدام OCR.
          </p>
        </div>
      </div>
    </div>

    <!-- Upload Card -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700"
    >
      <!-- Upload Area -->
      <div
        v-if="!selectedFile"
        class="border-2 border-dashed border-neutral-200 dark:border-neutral-600 rounded-xl p-6 text-center transition-all duration-300"
        :class="
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-neutral-900/50 scale-[1.01]'
            : 'hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-700/50'
        "
        @click="fileInput?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div
          class="w-12 h-12 bg-brand-50 dark:bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center transition-colors"
          :class="isDragging ? 'bg-brand-100 dark:bg-neutral-900/50' : ''"
        >
          <AppIcon
            name="cloud-arrow-up"
            :class="[
              'w-6 h-6 transition-colors',
              isDragging
                ? 'text-brand-600 dark:text-neutral-400'
                : 'text-neutral-400 dark:text-neutral-500',
            ]"
          />
        </div>
        <p
          class="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1"
        >
          {{
            isDragging
              ? "أفلت الملف هنا"
              : "اسحب ملف PDF هنا أو اضغط للاختيار"
          }}
        </p>
        <p class="text-xs text-neutral-400 dark:text-neutral-500">
          الحد الأقصى: 100 ميغابايت - صيغة PDF فقط
        </p>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Selected File & Options -->
      <div v-if="selectedFile" class="space-y-6 animate-fade-in-up">
        <!-- File Info -->
        <div
          class="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-600"
        >
          <div
            class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          >
            <AppIcon
              name="document"
              class="w-7 h-7 text-red-600 dark:text-red-400"
            />
            <div v-if="extractingMetadata" class="absolute inset-0 bg-white/50 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <BaseSpinner size="sm" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-neutral-900 dark:text-white truncate">
              {{ selectedFile.name }}
            </p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <span>{{ formatSize(selectedFile.size) }}</span>
              <span v-if="extractingMetadata" class="text-brand-600 dark:text-neutral-400 text-xs animate-pulse">جاري استخراج البيانات تلقائياً...</span>
            </p>
          </div>
          <button
            @click="clearFile"
            class="p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <AppIcon name="trash" class="w-5 h-5" />
          </button>
        </div>

        <!-- Supplier Name -->
        <div class="relative">
          <label
            class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2"
          >
            اسم الشركة الموردة
            <BaseSpinner v-if="extractingMetadata" size="xs" />
          </label>
          <div class="relative">
            <input
              v-model="supplierName"
              list="supplier-name-options"
              type="text"
              :disabled="extractingMetadata"
              placeholder="اكتب اسم الشركة كما يظهر أعلى الصفحة الأولى"
              class="w-full px-4 py-3 bg-brand-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 transition-all duration-200 disabled:opacity-50"
              @input="handleSupplierNameInput"
            />
            <datalist id="supplier-name-options">
              <option v-for="s in suppliers" :key="s.id" :value="s.name">
                {{ s.name }}
              </option>
            </datalist>
          </div>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            حقل إجباري. يمكنك تعديل الاسم يدوياً إذا كان الاستخراج التلقائي غير دقيق.
          </p>
        </div>

        <!-- Document Date -->
        <div class="relative">
          <label
            class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2"
          >
            تاريخ الملف (من الشركة)
            <BaseSpinner v-if="extractingMetadata" size="xs" />
          </label>
          <div class="relative">
            <input
              v-model="documentDate"
              type="date"
              :disabled="extractingMetadata"
              class="w-full px-4 py-3 bg-brand-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 transition-all duration-200 disabled:opacity-50"
            />
            <div v-if="extractingMetadata" class="absolute inset-0 bg-transparent cursor-not-allowed flex items-center px-4" title="جاري قراءة التاريخ من الملف">
              <span class="text-sm text-neutral-500 bg-brand-50 dark:bg-neutral-700 px-2 py-1 rounded">جاري قراءة التاريخ...</span>
            </div>
          </div>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            حقل إجباري. أدخل التاريخ المكتوب في أعلى الصفحة الأولى إذا لم يُكتشف تلقائياً.
          </p>
        </div>

        <div class="relative">
          <label
            class="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            طريقة التحليل
            <span class="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-neutral-800 dark:text-neutral-300">
              الافتراضي: {{ processingMethodLabel(defaultMethod) }}
            </span>
          </label>
          <BaseSelect
  v-model="selectedMethod"
  select-class="form-select"
  :options="[
    { label: 'استخدام الإعداد الافتراضي', value: '' },
    { label: 'Python PyPDF', value: 'python_pypdf' },
    { label: 'Python AI', value: 'python_ai' },
    { label: 'Node PDF', value: 'node_pdf' },
    { label: 'AWS Textract', value: 'aws_textract' },
  ]"
/>
          <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            يمكنك اختيار طريقة مخصصة لهذا الملف فقط، أو ترك النظام يستخدم الإعداد الافتراضي من لوحة الإدارة.
          </p>
        </div>

        <div
          v-if="!extractingMetadata && (!supplierName.trim() || !documentDate)"
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
        >
          يجب مراجعة اسم الشركة وتاريخ الملف وإكمالهما قبل بدء الرفع.
        </div>

        <!-- Upload Button - Smaller size -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <button
            @click="uploadFile"
            :disabled="uploading || extractingMetadata || !selectedFile || !supplierName.trim() || !documentDate"
            class="flex-1 py-3 px-6 bg-brand-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group text-base"
          >
            <span
              class="absolute inset-0 bg-brand-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
            <span class="relative flex items-center justify-center gap-2">
              <BaseSpinner
                v-if="uploading || extractingMetadata"
                size="xs"
                color="white"
              />
              <AppIcon v-else name="CloudArrowUp" size="sm" />
              <span>{{
                uploading
                  ? "جاري الرفع والمعالجة..."
                  : extractingMetadata
                    ? "جاري استخراج البيانات..."
                    : "رفع ومعالجة الملف"
              }}</span>
            </span>
          </button>
          <button
            @click="clearFile"
            :disabled="uploading || extractingMetadata"
            class="px-6 py-3 bg-brand-50 dark:bg-neutral-700 text-brand-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-brand-100 dark:hover:bg-neutral-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
        </div>

        <!-- Progress Bar -->
        <div v-if="uploading && progress > 0" class="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-brand-600 dark:text-brand-400">
              {{ progressMessage || 'جاري معالجة الملف...' }}
            </span>
            <span class="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              {{ progress }}%
            </span>
          </div>
          <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
            <div 
              class="bg-brand-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Success Message -->
      <Transition name="slide-fade">
        <div
          v-if="uploadSuccess"
          class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-bounce-in"
        >
          <div
            class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <AppIcon
              name="check-circle"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-green-800 dark:text-green-300">
              تم رفع الملف بنجاح
            </p>
            <p class="text-sm text-green-600 dark:text-green-400">
              جاري المعالجة في الخلفية. ستظهر
              النتائج في صفحة ملفاتي.
            </p>
          </div>
          <button
            @click="uploadSuccess = false"
            class="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
          >
            <AppIcon name="x" class="w-4 h-4" />
          </button>
        </div>
      </Transition>

      <!-- Error Message -->
      <Transition name="slide-fade">
        <div
          v-if="uploadError"
          class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-bounce-in"
        >
          <div
            class="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <AppIcon
              name="x-circle"
              class="w-5 h-5 text-red-600 dark:text-red-400"
            />
          </div>
          <p class="text-sm text-red-700 dark:text-red-300 flex-1">
            {{ uploadError }}
          </p>
          <button
            @click="uploadError = ''"
            class="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <AppIcon name="x" class="w-4 h-4" />
          </button>
        </div>
      </Transition>

    <!-- Processing Progress Modal -->
    <ProcessingProgress
      :visible="showProgress"
      :title="progressTitle"
      :subtitle="progressSubtitle"
      :progress="progress"
      :current-step="currentStep"
      :steps="progressSteps"
      :stats="progressStats"
      :can-cancel="progressStatus === 'processing' || progressStatus === 'success'"
      :can-close="progressStatus === 'error'"
      :can-save="progressStatus === 'success'"
      :can-apply="false"
      :can-clean="false"
      :can-fix="progressStatus === 'error'"
      :close-text="'إغلاق'"
      :status="progressStatus"
      @close="closeProgress"
      @cancel="progressStatus === 'success' ? cleanResults() : cancelProgress()"
      @save="applyResults"
      @apply="applyResults"
      @clean="cleanResults"
      @fix="fixResults"
    />

    <!-- Quick Stats -->
    <TransitionGroup
      name="fade-up"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div
        key="total-files"
        class="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div
            class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
          >
            <AppIcon
              name="document"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ stats.total_files }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              إجمالي الملفات
            </p>
          </div>
        </div>
      </div>
      <div
        key="processing-files"
        class="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div
            class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"
          >
            <AppIcon
              name="clock"
              class="w-5 h-5 text-yellow-600 dark:text-yellow-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ stats.processing_files }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              قيد المعالجة
            </p>
          </div>
        </div>
      </div>
      <div
        key="completed-files"
        class="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div
            class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
          >
            <AppIcon
              name="check-circle"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ stats.completed_files }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              مكتملة
            </p>
          </div>
        </div>
      </div>
      <div
        key="total-parts"
        class="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div
            class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"
          >
            <AppIcon
              name="cube"
              class="w-5 h-5 text-purple-600 dark:text-purple-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ stats.total_parts }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              إجمالي القطع
            </p>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Recent Files -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
          آخر الملفات المرفوعة
        </h3>
        <router-link
          v-if="recentFiles.length > 0"
          to="/files"
          class="text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
        >
          عرض الكل
        </router-link>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-3">
        <div
          v-for="file in recentFiles"
          :key="file.id"
          class="flex items-center gap-4 p-3 bg-brand-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-600 hover:bg-brand-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          @click="$router.push('/files/' + file.id)"
        >
          <div
            class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <AppIcon
              name="document"
              class="w-5 h-5 text-red-600 dark:text-red-400"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="font-medium text-neutral-900 dark:text-white truncate text-sm"
            >
              {{ file.original_name }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ formatDate(file.createdAt) }} ⬢
              {{ file.parts_count || 0 }} قطعة ⬢
              {{ formatSize(file.file_size) }}
            </p>
          </div>
          <BaseBadge :variant="statusVariant(file.status)" size="xs">
            {{ statusLabel(file.status) }}
          </BaseBadge>
        </div>
      </TransitionGroup>

        <div v-if="recentFiles.length === 0" class="text-center py-8">
          <div
            class="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center"
          >
            <AppIcon
              name="FolderOpen"
              class="w-8 h-8 text-neutral-400 dark:text-neutral-500"
            />
          </div>
          <p class="text-neutral-500 dark:text-neutral-400 text-sm">
            لم يتم رفع أي ملفات بعد
          </p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { pdfAPI, settingsAPI, supplierAPI } from "@/services/api";
import ProcessingProgress from "@/components/ProcessingProgress.vue";
import { AppIcon } from "@/components/icons";
import { BaseBadge, BaseSelect, BaseSpinner } from "@/components/base";

// Helper functions - تعريف الدوال المساعدة في البداية
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const statusLabel = (s) =>
  ({
    pending: "قيد الانتظار",
    processing: "جاري المعالجة",
    completed: "مكتمل",
    failed: "فشل",
  })[s] || s;
const statusVariant = (s) =>
  ({
    pending: "warning",
    processing: "info",
    completed: "success",
    failed: "error",
  })[s] || "default";

const router = useRouter();
const fileInput = ref(null);
const selectedFile = ref(null);
const selectedMethod = ref("");
const defaultMethod = ref("python_pypdf");
const supplierId = ref("");
const supplierName = ref("");
const documentDate = ref("");
const suppliers = ref([]);
const recentFiles = ref([]);
const stats = ref({
  total_files: 0,
  processing_files: 0,
  completed_files: 0,
  total_parts: 0,
});
const uploading = ref(false);
const uploadSuccess = ref(false);
const uploadError = ref("");
const isDragging = ref(false);
const extractingMetadata = ref(false);

// Progress tracking
const showProgress = ref(false);
const progress = ref(0);
const progressTitle = ref("جاري معالجة الملف");
const progressSubtitle = ref("");
const currentStep = ref(0);
const progressStatus = ref("processing");
const progressSteps = ref([
  { label: "رفع الملف", status: "pending", detail: "" },
  { label: "فحص الملف", status: "pending", detail: "" },
  { label: "استخراج البيانات", status: "pending", detail: "" },
  { label: "حفظ النتائج", status: "pending", detail: "" },
]);
const progressStats = ref({
  pages: 0,
  parts: 0,
  tables: 0,
});

let progressMonitorInterval = null;
let fileId = null;
let simulatedProgressInterval = null;

const processingMethodLabel = (value) =>
  ({
    python_pypdf: "Python PyPDF",
    python_ai: "Python AI",
    node_pdf: "Node PDF",
    aws_textract: "AWS Textract",
    ocr: "OCR",
  })[value] || value || "الافتراضي";

const startSimulatedProgress = () => {
  if (simulatedProgressInterval) clearInterval(simulatedProgressInterval);
  
  simulatedProgressInterval = setInterval(() => {
    if (progressStatus.value !== 'processing') {
      clearInterval(simulatedProgressInterval);
      return;
    }
    
    // Simulate progress smoothly
    if (progress.value < 25) {
      progress.value += 1;
    } else if (progress.value < 50) {
      progress.value += 0.5;
    } else if (progress.value < 65) {
      progress.value += 0.2;
    } else if (progress.value < 70) {
      progress.value += 0.05;
    }
    
    // Format to 1 decimal place
    progress.value = parseFloat(progress.value.toFixed(1));
  }, 1000);
};

const stopSimulatedProgress = () => {
  if (simulatedProgressInterval) {
    clearInterval(simulatedProgressInterval);
    simulatedProgressInterval = null;
  }
};

const refreshFilesAndStats = async () => {
  try {
    const [filesRes, statsRes] = await Promise.all([
      pdfAPI.getFiles({ limit: 5 }),
      pdfAPI.getStats(),
    ]);
    recentFiles.value = filesRes.data?.data?.files || [];
    stats.value = statsRes.data?.data || {
      total_files: 0,
      processing_files: 0,
      completed_files: 0,
      total_parts: 0,
    };
  } catch (e) {
    /* ignore */
  }
};

onMounted(async () => {
  try {
    const [suppliersRes, settingsRes] = await Promise.all([
      supplierAPI.getAll({ limit: 100 }),
      settingsAPI.getPublic(),
    ]);
    suppliers.value = suppliersRes.data?.data?.suppliers || [];
    defaultMethod.value =
      settingsRes.data?.data?.pdf_processing?.default_pdf_method || "python_pypdf";
  } catch (e) {
    /* ignore */
  }

  await refreshFilesAndStats();
});

onUnmounted(() => {
  stopProgressTracking();
});

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await processSelectedFile(file);
};

const handleDrop = async (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (!file) return;
  await processSelectedFile(file);
};

const processSelectedFile = async (file) => {
  // التحقق من صيغة الملف
  if (file.type !== "application/pdf") {
    uploadError.value = "يجب أن يكون الملف بصيغة PDF فقط";
    return;
  }

  // التحقق من حجم الملف (100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    uploadError.value = "حجم الملف يتجاوز الحد الأقصى المسموح (100 ميغابايت)";
    return;
  }

  selectedFile.value = file;
  uploadError.value = "";
  documentDate.value = "";
  supplierId.value = "";
  supplierName.value = "";
  
  // Extract metadata automatically
  await extractFileMetadata(file);
};

const normalizeSupplierName = (value) =>
  (value || "").replace(/\s+/g, " ").trim();

const findMatchingSupplier = (name) => {
  const normalizedName = normalizeSupplierName(name).toLowerCase();
  if (!normalizedName) return null;

  return (
    suppliers.value.find(
      (s) => normalizeSupplierName(s.name).toLowerCase() === normalizedName,
    ) ||
    suppliers.value.find((s) => {
      const currentName = normalizeSupplierName(s.name).toLowerCase();
      return (
        currentName.includes(normalizedName) ||
        normalizedName.includes(currentName)
      );
    }) ||
    null
  );
};

const reloadSuppliers = async () => {
  const res = await supplierAPI.getAll({ limit: 100 });
  suppliers.value = res.data?.data?.suppliers || [];
};

const ensureSupplierForUpload = async () => {
  const normalizedName = normalizeSupplierName(supplierName.value);
  if (!normalizedName) {
    throw new Error("يرجى إدخال اسم الشركة الموردة");
  }

  const existing = findMatchingSupplier(normalizedName);
  if (existing) {
    supplierId.value = existing.id;
    supplierName.value = existing.name;
    return existing.id;
  }

  try {
    const createRes = await supplierAPI.create({ name: normalizedName });
    const newSupplier = createRes.data?.data;
    if (newSupplier) {
      suppliers.value.push(newSupplier);
      supplierId.value = newSupplier.id;
      supplierName.value = newSupplier.name;
      return newSupplier.id;
    }
  } catch (error) {
    await reloadSuppliers();
    const fallbackSupplier = findMatchingSupplier(normalizedName);
    if (fallbackSupplier) {
      supplierId.value = fallbackSupplier.id;
      supplierName.value = fallbackSupplier.name;
      return fallbackSupplier.id;
    }

    throw error;
  }

  throw new Error("تعذر تجهيز الشركة الموردة حالياً");
};

const handleSupplierNameInput = () => {
  supplierId.value = "";
};

const extractFileMetadata = async (file) => {
  extractingMetadata.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await pdfAPI.extractMetadata(formData);
    
    // Check if user cleared or changed the file during extraction
    if (selectedFile.value !== file) return;

    const data = res.data?.data;
    
    if (data) {
      if (data.documentDate) {
        documentDate.value = data.documentDate;
      }
      
      if (data.supplierName) {
        const extractedName = data.supplierName.trim();
        supplierName.value = extractedName;
        const existing = findMatchingSupplier(extractedName);
        
        if (existing) {
          supplierId.value = existing.id;
          supplierName.value = existing.name;
        }
      }
    }
  } catch (e) {
    if (selectedFile.value === file) {
      documentDate.value = "";
      supplierId.value = "";
      supplierName.value = "";
    }

    if (e?.response?.status !== 403) {
      console.warn(
        "Metadata extraction skipped:",
        e?.response?.data?.message || e?.message || "unknown error"
      );
    }
  } finally {
    extractingMetadata.value = false;
  }
};

const clearFile = () => {
  stopProgressTracking();
  selectedFile.value = null;
  documentDate.value = "";
  supplierId.value = "";
  supplierName.value = "";
  selectedMethod.value = "";
  uploadSuccess.value = false;
  uploadError.value = "";
  extractingMetadata.value = false;
};

const uploadFile = async () => {
  if (!selectedFile.value) return;
  if (!supplierName.value.trim()) {
    uploadError.value = "يرجى إدخال اسم الشركة الموردة";
    return;
  }
  if (!documentDate.value) {
    uploadError.value = "يرجى تحديد تاريخ الملف";
    return;
  }

  uploading.value = true;
  uploadSuccess.value = false;
  uploadError.value = "";

  try {
    const ensuredSupplierId = await ensureSupplierForUpload();
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("supplier_id", ensuredSupplierId);
    formData.append("document_date", documentDate.value);
    if (selectedMethod.value) {
      formData.append("method", selectedMethod.value);
    }

    // Start progress tracking
    startProgressTracking();

    // Upload with progress tracking
    const response = await pdfAPI.upload(formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        if (percentCompleted <= 30) {
          progress.value = percentCompleted;
          progressSubtitle.value = `جاري رفع الملف... ${percentCompleted}%`;
          updateStep(0, 'active', progressSubtitle.value);
        }
      },
    });

    fileId = response.data?.data?.id;

    uploadSuccess.value = true;
    selectedFile.value = null;

    await refreshFilesAndStats();

    // Continue monitoring progress
    startProgressMonitor(fileId);
  } catch (error) {
    console.error("Upload error:", error);
    uploadError.value =
      error.response?.data?.message || "حدث خطأ أثناء رفع الملف";
    uploadSuccess.value = false;
    
    progressStatus.value = "error";
    progressTitle.value = "فشل رفع الملف";
    progressSubtitle.value = uploadError.value;
    
    stopProgressTracking();
  } finally {
    uploading.value = false;
  }
};

const progressMessage = ref("");

const startProgressMonitor = (id) => {
  if (!id) return;
  
  progressMonitorInterval = setInterval(async () => {
    try {
      const res = await pdfAPI.getJobStatus(id);
      const statusData = res.data?.data;
      
      if (statusData) {
        // Handle both API response formats (BullMQ raw vs DB status)
        const currentProgress = statusData.progress_percent !== undefined ? statusData.progress_percent : statusData.progress;
        
        // Only take backend progress if it's greater than simulated progress or if we're near completion
        if (currentProgress !== undefined) {
          if (currentProgress >= 70 || currentProgress > progress.value) {
            progress.value = currentProgress;
          }
        }
        
        const currentMessage = statusData.progress_message || statusData.message;
        progressMessage.value = currentMessage || progressMessage.value;
        progressSubtitle.value = progressMessage.value;
        
        // Update steps for visual feedback
        if (progress.value > 0 && progress.value <= 30) {
          currentStep.value = 1;
          updateStep(0, 'completed', 'تم الرفع');
          updateStep(1, 'active', progressMessage.value);
        } else if (progress.value > 30 && progress.value < 90) {
          currentStep.value = 2;
          updateStep(0, 'completed', 'تم الرفع');
          updateStep(1, 'completed', 'تم الفحص');
          updateStep(2, 'active', progressMessage.value);
        } else if (progress.value >= 90 && progress.value < 100) {
          currentStep.value = 3;
          updateStep(0, 'completed', 'تم الرفع');
          updateStep(1, 'completed', 'تم الفحص');
          updateStep(2, 'completed', 'تم استخراج البيانات');
          updateStep(3, 'active', progressMessage.value);
        }
        
        // Update stats
        if (statusData.page_count !== undefined) progressStats.value.pages = statusData.page_count || 0;
        if (statusData.parts_count !== undefined) progressStats.value.parts = statusData.parts_count || 0;
        if (statusData.tables_count !== undefined) progressStats.value.tables = statusData.tables_count || 0;
        
        
        if (statusData.state === 'completed' || statusData.status === 'completed') {
          progress.value = 100;
          progressMessage.value = "تمت المعالجة بنجاح";
          progressStatus.value = "success";
          progressTitle.value = "اكتملت معالجة الملف";
          progressSubtitle.value = "تم استخراج البيانات بنجاح";
          
          currentStep.value = 4;
          updateStep(3, 'completed', 'تم حفظ النتائج');
          
          stopProgressTracking();
          uploadSuccess.value = true;
          await refreshFilesAndStats();
        } else if (statusData.state === 'failed' || statusData.status === 'failed') {
          progressStatus.value = "error";
          progressTitle.value = "فشلت معالجة الملف";
          
          const errorMessage = statusData.error_message || statusData.error || "حدث خطأ غير متوقع أثناء المعالجة";
          progressSubtitle.value = errorMessage;
          
          uploadError.value = errorMessage;
          stopProgressTracking();
        }
      }
    } catch (e) {
      console.error("Error checking job status:", e);
    }
  }, 2000);
};

const startProgressTracking = () => {
  resetProgressState();
  showProgress.value = true;
  progressMessage.value = "يبدأ رفع الملف...";
  progressSubtitle.value = "جاري التحضير للرفع...";
  startSimulatedProgress();
};

const stopProgressTracking = () => {
  if (progressMonitorInterval) {
    clearInterval(progressMonitorInterval);
    progressMonitorInterval = null;
  }
  stopSimulatedProgress();
};

const updateStep = (index, status, detail) => {
  if (progressSteps.value[index]) {
    progressSteps.value[index].status = status;
    if (detail) {
      progressSteps.value[index].detail = detail;
    }
  }
};

const resetProgressState = () => {
  progress.value = 0;
  progressTitle.value = "جاري معالجة الملف";
  progressSubtitle.value = "";
  progressStatus.value = "processing";
  currentStep.value = 0;
  progressSteps.value = [
    { label: "رفع الملف", status: "pending", detail: "" },
    { label: "فحص الملف", status: "pending", detail: "" },
    { label: "استخراج البيانات", status: "pending", detail: "" },
    { label: "حفظ النتائج", status: "pending", detail: "" },
  ];
  progressStats.value = {
    pages: 0,
    parts: 0,
    tables: 0,
  };
};

const closeProgress = () => {
  showProgress.value = false;
  stopProgressTracking();
  resetProgressState();
};

const cancelProgress = () => {
  showProgress.value = false;
  stopProgressTracking();
  resetProgressState();
  uploadError.value = "تم إلغاء العملية";
};


const applyResults = () => {
  const currentFileId = fileId;
  closeProgress();
  if (currentFileId) {
    router.push(`/files/${currentFileId}`);
  }
};

const cleanResults = () => {
  closeProgress();
  clearFile();
  fileId = null;
};

const fixResults = async () => {
  if (!fileId) {
    closeProgress();
    return;
  }

  uploadError.value = "";
  progressTitle.value = "جاري إعادة المعالجة";
  progressSubtitle.value = "يتم الآن طلب إعادة معالجة الملف";
  startProgressTracking();

  try {
    await pdfAPI.reprocessFile(fileId, {});
    startProgressMonitor(fileId);
  } catch (e) {
    stopProgressTracking();
    progressStatus.value = "error";
    progressTitle.value = "تعذرت إعادة المعالجة";
    progressSubtitle.value =
      e.response?.data?.message || "تعذر إعادة معالجة الملف حالياً";
    uploadError.value = progressSubtitle.value;
  }
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
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-up-enter-active {
  transition: all 0.4s ease-out;
}

.fade-up-leave-active {
  transition: all 0.2s ease-in;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

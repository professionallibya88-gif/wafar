<template>
  <div class="page-shell-content space-y-4">
    <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
          رفع ملفات PDF
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          أضف عدة ملفات دفعة واحدة، وحرر بيانات كل ملف بشكل مستقل قبل الإرسال.
        </p>
      </div>
    </div>

    <div
      class="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div
        class="rounded-xl border-2 border-dashed p-5 text-center transition-all duration-300"
        :class="
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-neutral-900/50 scale-[1.01]'
            : 'border-neutral-200 hover:border-brand-300 hover:bg-brand-50 dark:border-neutral-600 dark:hover:border-brand-600 dark:hover:bg-neutral-700/50'
        "
        @click="fileInput?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div
          class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 transition-colors dark:bg-neutral-700"
          :class="isDragging ? 'bg-brand-100 dark:bg-neutral-900/50' : ''"
        >
          <AppIcon
            name="cloud-arrow-up"
            :class="[
              'h-5 w-5 transition-colors',
              isDragging
                ? 'text-brand-600 dark:text-neutral-400'
                : 'text-neutral-400 dark:text-neutral-500',
            ]"
          />
        </div>
        <p class="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {{
            isDragging
              ? "أفلت الملفات هنا"
              : "اسحب ملفات PDF هنا أو اضغط لاختيار عدة ملفات"
          }}
        </p>
        <p class="text-xs text-neutral-400 dark:text-neutral-500">
          الحد الأقصى لكل ملف: 100 ميغابايت. سيرسل الطلب بصيغة
          <span dir="ltr">files[] + items</span>
        </p>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".pdf"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <Transition name="slide-fade">
        <div
          v-if="uploadSuccessMessage"
          class="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
        >
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50"
          >
            <AppIcon
              name="check-circle"
              class="h-5 w-5 text-green-600 dark:text-green-400"
            />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-green-800 dark:text-green-300">
              تم تجهيز الطلب بنجاح
            </p>
            <p class="text-sm text-green-600 dark:text-green-400">
              {{ uploadSuccessMessage }}
            </p>
          </div>
          <button
            class="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
            @click="uploadSuccessMessage = ''"
          >
            <AppIcon name="x" class="h-4 w-4" />
          </button>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div
          v-if="uploadError"
          class="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50"
          >
            <AppIcon
              name="x-circle"
              class="h-5 w-5 text-red-600 dark:text-red-400"
            />
          </div>
          <p class="flex-1 text-sm text-red-700 dark:text-red-300">
            {{ uploadError }}
          </p>
          <button
            class="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
            @click="uploadError = ''"
          >
            <AppIcon name="x" class="h-4 w-4" />
          </button>
        </div>
      </Transition>

      <div v-if="uploadItems.length > 0" class="mt-4 space-y-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            class="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/40"
          >
            <p class="text-xs text-neutral-500 dark:text-neutral-400">إجمالي الملفات</p>
            <p class="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {{ uploadItems.length }}
            </p>
          </div>
          <div
            class="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/40"
          >
            <p class="text-xs text-neutral-500 dark:text-neutral-400">جاهزة للإرسال</p>
            <p class="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {{ readyItemsCount }}
            </p>
          </div>
          <div
            class="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/40"
          >
            <p class="text-xs text-neutral-500 dark:text-neutral-400">تحتاج مراجعة</p>
            <p class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {{ reviewItemsCount }}
            </p>
          </div>
          <div
            class="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/40"
          >
            <p class="text-xs text-neutral-500 dark:text-neutral-400">بها أخطاء</p>
            <p class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {{ erroredItemsCount }}
            </p>
          </div>
        </div>

        <div
          v-if="uploading && uploadProgress > 0"
          class="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40"
        >
          <div class="mb-2 flex items-center justify-between gap-3">
            <span class="text-sm font-semibold text-brand-600 dark:text-brand-400">
              {{ uploadProgressMessage }}
            </span>
            <span class="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              {{ uploadProgress }}%
            </span>
          </div>
          <div class="h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              class="h-2.5 rounded-full bg-brand-600 transition-all duration-300 ease-out"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(item, index) in uploadItems"
            :key="item.id"
            class="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/30"
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div class="flex min-w-0 items-start gap-3">
                  <div
                    class="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30"
                  >
                    <AppIcon
                      name="document"
                      class="h-6 w-6 text-red-600 dark:text-red-400"
                    />
                    <div
                      v-if="item.extractingMetadata"
                      class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm dark:bg-neutral-800/60"
                    >
                      <BaseSpinner size="sm" />
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="truncate font-semibold text-neutral-900 dark:text-white">
                        {{ index + 1 }}. {{ item.file.name }}
                      </p>
                      <BaseBadge :variant="itemStatus(item).variant" size="xs">
                        {{ itemStatus(item).label }}
                      </BaseBadge>
                    </div>
                    <div
                      class="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                    >
                      <span>{{ formatSize(item.file.size) }}</span>
                      <span v-if="item.extractingMetadata">جاري استخراج البيانات تلقائياً</span>
                      <span v-if="item.uploaded && item.fileId">تم إنشاء الملف بنجاح</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-if="canRetryItem(item)"
                    class="rounded-lg px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"
                    :disabled="uploading || item.extractingMetadata || item.uploading"
                    @click="retryItem(item)"
                  >
                    <span class="flex items-center gap-2">
                      <AppIcon name="ArrowPath" size="sm" />
                      <span>إعادة المحاولة</span>
                    </span>
                  </button>
                  <button
                    class="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    :disabled="uploading || item.extractingMetadata || !!item.validationError"
                    @click="extractItemMetadata(item)"
                  >
                    <span class="flex items-center gap-2">
                      <BaseSpinner v-if="item.extractingMetadata" size="xs" />
                      <AppIcon v-else name="ArrowPath" size="sm" />
                      <span>إعادة القراءة</span>
                    </span>
                  </button>
                  <button
                    class="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-neutral-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    :disabled="uploading"
                    @click="removeItem(item.id)"
                  >
                    <AppIcon name="trash" class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div
                v-if="item.validationError"
                class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
              >
                {{ item.validationError }}
              </div>

              <div
                v-if="item.uploadError"
                class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
              >
                {{ item.uploadError }}
              </div>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div class="relative">
                  <label
                    class="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    اسم الشركة الموردة
                    <BaseSpinner v-if="item.extractingMetadata" size="xs" />
                  </label>
                  <input
                    v-model="item.supplierName"
                    list="supplier-name-options"
                    type="text"
                    :disabled="isItemLocked(item)"
                    placeholder="اكتب اسم الشركة كما يظهر أعلى الصفحة الأولى"
                    class="w-full rounded-xl border border-neutral-200 bg-brand-50 px-3 py-2 text-neutral-900 transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:bg-neutral-600 dark:focus:ring-brand-900/30"
                    @input="handleSupplierNameInput(item)"
                  />
                  <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    حقل إجباري. يمكنك تعديله يدوياً لكل ملف.
                  </p>
                </div>

                <div class="relative">
                  <label
                    class="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    تاريخ الملف
                    <BaseSpinner v-if="item.extractingMetadata" size="xs" />
                  </label>
                  <input
                    v-model="item.documentDate"
                    type="date"
                    :disabled="isItemLocked(item)"
                    class="w-full rounded-xl border border-neutral-200 bg-brand-50 px-3 py-2 text-neutral-900 transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:bg-neutral-600 dark:focus:ring-brand-900/30"
                  />
                  <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    حقل إجباري. أدخل التاريخ المكتوب على الملف إذا لم يلتقط تلقائياً.
                  </p>
                </div>
              </div>

              <div class="relative">
                <label
                  class="mb-1 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  طريقة التحليل
                  <span
                    class="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    الافتراضي: {{ processingMethodLabel(defaultMethod) }}
                  </span>
                </label>
                <BaseSelect
                  v-model="item.method"
                  :disabled="isItemLocked(item)"
                  select-class="form-select py-2"
                  :options="methodOptions"
                />
                <p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  هذا الاختيار يطبق على هذا الملف فقط.
                </p>
              </div>

              <div
                v-if="!item.validationError && !item.extractingMetadata && !isItemReady(item)"
                class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
              >
                يجب إكمال اسم الشركة وتاريخ الملف قبل إرسال هذا العنصر.
              </div>

              <div
                v-if="item.fileId"
                class="space-y-3 rounded-xl border px-3 py-3 text-sm"
                :class="processingPanelClass(item)"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="font-semibold">
                      {{ processingStatusLabel(item.processingStatus) }}
                    </p>
                    <p class="mt-1 text-xs opacity-80">
                      {{ item.processingMessage || "تم إرسال الملف وهو بانتظار المعالجة." }}
                    </p>
                  </div>
                  <div class="text-sm font-bold">
                    {{ item.processingProgress }}%
                  </div>
                </div>

                <div class="h-2 overflow-hidden rounded-full bg-white/60 dark:bg-neutral-800/70">
                  <div
                    class="h-2 rounded-full transition-all duration-300 ease-out"
                    :class="processingBarClass(item)"
                    :style="{ width: `${item.processingProgress}%` }"
                  ></div>
                </div>

                <div
                  v-if="item.partsCount > 0 || item.processingError"
                  class="flex flex-wrap items-center gap-3 text-xs"
                >
                  <span v-if="item.partsCount > 0">
                    عدد القطع المستخرجة: {{ item.partsCount }}
                  </span>
                  <span v-if="item.processingError">
                    {{ item.processingError }}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <button
                    class="font-semibold underline-offset-4 hover:underline"
                    @click="router.push(`/files/${item.fileId}`)"
                  >
                    فتح الملف
                  </button>
                  <button
                    v-if="item.processingStatus === 'failed'"
                    class="font-semibold underline-offset-4 hover:underline"
                    @click="retryItem(item)"
                  >
                    إعادة المعالجة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <datalist id="supplier-name-options">
          <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.name">
            {{ supplier.name }}
          </option>
        </datalist>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            class="flex-1 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="uploading || readyItemsCount === 0"
            @click="uploadFiles"
          >
            <span class="flex items-center justify-center gap-2">
              <BaseSpinner v-if="uploading" size="xs" color="white" />
              <AppIcon v-else name="CloudArrowUp" size="sm" />
              <span>
                {{
                  uploading
                    ? "جاري إرسال الملفات..."
                    : `إرسال ${readyItemsCount} ملف${readyItemsCount === 1 ? "" : ""}`
                }}
              </span>
            </span>
          </button>
          <button
            class="rounded-xl bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-all duration-200 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            :disabled="uploading"
            @click="clearAll"
          >
            مسح القائمة
          </button>
        </div>
      </div>
    </div>

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
          @click="router.push('/files/' + file.id)"
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
import { computed, ref, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { pdfAPI, settingsAPI, supplierAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseBadge, BaseSelect, BaseSpinner } from "@/components/base";

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
const defaultMethod = ref("python_pypdf");
const uploadItems = ref([]);
const suppliers = ref([]);
const recentFiles = ref([]);
const stats = ref({
  total_files: 0,
  processing_files: 0,
  completed_files: 0,
  total_parts: 0,
});
const uploading = ref(false);
const uploadSuccessMessage = ref("");
const uploadError = ref("");
const isDragging = ref(false);
const uploadProgress = ref(0);
const uploadProgressMessage = ref("");
let uploadItemCounter = 0;
const itemPollTimers = new Map();

const methodOptions = [
  { label: "استخدام الإعداد الافتراضي", value: "" },
  { label: "Python PyPDF", value: "python_pypdf" },
  { label: "Python AI", value: "python_ai" },
  { label: "Node PDF", value: "node_pdf" },
  { label: "AWS Textract", value: "aws_textract" },
];

const processingMethodLabel = (value) =>
  ({
    python_pypdf: "Python PyPDF",
    python_ai: "Python AI",
    node_pdf: "Node PDF",
    aws_textract: "AWS Textract",
    ocr: "OCR",
  })[value] || value || "الافتراضي";

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

const normalizeSupplierName = (value) =>
  (value || "").replace(/\s+/g, " ").trim();

const isItemReady = (item) =>
  !item.validationError &&
  !!normalizeSupplierName(item.supplierName) &&
  !!item.documentDate &&
  !item.extractingMetadata &&
  !item.uploaded;

const isItemLocked = (item) => uploading.value || item.extractingMetadata || item.uploaded;

const readyItems = computed(() => uploadItems.value.filter((item) => isItemReady(item)));
const readyItemsCount = computed(() => readyItems.value.length);
const reviewItemsCount = computed(() =>
  uploadItems.value.filter(
    (item) =>
      !item.validationError &&
      !item.uploadError &&
      !item.uploaded &&
      !isItemReady(item)
  ).length
);
const erroredItemsCount = computed(() =>
  uploadItems.value.filter((item) => !!item.validationError || !!item.uploadError).length
);

const nextUploadItemId = () => `upload-item-${Date.now()}-${uploadItemCounter++}`;

const getFileValidationError = (file) => {
  const hasPdfMime = file.type === "application/pdf";
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  if (!hasPdfMime && !hasPdfExtension) {
    return "يجب أن يكون الملف بصيغة PDF فقط";
  }

  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return "حجم الملف يتجاوز الحد الأقصى المسموح (100 ميغابايت)";
  }

  return "";
};

const buildUploadItem = (file) => ({
  id: nextUploadItemId(),
  file,
  supplierId: "",
  supplierName: "",
  documentDate: "",
  method: "",
  extractingMetadata: false,
  validationError: getFileValidationError(file),
  uploadError: "",
  uploaded: false,
  uploading: false,
  fileId: "",
  processingStatus: "",
  processingProgress: 0,
  processingMessage: "",
  processingError: "",
  partsCount: 0,
});

const itemStatus = (item) => {
  if (item.validationError) {
    return { label: "غير صالح", variant: "error" };
  }
  if (item.uploadError || item.processingError || item.processingStatus === "failed") {
    return { label: "به خطأ", variant: "error" };
  }
  if (item.processingStatus === "completed") {
    return { label: "مكتمل", variant: "success" };
  }
  if (item.processingStatus === "processing") {
    return { label: "جاري المعالجة", variant: "info" };
  }
  if (item.processingStatus === "pending") {
    return { label: "في الانتظار", variant: "warning" };
  }
  if (item.uploaded) {
    return { label: "تم الإرسال", variant: "success" };
  }
  if (item.uploading) {
    return { label: "جاري الرفع", variant: "info" };
  }
  if (item.extractingMetadata) {
    return { label: "جاري القراءة", variant: "info" };
  }
  if (isItemReady(item)) {
    return { label: "جاهز", variant: "success" };
  }
  return { label: "ينتظر الإكمال", variant: "warning" };
};

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  await addFiles(files);
  e.target.value = "";
};

const handleDrop = async (e) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files || []);
  if (files.length === 0) return;
  await addFiles(files);
};

const addFiles = async (files) => {
  uploadError.value = "";
  uploadSuccessMessage.value = "";

  const items = files.map((file) => buildUploadItem(file));
  uploadItems.value = [...items, ...uploadItems.value];

  await Promise.allSettled(
    items
      .filter((item) => !item.validationError)
      .map((item) => extractItemMetadata(item))
  );
};

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

const ensureSupplierForUpload = async (item) => {
  const normalizedName = normalizeSupplierName(item.supplierName);
  if (!normalizedName) {
    throw new Error("يرجى إدخال اسم الشركة الموردة");
  }

  const existing = findMatchingSupplier(normalizedName);
  if (existing) {
    item.supplierId = existing.id;
    item.supplierName = existing.name;
    return existing.id;
  }

  try {
    const createRes = await supplierAPI.create({ name: normalizedName });
    const newSupplier = createRes.data?.data;
    if (newSupplier) {
      suppliers.value.push(newSupplier);
      item.supplierId = newSupplier.id;
      item.supplierName = newSupplier.name;
      return newSupplier.id;
    }
  } catch (error) {
    await reloadSuppliers();
    const fallbackSupplier = findMatchingSupplier(normalizedName);
    if (fallbackSupplier) {
      item.supplierId = fallbackSupplier.id;
      item.supplierName = fallbackSupplier.name;
      return fallbackSupplier.id;
    }

    throw error;
  }

  throw new Error("تعذر تجهيز الشركة الموردة حالياً");
};

const handleSupplierNameInput = (item) => {
  item.supplierId = "";
  item.uploadError = "";
  item.uploaded = false;
  item.fileId = "";
  item.processingStatus = "";
  item.processingProgress = 0;
  item.processingMessage = "";
  item.processingError = "";
  item.partsCount = 0;
};

const isTerminalProcessingStatus = (status) =>
  status === "completed" || status === "failed";

const processingStatusLabel = (status) =>
  ({
    pending: "بانتظار بدء المعالجة",
    processing: "جاري معالجة الملف",
    completed: "اكتملت المعالجة",
    failed: "فشلت المعالجة",
  })[status] || "تم إرسال الملف";

const processingPanelClass = (item) => {
  if (item.processingStatus === "failed") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300";
  }
  if (item.processingStatus === "completed") {
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300";
  }
  return "border-brand-200 bg-brand-50 text-brand-700 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200";
};

const processingBarClass = (item) => {
  if (item.processingStatus === "failed") {
    return "bg-red-500";
  }
  if (item.processingStatus === "completed") {
    return "bg-green-500";
  }
  return "bg-brand-600";
};

const clearPollTimer = (itemId) => {
  const timerId = itemPollTimers.get(itemId);
  if (timerId) {
    clearTimeout(timerId);
    itemPollTimers.delete(itemId);
  }
};

const schedulePoll = (item) => {
  clearPollTimer(item.id);
  const timerId = window.setTimeout(() => pollItemStatus(item), 2000);
  itemPollTimers.set(item.id, timerId);
};

const applyProcessingState = (item, data = {}) => {
  const status = data.status || item.processingStatus || "pending";
  item.processingStatus = status;
  item.processingProgress =
    typeof data.progress_percent === "number"
      ? data.progress_percent
      : status === "completed"
        ? 100
        : item.processingProgress || 0;
  item.processingMessage =
    data.progress_message ||
    (status === "completed"
      ? "تم إنهاء المعالجة وحفظ البيانات."
      : status === "failed"
        ? "تعذر إكمال المعالجة لهذا الملف."
        : "تم إرسال الملف وهو بانتظار المعالجة.");
  item.partsCount =
    typeof data.parts_count === "number" ? data.parts_count : item.partsCount || 0;
  item.processingError = data.error_message || (status === "failed" ? item.processingError : "");

  if (status === "completed") {
    item.uploaded = true;
    item.uploadError = "";
    item.processingError = "";
    item.processingProgress = 100;
  }

  if (status === "failed" && data.error_message) {
    item.processingError = data.error_message;
  }
};

const pollItemStatus = async (item) => {
  if (!item?.fileId) {
    return;
  }

  try {
    const response = await pdfAPI.getJobStatus(item.fileId);
    const data = response.data?.data || {};
    applyProcessingState(item, data);

    if (!isTerminalProcessingStatus(item.processingStatus)) {
      schedulePoll(item);
      return;
    }

    clearPollTimer(item.id);
    await refreshFilesAndStats();
  } catch (error) {
    item.processingError =
      error?.response?.data?.message || "تعذر تحديث حالة المعالجة حالياً";
    clearPollTimer(item.id);
  }
};

const startPollingItem = (item) => {
  if (!item?.fileId) {
    return;
  }

  if (isTerminalProcessingStatus(item.processingStatus)) {
    clearPollTimer(item.id);
    return;
  }

  schedulePoll(item);
};

const canRetryItem = (item) =>
  !item.validationError &&
  !item.extractingMetadata &&
  !item.uploading &&
  ((!!item.uploadError && !item.fileId) || item.processingStatus === "failed");

const extractItemMetadata = async (item) => {
  if (!item || item.validationError) return;

  item.extractingMetadata = true;
  item.uploadError = "";
  try {
    const formData = new FormData();
    formData.append("file", item.file);

    const res = await pdfAPI.extractMetadata(formData);
    const data = res.data?.data;

    if (data) {
      if (data.documentDate) {
        item.documentDate = data.documentDate;
      }

      if (data.supplierName) {
        const extractedName = data.supplierName.trim();
        item.supplierName = extractedName;
        const existing = findMatchingSupplier(extractedName);

        if (existing) {
          item.supplierId = existing.id;
          item.supplierName = existing.name;
        }
      }
    }
  } catch (e) {
    if (e?.response?.status !== 403) {
      item.uploadError =
        e?.response?.data?.message || "تعذر استخراج البيانات تلقائياً لهذا الملف";
    }
  } finally {
    item.extractingMetadata = false;
  }
};

const removeItem = (itemId) => {
  clearPollTimer(itemId);
  uploadItems.value = uploadItems.value.filter((item) => item.id !== itemId);
};

const clearAll = () => {
  uploadItems.value.forEach((item) => clearPollTimer(item.id));
  uploadItems.value = [];
  uploadSuccessMessage.value = "";
  uploadError.value = "";
  uploadProgress.value = 0;
  uploadProgressMessage.value = "";
};

const extractBatchResults = (payload) => {
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.items,
    payload.files,
    payload.results,
    payload.uploads,
    payload.uploadedFiles,
    payload.uploaded_files,
  ];

  return candidates.find((candidate) => Array.isArray(candidate)) || [];
};

const uploadSelectedItems = async (itemsToUpload) => {
  if (itemsToUpload.length === 0) {
    uploadError.value = "لا توجد ملفات جاهزة للإرسال حالياً";
    return;
  }

  uploading.value = true;
  uploadSuccessMessage.value = "";
  uploadError.value = "";
  uploadProgress.value = 0;
  uploadProgressMessage.value = "جاري تجهيز الملفات للإرسال...";

  uploadItems.value.forEach((item) => {
    item.uploadError = item.validationError ? item.uploadError : "";
    item.uploading = false;
  });

  try {
    const preparedUploads = [];

    for (const item of itemsToUpload) {
      try {
        const supplierId = await ensureSupplierForUpload(item);
        item.uploading = true;
        item.uploadError = "";
        item.processingError = "";
        item.processingMessage = "";
        item.processingStatus = "";
        item.processingProgress = 0;
        item.partsCount = 0;
        preparedUploads.push({
          item,
          payload: {
            supplier_id: supplierId,
            document_date: item.documentDate,
            ...(item.method ? { method: item.method } : {}),
          },
        });
      } catch (error) {
        item.uploadError =
          error?.response?.data?.message ||
          error?.message ||
          "تعذر تجهيز بيانات هذا الملف";
      }
    }

    if (preparedUploads.length === 0) {
      throw new Error("تعذر تجهيز أي ملف للإرسال");
    }

    const formData = new FormData();
    preparedUploads.forEach(({ item }) => {
      formData.append("files[]", item.file);
    });
    formData.append(
      "items",
      JSON.stringify(preparedUploads.map(({ payload }) => payload))
    );

    const response = await pdfAPI.upload(formData, {
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        uploadProgress.value = percentCompleted;
        if (percentCompleted < 100) {
          uploadProgressMessage.value = `جاري رفع ${preparedUploads.length} ملف... ${percentCompleted}%`;
        } else {
          uploadProgressMessage.value = "تم إرسال الملفات. جاري تحديث القائمة...";
        }
      },
    });

    const payload = response.data?.data;
    const results = extractBatchResults(payload);

    let successCount = 0;

    preparedUploads.forEach(({ item }, index) => {
      const result = results[index];
      const fileError =
        result?.success === false || result?.status === "failed"
          ? result?.error?.message || result?.error || result?.message || "تعذر رفع الملف"
          : "";

      if (fileError) {
        item.uploadError = fileError;
        item.uploaded = false;
        item.fileId = "";
      } else {
        item.uploadError = "";
        item.uploaded = true;
        item.fileId =
          result?.id ||
          result?.file_id ||
          result?.data?.id ||
          payload?.id ||
          "";
        applyProcessingState(item, {
          status:
            result?.data?.status || result?.status || "pending",
          progress_percent: 0,
          progress_message: "تم إرسال الملف وهو بانتظار المعالجة.",
        });
        startPollingItem(item);
        successCount += 1;
      }

      item.uploading = false;
    });

    uploadProgress.value = 100;
    uploadProgressMessage.value = "اكتمل إرسال الملفات بنجاح";
    uploadSuccessMessage.value = `تم إرسال ${successCount} من أصل ${preparedUploads.length} ملف للمعالجة.`;

    await refreshFilesAndStats();
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "حدث خطأ أثناء رفع الملفات";
    uploadError.value = message;
    uploadItems.value.forEach((item) => {
      if (item.uploading) {
        item.uploading = false;
        item.uploadError = message;
      }
    });
  } finally {
    uploading.value = false;
    uploadItems.value.forEach((item) => {
      item.uploading = false;
    });
  }
};

const uploadFiles = async () => {
  await uploadSelectedItems(readyItems.value);
};

const retryItem = async (item) => {
  if (!item) {
    return;
  }

  if (item.fileId && item.processingStatus === "failed") {
    try {
      item.uploadError = "";
      item.processingError = "";
      item.processingStatus = "pending";
      item.processingProgress = 0;
      item.processingMessage = "تمت إعادة جدولة الملف للمعالجة.";
      const response = await pdfAPI.reprocessFile(item.fileId, {
        ...(item.method ? { method: item.method } : {}),
      });
      applyProcessingState(item, {
        status: response.data?.data?.status || "pending",
        progress_percent: 0,
        progress_message: "تمت إعادة جدولة الملف للمعالجة.",
      });
      startPollingItem(item);
      await refreshFilesAndStats();
      return;
    } catch (error) {
      item.processingStatus = "failed";
      item.processingError =
        error?.response?.data?.message || "تعذر إعادة معالجة الملف حالياً";
      return;
    }
  }

  await uploadSelectedItems([item]);
};

onBeforeUnmount(() => {
  uploadItems.value.forEach((item) => clearPollTimer(item.id));
});
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

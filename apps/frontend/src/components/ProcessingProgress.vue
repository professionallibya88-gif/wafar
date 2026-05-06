<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-modal flex min-h-dvh items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-md p-4 sm:p-6"
    >
      <div
        class="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-auto animate-scale-in border border-gray-200 dark:border-gray-800"
      >
      <!-- Header -->
      <div class="text-center mb-5">
        <!-- Percentage م Status Icon -->
        <div class="flex items-center justify-center gap-2 mb-3">
          <span
            class="text-2xl font-extrabold tabular-nums tracking-tight"
            :class="{
              'text-emerald-600 dark:text-emerald-400': status === 'success',
              'text-red-500 dark:text-red-400': status === 'error',
              'text-gray-900 dark:text-white': status === 'processing',
            }"
          >
            {{ progress }}%
          </span>
          <div class="flex items-center">
            <AppIcon
              v-if="status === 'success'"
              name="CheckCircle"
              size="xl"
              color="success"
              customClass="dark:text-green-400"
            />
            <AppIcon
              v-else-if="status === 'error'"
              name="XCircle"
              size="xl"
              color="error"
              customClass="dark:text-red-400"
            />
            <BaseSpinner
              v-else-if="isProcessing"
              size="xs"
            />
          </div>
        </div>

        <!-- Progress Bar -->
        <div
          class="relative w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner"
        >
          <!-- Glow track behind bar -->
          <div
            class="absolute inset-0 rounded-full transition-all duration-700 ease-out"
            :class="{
              'bg-gradient-to-l from-emerald-300/40 via-emerald-400/20 to-transparent':
                isProcessing,
              'bg-emerald-500/20': status === 'success',
              'bg-red-500/20': status === 'error',
            }"
          />
          <!-- Main fill bar -->
          <div
            class="h-full rounded-full transition-all duration-700 ease-out relative"
            :class="{
              'bg-gradient-to-l from-emerald-500 to-emerald-400':
                status !== 'error',
              'bg-gradient-to-l from-red-500 to-red-400': status === 'error',
            }"
            :style="{ width: `${Math.min(Math.max(progress, 0), 100)}%` }"
          >
            <!-- Shimmer effect while processing -->
            <div
              v-if="isProcessing"
              class="absolute inset-0 rounded-full animate-shimmer"
              style="
                background: linear-gradient(
                  90deg,
                  transparent 0%,
                  rgba(255, 255, 255, 0.35) 50%,
                  transparent 100%
                );
                background-size: 200% 100%;
              "
            />
            <!-- Glow cap at the end -->
            <div
              v-if="progress > 0 && progress < 100"
              class="absolute top-0 left-0 h-full w-2 bg-white/50 rounded-full blur-[2px]"
            />
          </div>
        </div>

        <!-- Mini dots when processing -->
        <div v-if="isProcessing" class="flex justify-center gap-1 mt-2">
          <span
            class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          />
          <span
            class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          />
          <span
            class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          />
        </div>

        <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-1">
          {{ title }}
        </h3>
        <p v-if="!subtitle.includes('جاري حفظ القطع')" class="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
          {{ subtitle }}
        </p>
        <p v-else class="text-brand-600 dark:text-brand-400 text-sm font-bold mt-2">
          وصلت الآن : {{ subtitle.match(/\((.*?)\)/)?.[1] || subtitle }}
        </p>
      </div>

      <!-- Progress Details -->
      <div class="space-y-4">
        <!-- Steps with enhanced animation -->
        <div class="space-y-1">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center gap-2 p-2 rounded-lg transition-all duration-300 transform"
            :class="{
              'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800':
                step.status === 'completed',
              'bg-brand-50 dark:bg-neutral-900/30 border border-brand-200 dark:border-neutral-800 shadow-md':
                step.status === 'active',
              'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700':
                step.status === 'pending',
            }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="relative">
              <!-- Connecting line for completed steps -->
              <div
                v-if="index > 0 && steps[index - 1].status === 'completed'"
                class="absolute -top-3 right-3 w-0.5 h-3 bg-green-300 dark:bg-green-700"
              />

              <div
                class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                :class="{
                  'bg-green-500 shadow-lg shadow-green-500/30':
                    step.status === 'completed',
                  'bg-brand-500 shadow-lg shadow-brand-500/30 animate-pulse':
                    step.status === 'active',
                  'bg-neutral-300 dark:bg-neutral-600':
                    step.status === 'pending',
                }"
              >
                <AppIcon
                  v-if="step.status === 'completed'"
                  name="Check"
                  size="xs"
                  color="white"
                />
                <BaseSpinner
                  v-else-if="step.status === 'active'"
                  size="xs"
                  color="white"
                />
                <span
                  v-else
                  class="text-white dark:text-neutral-300 text-xs font-medium"
                  >{{ index + 1 }}</span
                >
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="font-semibold text-gray-900 dark:text-white text-[10px] truncate"
              >
                {{ step.label }}
              </p>
              <p
                v-if="step.detail"
                class="text-[8px] text-gray-500 dark:text-gray-400 truncate"
              >
                {{ step.detail }}
              </p>
            </div>
            <!-- Status indicator -->
            <div class="flex-shrink-0">
              <AppIcon
                v-if="step.status === 'completed'"
                name="CheckCircle"
                size="xs"
                color="green"
              />
              <div
                v-else-if="step.status === 'active'"
                class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping"
              />
              <div
                v-else
                class="w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full"
              />
            </div>
          </div>
        </div>

        <!-- Enhanced Stats with cards -->
        <div
          class="grid grid-cols-3 gap-1 pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-1.5 text-center border border-blue-200 dark:border-blue-800"
          >
            <p class="text-sm font-bold text-blue-600 dark:text-blue-400">
              {{ stats.pages }}
            </p>
            <p class="text-[8px] text-blue-700 dark:text-blue-300 font-medium">
              صفحة
            </p>
          </div>
          <div
            class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-1.5 text-center border border-green-200 dark:border-green-800"
          >
            <p class="text-sm font-bold text-green-600 dark:text-green-400">
              {{ stats.parts }}
            </p>
            <p
              class="text-[8px] text-green-700 dark:text-green-300 font-medium"
            >
              قطعة
            </p>
          </div>
          <div
            class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-1.5 text-center border border-purple-200 dark:border-purple-800"
          >
            <p class="text-sm font-bold text-purple-600 dark:text-purple-400">
              {{ stats.tables }}
            </p>
            <p
              class="text-[8px] text-purple-700 dark:text-purple-300 font-medium"
            >
              جدول
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-2">
        <button
          v-if="canSave"
          @click="$emit('save')"
          class="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/30"
        >
          حفظ
        </button>
        <button
          v-if="canApply"
          @click="$emit('apply')"
          class="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/30"
        >
          تطبيق
        </button>
        <button
          v-if="canCancel"
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          إلغاء
        </button>
        <button
          v-if="canClean"
          @click="$emit('clean')"
          class="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          تنظيف
        </button>
        <button
          v-if="canFix"
          @click="$emit('fix')"
          class="flex-1 px-4 py-2.5 bg-brand-50 dark:bg-neutral-800 text-brand-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-brand-100 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          إصلاح
        </button>
        <button
          v-if="canClose"
          @click="$emit('close')"
          class="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/30"
        >
          {{ closeText }}
        </button>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { AppIcon } from "./icons";
import BaseSpinner from "./base/BaseSpinner.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "جاري معالجة الملف",
  },
  subtitle: {
    type: String,
    default: "يرجى الانتظار...",
  },
  progress: {
    type: Number,
    default: 0,
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Array,
    default: () => [
      { label: "رفع الملف", status: "pending" },
      { label: "فحص الملف", status: "pending" },
      { label: "استخراج البيانات", status: "pending" },
      { label: "حفظ النتائج", status: "pending" },
    ],
  },
  stats: {
    type: Object,
    default: () => ({
      pages: 0,
      parts: 0,
      tables: 0,
    }),
  },
  canCancel: {
    type: Boolean,
    default: true,
  },
  canClose: {
    type: Boolean,
    default: false,
  },
  canSave: {
    type: Boolean,
    default: false,
  },
  canApply: {
    type: Boolean,
    default: false,
  },
  canClean: {
    type: Boolean,
    default: false,
  },
  canFix: {
    type: Boolean,
    default: false,
  },
  closeText: {
    type: String,
    default: "إغلاق",
  },
  status: {
    type: String,
    default: "processing", // processing, success, error
  },
});

defineEmits(["close", "cancel", "save", "apply", "clean", "fix"]);

const isProcessing = computed(() => {
  return props.status === "processing" && props.progress < 100;
});
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 1.5s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .text-lg {
    font-size: 0.9rem;
  }

  .max-w-md {
    max-width: 28rem;
  }
}
</style>

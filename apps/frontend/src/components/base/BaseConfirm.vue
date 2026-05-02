<template>
  <Teleport to="body">
    <!-- Step 1 Modal -->
    <BaseModal
      v-model:show="state.showStep1"
      :title="state.options.title || 'تأكيد الإجراء'"
      size="md"
      :closeable="false"
      :closeOnBackdrop="false"
      :closeOnEscape="false"
    >
      <div class="flex flex-col items-center text-center p-4">
        <div 
          class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          :class="iconColorClass"
        >
          <AppIcon :name="iconName" size="xl" />
        </div>
        <p class="text-lg text-neutral-800 dark:text-neutral-200 font-medium mb-2">
          {{ state.message }}
        </p>
        <p v-if="state.options.description" class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ state.options.description }}
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <BaseButton variant="outline" @click="cancel">
            {{ state.options.cancelText || 'إلغاء' }}
          </BaseButton>
          <BaseButton :variant="state.options.type === 'danger' ? 'danger' : 'primary'" @click="proceedToStep2">
            {{ state.options.confirmText || 'متابعة' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Step 2 Modal (Final Confirmation) -->
    <BaseModal
      v-model:show="state.showStep2"
      title="تأكيد نهائي للإجراء"
      size="md"
      :closeable="false"
      :closeOnBackdrop="false"
      :closeOnEscape="false"
    >
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 bg-error-100 dark:bg-error-900/30 text-error-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <AppIcon name="ExclamationCircle" size="xl" />
        </div>
        <p class="text-lg text-neutral-800 dark:text-neutral-200 font-bold mb-2">
          تأكيد نهائي
        </p>
        <p class="text-md text-neutral-600 dark:text-neutral-300 mb-4">
          أنت على وشك تنفيذ إجراء حساس. يرجى التأكيد النهائي للمتابعة.
        </p>
        <div class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 w-full text-right">
          <p class="text-sm text-error-800 dark:text-error-400 font-medium flex items-center gap-2">
            <AppIcon name="InformationCircle" size="sm" />
            تحذير: هذا الإجراء لا يمكن التراجع عنه.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <BaseButton variant="outline" @click="cancel">
            إلغاء الأمر
          </BaseButton>
          <BaseButton variant="danger" @click="confirmFinal">
            تأكيد التنفيذ
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </Teleport>
</template>

<script setup>
import { reactive, computed, onMounted, onUnmounted } from "vue";
import BaseModal from "./BaseModal.vue";
import BaseButton from "./BaseButton.vue";
import { AppIcon } from "@/icons";

const state = reactive({
  showStep1: false,
  showStep2: false,
  message: "",
  options: {},
  resolve: null,
});

const iconName = computed(() => {
  if (state.options.icon) return state.options.icon;
  if (state.options.type === 'danger') return 'ExclamationCircle';
  if (state.options.type === 'info') return 'InformationCircle';
  return 'ExclamationTriangle';
});

const iconColorClass = computed(() => {
  if (state.options.type === 'danger') return 'bg-error-100 dark:bg-error-900/30 text-error-600';
  if (state.options.type === 'info') return 'bg-info-100 dark:bg-info-900/30 text-info-600';
  return 'bg-warning-100 dark:bg-warning-900/30 text-warning-600';
});

const showConfirm = (message, options = {}) => {
  return new Promise((resolve) => {
    state.message = message;
    state.options = {
      type: 'danger', // default type
      requireTwoSteps: true, // 2-step confirmation by default
      ...options,
    };
    state.resolve = resolve;
    state.showStep1 = true;
    state.showStep2 = false;
  });
};

const proceedToStep2 = () => {
  state.showStep1 = false;
  if (state.options.requireTwoSteps) {
    // Small delay to allow the first modal to close smoothly before opening the second
    setTimeout(() => {
      state.showStep2 = true;
    }, 300);
  } else {
    confirmFinal();
  }
};

const confirmFinal = () => {
  state.showStep1 = false;
  state.showStep2 = false;
  if (state.resolve) {
    state.resolve(true);
    state.resolve = null;
  }
};

const cancel = () => {
  state.showStep1 = false;
  state.showStep2 = false;
  if (state.resolve) {
    state.resolve(false);
    state.resolve = null;
  }
};

// Global event listener
const handleConfirmEvent = (event) => {
  const { message, options, resolve } = event.detail;
  showConfirm(message, options).then(resolve);
};

onMounted(() => {
  window.addEventListener("show-confirm", handleConfirmEvent);
});

onUnmounted(() => {
  window.removeEventListener("show-confirm", handleConfirmEvent);
});

// Expose methods globally
window.$confirm = showConfirm;

defineExpose({ showConfirm });
</script>

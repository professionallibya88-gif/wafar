<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[160] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'relative flex items-start gap-3 p-4 rounded-xl shadow-lg backdrop-blur-md border pointer-events-auto',
          'animate-bounce-in',
          variantClasses(toast.type),
        ]"
      >
        <!-- Icon -->
        <div :class="iconWrapperClasses(toast.type)">
          <!-- Success Icon -->
          <AppIcon
            v-if="toast.type === 'success'"
            name="Check"
            size="md"
            color="success"
          />
          <!-- Error Icon -->
          <AppIcon
            v-else-if="toast.type === 'error'"
            name="X"
            size="md"
            color="error"
          />
          <!-- Warning Icon -->
          <AppIcon
            v-else-if="toast.type === 'warning'"
            name="ExclamationTriangle"
            size="md"
            color="warning"
          />
          <!-- Info Icon -->
          <AppIcon v-else name="InformationCircle" size="md" color="info" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p
            v-if="toast.title"
            class="font-semibold text-sm text-gray-900 dark:text-white"
          >
            {{ toast.title }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 p-1 rounded-lg hover:bg-brand-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <AppIcon
            name="X"
            size="sm"
            customClass="text-gray-400 dark:text-gray-500"
          />
        </button>

        <!-- Progress Bar -->
        <div
          v-if="toast.duration !== 0"
          class="absolute bottom-0 right-0 left-0 h-1 rounded-b-xl overflow-hidden"
        >
          <div
            :class="[
              'h-full transition-all ease-linear',
              progressBarClass(toast.type),
            ]"
            :style="{ width: `${toast.progress}%` }"
          />
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { AppIcon } from "@/icons";

const toasts = ref([]);
let toastId = 0;
let intervalId = null;

const addToast = ({ type = "info", title = "", message, duration = 5000 }) => {
  const id = ++toastId;
  const toast = {
    id,
    type,
    title,
    message,
    duration,
    progress: 100,
    startTime: Date.now(),
  };

  toasts.value.push(toast);

  if (duration > 0) {
    const updateProgress = () => {
      const elapsed = Date.now() - toast.startTime;
      toast.progress = Math.max(0, 100 - (elapsed / duration) * 100);

      if (toast.progress <= 0) {
        removeToast(id);
      }
    };

    intervalId = setInterval(updateProgress, 50);
  }

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const variantClasses = (type) => {
  const variants = {
    success:
      "bg-success-50/95 dark:bg-success-900/70 border-success-200 dark:border-success-700",
    error:
      "bg-error-50/95 dark:bg-error-900/70 border-error-200 dark:border-error-700",
    warning:
      "bg-warning-50/95 dark:bg-warning-900/70 border-warning-200 dark:border-warning-700",
    info: "bg-brand-50/95 dark:bg-neutral-900/70 border-brand-200 dark:border-neutral-700",
  };
  return variants[type] || variants.info;
};

const iconWrapperClasses = (type) => {
  const icons = {
    success: "text-success-500",
    error: "text-error-500",
    warning: "text-warning-500",
    info: "text-brand-500",
  };
  return icons[type] || icons.info;
};

const progressBarClass = (type) => {
  const bars = {
    success: "bg-success-500",
    error: "bg-error-500",
    warning: "bg-warning-500",
    info: "bg-brand-500",
  };
  return bars[type] || bars.info;
};

// Global event listener
const handleToast = (event) => {
  addToast(event.detail);
};

onMounted(() => {
  window.addEventListener("show-toast", handleToast);
});

onUnmounted(() => {
  window.removeEventListener("show-toast", handleToast);
  if (intervalId) clearInterval(intervalId);
});

// Expose methods globally
window.$toast = {
  success: (message, title = "") =>
    addToast({ type: "success", message, title }),
  error: (message, title = "") => addToast({ type: "error", message, title }),
  warning: (message, title = "") =>
    addToast({ type: "warning", message, title }),
  info: (message, title = "") => addToast({ type: "info", message, title }),
};

defineExpose({ addToast, removeToast });
</script>

<style scoped>
.toast-enter-active {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-leave-active {
  animation: slideOutUp 0.3s ease forwards;
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes slideOutUp {
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>

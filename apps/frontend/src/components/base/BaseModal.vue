<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="handleBackdropClick"
        />

        <!-- Modal Content -->
        <div
          ref="modalRef"
          :class="[
            'relative bg-layer-card shadow-2xl w-full transition-all border-t sm:border border-neutral-200 dark:border-neutral-800',
            'animate-scale-in-center',
            sizeClasses,
            'max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col',
            'rounded-t-2xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl'
          ]"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800"
          >
            <slot name="header">
              <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ title }}
              </h3>
            </slot>
            <button
              v-if="closeable"
              @click="close"
              class="p-2 text-neutral-400 hover:text-brand-600 dark:hover:text-neutral-200 hover:bg-brand-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <AppIcon name="X" size="md" />
            </button>
          </div>

          <!-- Body -->
          <div
            class="flex-1 overflow-y-auto p-6"
            :class="{ 'p-6': !$slots.header && !title }"
          >
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-brand-50 dark:bg-neutral-800/70 rounded-b-none sm:rounded-b-2xl"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from "vue";
import { AppIcon } from "@/icons";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl", "full"].includes(v),
  },
  closeable: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  closeOnEscape: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:show", "close"]);

const sizeClasses = computed(() => {
  const sizes = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };
  return sizes[props.size];
});

const close = () => {
  emit("update:show", false);
  emit("close");
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close();
  }
};

const handleEscape = (e) => {
  if (e.key === "Escape" && props.show && props.closeOnEscape) {
    close();
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>

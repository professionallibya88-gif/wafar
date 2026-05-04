<template>
  <transition name="route-loader-fade">
    <div
      v-if="visible"
      class="pointer-events-none fixed inset-x-0 top-0 z-[155] flex justify-center px-4 pt-5"
      aria-label="جاري تجهيز الصفحة"
    >
      <div
        class="route-loader-shell flex h-14 w-14 items-center justify-center rounded-full border border-brand-200/70 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-brand-500/15 dark:bg-neutral-950/80"
        role="status"
        aria-live="polite"
      >
        <BaseSpinner usage="route" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import BaseSpinner from "./BaseSpinner.vue";

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  delay: {
    type: Number,
    default: 140,
  },
});

const visible = ref(false);
let timerId = null;

const clearTimer = () => {
  if (timerId) {
    window.clearTimeout(timerId);
    timerId = null;
  }
};

watch(
  () => props.active,
  (isActive) => {
    clearTimer();

    if (isActive) {
      timerId = window.setTimeout(() => {
        visible.value = true;
      }, props.delay);
      return;
    }

    visible.value = false;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<style scoped>
.route-loader-shell {
  direction: rtl;
}

.route-loader-fade-enter-active,
.route-loader-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.route-loader-fade-enter-from,
.route-loader-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .route-loader-fade-enter-active,
  .route-loader-fade-leave-active {
    transition-duration: 120ms;
  }

  .route-loader-fade-enter-from,
  .route-loader-fade-leave-to {
    transform: none;
  }
}
</style>

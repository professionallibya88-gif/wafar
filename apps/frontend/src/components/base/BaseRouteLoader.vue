<template>
  <transition name="route-loader-fade">
    <div
      v-if="visible"
      class="pointer-events-none fixed inset-0 z-loader flex items-center justify-center"
      aria-label="جاري تجهيز الصفحة"
    >
      <div class="route-loader-shell" role="status" aria-live="polite">
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.route-loader-fade-enter-active,
.route-loader-fade-leave-active {
  transition: opacity 180ms ease;
}

.route-loader-fade-enter-from,
.route-loader-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .route-loader-fade-enter-active,
  .route-loader-fade-leave-active {
    transition-duration: 120ms;
  }
}
</style>

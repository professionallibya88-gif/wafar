<template>
  <transition name="blocking-overlay-fade">
    <div
      v-if="show"
      class="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-white/70 backdrop-blur-sm dark:bg-neutral-950/70"
      role="status"
      aria-label="جاري تنفيذ العملية"
      aria-live="polite"
    >
      <div class="blocking-overlay-spinner">
        <BaseSpinner usage="overlay" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import BaseSpinner from "./BaseSpinner.vue";

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.blocking-overlay-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.blocking-overlay-fade-enter-active,
.blocking-overlay-fade-leave-active {
  transition: opacity 180ms ease;
}

.blocking-overlay-fade-enter-from,
.blocking-overlay-fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <transition name="blocking-overlay-fade">
    <div
      v-if="show"
      class="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-white/70 backdrop-blur-sm dark:bg-neutral-950/70"
      role="status"
      aria-label="جاري تنفيذ العملية"
      aria-live="polite"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200/80 bg-white/92 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/92"
      >
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
.blocking-overlay-fade-enter-active,
.blocking-overlay-fade-leave-active {
  transition: opacity 180ms ease;
}

.blocking-overlay-fade-enter-from,
.blocking-overlay-fade-leave-to {
  opacity: 0;
}
</style>

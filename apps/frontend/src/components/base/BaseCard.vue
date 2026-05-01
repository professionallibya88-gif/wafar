<template>
  <div
    :class="[
      'bg-layer-card rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden',
      'transition-all duration-300 will-change-transform',
      hoverable
        ? 'hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-1 cursor-pointer'
        : 'shadow-sm',
      paddingClasses,
      { 'border-r-4 border-r-brand-500 dark:border-r-brand-400': highlighted },
    ]"
  >
    <!-- Header Slot -->
    <div v-if="$slots.header || title" class="mb-4">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {{ title }}
          </h3>
          <slot name="headerAction" />
        </div>
        <p
          v-if="subtitle"
          class="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <!-- Content -->
    <div :class="{ 'mt-4': $slots.header || title }">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div
      v-if="$slots.footer"
      class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const paddingMap = {
  0: "p-0",
  2: "p-2",
  3: "p-3",
  4: "p-4",
  5: "p-5",
  6: "p-6",
  8: "p-8",
};

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  highlighted: {
    type: Boolean,
    default: false,
  },
  padding: {
    type: [String, Number],
    default: "6",
  },
});

const paddingClasses = computed(() => {
  const key = String(props.padding);
  return paddingMap[key] || "p-6";
});
</script>

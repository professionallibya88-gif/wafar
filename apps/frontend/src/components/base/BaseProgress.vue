<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium" :class="labelClass">{{ label }}</span>
      <span class="text-sm font-semibold" :class="valueClass"
        >{{ displayValue }}%</span
      >
    </div>
    <div :class="wrapperClass" class="relative overflow-hidden rounded-full">
      <div :class="bgClass" class="absolute inset-0"></div>
      <div
        :class="[fillClass, animated && 'transition-all duration-500 ease-out']"
        :style="{ width: `${clampedValue}%` }"
      >
        <div v-if="striped" class="absolute inset-0 overflow-hidden">
          <div class="progress-stripes"></div>
        </div>
        <div v-if="shimmer" class="absolute inset-0 shimmer"></div>
      </div>
      <div
        v-if="centerLabel"
        class="absolute inset-0 flex items-center justify-center"
      >
        <span class="text-xs font-semibold text-white"
          >{{ displayValue }}%</span
        >
      </div>
    </div>
    <p v-if="description" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  value: { type: Number, default: 0 },
  label: { type: String, default: "" },
  description: { type: String, default: "" },
  showLabel: { type: Boolean, default: true },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl"].includes(v),
  },
  variant: {
    type: String,
    default: "primary",
    validator: (v) =>
      ["primary", "success", "warning", "error", "gradient"].includes(v),
  },
  striped: { type: Boolean, default: false },
  animated: { type: Boolean, default: true },
  shimmer: { type: Boolean, default: false },
  centerLabel: { type: Boolean, default: false },
});

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));
const displayValue = computed(() => Math.round(clampedValue.value));

const sizeClasses = { xs: "h-1", sm: "h-2", md: "h-3", lg: "h-4", xl: "h-6" };
const wrapperClass = computed(() => sizeClasses[props.size]);
const bgClass = computed(() => "bg-brand-50 dark:bg-neutral-800");
const fillClass = computed(() => {
  const variants = {
    primary: "bg-brand-600 dark:bg-neutral-600",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
    gradient: "bg-gradient-to-r from-brand-500 to-accent-500 dark:from-brand-500",
  };
  return `h-full relative ${variants[props.variant]}`;
});
const labelClass = computed(() => "text-gray-900 dark:text-white");
const valueClass = computed(() => "text-gray-600 dark:text-gray-300");
</script>

<style scoped>
.progress-stripes {
  width: 200%;
  height: 100%;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progressStripes 1s linear infinite;
}
@keyframes progressStripes {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-1rem);
  }
}
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
</style>

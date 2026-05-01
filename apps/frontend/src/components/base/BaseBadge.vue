<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      sizeClasses,
      variantClasses,
    ]"
  >
    <!-- Dot -->
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full ml-1.5', dotClass]" />

    <slot />
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      [
        "default",
        "primary",
        "success",
        "warning",
        "error",
        "info",
        "outline",
      ].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg"].includes(v),
  },
  dot: {
    type: Boolean,
    default: false,
  },
  pulse: {
    type: Boolean,
    default: false,
  },
});

const sizeClasses = computed(() => {
  const sizes = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };
  return sizes[props.size];
});

const variantClasses = computed(() => {
  const variants = {
    default:
      "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
    primary:
      "bg-brand-100 dark:bg-neutral-900/40 text-brand-700 dark:text-neutral-300",
    success:
      "bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300",
    warning:
      "bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300",
    error:
      "bg-error-100 dark:bg-error-900/40 text-error-700 dark:text-error-300",
    info: "bg-brand-100 dark:bg-neutral-900/40 text-brand-700 dark:text-neutral-300",
    outline:
      "bg-transparent border border-current text-neutral-600 dark:text-neutral-400",
  };
  return variants[props.variant];
});

const dotClass = computed(() => {
  const dots = {
    default: "bg-neutral-500",
    primary: "bg-brand-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
    info: "bg-brand-500",
  };
  return props.pulse
    ? `${dots[props.variant]} animate-pulse`
    : dots[props.variant];
});
</script>

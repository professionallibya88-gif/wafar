<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      roundedClass,
      block ? 'w-full' : '',
      sizeClasses,
      variantClasses,
      { 'active:scale-95': !disabled && !loading },
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Spinner -->
    <AppIcon
      v-if="loading"
      name="Refresh"
      :class="['animate-spin', iconSizeClass]"
    />

    <!-- Icon Left -->
    <span v-if="$slots.iconLeft && !loading" :class="iconSizeClass">
      <slot name="iconLeft" />
    </span>

    <!-- Default Content -->
    <slot />

    <!-- Icon Right -->
    <span v-if="$slots.iconRight && !loading" :class="iconSizeClass">
      <slot name="iconRight" />
    </span>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { AppIcon } from "@/icons";

const props = defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary",
    validator: (v) =>
      [
        "primary",
        "secondary",
        "outline",
        "ghost",
        "danger",
        "success",
        "warning",
      ].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl"].includes(v),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: String,
    default: "lg",
  },
});

defineEmits(["click"]);

const sizeClasses = computed(() => {
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs min-h-[36px]",
    sm: "px-3 py-2 text-sm min-h-[44px] sm:min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[48px] sm:min-h-[40px]",
    lg: "px-5 py-3 text-base min-h-[56px] sm:min-h-[48px]",
    xl: "px-6 py-3.5 text-base min-h-[64px] sm:min-h-[56px]",
  };
  return sizes[props.size];
});

const roundedClass = computed(() => {
  const roundedMap = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  };
  return roundedMap[props.rounded] || "rounded-xl";
});

const iconSizeClass = computed(() => {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-5 h-5",
  };
  return sizes[props.size];
});

const variantClasses = computed(() => {
  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-brand-sm hover:shadow-brand-md",
    secondary:
      "bg-brand-50 text-brand-700 hover:bg-brand-100 focus:ring-brand-500 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 border border-brand-200 dark:border-neutral-700",
    outline:
      "border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-500 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/30",
    ghost:
      "text-brand-600 hover:bg-brand-50 focus:ring-brand-500 dark:text-neutral-300 dark:hover:bg-neutral-800",
    danger:
      "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 dark:bg-error-700 dark:hover:bg-error-600 shadow-sm hover:shadow-md",
    success:
      "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 dark:bg-success-700 dark:hover:bg-success-600 shadow-sm hover:shadow-md",
    warning:
      "bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-400 dark:bg-warning-600 dark:hover:bg-warning-500 shadow-sm hover:shadow-md",
  };
  return variants[props.variant];
});
</script>

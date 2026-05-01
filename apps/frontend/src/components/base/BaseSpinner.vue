<template>
  <div :class="wrapperClasses" role="status">
    <AppIcon
      name="Refresh"
      :class="[sizeClasses, 'animate-spin text-current']"
    />
    <span v-if="text" class="mr-2 text-sm">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { AppIcon } from "@/icons";

const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl"].includes(v),
  },
  text: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "primary",
    validator: (v) => ["primary", "white", "gray"].includes(v),
  },
});

const sizeClasses = computed(() => {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };
  return sizes[props.size];
});

const wrapperClasses = computed(() => {
  const base = "inline-flex items-center justify-center";
  const colors = {
    primary: "text-brand-600 dark:text-neutral-400",
    white: "text-white",
    gray: "text-surface-500 dark:text-surface-400",
  };
  return `${base} ${colors[props.color]}`;
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variantClasses"
  >
    <BaseSpinner
      v-if="loading"
      :size="loadingSpinnerSize"
      :color="loadingSpinnerColor"
      usage="action"
    />
    <AppIcon
      v-if="icon && !loading"
      :name="icon"
      :size="iconSize"
      :color="iconColor"
    />
    <span v-if="loading">{{ loadingText }}</span>
    <slot v-else />
  </button>
</template>

<script setup>
import { computed } from "vue";
import { AppIcon } from "@/icons";
import BaseSpinner from "./BaseSpinner.vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "accent", "danger", "success", "ghost"].includes(
        value,
      ),
  },
  type: {
    type: String,
    default: "button",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: "جاري التحميل...",
  },
  icon: {
    type: String,
    default: null,
  },
  iconSize: {
    type: String,
    default: "md",
  },
  iconColor: {
    type: String,
    default: null,
  },
});

defineEmits(["click"]);

const loadingSpinnerSize = computed(() => {
  return props.iconSize === "lg" || props.iconSize === "xl" ? "sm" : "xs";
});

const loadingSpinnerColor = computed(() => {
  const solidVariants = ["primary", "accent", "danger", "success"];
  return solidVariants.includes(props.variant) ? "white" : "primary";
});

const variantClasses = computed(() => {
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white dark:bg-neutral-600 dark:hover:bg-brand-700",
    secondary:
      "bg-brand-50 dark:bg-gray-700 hover:bg-brand-100 dark:hover:bg-gray-600 text-brand-700 dark:text-gray-300 border border-brand-200 dark:border-gray-600",
    accent:
      "bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-500/30",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    ghost:
      "bg-transparent hover:bg-brand-50 dark:hover:bg-gray-700 text-brand-700 dark:text-gray-300",
  };
  return variants[props.variant] || variants.primary;
});
</script>

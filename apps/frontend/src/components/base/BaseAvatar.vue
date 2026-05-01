<template>
  <div class="relative inline-block">
    <!-- Avatar Image -->
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      :class="sizeClass"
      class="rounded-full object-cover bg-gray-200 dark:bg-neutral-800"
      @error="imageError = true"
    />

    <!-- Fallback Avatar -->
    <div
      v-else
      :class="[sizeClass, bgClass, textClass]"
      class="rounded-full flex items-center justify-center font-semibold"
    >
      <span v-if="initials">{{ initials }}</span>
      <AppIcon v-else name="User" customClass="w-1/2 h-1/2" />
    </div>

    <!-- Status Indicator -->
    <span
      v-if="status"
      :class="[statusClass, statusSizeClass]"
      class="absolute bottom-0 rounded-full border-2 border-white dark:border-neutral-900"
    ></span>

    <!-- Online Badge -->
    <span
      v-if="showOnline"
      class="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-white dark:border-neutral-900"
    ></span>

    <!-- Notification Badge -->
    <span
      v-if="badge"
      :class="[badgeClass]"
      class="absolute -top-1 -left-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold text-white"
    >
      {{ badge > 99 ? "99+" : badge }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { AppIcon } from "@/icons";

const props = defineProps({
  src: { type: String, default: "" },
  alt: { type: String, default: "Avatar" },
  name: { type: String, default: "" },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl", "2xl"].includes(v),
  },
  status: {
    type: String,
    default: null,
    validator: (v) => [null, "online", "offline", "busy", "away"].includes(v),
  },
  showOnline: { type: Boolean, default: false },
  badge: { type: [Number, String], default: null },
  variant: {
    type: String,
    default: "primary",
    validator: (v) =>
      ["primary", "success", "warning", "error", "gradient"].includes(v),
  },
});

const imageError = ref(false);

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-20 h-20 text-2xl",
};

const statusSizes = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
  "2xl": "w-5 h-5",
};

const initials = computed(() => {
  if (!props.name) return "";
  const parts = props.name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return props.name.slice(0, 2).toUpperCase();
});

const sizeClass = computed(() => sizeClasses[props.size]);
const statusSizeClass = computed(() => statusSizes[props.size]);

const bgClass = computed(() => {
  if (props.variant === "gradient") {
    return "bg-gradient-to-br from-brand-500 to-accent-500";
  }
  const variants = {
    primary:
      "bg-brand-100 dark:bg-neutral-900/40 text-brand-600 dark:text-neutral-400",
    success:
      "bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400",
    warning:
      "bg-warning-100 dark:bg-warning-900/40 text-warning-600 dark:text-warning-400",
    error:
      "bg-error-100 dark:bg-error-900/40 text-error-600 dark:text-error-400",
  };
  return variants[props.variant];
});

const textClass = computed(() => "text-gray-900 dark:text-white");

const statusClass = computed(() => {
  const statuses = {
    online: "bg-success-500",
    offline: "bg-gray-400",
    busy: "bg-error-500",
    away: "bg-warning-500",
  };
  return statuses[props.status];
});

const badgeClass = computed(() => {
  return "bg-error-500";
});
</script>

<template>
  <div
    :class="wrapperClasses"
    role="status"
    :aria-label="resolvedLabel"
    :data-loading-kind="'spinner'"
    :data-loading-usage="usage"
  >
    <span
      v-if="resolvedVariant === 'dual-ring'"
      :class="spinnerClasses"
      class="spinner-dual-ring"
      aria-hidden="true"
    ></span>
    
    <span
      v-else-if="resolvedVariant === 'sequential-dots'"
      :class="spinnerClasses"
      class="spinner-sequential-dots"
      aria-hidden="true"
    >
      <span class="spinner-dot"></span>
      <span class="spinner-dot"></span>
      <span class="spinner-dot"></span>
      <span class="spinner-dot"></span>
    </span>

    <span class="sr-only">{{ resolvedLabel }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSiteSettings } from "@/composables/useSiteSettings";

const props = defineProps({
  variant: {
    type: String,
    default: "dual-ring",
    validator: (v) => !v || ["dual-ring", "sequential-dots"].includes(v),
  },
  size: {
    type: String,
    default: "",
    validator: (v) => !v || ["xs", "sm", "md", "lg", "xl"].includes(v),
  },
  text: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
    validator: (v) => !v || ["primary", "white", "gray"].includes(v),
  },
  usage: {
    type: String,
    default: "inline",
    validator: (v) => ["inline", "action", "section", "overlay", "route"].includes(v),
  },
});

const usageLabels = {
  inline: "جاري تحميل عنصر خفيف",
  action: "جاري تنفيذ الإجراء",
  section: "جاري تحميل القسم",
  overlay: "جاري تنفيذ العملية",
  route: "جاري تجهيز الصفحة",
};

const { siteSettings } = useSiteSettings();

const resolvedVariant = computed(
  () => props.variant || siteSettings.value?.loader_spinner_variant || "dual-ring"
);
const resolvedSize = computed(
  () => props.size || siteSettings.value?.loader_spinner_size || "md"
);
const resolvedColor = computed(
  () => props.color || siteSettings.value?.loader_spinner_color || "primary"
);
const resolvedSpeed = computed(() => siteSettings.value?.loader_spinner_speed || "normal");

const spinnerClasses = computed(() => [
  "spinner-visual",
  `spinner-size-${resolvedSize.value}`,
  `spinner-color-${resolvedColor.value}`,
  `spinner-speed-${resolvedSpeed.value}`,
]);

const resolvedLabel = computed(() => {
  return props.text || usageLabels[props.usage] || "جاري التحميل";
});

const wrapperClasses = computed(() => {
  const displayClass =
    props.usage === "section" || props.usage === "overlay" || props.usage === "route"
      ? "flex"
      : "inline-flex";

  return `${displayClass} items-center justify-center`;
});
</script>

<style scoped>
.spinner-visual {
  --spinner-leading: rgb(37 99 235 / 1);
  --spinner-strong: rgb(29 78 216 / 1);
  --spinner-duration: 1s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dot-gap, 8px);
}

.spinner-size-xs {
  --spinner-size: 18px;
  --dot-size: 4px;
  --dot-gap: 4px;
  --ring-border: 2px;
}

.spinner-size-sm {
  --spinner-size: 24px;
  --dot-size: 6px;
  --dot-gap: 6px;
  --ring-border: 2px;
}

.spinner-size-md {
  --spinner-size: 36px;
  --dot-size: 10px;
  --dot-gap: 8px;
  --ring-border: 3px;
}

.spinner-size-lg {
  --spinner-size: 48px;
  --dot-size: 14px;
  --dot-gap: 10px;
  --ring-border: 3px;
}

.spinner-size-xl {
  --spinner-size: 64px;
  --dot-size: 18px;
  --dot-gap: 12px;
  --ring-border: 4px;
}

.spinner-color-primary {
  --spinner-leading: rgb(37 99 235 / 1);
  --spinner-strong: rgb(29 78 216 / 1);
}

.dark .spinner-color-primary {
  --spinner-leading: rgb(147 197 253 / 1);
  --spinner-strong: rgb(96 165 250 / 1);
}

.spinner-color-white {
  --spinner-leading: rgb(255 255 255 / 1);
  --spinner-strong: rgb(255 255 255 / 0.7);
}

.spinner-color-gray {
  --spinner-leading: rgb(75 85 99 / 1);
  --spinner-strong: rgb(55 65 81 / 1);
}

.dark .spinner-color-gray {
  --spinner-leading: rgb(229 231 235 / 0.96);
  --spinner-strong: rgb(156 163 175 / 0.96);
}

.spinner-speed-slow {
  --spinner-duration: 1.3s;
}

.spinner-speed-normal {
  --spinner-duration: 1s;
}

.spinner-speed-fast {
  --spinner-duration: 0.7s;
}

/* === Dual Ring Variant (s2 mockup) === */
.spinner-dual-ring {
  position: relative;
  width: var(--spinner-size);
  height: var(--spinner-size);
}

.spinner-dual-ring::before,
.spinner-dual-ring::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  border: var(--ring-border) solid transparent;
}

.spinner-dual-ring::before {
  inset: 10%;
  border-top-color: var(--spinner-leading);
  border-right-color: var(--spinner-leading);
  animation: spinner-spin calc(var(--spinner-duration) * 0.86) linear infinite;
}

.spinner-dual-ring::after {
  inset: 25%;
  border-bottom-color: var(--spinner-strong);
  border-left-color: var(--spinner-strong);
  animation: spinner-spin-reverse calc(var(--spinner-duration) * 0.78) linear infinite;
}

@keyframes spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinner-spin-reverse {
  to {
    transform: rotate(-360deg);
  }
}

/* === Sequential Dots Variant === */
.spinner-sequential-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dot-gap);
}

.spinner-dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  background-color: var(--spinner-leading);
  animation: spinner-pulse var(--spinner-duration) ease-in-out infinite;
}

.spinner-dot:nth-child(2) {
  animation-delay: calc(var(--spinner-duration) * 0.12);
}

.spinner-dot:nth-child(3) {
  animation-delay: calc(var(--spinner-duration) * 0.24);
}

.spinner-dot:nth-child(4) {
  animation-delay: calc(var(--spinner-duration) * 0.36);
}

@keyframes spinner-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.42;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-dot {
    animation-duration: 2.1s !important;
  }
  .spinner-dual-ring::before,
  .spinner-dual-ring::after {
    animation-duration: 2.1s !important;
  }
}
</style>

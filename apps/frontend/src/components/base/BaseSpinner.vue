<template>
  <div
    :class="wrapperClasses"
    role="status"
    :aria-label="resolvedLabel"
    :data-loading-kind="'spinner'"
    :data-loading-usage="usage"
    :data-spinner-variant="resolvedVariant"
  >
    <span :class="spinnerClasses" aria-hidden="true">
      <template v-if="usesSvgVariant">
        <svg class="spinner-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="spinner-svg-track" cx="50" cy="50" r="34" />
          <circle class="spinner-svg-dash" cx="50" cy="50" r="34" />
        </svg>
      </template>

      <template v-else-if="resolvedVariant === 'spokes'">
        <span
          v-for="index in 8"
          :key="`spoke-${index}`"
          class="spinner-spoke"
          :style="{
            '--spoke-rotation': `${(index - 1) * 45}deg`,
            '--spoke-delay': `${(index - 1) * 0.08}s`,
          }"
        />
      </template>

      <template v-else-if="resolvedVariant === 'bars'">
        <span
          v-for="(height, index) in barHeights"
          :key="`bar-${index}`"
          class="spinner-bar"
          :style="{
            '--bar-height': height,
            '--bar-delay': `${index * 0.08}s`,
          }"
        />
      </template>

      <template v-else-if="resolvedVariant === 'dual-ring'">
        <span class="spinner-helper spinner-helper-ring-a" />
        <span class="spinner-helper spinner-helper-ring-b" />
      </template>

      <template v-else-if="resolvedVariant === 'orbit-dot'">
        <span class="spinner-helper spinner-orbit-track" />
        <span class="spinner-helper spinner-orbit-dot" />
      </template>

      <template v-else-if="resolvedVariant === 'ripple'">
        <span class="spinner-helper spinner-ripple-a" />
        <span class="spinner-helper spinner-ripple-b" />
      </template>

      <span v-if="showCore" class="spinner-core" />
    </span>
    <span class="sr-only">{{ resolvedLabel }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSiteSettings } from "@/composables/useSiteSettings";

const props = defineProps({
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
  variant: {
    type: String,
    default: "",
    validator: (v) =>
      !v ||
      [
        "arc-gradient",
        "dual-ring",
        "segmented",
        "orbit-dot",
        "draw-arc",
        "spokes",
        "square-corners",
        "diamond",
        "ripple",
        "segmented-soft",
        "fine-dash",
        "bars",
      ].includes(v),
  },
});

const usageLabels = {
  inline: "جاري تحميل عنصر خفيف",
  action: "جاري تنفيذ الجراء",
  section: "جاري تحميل القسم",
  overlay: "جاري تنفيذ العملية",
  route: "جاري تجهيز الصفحة",
};

const { siteSettings } = useSiteSettings();
const barHeights = ["34%", "52%", "72%", "52%", "34%"];

const resolvedVariant = computed(
  () => props.variant || siteSettings.value?.loader_spinner_variant || "arc-gradient"
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
  `spinner-variant-${resolvedVariant.value}`,
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

const usesSvgVariant = computed(
  () => resolvedVariant.value === "draw-arc" || resolvedVariant.value === "fine-dash"
);

const showCore = computed(() =>
  ["arc-gradient", "segmented", "square-corners", "diamond", "ripple", "segmented-soft"].includes(
    resolvedVariant.value
  )
);
</script>

<style scoped>
.spinner-visual {
  --spinner-size: 1.75rem;
  --spinner-border-width: 3px;
  --spinner-track: rgb(191 219 254 / 0.42);
  --spinner-leading: rgb(37 99 235 / 1);
  --spinner-trailing: rgb(96 165 250 / 0.92);
  --spinner-core-color: rgb(37 99 235 / 0.18);
  --spinner-inner-shadow: rgb(255 255 255 / 0.12);
  --spinner-outer-glow: rgb(37 99 235 / 0.12);
  --spinner-duration: 0.95s;
  --spinner-ripple-duration: 1.6s;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--spinner-size);
  height: var(--spinner-size);
  transform: translateZ(0);
}

.spinner-size-xs {
  --spinner-size: 1rem;
  --spinner-border-width: 2px;
}

.spinner-size-sm {
  --spinner-size: 1.25rem;
  --spinner-border-width: 2px;
}

.spinner-size-md {
  --spinner-size: 1.75rem;
  --spinner-border-width: 3px;
}

.spinner-size-lg {
  --spinner-size: 2.25rem;
  --spinner-border-width: 3px;
}

.spinner-size-xl {
  --spinner-size: 3rem;
  --spinner-border-width: 4px;
}

.spinner-color-primary {
  --spinner-track: rgb(191 219 254 / 0.52);
  --spinner-leading: rgb(37 99 235 / 1);
  --spinner-trailing: rgb(96 165 250 / 0.94);
  --spinner-core-color: rgb(37 99 235 / 0.18);
  --spinner-inner-shadow: rgb(255 255 255 / 0.16);
  --spinner-outer-glow: rgb(37 99 235 / 0.16);
}

.dark .spinner-color-primary {
  --spinner-track: rgb(31 41 55 / 0.92);
  --spinner-leading: rgb(147 197 253 / 1);
  --spinner-trailing: rgb(191 219 254 / 0.96);
  --spinner-core-color: rgb(147 197 253 / 0.24);
  --spinner-inner-shadow: rgb(255 255 255 / 0.04);
  --spinner-outer-glow: rgb(96 165 250 / 0.24);
}

.spinner-color-white {
  --spinner-track: rgb(255 255 255 / 0.24);
  --spinner-leading: rgb(255 255 255 / 1);
  --spinner-trailing: rgb(255 255 255 / 0.82);
  --spinner-core-color: rgb(255 255 255 / 0.22);
  --spinner-inner-shadow: rgb(255 255 255 / 0.08);
  --spinner-outer-glow: rgb(255 255 255 / 0.18);
}

.spinner-color-gray {
  --spinner-track: rgb(209 213 219 / 0.72);
  --spinner-leading: rgb(75 85 99 / 1);
  --spinner-trailing: rgb(107 114 128 / 0.92);
  --spinner-core-color: rgb(75 85 99 / 0.16);
  --spinner-inner-shadow: rgb(255 255 255 / 0.12);
  --spinner-outer-glow: rgb(107 114 128 / 0.1);
}

.dark .spinner-color-gray {
  --spinner-track: rgb(55 65 81 / 0.92);
  --spinner-leading: rgb(229 231 235 / 0.96);
  --spinner-trailing: rgb(156 163 175 / 0.92);
  --spinner-core-color: rgb(229 231 235 / 0.2);
  --spinner-inner-shadow: rgb(255 255 255 / 0.04);
  --spinner-outer-glow: rgb(229 231 235 / 0.12);
}

.spinner-speed-slow {
  --spinner-duration: 1.25s;
  --spinner-ripple-duration: 1.95s;
}

.spinner-speed-normal {
  --spinner-duration: 0.95s;
  --spinner-ripple-duration: 1.6s;
}

.spinner-speed-fast {
  --spinner-duration: 0.72s;
  --spinner-ripple-duration: 1.3s;
}

.spinner-core,
.spinner-helper,
.spinner-spoke,
.spinner-bar,
.spinner-svg {
  position: absolute;
}

.spinner-core {
  width: 34%;
  height: 34%;
  border-radius: 9999px;
  background: var(--spinner-core-color);
  box-shadow: 0 0 18px -12px var(--spinner-leading);
}

.spinner-variant-arc-gradient {
  border: var(--spinner-border-width) solid var(--spinner-track);
  border-top-color: var(--spinner-leading);
  border-inline-start-color: var(--spinner-trailing);
  border-radius: 9999px;
  animation: spinner-rotate var(--spinner-duration) linear infinite;
  box-shadow:
    0 0 0 1px var(--spinner-inner-shadow) inset,
    0 8px 18px -14px var(--spinner-outer-glow);
}

.spinner-variant-dual-ring .spinner-helper-ring-a,
.spinner-variant-dual-ring .spinner-helper-ring-b {
  border-radius: 9999px;
  border: var(--spinner-border-width) solid transparent;
}

.spinner-variant-dual-ring .spinner-helper-ring-a {
  inset: 8%;
  border-top-color: var(--spinner-leading);
  border-left-color: var(--spinner-leading);
  animation: spinner-rotate var(--spinner-duration) linear infinite;
}

.spinner-variant-dual-ring .spinner-helper-ring-b {
  inset: 28%;
  border-bottom-color: var(--spinner-trailing);
  border-right-color: var(--spinner-trailing);
  animation: spinner-rotate-reverse calc(var(--spinner-duration) * 0.92) linear infinite;
}

.spinner-variant-segmented {
  border-radius: 9999px;
  background: conic-gradient(
    var(--spinner-leading) 0 18%,
    transparent 18% 32%,
    var(--spinner-trailing) 32% 48%,
    transparent 48% 66%,
    rgb(from var(--spinner-leading) r g b / 0.35) 66% 82%,
    transparent 82% 100%
  );
  -webkit-mask: radial-gradient(circle, transparent 52%, #000 54%);
  mask: radial-gradient(circle, transparent 52%, #000 54%);
  animation: spinner-rotate var(--spinner-duration) linear infinite;
}

.spinner-variant-orbit-dot .spinner-orbit-track {
  inset: 8%;
  border-radius: 9999px;
  border: max(2px, calc(var(--spinner-border-width) - 1px)) solid var(--spinner-track);
}

.spinner-variant-orbit-dot .spinner-orbit-dot {
  top: 8%;
  left: 50%;
  width: max(8px, calc(var(--spinner-size) * 0.14));
  height: max(8px, calc(var(--spinner-size) * 0.14));
  margin-left: calc(max(8px, calc(var(--spinner-size) * 0.14)) / -2);
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--spinner-leading), var(--spinner-trailing));
  box-shadow: 0 0 0 8px rgb(from var(--spinner-leading) r g b / 0.08);
  transform-origin: center calc(var(--spinner-size) * 0.42);
  animation: spinner-rotate var(--spinner-duration) linear infinite;
}

.spinner-svg {
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.spinner-svg-track,
.spinner-svg-dash {
  fill: none;
  stroke-linecap: round;
}

.spinner-svg-track {
  stroke: var(--spinner-track);
  stroke-width: 5;
}

.spinner-svg-dash {
  stroke: var(--spinner-leading);
  stroke-width: 5;
  stroke-dasharray: 120 220;
  animation: spinner-dash calc(var(--spinner-duration) * 1.45) ease-in-out infinite;
}

.spinner-variant-fine-dash .spinner-svg-track {
  stroke-width: 4;
}

.spinner-variant-fine-dash .spinner-svg-dash {
  stroke-width: 4;
  stroke: var(--spinner-trailing);
}

.spinner-variant-spokes .spinner-spoke {
  top: 50%;
  left: 50%;
  width: max(3px, calc(var(--spinner-size) * 0.08));
  height: calc(var(--spinner-size) * 0.24);
  margin: calc(var(--spinner-size) * -0.12) 0 0 calc(var(--spinner-size) * -0.04);
  border-radius: 9999px;
  background: var(--spinner-leading);
  transform: rotate(var(--spoke-rotation)) translateY(calc(var(--spinner-size) * -0.33));
  transform-origin: center calc(var(--spinner-size) * 0.33);
  animation: spinner-blink calc(var(--spinner-duration) * 1.25) linear infinite;
  animation-delay: var(--spoke-delay);
}

.spinner-variant-square-corners {
  width: calc(var(--spinner-size) * 0.82);
  height: calc(var(--spinner-size) * 0.82);
  animation: spinner-rotate calc(var(--spinner-duration) * 1.25) linear infinite;
}

.spinner-variant-square-corners::before,
.spinner-variant-square-corners::after {
  content: "";
  position: absolute;
  border-radius: 18%;
  border: var(--spinner-border-width) solid transparent;
}

.spinner-variant-square-corners::before {
  inset: 0;
  border-top-color: var(--spinner-leading);
  border-left-color: var(--spinner-leading);
}

.spinner-variant-square-corners::after {
  inset: 20%;
  border-bottom-color: var(--spinner-trailing);
  border-right-color: var(--spinner-trailing);
}

.spinner-variant-diamond {
  width: calc(var(--spinner-size) * 0.64);
  height: calc(var(--spinner-size) * 0.64);
  transform: rotate(45deg);
  border: var(--spinner-border-width) solid rgb(from var(--spinner-leading) r g b / 0.25);
  animation: spinner-rotate calc(var(--spinner-duration) * 1.5) linear infinite;
}

.spinner-variant-diamond::after {
  content: "";
  position: absolute;
  inset: 20%;
  border: var(--spinner-border-width) solid var(--spinner-leading);
}

.spinner-variant-ripple .spinner-ripple-a,
.spinner-variant-ripple .spinner-ripple-b {
  border-radius: 9999px;
  border: var(--spinner-border-width) solid var(--spinner-track);
  animation: spinner-ripple var(--spinner-ripple-duration) ease-out infinite;
}

.spinner-variant-ripple .spinner-ripple-a {
  inset: 8%;
}

.spinner-variant-ripple .spinner-ripple-b {
  inset: 24%;
  border-color: var(--spinner-trailing);
  animation-delay: 0.18s;
}

.spinner-variant-segmented-soft {
  border-radius: 9999px;
  background:
    radial-gradient(circle at center, transparent 0 49%, rgb(255 255 255 / 0) 50% 54%, transparent 55%),
    conic-gradient(
      rgb(from var(--spinner-leading) r g b / 0.22) 0 14%,
      var(--spinner-leading) 14% 24%,
      transparent 24% 38%,
      rgb(from var(--spinner-trailing) r g b / 0.18) 38% 48%,
      var(--spinner-trailing) 48% 58%,
      transparent 58% 74%,
      rgb(from var(--spinner-leading) r g b / 0.18) 74% 84%,
      transparent 84% 100%
    );
  animation: spinner-rotate calc(var(--spinner-duration) * 1.08) linear infinite;
}

.spinner-variant-bars {
  gap: calc(var(--spinner-size) * 0.05);
}

.spinner-variant-bars .spinner-bar {
  position: relative;
  width: max(4px, calc(var(--spinner-size) * 0.11));
  height: var(--bar-height);
  border-radius: 9999px;
  background: linear-gradient(180deg, var(--spinner-trailing), var(--spinner-leading));
  animation: spinner-bars calc(var(--spinner-duration) * 1.15) ease-in-out infinite;
  animation-delay: var(--bar-delay);
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinner-rotate-reverse {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1 220;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 120 220;
    stroke-dashoffset: -36;
  }
  100% {
    stroke-dasharray: 120 220;
    stroke-dashoffset: -180;
  }
}

@keyframes spinner-blink {
  0%,
  100% {
    opacity: 0.22;
  }
  50% {
    opacity: 1;
  }
}

@keyframes spinner-ripple {
  0% {
    transform: scale(0.7);
    opacity: 0.88;
  }
  100% {
    transform: scale(1.14);
    opacity: 0;
  }
}

@keyframes spinner-bars {
  0%,
  100% {
    transform: scaleY(0.55);
    opacity: 0.45;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-visual,
  .spinner-helper,
  .spinner-spoke,
  .spinner-bar,
  .spinner-svg-dash {
    animation-duration: 1.8s !important;
  }

  .spinner-core {
    box-shadow: none;
  }
}
</style>

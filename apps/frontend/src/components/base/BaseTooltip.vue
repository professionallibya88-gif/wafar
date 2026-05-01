<template>
  <div class="relative inline-block">
    <div
      @mouseenter="show = true"
      @mouseleave="show = false"
      @focus="show = true"
      @blur="show = false"
    >
      <slot />
    </div>

    <Transition name="tooltip">
      <div
        v-if="show"
        :class="tooltipClass"
        class="absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg whitespace-nowrap"
      >
        <slot name="content">{{ content }}</slot>

        <!-- Arrow -->
        <div
          :class="arrowClass"
          class="absolute w-2 h-2 bg-white border-gray-200"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  placement: {
    type: String,
    default: "top",
    validator: (v) => ["top", "bottom", "left", "right"].includes(v),
  },
  variant: {
    type: String,
    default: "dark",
    validator: (v) =>
      ["dark", "light", "primary", "success", "warning", "error"].includes(v),
  },
});

const show = ref(false);

const tooltipClass = computed(() => {
  const base = "border";
  const variants = {
    dark: "bg-neutral-900 text-white dark:bg-neutral-950 border-gray-700 dark:border-gray-800",
    light: "bg-white text-gray-900 border-gray-200 shadow-lg",
    primary: "bg-brand-600 text-white border-brand-700",
    success: "bg-success-600 text-white border-success-700",
    warning: "bg-warning-500 text-white border-warning-600",
    error: "bg-error-600 text-white border-error-700",
  };
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 ml-2",
    right: "left-full top-1/2 -translate-y-1/2 mr-2",
  };

  return `${base} ${variants[props.variant]} ${positions[props.placement]}`;
});

const arrowClass = computed(() => {
  const base = "rotate-45";
  const positions = {
    top: "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r",
    bottom: "-top-1 left-1/2 -translate-x-1/2 border-t border-l",
    left: "-right-1 top-1/2 -translate-y-1/2 border-t border-r",
    right: "-left-1 top-1/2 -translate-y-1/2 border-b border-l",
  };

  const borderColors = {
    dark: "border-neutral-900 bg-neutral-900",
    light: "border-white bg-white",
    primary: "border-brand-600 bg-brand-600",
    success: "border-success-600 bg-success-600",
    warning: "border-warning-500 bg-warning-500",
    error: "border-error-600 bg-error-600",
  };

  return `${base} ${positions[props.placement]} ${borderColors[props.variant]}`;
});
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>

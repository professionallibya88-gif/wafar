<script setup>
import { computed } from "vue";
import { getIcon, IconSizes, IconColors } from "./index";

const props = defineProps({
  // Icon name (string or component)
  name: {
    type: [String, Object],
    required: true,
  },
  // Default size: xs, sm, md, lg, xl, 2xl, 3xl
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"].includes(v),
  },
  // Color: primary, secondary, success, warning, error, info, white, gray, dark
  color: {
    type: String,
    default: "",
    validator: (v) =>
      !v ||
      [
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
        "white",
        "gray",
        "dark",
      ].includes(v),
  },
  // Extra CSS class
  customClass: {
    type: String,
    default: "",
  },
});

// Size class
const sizeClass = computed(() => {
  return IconSizes[props.size] || IconSizes.md;
});

// Color class
const colorClass = computed(() => {
  if (!props.color) return "";
  return IconColors[props.color] || "";
});

// All classes combined
const iconClasses = computed(() => {
  const classes = [sizeClass.value];
  if (colorClass.value) classes.push(colorClass.value);
  if (props.customClass) classes.push(props.customClass);
  return classes.join(" ");
});

// Get icon component
const iconComponent = computed(() => {
  const name = props.name;

  if (!name) return null;

  // If it's already a component (function or object)
  if (typeof name === "function") return name;
  if (typeof name === "object") return name;

  // If it's a string, resolve it
  if (typeof name === "string") {
    return getIcon(name);
  }

  return null;
});
</script>

<template>
  <component v-if="iconComponent" :is="iconComponent" :class="iconClasses" />
  <span v-else class="inline-block w-5 h-5 bg-gray-300 rounded" />
</template>

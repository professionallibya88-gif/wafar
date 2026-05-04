<template>
  <transition :name="transitionName" :mode="mode">
    <slot />
  </transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // نوع الانتقال: fade, slide, scale, bounce
  type: {
    type: String,
    default: "fade",
  },
  // اتجاه الانتقال: forward, back
  direction: {
    type: String,
    default: "forward",
  },
  // وضع الانتقال: in-out, out-in
  mode: {
    type: String,
    default: "out-in",
  },
});

// تحديد اسم الانتقال بناءً على النوع والاتجاه
const transitionName = computed(() => {
  const typeMap = {
    fade: "page-fade",
    slide: "page-slide",
    scale: "page-scale",
    bounce: "page-bounce",
    reduced: "page-reduced",
  };

  const baseName = typeMap[props.type] || "page-fade";

  // إضافة لاحقة الاتجاه للانتقالات المنزلقة
  if (props.type === "slide") {
    const directionSuffix = props.direction === "back" ? "-back" : "";
    return `${baseName}${directionSuffix}`;
  }

  return baseName;
});
</script>

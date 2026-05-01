<template>
  <transition
    :name="transitionName"
    :mode="mode"
    appear
    :style="{ '--transition-delay': delay + 'ms' }"
  >
    <slot />
  </transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // نوع الانتقال: fade, slide-up, slide-down, scale
  type: {
    type: String,
    default: "fade",
  },
  // تأخير الانتقال بالمللي ثانية
  delay: {
    type: Number,
    default: 0,
  },
  // وضع الانتقال: out-in, in-out
  mode: {
    type: String,
    default: "",
  },
});

const transitionName = computed(() => {
  const typeMap = {
    fade: "section-fade",
    "slide-up": "section-slide-up",
    "slide-down": "section-slide-down",
    scale: "section-scale",
  };

  return typeMap[props.type] || "section-fade";
});
</script>

<style scoped>
/* تأخير الانتقال إذا تم تحديده */
:deep(.section-fade-enter-active),
:deep(.section-slide-up-enter-active),
:deep(.section-slide-down-enter-active),
:deep(.section-scale-enter-active) {
  transition-delay: var(--transition-delay, 0ms);
}
</style>

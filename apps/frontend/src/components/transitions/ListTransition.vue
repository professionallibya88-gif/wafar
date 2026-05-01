<template>
  <transition-group :name="transitionName" tag="div" :class="containerClass">
    <slot />
  </transition-group>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // نوع الانتقال: list, shuffle, fade
  type: {
    type: String,
    default: "list",
  },
  // كلاس الحاوية
  containerClass: {
    type: String,
    default: "",
  },
});

const transitionName = computed(() => {
  const typeMap = {
    list: "list-transition",
    shuffle: "list-shuffle",
    fade: "list-fade",
  };

  return typeMap[props.type] || "list-transition";
});
</script>

<style scoped>
/* ضمان أن الحاوية تحتوي على العناصر بشكل صحيح */
div {
  position: relative;
}
</style>

<template>
  <div :class="wrapperClass" role="status" :aria-label="label">
    <!-- Text Skeleton -->
    <template v-if="type === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        class="skeleton rounded"
        :style="{ height: '1rem', width: i === lines ? lastLineWidth : '100%' }"
      />
    </template>

    <!-- Avatar Skeleton -->
    <template v-else-if="type === 'avatar'">
      <div
        class="rounded-full skeleton"
        :style="{ width: size, height: size }"
      />
    </template>

    <!-- Image Skeleton -->
    <template v-else-if="type === 'image'">
      <div
        class="rounded-lg skeleton"
        :style="{ width: width || '100%', height: height || '200px' }"
      />
    </template>

    <!-- Card Skeleton -->
    <template v-else-if="type === 'card'">
      <div class="space-y-3">
        <div class="skeleton rounded h-40" />
        <div class="space-y-2">
          <div class="skeleton rounded h-4 w-3/4" />
          <div class="skeleton rounded h-4 w-1/2" />
        </div>
      </div>
    </template>

    <!-- Table Skeleton -->
    <template v-else-if="type === 'table'">
      <div class="space-y-3">
        <div class="flex gap-4">
          <div
            v-for="i in columns"
            :key="i"
            class="skeleton rounded h-8 flex-1"
          />
        </div>
        <div v-for="row in rows" :key="row" class="flex gap-4">
          <div
            v-for="i in columns"
            :key="i"
            class="skeleton rounded h-6 flex-1"
          />
        </div>
      </div>
    </template>

    <!-- Custom Skeleton -->
    <template v-else-if="type === 'custom'">
      <slot />
    </template>

    <!-- Loading Text -->
    <span class="sr-only">{{ label || "جاري التحميل..." }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "text",
    validator: (v) =>
      ["text", "avatar", "image", "card", "table", "custom"].includes(v),
  },
  lines: {
    type: Number,
    default: 3,
  },
  lastLineWidth: {
    type: String,
    default: "60%",
  },
  size: {
    type: String,
    default: "48px",
  },
  width: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "",
  },
  rows: {
    type: Number,
    default: 5,
  },
  columns: {
    type: Number,
    default: 4,
  },
  label: {
    type: String,
    default: "",
  },
  animated: {
    type: Boolean,
    default: true,
  },
});

const wrapperClass = computed(() => {
  return props.animated ? "" : "";
});
</script>

<style scoped>
.skeleton {
  background-color: rgb(229 231 235);
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark .skeleton {
  background-color: rgb(31 41 55);
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

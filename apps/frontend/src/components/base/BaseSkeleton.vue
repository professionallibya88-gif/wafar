<template>
  <div
    :class="wrapperClass"
    role="status"
    :aria-label="resolvedLabel"
    :data-loading-kind="'skeleton'"
    :data-loading-usage="resolvedUsage"
  >
    <!-- Text Skeleton -->
    <template v-if="type === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        :class="['rounded', skeletonClass]"
        :style="{ height: '1rem', width: i === lines ? lastLineWidth : '100%' }"
      />
    </template>

    <!-- Avatar Skeleton -->
    <template v-else-if="type === 'avatar'">
      <div
        :class="['rounded-full', skeletonClass]"
        :style="{ width: size, height: size }"
      />
    </template>

    <!-- Image Skeleton -->
    <template v-else-if="type === 'image'">
      <div
        :class="['rounded-lg', skeletonClass]"
        :style="{ width: width || '100%', height: height || '200px' }"
      />
    </template>

    <!-- Card Skeleton -->
    <template v-else-if="type === 'card'">
      <div class="space-y-3">
        <div :class="['rounded h-40', skeletonClass]" />
        <div class="space-y-2">
          <div :class="['rounded h-4 w-3/4', skeletonClass]" />
          <div :class="['rounded h-4 w-1/2', skeletonClass]" />
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
            :class="['rounded h-8 flex-1', skeletonClass]"
          />
        </div>
        <div v-for="row in rows" :key="row" class="flex gap-4">
          <div
            v-for="i in columns"
            :key="i"
            :class="['rounded h-6 flex-1', skeletonClass]"
          />
        </div>
      </div>
    </template>

    <!-- Custom Skeleton -->
    <template v-else-if="type === 'custom'">
      <slot />
    </template>

    <!-- Loading Text -->
    <span class="sr-only">{{ resolvedLabel }}</span>
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
  usage: {
    type: String,
    default: "",
    validator: (v) =>
      ["", "section", "list", "table", "card", "detail", "media"].includes(v),
  },
  animated: {
    type: Boolean,
    default: true,
  },
});

// السكلتون مخصص للتحميلات التي تحتاج الحفاظ على بنية الصفحة أو القائمة أو الجدول.
const usageByType = {
  text: "detail",
  avatar: "media",
  image: "media",
  card: "card",
  table: "table",
  custom: "section",
};

const usageLabels = {
  section: "جاري تجهيز بنية المحتوى",
  list: "جاري تجهيز عناصر القائمة",
  table: "جاري تجهيز بيانات الجدول",
  card: "جاري تجهيز البطاقات",
  detail: "جاري تجهيز تفاصيل المحتوى",
  media: "جاري تجهيز المحتوى المرئي",
};

const resolvedUsage = computed(() => {
  return props.usage || usageByType[props.type] || "section";
});

const resolvedLabel = computed(() => {
  return props.label || usageLabels[resolvedUsage.value] || "جاري التحميل...";
});

const wrapperClass = computed(() => {
  return props.type === "text" ? "space-y-2" : "";
});

const skeletonClass = computed(() => {
  return [
    "bg-gray-200 dark:bg-gray-700",
    props.animated ? "animate-pulse" : "",
  ];
});
</script>

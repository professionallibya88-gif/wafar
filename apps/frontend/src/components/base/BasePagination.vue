<script setup>
import { computed, ref, watch } from "vue";
import AppIcon from "../icons/AppIcon.vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:currentPage", "update:pageSize"]);

const jumpPage = ref(props.currentPage);

watch(
  () => props.currentPage,
  (newVal) => {
    jumpPage.value = newVal;
  }
);

const pages = computed(() => {
  const current = props.currentPage;
  const total = props.totalPages;

  if (total <= 0) return [];

  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

const goToPage = (page) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return;
  emit("update:currentPage", page);
};

const onPageSizeChange = (event) => {
  const newSize = parseInt(event.target.value, 10);
  emit("update:pageSize", newSize);
  // Reset to first page when changing page size
  emit("update:currentPage", 1);
};

const handleJump = () => {
  let targetPage = jumpPage.value;
  if (!targetPage || isNaN(targetPage)) {
    jumpPage.value = props.currentPage;
    return;
  }

  if (targetPage < 1) targetPage = 1;
  if (targetPage > props.totalPages) targetPage = props.totalPages;

  jumpPage.value = targetPage;

  if (targetPage !== props.currentPage) {
    goToPage(targetPage);
  }
};
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 py-3">
    <!-- القسم الأيمن: عدد العناصر وحجم الصفحة -->
    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
      <span v-if="totalItems !== undefined">
        إجمالي العناصر:
        <span class="font-bold text-gray-900 dark:text-gray-100">{{ totalItems }}</span>
      </span>

      <div class="flex items-center gap-2">
        <label for="pageSize" class="sr-only">حجم الصفحة</label>
        <select
          id="pageSize"
          :value="pageSize"
          @change="onPageSizeChange"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        >
          <option :value="20">20 / صفحة</option>
          <option :value="50">50 / صفحة</option>
          <option :value="100">100 / صفحة</option>
          <option :value="200">200 / صفحة</option>
        </select>
      </div>
    </div>

    <!-- القسم الأوسط/الأيسر: أزرار التنقل والانتقال المباشر -->
    <div class="flex flex-wrap items-center gap-4">
      <nav
        class="isolate inline-flex -space-x-px rounded-md shadow-sm rtl:space-x-reverse"
        aria-label="Pagination"
      >
        <!-- الصفحة السابقة -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1 || totalPages === 0"
          class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800"
          title="الصفحة السابقة"
        >
          <span class="sr-only">السابق</span>
          <AppIcon name="chevron-right" class="h-5 w-5" />
        </button>

        <!-- أرقام الصفحات -->
        <template v-for="(page, index) in pages" :key="index">
          <button
            v-if="page !== '...'"
            @click="goToPage(page)"
            :class="[
              page === currentPage
                ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 dark:bg-gray-800',
            ]"
          >
            {{ page }}
          </button>
          <span
            v-else
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-800 focus:outline-offset-0"
          >
            ...
          </span>
        </template>

        <!-- الصفحة التالية -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages || totalPages === 0"
          class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800"
          title="الصفحة التالية"
        >
          <span class="sr-only">التالي</span>
          <AppIcon name="chevron-left" class="h-5 w-5" />
        </button>
      </nav>

      <!-- الانتقال المباشر -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">انتقال إلى:</span>
        <input
          type="number"
          v-model.number="jumpPage"
          @keyup.enter="handleJump"
          @blur="handleJump"
          min="1"
          :max="totalPages || 1"
          class="block w-16 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-center dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  </div>
</template>

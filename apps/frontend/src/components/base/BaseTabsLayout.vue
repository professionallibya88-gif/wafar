<template>
  <div class="space-y-0 sm:space-y-6 relative overflow-hidden">
    <!-- Desktop Header (Hidden on Mobile List if inside a tab, but maybe shown on List view) -->
    <div
      v-if="!isMobile || showMobileList"
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-0"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Layout Container -->
    <div class="flex flex-col sm:block relative">
      <Transition :name="isMobile ? 'slide-left' : 'fade'" mode="out-in">
        <!-- Tabs / Mobile List -->
        <div
          v-if="!isMobile || showMobileList"
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 mt-4 sm:mt-0 w-full overflow-hidden"
        >
          <!-- Desktop Tabs -->
          <div class="hidden sm:flex gap-2 overflow-x-auto pb-2">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="$emit('update:modelValue', tab.key)"
              class="px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center gap-2"
              :class="
                modelValue === tab.key
                  ? 'bg-brand-100 dark:bg-neutral-900/30 text-brand-700 dark:text-neutral-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-gray-700'
              "
            >
              <AppIcon v-if="tab.icon" :name="tab.icon" size="sm" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Mobile List -->
          <div
            class="flex sm:hidden flex-col divide-y divide-gray-100 dark:divide-gray-700/50 border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden"
          >
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="selectTabMobile(tab.key)"
              class="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-right w-full"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-brand-50 dark:bg-gray-700 flex items-center justify-center text-brand-600 dark:text-gray-300">
                  <AppIcon v-if="tab.icon" :name="tab.icon" size="md" />
                </div>
                <span class="text-base font-medium text-gray-900 dark:text-white">{{ tab.label }}</span>
              </div>
              <AppIcon name="ChevronLeft" size="sm" customClass="text-gray-400 rtl:rotate-180" />
            </button>
          </div>
        </div>

        <!-- Tab Content Area -->
        <div
          v-else-if="!showMobileList"
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 min-h-[calc(100vh-80px)] sm:min-h-0 pb-20 sm:pb-0 w-full overflow-hidden"
        >
          <!-- Mobile Content Header (Native-like) -->
          <div
            class="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <button
                @click="backToList"
                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <AppIcon name="ArrowRight" size="sm" customClass="rtl:rotate-180" />
              </button>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ activeTabLabel }}
              </h2>
            </div>
            <!-- Slot for mobile header actions (e.g. Save button) -->
            <slot name="mobile-actions"></slot>
          </div>

          <!-- Content Slot -->
          <div class="p-4 sm:p-6 lg:p-8">
            <slot></slot>
          </div>
        </div>
      </Transition>

      <!-- Desktop Content Area -->
      <div
        v-if="!isMobile"
        class="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden"
      >
        <div class="p-4 sm:p-6 lg:p-8">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AppIcon } from '@/components/icons';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
    // Format: [{ key: 'general', label: 'عام', icon: 'Cog6Tooth' }]
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'back']);

const isMobile = ref(false);
const showMobileList = ref(true);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640; // sm breakpoint in Tailwind
  if (!isMobile.value) {
    showMobileList.value = true;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const selectTabMobile = (key) => {
  emit('update:modelValue', key);
  showMobileList.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const backToList = () => {
  showMobileList.value = true;
  emit('back');
};

const activeTabLabel = computed(() => {
  const tab = props.tabs.find((t) => t.key === props.modelValue);
  return tab ? tab.label : '';
});
</script>

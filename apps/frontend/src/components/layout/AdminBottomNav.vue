<template>
  <div
    class="mobile-bottom-nav lg:hidden safe-area-inset-bottom transition-transform duration-300 fixed bottom-0 inset-x-0 z-40"
    :class="showMobileSidebar ? 'translate-y-full' : 'translate-y-0'"
  >
    <!-- طبقة الخلفية المعزولة لتفادي مشكلة قص العناصر (overflow clipping) بسبب backdrop-filter -->
    <div class="absolute inset-0 bg-layer-navbar/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 pointer-events-none -z-10"></div>

    <div class="relative grid grid-cols-5 gap-1.5 p-2 pb-safe z-10">
      <template v-for="item in items" :key="item.path">
        <!-- الزر الأوسط البارز (الملفات) -->
        <div v-if="item.path === '/admin/files'" class="relative flex flex-col items-center justify-end pb-1.5 xs:pb-2 px-1 rounded-2xl min-h-[60px] xs:min-h-[64px]">
          <router-link
            :to="item.path"
            class="absolute -top-6 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95 z-20"
            :class="[
              isActive(item.path)
                ? 'bg-brand-600 text-white shadow-brand-500/40 scale-105'
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20 dark:bg-brand-600 dark:hover:bg-brand-500',
              'w-14 h-14 ring-[6px] ring-white dark:ring-[#121416]'
            ]"
          >
            <AppIcon :name="item.icon" size="lg" color="white" />
          </router-link>
          
          <span 
            class="text-[11px] font-medium transition-colors relative z-10 pt-4" 
            :class="isActive(item.path) ? 'text-brand-700 dark:text-brand-400' : 'text-neutral-600 dark:text-neutral-400'"
          >{{ item.label }}</span>
        </div>

        <!-- الأزرار العادية -->
        <router-link
          v-else
          :to="item.path"
          class="relative flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all min-h-[60px]"
          :class="
            isActive(item.path)
              ? 'text-brand-700 bg-brand-50 shadow-brand-sm dark:text-neutral-300 dark:bg-neutral-900/30'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-neutral-100 hover:bg-brand-50 dark:hover:bg-neutral-800/80'
          "
        >
          <AppIcon :name="item.icon" size="md" />
          <span class="text-[11px] mt-1 font-medium">{{ item.label }}</span>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup>
import { AppIcon } from "@/components/icons";

defineProps({
  items: {
    type: Array,
    required: true,
  },
  showMobileSidebar: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Function,
    required: true,
  },
});
</script>

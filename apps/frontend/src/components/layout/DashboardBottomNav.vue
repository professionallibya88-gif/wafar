<template>
  <div
    class="mobile-bottom-nav lg:hidden safe-area-inset-bottom transition-transform duration-300 backdrop-blur-md fixed bottom-0 inset-x-0 z-40 bg-layer-navbar/95 border-t border-neutral-200/80 dark:border-neutral-800/80"
    :class="showMobileSidebar ? 'translate-y-full' : 'translate-y-0'"
  >
    <div class="grid grid-cols-5 gap-1.5 p-2 pb-safe">
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="relative flex flex-col items-center justify-center py-2.5 xs:py-3 px-1 rounded-2xl transition-all touch-target min-h-[60px] xs:min-h-[64px]"
        :class="
          isActive(item.path)
            ? 'text-brand-700 bg-brand-50 shadow-brand-sm dark:text-neutral-300 dark:bg-neutral-900/30'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-neutral-100 hover:bg-brand-50 dark:hover:bg-neutral-800/80'
        "
      >
        <span
          v-if="item.requiresAuth && !isAuthenticated"
          class="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-brand-500"
        />
        <AppIcon :name="item.icon" size="md" />
        <span class="text-xs mt-1 font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { AppIcon } from "@/icons";

defineProps({
  items: { type: Array, required: true },
  isAuthenticated: { type: Boolean, default: false },
  showMobileSidebar: { type: Boolean, default: false },
  isActive: { type: Function, required: true },
});
</script>

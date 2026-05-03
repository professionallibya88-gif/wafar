<template>
  <aside
    class="sidebar-menu bg-layer-sidebar shadow-lg overflow-hidden flex flex-col fixed inset-y-0 right-0 z-[110] transition-transform duration-300 w-[19rem] max-w-[calc(100vw-3rem)] lg:sticky lg:top-[5.25rem] lg:inset-y-auto lg:right-auto lg:h-[calc(100vh-6.5rem)] lg:rounded-[1.75rem] lg:flex-shrink-0"
    :class="[
      showMobileSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
      isSidebarCollapsed ? 'lg:w-24 sidebar-collapsed' : 'lg:w-[19rem]',
    ]"
    dir="rtl"
  >
    <div class="flex flex-col h-full">
      <div class="p-4 border-b border-neutral-200/80 dark:border-neutral-800/60">
        <div
          class="flex"
          :class="
            isSidebarCollapsed
              ? 'flex-col items-center gap-3'
              : 'items-start justify-between gap-3'
          "
        >
          <div
            class="flex items-center gap-3"
            :class="isSidebarCollapsed ? 'justify-center' : 'min-w-0'"
          >
            <div
              class="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand-sm flex-shrink-0"
            >
              <AppIcon name="Grid" size="md" color="white" />
            </div>
            <div v-if="!isSidebarCollapsed" class="min-w-0">
              <h2 class="font-semibold text-neutral-900 dark:text-white">
                أقسام الإدارة
              </h2>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                وصول كامل ومنظم حسب المهام
              </p>
            </div>
          </div>

          <div
            class="flex items-center gap-2"
            :class="isSidebarCollapsed ? 'w-full justify-center' : ''"
          >
            <button
              @click="$emit('toggle-collapse')"
              class="hidden lg:inline-flex items-center justify-center w-10 h-10 rounded-2xl text-neutral-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-800 transition-all"
              :aria-label="isSidebarCollapsed ? 'توسيع قائمة الإدارة' : 'طي قائمة الإدارة'"
              :title="isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'"
            >
              <AppIcon
                name="ChevronDoubleRight"
                size="md"
                :customClass="
                  !isSidebarCollapsed
                    ? 'transition-transform duration-300 rotate-180'
                    : 'transition-transform duration-300'
                "
              />
            </button>

            <button
              @click="$emit('close-mobile')"
              class="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-2xl text-neutral-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-800 transition-all"
              aria-label="إغلاق قائمة الإدارة"
            >
              <AppIcon name="XMark" size="md" />
            </button>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-3 pb-3 pt-4 overflow-y-auto">
        <div
          v-for="section in menuSections"
          :key="section.title"
          class="mb-5 last:mb-0"
        >
          <div
            v-if="!isSidebarCollapsed"
            class="px-3 pb-2 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider"
          >
            {{ section.title }}
          </div>
          <div
            v-else
            class="mx-3 mb-2 border-t border-neutral-200 dark:border-neutral-700"
          />

          <router-link
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            @click="$emit('close-mobile')"
            class="admin-nav-item flex items-center gap-3 px-4 py-3 rounded-2xl mb-1"
            :class="{ 'admin-nav-item-active': isActive(item.path) }"
          >
            <AppIcon :name="item.icon" :size="isSidebarCollapsed ? 'lg' : 'md'" />
            <div
              v-if="!isSidebarCollapsed"
              class="flex items-center justify-between gap-3 flex-1 min-w-0"
            >
              <span class="truncate">{{ item.label }}</span>
              <span
                v-if="item.tag"
                class="text-[11px] font-semibold px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300"
              >
                {{ item.tag }}
              </span>
            </div>
          </router-link>
        </div>
      </nav>

      <div
        class="p-3 border-t border-neutral-200/80 dark:border-neutral-800/60"
      >
        <router-link
          to="/"
          class="admin-nav-item flex items-center gap-3 px-4 py-3 rounded-2xl"
        >
          <AppIcon name="ArrowLeft" :size="isSidebarCollapsed ? 'lg' : 'md'" />
          <span v-if="!isSidebarCollapsed">واجهة المستخدم</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { AppIcon } from "@/components/icons";

defineProps({
  menuSections: {
    type: Array,
    required: true,
  },
  showMobileSidebar: {
    type: Boolean,
    default: false,
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Function,
    required: true,
  },
});

defineEmits(["close-mobile", "toggle-collapse"]);
</script>

<style scoped>
.admin-nav-item {
  color: #4b5563;
  transition:
    color 0.2s ease-in-out,
    background-color 0.2s ease-in-out,
    transform 0.2s ease-in-out;
  border-right: 3px solid transparent;
}

.admin-nav-item:hover {
  background-color: #eff6ff;
  color: #1d4ed8;
  transform: translateX(-2px);
}

.dark .admin-nav-item {
  color: #9ca3af;
}

.dark .admin-nav-item:hover {
  background-color: #374151;
  color: #ffffff;
}

.admin-nav-item-active {
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  border-right-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.dark .admin-nav-item-active {
  background-color: #1f2937;
  color: #ffffff;
  border-right-color: #9ca3af;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.sidebar-menu .admin-nav-item {
  min-height: 3.25rem;
}

.sidebar-collapsed .admin-nav-item {
  justify-content: center;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>

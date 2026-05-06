<template>
  <aside
    class="sidebar-menu dashboard-sidebar overflow-hidden flex flex-col fixed inset-y-0 right-0 z-sidebar transition-transform duration-300 lg:inset-y-3 lg:right-3 lg:rounded-[1.75rem]"
    :class="[
      showMobileSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
      sidebarCollapsed ? 'lg:w-24' : 'lg:w-[19rem]',
      'w-[19rem] max-w-[calc(100vw-3rem)]'
    ]"
    dir="rtl"
  >
    <div class="flex flex-col h-full">
      <!-- رأس الشريط الجانبي -->
      <div class="p-4 border-b border-neutral-200/80 dark:border-neutral-800/60 flex lg:block justify-between items-center lg:justify-start">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <img
              v-if="siteSettings?.site_logo"
              :src="siteSettings.site_logo"
              class="w-10 h-10 object-contain"
              :alt="siteSettings?.site_name || 'وفر'"
            />
            <div
              v-else
              class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand-sm"
            >
              <AppIcon name="Grid" size="md" color="white" />
            </div>
            <div v-if="!sidebarCollapsed || showMobileSidebar">
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ siteSettings?.site_name || 'وفر' }} <span class="text-brand-600">برو</span>
              </h2>
            </div>
          </div>
          <button
            v-if="(!sidebarCollapsed || showMobileSidebar)"
            @click="$emit('close-mobile')"
            class="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-white rounded"
          >
            <AppIcon name="XMark" size="md" />
          </button>
        </div>
      </div>

      <!-- عناصر القائمة -->
      <nav class="flex-1 px-3 pb-3 pt-5 space-y-1.5 overflow-y-auto">
        <template v-for="item in menuItems" :key="item.path">
          <!-- فاصل لقوائم الإدارة -->
          <div
            v-if="item.isAdmin && isFirstAdminItem(item)"
            class="pt-4 pb-2"
          >
            <p
              v-if="!sidebarCollapsed"
              class="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >
              الإدارة
            </p>
            <div v-else class="mx-4 border-t border-gray-200 dark:border-gray-700 mt-2 mb-2"></div>
          </div>

          <router-link
            :to="item.path"
            @click="$emit('close-mobile')"
            class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl relative"
            :class="{
              'nav-item-active': isActive(item.path),
              'nav-item-locked': item.requiresAuth && !isAuthenticated,
              'admin-item': item.isAdmin
            }"
          >
            <div v-if="item.requiresAuth && !isAuthenticated" class="absolute inset-0 bg-white/40 dark:bg-neutral-900/40 rounded-xl pointer-events-none z-10 backdrop-blur-[1px]"></div>
            <AppIcon :name="item.icon" size="md" />
            <div
              v-if="!sidebarCollapsed"
              class="flex items-center justify-between gap-3 flex-1 min-w-0"
            >
              <span class="truncate">{{ item.label }}</span>
              <span
                v-if="item.requiresAuth && !isAuthenticated"
                class="text-[10px] font-bold px-2 py-1 rounded-full bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 z-20 shadow-sm border border-white/50 dark:border-neutral-600/50"
              >
                <AppIcon name="LockClosed" class="w-3 h-3 inline-block ml-0.5 align-text-bottom" /> دخول
              </span>
            </div>
          </router-link>
        </template>
      </nav>

      <!-- تذييل الشريط الجانبي -->
      <div
        v-if="!sidebarCollapsed"
        class="p-4 border-t border-neutral-200/80 dark:border-neutral-800/60"
      >
        <div class="bg-brand-600 rounded-xl p-3 text-white shadow-brand-md">
          <p class="text-sm font-medium">تحتاج مساعدة؟</p>
          <router-link
            to="/contact"
            @click="$emit('close-mobile')"
            class="mt-2 block w-full text-center bg-white/20 hover:bg-white/30 text-white text-sm py-2 rounded-lg transition-colors duration-200"
          >
            تواصل معنا
          </router-link>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { AppIcon } from "@/icons";
import { useSiteSettings } from "@/composables/useSiteSettings";

const { siteSettings } = useSiteSettings();

const props = defineProps({
  menuItems: { type: Array, required: true },
  isAuthenticated: { type: Boolean, default: false },
  showMobileSidebar: { type: Boolean, default: false },
  sidebarCollapsed: { type: Boolean, default: false },
  isActive: { type: Function, required: true },
});

const isFirstAdminItem = (item) => {
  const adminItems = props.menuItems.filter(i => i.isAdmin);
  if (adminItems.length === 0) return false;
  return adminItems[0].path === item.path;
};

defineEmits(["close-mobile"]);
</script>

<style scoped>
.nav-item {
  color: #4b5563;
  transition:
    color 0.2s ease-in-out,
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    transform 0.2s ease-in-out;
  border-right: 3px solid transparent;
}

.dark .nav-item {
  color: #9ca3af;
}

.nav-item:hover {
  background-color: #eff6ff; /* أزرق فاتح (brand-50) */
  color: #1d4ed8; /* أزرق داكن (brand-700) */
  transform: translateX(-2px);
}

.dark .nav-item:hover {
  background-color: #4b5563; /* رمادي فاتح نسبياً في الوضع المظلم */
  color: #ffffff;
}

.nav-item-active {
  background-color: #2563eb; /* أزرق أساسي (brand-600) */
  color: #ffffff; /* أبيض واضح */
  font-weight: 600;
  border-right: 3px solid #1d4ed8; /* أزرق داكن */
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.nav-item-locked {
  opacity: 0.92;
}

.dark .nav-item-active {
  background-color: #374151; /* رمادي داكن */
  color: #ffffff; /* أبيض واضح */
  border-right: 3px solid #9ca3af;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.admin-item {
  color: #6b7280;
}

.admin-item:hover {
  background-color: #f9fafb;
  color: #111827;
}

.dark .admin-item:hover {
  background-color: #374151;
  color: #f9fafb;
}

.admin-item.nav-item-active {
  background-color: #f3f4f6;
  color: #111827;
  border-right: 3px solid #4b5563;
  box-shadow: none;
}

.dark .admin-item.nav-item-active {
  background-color: #1f2937;
  color: #f9fafb;
  border-right: 3px solid #9ca3af;
  box-shadow: none;
}
</style>

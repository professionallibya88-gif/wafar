<template>
  <nav
    class="sticky top-0 z-50 bg-layer-navbar/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 safe-area-inset-top"
  >
    <div class="container-fluid">
      <div class="flex justify-between items-center h-[4.25rem] gap-2">
        <!-- شعار منصة وفر -->
        <div class="flex items-center gap-2 xs:gap-4 flex-1 min-w-0">
          <!-- زر فتح القائمة على الموبايل -->
          <button
            @click="$emit('toggle-mobile')"
            class="lg:hidden p-2.5 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
            aria-label="فتح القائمة"
          >
            <AppIcon name="Bars3" size="lg" />
          </button>

          <!-- زر طي/توسيع القائمة على الديسكتوب -->
          <button
            @click="$emit('toggle-collapse')"
            class="hidden lg:flex items-center justify-center w-10 h-10 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
            :class="{ 'rotate-180': !sidebarCollapsed }"
            aria-label="طي/توسيع القائمة"
          >
            <AppIcon
              name="ChevronDoubleRight"
              size="md"
              customClass="transition-transform duration-300"
            />
          </button>

          <div class="flex items-center gap-3 lg:hidden min-w-0">
            <img
              v-if="siteSettings?.site_logo"
              :src="siteSettings.site_logo"
              class="w-9 h-9 object-contain flex-shrink-0"
              :alt="siteSettings?.site_name || 'وفر'"
            />
            <div
              v-else
              class="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand-sm flex-shrink-0"
            >
              <AppIcon name="DocumentText" size="sm" color="white" />
            </div>
            <div class="min-w-0">
              <h1
                class="text-lg font-black text-neutral-900 dark:text-white hidden sm:block tracking-tight truncate"
              >
                {{ siteSettings?.site_name || 'وفر' }} <span class="text-brand-600">برو</span>
              </h1>
              <h1
                class="text-base font-bold text-neutral-900 dark:text-white sm:hidden tracking-tight truncate max-w-[100px] xs:max-w-[160px]"
              >
                {{ siteSettings?.site_name || 'وفر' }}
              </h1>
            </div>
          </div>
        </div>

        <!-- أزرار التحكم -->
        <div class="flex items-center gap-2 md:gap-5 flex-shrink-0 relative z-[70]">
          <ThemeToggle />
          <NotificationBell v-if="isAuthenticated" />

          <div
            v-if="isAuthenticated"
            class="h-6 w-px bg-neutral-200 dark:bg-neutral-700 hidden md:block"
          ></div>

          <!-- قائمة المستخدم -->
          <div v-if="isAuthenticated" class="flex items-center gap-3">
            <div class="hidden md:block text-right">
              <p class="text-sm font-bold text-neutral-900 dark:text-white">
                {{ userName }}
              </p>
              <p
                class="text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {{ userRoleLabel }}
              </p>
            </div>
            <router-link
              to="/profile"
              class="w-10 h-10 bg-brand-50 dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 rounded-full flex items-center justify-center text-brand-600 dark:text-neutral-400 font-bold hover:ring-2 hover:ring-brand-500 hover:ring-offset-2 dark:hover:ring-offset-neutral-900 transition-all overflow-hidden"
            >
              <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else>{{ userName?.charAt(0) || "م" }}</span>
            </router-link>
          </div>

          <div v-else class="flex items-center gap-2">
            <router-link
              :to="registerLink"
              class="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-brand-600 dark:text-neutral-400 hover:bg-brand-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
            >
              إنشاء حساب
            </router-link>
            <router-link
              :to="loginLink"
              class="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-brand-sm hover:shadow-brand-md transition-all"
            >
              <AppIcon name="ArrowLeftEndOnRectangle" size="sm" />
              تسجيل الدخول
            </router-link>
          </div>

          <!-- تسجيل خروج -->
          <button
            v-if="isAuthenticated"
            @click="$emit('logout')"
            class="flex items-center gap-2 p-2.5 text-neutral-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-xl transition-all"
            title="تسجيل خروج"
          >
            <AppIcon name="ArrowRightStartOnRectangle" size="md" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { AppIcon } from "@/icons";
import { ThemeToggle } from "@/base";
import NotificationBell from "@/NotificationBell.vue";
import { buildLoginRedirect } from "@/utils/authRedirect";
import { useSiteSettings } from "@/composables/useSiteSettings";

const { siteSettings } = useSiteSettings();

defineProps({
  isAuthenticated: { type: Boolean, default: false },
  userName: { type: String, default: "" },
  userAvatar: { type: String, default: "" },
  userRoleLabel: { type: String, default: "حساب المستخدم" },
  sidebarCollapsed: { type: Boolean, default: false },
});

const route = useRoute();
const authRedirect = computed(() => buildLoginRedirect(route.fullPath));
const loginLink = computed(() => authRedirect.value);
const registerLink = computed(() => ({
  path: "/register",
  query: authRedirect.value.query,
}));

defineEmits(["toggle-mobile", "toggle-collapse", "logout"]);
</script>

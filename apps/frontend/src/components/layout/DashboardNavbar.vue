<template>
  <nav
    class="sticky top-0 z-50 bg-layer-navbar/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 safe-area-inset-top transition-transform duration-300 ease-in-out"
    :class="[isNavbarHidden ? '-translate-y-full lg:translate-y-0' : 'translate-y-0']"
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
          <div v-if="isAuthenticated" class="flex items-center gap-3 relative" ref="userDropdownRef">
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
            <button
              ref="userDropdownButtonRef"
              @click.stop="toggleUserDropdown"
              class="w-10 h-10 bg-brand-50 dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 rounded-full flex items-center justify-center text-brand-600 dark:text-neutral-400 font-bold hover:ring-2 hover:ring-brand-500 hover:ring-offset-2 dark:hover:ring-offset-neutral-900 transition-all overflow-hidden"
            >
              <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="w-full h-full object-cover" />
              <AppIcon v-else name="User" size="md" />
            </button>

            <!-- القائمة المنسدلة -->
            <Teleport to="body">
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="uiState.isUserDropdownOpen"
                  class="fixed z-[130] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                  :style="userDropdownStyle"
                  @click.stop
                >
                  <div class="py-1">
                    <router-link
                      to="/profile"
                      @click="closeUserDropdown"
                      class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-brand-50 dark:hover:bg-neutral-800 hover:text-brand-600 transition-colors"
                    >
                      <AppIcon name="UserCircle" size="sm" />
                      حسابي
                    </router-link>
                    <div class="h-px bg-neutral-200 dark:bg-neutral-800 my-1"></div>
                    <button
                      @click="handleLogoutClick"
                      class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30 transition-colors"
                    >
                      <AppIcon name="ArrowRightStartOnRectangle" size="sm" />
                      تسجيل خروج
                    </button>
                  </div>
                </div>
              </transition>
            </Teleport>
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
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { AppIcon } from "@/icons";
import { ThemeToggle } from "@/base";
import NotificationBell from "@/NotificationBell.vue";
import { buildLoginRedirect } from "@/utils/authRedirect";
import { useFloatingPosition } from "@/composables/useFloatingPosition";
import { useSiteSettings } from "@/composables/useSiteSettings";

const { siteSettings } = useSiteSettings();

const emit = defineEmits(["toggle-mobile", "toggle-collapse", "logout"]);

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

// User Dropdown Logic
const uiState = reactive({
  isUserDropdownOpen: false,
});
const userDropdownRef = ref(null);
const userDropdownButtonRef = ref(null);

const { floatingStyle: userDropdownStyle } = useFloatingPosition({
  triggerRef: userDropdownButtonRef,
  isOpen: computed(() => uiState.isUserDropdownOpen),
  desktopWidth: 192,
  mobileWidth: (viewportWidth) => Math.min(280, viewportWidth - 32),
  viewportPadding: 16,
  offset: 8,
  mobileBreakpoint: 640,
  centerOnMobile: false,
  align: "end",
});

const toggleUserDropdown = () => {
  uiState.isUserDropdownOpen = !uiState.isUserDropdownOpen;
};

const closeUserDropdown = () => {
  uiState.isUserDropdownOpen = false;
};

const handleLogoutClick = () => {
  closeUserDropdown();
  emit("logout");
};

const handleClickOutside = (event) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    closeUserDropdown();
  }
};

// Navbar Scroll Logic
const isNavbarHidden = ref(false);
let lastScrollY = 0;
const SCROLL_THRESHOLD = 10; // الحد الأدنى للتمرير قبل الإخفاء/الإظهار

const handleScroll = () => {
  // تفعيل الخاصية فقط على الموبايل والتابلت (أقل من 1024px)
  if (window.innerWidth >= 1024) {
    if (isNavbarHidden.value) isNavbarHidden.value = false;
    return;
  }

  // استخدم Dashboard Layout's main scroll container if available, otherwise window
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  
  if (Math.abs(scrollY - lastScrollY) < SCROLL_THRESHOLD) {
    return;
  }

  // إذا كان التمرير لأسفل وتجاوزنا ارتفاع النافبار (حوالي 68px)
  if (scrollY > lastScrollY && scrollY > 70) {
    isNavbarHidden.value = true;
  } else if (scrollY < lastScrollY) {
    isNavbarHidden.value = false;
  }

  lastScrollY = scrollY <= 0 ? 0 : scrollY;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // استخدام scroll event مع passive لتحسين الأداء
  window.addEventListener("scroll", handleScroll, { passive: true });
  // إذا كان المحتوى بداخل main element فيه overflow-auto
  const mainEl = document.querySelector('.dashboard-main');
  if (mainEl) {
    mainEl._navScrollHandler = (e) => {
      if (window.innerWidth >= 1024) {
        if (isNavbarHidden.value) isNavbarHidden.value = false;
        return;
      }
      const scrollY = e.target.scrollTop;
      if (Math.abs(scrollY - lastScrollY) < SCROLL_THRESHOLD) return;
      if (scrollY > lastScrollY && scrollY > 70) {
        isNavbarHidden.value = true;
      } else if (scrollY < lastScrollY) {
        isNavbarHidden.value = false;
      }
      lastScrollY = scrollY <= 0 ? 0 : scrollY;
    };
    mainEl.addEventListener("scroll", mainEl._navScrollHandler, { passive: true });
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll);
  const mainEl = document.querySelector('.dashboard-main');
  if (mainEl && mainEl._navScrollHandler) {
    mainEl.removeEventListener("scroll", mainEl._navScrollHandler);
    delete mainEl._navScrollHandler;
  }
});
</script>

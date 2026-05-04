<template>
  <nav
    class="sticky top-0 z-40 overflow-visible bg-layer-navbar/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 safe-area-inset-top transition-transform duration-300 ease-in-out"
    :class="[isNavbarHidden ? '-translate-y-full lg:translate-y-0' : 'translate-y-0']"
  >
    <div class="container-fluid overflow-visible">
      <div class="flex justify-between items-center h-[4.25rem] gap-3 overflow-visible">
        <div class="flex items-center gap-3 min-w-0">
          <button
            @click="$emit('toggle-mobile')"
            class="lg:hidden p-2.5 text-neutral-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
            aria-label="فتح قائمة الإدارة"
          >
            <AppIcon name="Bars3" size="lg" />
          </button>

          <router-link
            to="/admin"
            class="flex items-center gap-3 min-w-0"
          >
            <div
              class="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-brand-sm flex-shrink-0"
            >
              <AppIcon name="ShieldCheck" size="md" color="white" />
            </div>
            <div class="min-w-0">
              <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                لوحة تحكم الإدارة
              </h1>
              <p class="hidden sm:block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                إدارة المستخدمين والمحتوى والتشغيل من مكان واحد
              </p>
            </div>
          </router-link>
        </div>

        <div class="flex items-center gap-2 md:gap-4 flex-shrink-0 overflow-visible">
          <div
            class="hidden xl:flex items-center gap-4 px-4 py-2 bg-brand-50 dark:bg-neutral-900/40 rounded-2xl"
          >
            <div class="text-center min-w-[70px]">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                المستخدمون
              </p>
              <p class="text-sm font-bold text-neutral-900 dark:text-white">
                {{ quickStats.totalUsers ?? "-" }}
              </p>
            </div>
            <div class="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
            <div class="text-center min-w-[70px]">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                الملفات
              </p>
              <p class="text-sm font-bold text-neutral-900 dark:text-white">
                {{ quickStats.totalPDFs ?? "-" }}
              </p>
            </div>
          </div>

          <ThemeToggle />

          <div class="relative overflow-visible" ref="adminDropdownRef">
            <button
              @click="isAdminDropdownOpen = !isAdminDropdownOpen"
              class="flex items-center gap-3 pr-2 sm:pr-3 transition-opacity hover:opacity-80"
            >
              <div class="hidden sm:block text-right">
                <p class="text-sm font-bold text-neutral-900 dark:text-white">
                  {{ userName }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ userRoleLabel }}
                </p>
              </div>
              <div
                class="w-10 h-10 rounded-full bg-brand-50 dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 flex items-center justify-center text-brand-700 dark:text-neutral-200 font-bold"
              >
                <AppIcon name="User" size="md" />
              </div>
            </button>

            <!-- القائمة المنسدلة -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isAdminDropdownOpen"
                class="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden z-[130]"
              >
                <div class="py-1">
                  <router-link
                    to="/admin/settings"
                    @click="isAdminDropdownOpen = false"
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
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { AppIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/base";
import { useAdminMenu } from "@/composables/useAdminMenu";

defineProps({
  userName: { type: String, default: "" },
  userRoleLabel: { type: String, default: "مسؤول" },
});

const emit = defineEmits(["toggle-mobile", "logout"]);

const { quickStats, loadQuickStats } = useAdminMenu();

const isAdminDropdownOpen = ref(false);
const adminDropdownRef = ref(null);

const handleLogoutClick = () => {
  isAdminDropdownOpen.value = false;
  emit("logout");
};

const handleClickOutside = (event) => {
  if (adminDropdownRef.value && !adminDropdownRef.value.contains(event.target)) {
    isAdminDropdownOpen.value = false;
  }
};

// Navbar Scroll Logic
const isNavbarHidden = ref(false);
let lastScrollY = 0;
const SCROLL_THRESHOLD = 10;

const handleScroll = () => {
  if (window.innerWidth >= 1024) {
    if (isNavbarHidden.value) isNavbarHidden.value = false;
    return;
  }

  const scrollY = window.scrollY || document.documentElement.scrollTop;
  
  if (Math.abs(scrollY - lastScrollY) < SCROLL_THRESHOLD) return;

  if (scrollY > lastScrollY && scrollY > 70) {
    isNavbarHidden.value = true;
  } else if (scrollY < lastScrollY) {
    isNavbarHidden.value = false;
  }

  lastScrollY = scrollY <= 0 ? 0 : scrollY;
};

onMounted(() => {
  loadQuickStats();
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", handleScroll, { passive: true });
  
  // Add listener to main scroll container if exists
  setTimeout(() => {
    const mainEls = document.querySelectorAll('main');
    mainEls.forEach(mainEl => {
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
    });
  }, 100);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll);
  const mainEls = document.querySelectorAll('main');
  mainEls.forEach(mainEl => {
    if (mainEl._navScrollHandler) {
      mainEl.removeEventListener("scroll", mainEl._navScrollHandler);
      delete mainEl._navScrollHandler;
    }
  });
});
</script>

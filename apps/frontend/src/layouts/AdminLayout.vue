<template>
  <div class="min-h-screen flex flex-col bg-layer-base">
    <nav
      class="sticky top-0 z-40 overflow-visible bg-layer-navbar/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 safe-area-inset-top transition-transform duration-300 ease-in-out"
      :class="[isNavbarHidden ? '-translate-y-full lg:translate-y-0' : 'translate-y-0']"
    >
      <div class="container-fluid overflow-visible">
        <div class="flex justify-between items-center h-[4.25rem] gap-3 overflow-visible">
          <div class="flex items-center gap-3 min-w-0">
            <button
              @click="toggleMobileSidebar"
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
                    {{ authStore.userName }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ authStore.userRoleLabel }}
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
                  class="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
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

    <div class="flex flex-1 relative">
      <div
        v-if="showMobileSidebar"
        @click="closeMobileSidebar"
        class="fixed inset-0 bg-black/50 z-[100] lg:hidden animate-fade-in"
      />

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
                  @click="toggleSidebarCollapse"
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
                  @click="closeMobileSidebar"
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
              v-for="section in filteredAdminMenuSections"
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
                @click="closeMobileSidebar"
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

      <main
        class="flex-1 min-w-0 p-4 xs:p-6 lg:p-6 xl:p-8 bg-layer-content transition-all duration-300"
        :class="showMobileSidebar ? 'overflow-hidden' : ''"
      >
        <div
          class="max-w-7xl mx-auto pb-32 lg:p-6 xl:p-8 lg:min-h-[calc(100vh-6.5rem)] lg:rounded-[2rem] lg:border lg:border-neutral-200/70 dark:border-neutral-800/70 lg:bg-layer-content"
        >
          <router-view />
        </div>
      </main>
    </div>

    <div
      class="mobile-bottom-nav lg:hidden safe-area-inset-bottom transition-transform duration-300 fixed bottom-0 inset-x-0 z-40"
      :class="showMobileSidebar ? 'translate-y-full' : 'translate-y-0'"
    >
      <!-- طبقة الخلفية المعزولة لتفادي مشكلة قص العناصر (overflow clipping) بسبب backdrop-filter -->
      <div class="absolute inset-0 bg-layer-navbar/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 pointer-events-none -z-10"></div>

      <div class="relative grid grid-cols-5 gap-1.5 p-2 pb-safe z-10">
        <template v-for="item in bottomNavItems" :key="item.path">
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
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { adminAPI } from "@/services/api";
import { useFeatureFlags } from "@/composables/useFeatureFlags";
import { AppIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/base";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isEnabled } = useFeatureFlags();

const showMobileSidebar = ref(false);
const isSidebarCollapsed = ref(false);

// Admin Dropdown Logic
const isAdminDropdownOpen = ref(false);
const adminDropdownRef = ref(null);

const handleLogoutClick = () => {
  isAdminDropdownOpen.value = false;
  handleLogout();
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
  document.body.classList.remove("sidebar-open");
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

const quickStats = ref({
  totalUsers: null,
  totalPDFs: null,
});

const adminMenuSectionsConfig = [
  {
    title: "نظرة عامة",
    items: [
      {
        path: "/admin",
        routeName: "AdminDashboard",
        label: "الرئيسية",
        icon: "ChartBar",
        featureKey: "admin_dashboard",
        showInBottom: true,
      },
      {
        path: "/admin/users",
        routeName: "AdminUsers",
        label: "المستخدمون",
        icon: "Users",
        showInBottom: true,
      },
      {
        path: "/admin/admins",
        routeName: "AdminAdmins",
        label: "المديرون",
        icon: "ShieldExclamation",
      },
      {
        path: "/admin/activity-logs",
        routeName: "AdminActivityLogs",
        label: "سجلات النشاط",
        icon: "ClipboardDocumentList",
        featureKey: "admin_activity_logs",
      },
    ],
  },
  {
    title: "المحتوى والتشغيل",
    items: [
      { path: "/admin/parts", routeName: "AdminParts", label: "قطع الغيار", icon: "Cog" },
      {
        path: "/admin/suppliers",
        routeName: "AdminSuppliers",
        label: "الموردون",
        icon: "BuildingOffice",
      },
      {
        path: "/admin/files",
        routeName: "AdminFiles",
        label: "ملفات PDF",
        icon: "DocumentText",
        showInBottom: true,
      },
      {
        path: "/admin/support-channels",
        routeName: "AdminSupportChannels",
        label: "التواصل والدعم",
        icon: "ChatBubble",
      },
      {
        path: "/admin/support-tickets",
        label: "تذاكر الدعم",
        icon: "ChatBubbleLeftRightIcon",
      },
      {
        path: "/admin/notifications",
        routeName: "AdminNotifications",
        label: "الإشعارات",
        icon: "Bell",
      },
    ],
  },
  {
    title: "الاشتراكات والتحصيل",
    items: [
      {
        path: "/admin/plans",
        routeName: "AdminPlans",
        label: "باقات الاشتراك",
        icon: "CurrencyDollar",
      },
      {
        path: "/admin/payments",
        routeName: "AdminPayments",
        label: "المدفوعات",
        icon: "CreditCard",
        showInBottom: true,
      },
    ],
  },
  {
    title: "الإعدادات والمراقبة",
    items: [
      {
        path: "/admin/analysis-engines",
        routeName: "AdminAnalysisEngines",
        label: "محركات التحليل",
        icon: "CpuChip",
        tag: "PDF",
      },
      {
        path: "/admin/ai-providers",
        routeName: "AdminAIProviders",
        label: "مزودو الذكاء الاصطناعي",
        icon: "Sparkles",
        tag: "AI",
      },
      {
        path: "/admin/settings",
        routeName: "AdminSettings",
        label: "الإعدادات",
        icon: "Cog6Tooth",
        showInBottom: true,
      },
      {
        path: "/admin/monitoring",
        routeName: "AdminMonitoring",
        label: "مراقبة النظام",
        icon: "ChartSquareBar",
        featureKey: "admin_monitoring",
      },
      {
        path: "/admin/advanced-monitoring",
        routeName: "AdminAdvancedMonitoring",
        label: "المراقبة المتقدمة",
        icon: "Signal",
        featureKey: "admin_advanced_monitoring",
      },
    ],
  },
];

const canShowItem = (item) => {
  const routeAllowed = !item.routeName || router.hasRoute(item.routeName);
  const featureAllowed = !item.featureKey || isEnabled(item.featureKey);
  return routeAllowed && featureAllowed;
};

const filteredAdminMenuSections = computed(() =>
  adminMenuSectionsConfig
    .map((section) => ({
      ...section,
      items: section.items.filter(canShowItem),
    }))
    .filter((section) => section.items.length > 0)
);

const loadQuickStats = async () => {
  try {
    const res = await adminAPI.getStats();
    const d = res.data?.data;
    if (d) {
      quickStats.value.totalUsers = d.totalUsers ?? 0;
      quickStats.value.totalPDFs = d.totalPDFs ?? 0;
    }
  } catch {
    quickStats.value.totalUsers = null;
    quickStats.value.totalPDFs = null;
  }
};

const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value;
};

const closeMobileSidebar = () => {
  showMobileSidebar.value = false;
};

watch(showMobileSidebar, (newValue) => {
  if (window.innerWidth < 1024) {
    if (newValue) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }
});

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const bottomNavItems = computed(() => {
  const firstFiveItems = filteredAdminMenuSections.value
    .flatMap((section) => section.items)
    .filter((item) => item.showInBottom)
    .slice(0, 5);

  return firstFiveItems.map(({ path, label, icon }) => ({ path, label, icon }));
});

const isActive = (path) => {
  if (path === "/admin") {
    return route.path === "/admin";
  }
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  if (window.$confirm) {
    const confirmed = await window.$confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟", {
      title: "تأكيد تسجيل الخروج",
      confirmText: "تسجيل خروج",
      cancelText: "إلغاء",
      type: "danger",
      icon: "ArrowRightStartOnRectangle",
      requireTwoSteps: false
    });
    if (!confirmed) return;
  }
  await authStore.logout();
  router.push("/admin/login");
};
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

main {
  scroll-behavior: smooth;
}

:deep(body.sidebar-open) {
  overflow: hidden;
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

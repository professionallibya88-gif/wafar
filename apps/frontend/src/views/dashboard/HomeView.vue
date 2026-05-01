<template>
  <div 
    class="page-shell max-w-7xl mx-auto pb-12 relative"
    :class="{ 'h-[calc(100vh-100px)] overflow-hidden': !isAuthenticated }"
  >
    
    <!-- الغطاء الترويجي للمستخدم غير المسجل (التشويق) -->
    <div 
      v-if="!isAuthenticated" 
      class="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/70 dark:bg-neutral-900/80 backdrop-blur-[4px] rounded-3xl mx-4 lg:mx-0"
    >
      <div class="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-neutral-100 dark:border-neutral-800 text-center transform transition-all hover:scale-105 duration-300 relative z-50">
        <div class="w-20 h-20 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AppIcon name="Sparkles" class="w-10 h-10 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 class="text-2xl font-extrabold text-neutral-900 dark:text-white mb-4">
          {{ siteSettings.landing_hero_title || 'اكتشف منصة وفر لقطع الغيار' }}
        </h2>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed font-medium">
          {{ siteSettings.landing_hero_description || 'المنصة الذكية الأولى في ليبيا للبحث المتقدم ومقارنة أسعار قطع غيار السيارات. قم بإنشاء حسابك الآن لتجربة بحث لا مثيل لها.' }}
        </p>
        <div class="flex flex-col gap-4">
          <router-link 
            to="/login" 
            class="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-brand-sm transition-all duration-200"
          >
            تسجيل الدخول
          </router-link>
          <router-link 
            to="/register" 
            class="w-full py-3.5 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl font-bold transition-all duration-200"
          >
            إنشاء حساب جديد
          </router-link>
        </div>
      </div>
    </div>

    <div :class="{ 'opacity-10 blur-md pointer-events-none select-none transition-all duration-500': !isAuthenticated }" class="space-y-12">
      <!-- Welcome Header -->
    <SectionTransition type="fade" :delay="0">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1
            class="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight"
          >
            {{ welcomeTitle }}
          </h1>
          <p
            class="mt-2 text-lg text-neutral-500 dark:text-neutral-400 font-medium"
          >
            {{ welcomeDescription }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-5 py-2.5 bg-layer-card rounded-full shadow-sm border border-neutral-200 dark:border-neutral-800">
            <span class="relative flex h-3 w-3">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-3 w-3 bg-brand-500"
              ></span>
            </span>
            <span
              class="text-sm font-bold text-neutral-700 dark:text-neutral-300"
              >{{ statusLabelText }}</span
            >
          </div>
          <router-link
            :to="primaryActionPath"
            class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full shadow-brand-sm transition-all duration-200"
          >
            {{ primaryActionLabel }}
          </router-link>
        </div>
      </div>
    </SectionTransition>

    <!-- Quick Search (Prominent & Top) -->
    <SectionTransition
      v-if="isEnabled('search')"
      type="slide-up"
      :delay="50"
    >
      <div class="panel-card p-6 lg:p-10 bg-gradient-to-r from-brand-600 to-brand-800 dark:from-neutral-800 dark:to-neutral-900 border-none shadow-xl rounded-3xl relative overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-brand-400/20 dark:bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2
          class="text-2xl lg:text-3xl font-extrabold text-white mb-8 text-center relative z-10 drop-shadow-md"
        >
          عن ماذا تبحث اليوم؟
        </h2>
        <div class="relative max-w-4xl mx-auto z-10">
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-neutral-400 dark:text-neutral-500"
          >
            <AppIcon name="MagnifyingGlass" class="w-7 h-7" />
          </div>
          <input
            v-model="quickSearch"
            type="text"
            class="w-full pr-16 pl-6 py-5 bg-white dark:bg-neutral-950 border-2 border-transparent focus:border-brand-300 dark:focus:border-brand-700 rounded-2xl shadow-2xl text-xl text-neutral-900 dark:text-neutral-100 transition-all placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
            placeholder="أدخل رقم القطعة، المورد، أو الوصف..."
          />
        </div>
      </div>
    </SectionTransition>

    <!-- Stats Cards -->
    <SectionTransition type="slide-up" :delay="100">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="stat in statsData"
          :key="stat.label"
          class="group bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
        >
          <div class="flex items-center justify-between mb-5">
            <div
              :class="[
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                stat.bgColor,
              ]"
            >
              <AppIcon
                :name="stat.iconName"
                :class="['w-7 h-7', stat.iconColor]"
              />
            </div>
            <span
              :class="[
                'text-sm font-bold px-3 py-1.5 rounded-full',
                stat.trend > 0
                  ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
              ]"
            >
              {{ stat.trend > 0 ? "+" : "" }}{{ stat.trend }}%
            </span>
          </div>
          <div>
            <p
              class="text-4xl font-black text-neutral-900 dark:text-neutral-50 mb-1.5 tracking-tight"
            >
              {{ stat.value }}
            </p>
            <p
              class="text-base font-semibold text-neutral-500 dark:text-neutral-400"
            >
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </SectionTransition>

    <!-- Main Content -->
    <div class="space-y-10">
      <!-- Quick Actions -->
      <SectionTransition type="slide-up" :delay="250">
        <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">
          إجراءات سريعة
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <router-link
            v-for="action in quickActions"
            :key="action.path"
            :to="action.path"
            class="panel-card p-6 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 group relative rounded-3xl"
          >
            <span
              v-if="action.requiresAuth && !isAuthenticated"
              class="absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              دخول
            </span>
            <div class="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-neutral-800 group-hover:bg-brand-100 dark:group-hover:bg-neutral-700 flex items-center justify-center transition-colors">
              <AppIcon
                :name="action.iconName"
                class="w-7 h-7 text-brand-600 dark:text-brand-400"
              />
            </div>
            <span
              class="text-sm font-bold text-neutral-700 dark:text-neutral-300 text-center"
              >{{ action.label }}</span
            >
          </router-link>
        </div>
      </SectionTransition>

      <!-- Recent Activity Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
        <!-- Recent Files -->
        <SectionTransition
          v-if="isEnabled('files') || isEnabled('upload')"
          type="slide-up"
          :delay="300"
        >
          <div class="panel-card p-6 h-full">
            <div class="flex items-center justify-between mb-6">
              <h2
                class="text-xl font-bold text-neutral-900 dark:text-neutral-50"
              >
                {{
                  isAuthenticated
                    ? "أحدث الملفات المعالجة"
                    : "ما الذي ستحصل عليه بعد التسجيل"
                }}
              </h2>
              <router-link
                :to="filesActionPath"
                class="text-sm font-bold text-brand-600 dark:text-neutral-400 hover:text-brand-700"
              >
                {{
                  isAuthenticated
                    ? "عرض السجل الكامل"
                    : "ابدأ الآن"
                }}
                ←
              </router-link>
            </div>

            <div v-if="recentFiles.length === 0" class="text-center py-10 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">
              <div
                class="w-16 h-16 bg-white dark:bg-neutral-900 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm"
              >
                <AppIcon name="DocumentText" class="w-8 h-8 text-neutral-400" />
              </div>
              <p class="text-neutral-500 dark:text-neutral-400 font-medium">
                {{
                  isAuthenticated
                    ? "لم تقم برفع أي ملفات حتى الآن"
                    : "بعد إنشاء الحساب ستظهر هنا الملفات المرفوعة ونتائج معالجتها باحترافية."
                }}
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="file in recentFiles"
                :key="file.id"
                class="flex items-center justify-between p-4 bg-brand-50 dark:bg-neutral-800 rounded-xl hover:bg-brand-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center shadow-sm border border-neutral-200 dark:border-neutral-700"
                  >
                    <AppIcon
                      name="Document"
                      class="w-6 h-6 text-brand-600 dark:text-neutral-400"
                    />
                  </div>
                  <div>
                    <p class="font-bold text-neutral-900 dark:text-neutral-100">
                      {{ file.original_name }}
                    </p>
                    <p
                      class="text-sm text-neutral-500 dark:text-neutral-400 mt-1"
                    >
                      {{ formatDate(file.created_at || file.createdAt) }}
                    </p>
                  </div>
                </div>
                <BaseBadge
                  :variant="getFileStatusVariant(file.status)"
                  size="md"
                  class="px-3 py-1"
                >
                  {{ getFileStatusLabel(file.status) }}
                </BaseBadge>
              </div>
            </div>
          </div>
        </SectionTransition>

        <!-- Recent Searches -->
        <SectionTransition
          v-if="isEnabled('history') || isEnabled('search')"
          type="slide-up"
          :delay="350"
        >
          <div class="panel-card p-6 h-full">
            <div class="flex items-center justify-between mb-6">
              <h2
                class="text-xl font-bold text-neutral-900 dark:text-neutral-50"
              >
                {{
                  isAuthenticated
                    ? "عمليات البحث الأخيرة"
                    : "البحث الذكي بعد تسجيل الدخول"
                }}
              </h2>
              <router-link
                :to="historyActionPath"
                class="text-sm font-bold text-brand-600 dark:text-neutral-400 hover:text-brand-700"
              >
                {{
                  isAuthenticated
                    ? "سجل البحث"
                    : "سجل الدخول"
                }}
                ←
              </router-link>
            </div>

            <div v-if="recentSearches.length === 0" class="text-center py-10 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">
              <div
                class="w-16 h-16 bg-white dark:bg-neutral-900 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm"
              >
                <AppIcon
                  name="MagnifyingGlass"
                  class="w-8 h-8 text-neutral-400"
                />
              </div>
              <p class="text-neutral-500 dark:text-neutral-400 font-medium">
                {{
                  isAuthenticated
                    ? "سجل البحث فارغ حالياً"
                    : "يمكنك مراجعة سجل البحث ومتابعة النتائج فور تسجيل الدخول إلى حسابك."
                }}
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="search in recentSearches.slice(0, 5)"
                :key="search.id"
                @click="goToSearch(search.query)"
                class="flex items-center gap-4 p-4 bg-brand-50 dark:bg-neutral-800 rounded-xl hover:bg-brand-100 dark:hover:bg-neutral-700 hover:border-brand-200 dark:hover:border-brand-800 border border-transparent cursor-pointer transition-all"
              >
                <div
                  class="w-10 h-10 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-sm"
                >
                  <AppIcon name="Clock" class="w-5 h-5 text-neutral-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="font-bold text-neutral-900 dark:text-neutral-100 truncate"
                  >
                    {{ search.query }}
                  </p>
                  <p
                    class="text-xs text-neutral-500 dark:text-neutral-400 mt-1"
                  >
                    {{ search.results_count }} نتيجة موجودة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionTransition>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency } from "@/utils/currency";
import { pdfAPI, searchAPI } from "@/services/api";
import { BaseBadge } from "@/components/base";
import { AppIcon } from "@/components/icons";
import { SectionTransition } from "@/components/transitions";
import { buildLoginRedirect } from "@/utils/authRedirect";
import { useFeatureFlags } from "@/composables/useFeatureFlags";
import { useSiteSettings } from "@/composables/useSiteSettings";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";
import { getFileStatusLabel, getFileStatusVariant } from "@/utils/statusLabels";

const router = useRouter();
const authStore = useAuthStore();
const { isEnabled } = useFeatureFlags();
const { siteSettings } = useSiteSettings();
const quickSearch = ref("");
const recentFiles = ref([]);
const recentSearches = ref([]);
const catalogsCount = ref(0);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const loginRedirect = computed(() => buildLoginRedirect("/upload"));
const primaryActionPath = computed(() => {
  if (!isAuthenticated.value) return "/register";
  if (isEnabled("upload")) return "/upload";
  if (isEnabled("search")) return "/search";
  return "/";
});
const primaryActionLabel = computed(() => {
  if (!isAuthenticated.value) return "إنشاء حساب جديد";
  if (isEnabled("upload")) return "+ رفع ملف جديد";
  if (isEnabled("search")) return "البحث";
  return "الرئيسية";
});
const filesActionPath = computed(() =>
  isAuthenticated.value ? "/files" : loginRedirect.value,
);
const historyActionPath = computed(() =>
  isAuthenticated.value ? "/history" : loginRedirect.value,
);
const welcomeTitle = computed(() => {
  return `مرحباً، ${authStore.userName || "المستخدم"}`;
});

const welcomeDescription = computed(() =>
  isAuthenticated.value
    ? `حسابك الحالي مصنف كـ ${authStore.userRoleLabel}`
    : "مرحباً بك في منصتك لقطع غيار السيارات"
);
const statusLabelText = computed(() =>
  isAuthenticated.value ? "الوضع الحالي" : "وضع الاستشارة",
);

// Stats Data
const statsData = computed(() => {
  if (isAuthenticated.value) {
    const stats = [];
    if (isEnabled("upload") || isEnabled("files")) {
      stats.push({
        label: "الملفات المرفوعة",
        value: String(recentFiles.value.length || 0),
        iconName: "DocumentText",
        bgColor: "bg-brand-100 dark:bg-neutral-900/30",
        iconColor: "text-brand-600 dark:text-neutral-400",
        trend: 12,
      });
    }
    if (isEnabled("catalogs")) {
      stats.push({
        label: "النتائج المتاحة",
        value: String(catalogsCount.value || 0),
        iconName: "BookOpen",
        bgColor: "bg-brand-100 dark:bg-neutral-900/30",
        iconColor: "text-brand-600 dark:text-neutral-400",
        trend: 8,
      });
    }
    if (isEnabled("search") || isEnabled("history")) {
      stats.push({
        label: "عمليات البحث",
        value: String(recentSearches.value.length || 0),
        iconName: "MagnifyingGlass",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        trend: 25,
      });
    }
    if (isEnabled("payments")) {
      stats.push({
        label: "الرصيد",
        value: formatCurrency(500),
        iconName: "CurrencyDollar",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        trend: 0,
      });
    }
    return stats;
  }

  return [
    {
      label: "النتائج",
      iconName: "Sparkles",
      bgColor: "bg-brand-100 dark:bg-neutral-900/30",
      iconColor: "text-brand-600 dark:text-neutral-400",
      trend: 18,
    },
    {
      label: "الأقسام الرئيسية",
      value: "6",
      iconName: "Grid",
      bgColor: "bg-brand-100 dark:bg-neutral-900/30",
      iconColor: "text-brand-600 dark:text-neutral-400",
      trend: 10,
    },
    {
      label: "سرعة الاستجابة",
      iconName: "Bolt",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      trend: 25,
    },
    {
      label: "واجهة عربية",
      value: "RTL",
      iconName: "Globe",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      trend: 0,
    },
  ];
});

// Quick Actions
const quickActions = computed(() =>
  [
    isEnabled("search") && {
      path: "/search",
      label: "البحث",
      iconName: "MagnifyingGlass",
      requiresAuth: true,
    },
    isEnabled("catalogs") && {
      path: "/catalogs",
      label: "الفهارس",
      iconName: "BookOpen",
    },
    isEnabled("upload") && {
      path: "/upload",
      label: "رفع ملف PDF",
      iconName: "CloudArrowUp",
    },
    isEnabled("compare") && {
      path: "/compare",
      label: "المقارنة",
      iconName: "ChartBar",
      requiresAuth: true,
    },
    isEnabled("subscriptions") && {
      path: "/subscriptions",
      label: "الاشتراكات",
      iconName: "CheckCircle",
      requiresAuth: true,
    },
    isEnabled("payments") && {
      path: "/payments",
      label: "الدفعات",
      iconName: "CreditCard",
      requiresAuth: true,
    },
    {
      path: "/profile",
      label: "الملف الشخصي",
      iconName: "User",
      requiresAuth: true,
    },
  ].filter(Boolean)
);

const fetchData = async () => {
  if (!isAuthenticated.value) return;

  const promises = [];
  if (isEnabled("files") || isEnabled("upload")) {
    promises.push(pdfAPI.getFiles({ limit: 5 }));
  }
  if (isEnabled("history") || isEnabled("search")) {
    promises.push(searchAPI.getHistory({ limit: 5 }));
  }
  if (isEnabled("catalogs")) {
    promises.push(pdfAPI.getCatalogs({ limit: 1 }));
  }

  if (promises.length === 0) return;

  try {
    const results = await Promise.all(promises);
    let idx = 0;
    if (isEnabled("files") || isEnabled("upload")) {
      recentFiles.value = results[idx]?.data?.data?.files || [];
      idx++;
    }
    if (isEnabled("history") || isEnabled("search")) {
      recentSearches.value = results[idx]?.data?.data?.history || [];
      idx++;
    }
    if (isEnabled("catalogs")) {
      catalogsCount.value = results[idx]?.data?.meta?.total || 0;
    }
  } catch {
    // تجاهل الأخطاء في التحميل
  }
};

let pollingInterval = null;

onMounted(async () => {
  await fetchData();
  
  if (isAuthenticated.value) {
    pollingInterval = setInterval(fetchData, 10000); // 10 seconds for real-time feel
  }
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});

useAutoApplyFilters(
  () => [quickSearch.value],
  () => doQuickSearch(),
  { delay: 500 }
);

const doQuickSearch = () => {
  if (quickSearch.value.trim()) {
    router.push({ path: "/search", query: { q: quickSearch.value.trim() } });
  }
};

const goToSearch = (query) => {
  router.push({ path: "/search", query: { q: query } });
};

const formatDate = (date) => {
  if (!date) return 'غير محدد';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'غير محدد';
  return d.toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


</script>

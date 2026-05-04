import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  buildLoginRedirect,
  getPostAdminAuthRedirect,
  getPostAuthRedirect,
} from "@/utils/authRedirect";
import { useFeatureFlags } from "@/composables/useFeatureFlags";
import { useNavigationState } from "@/composables/useNavigationState";

let hasCompletedInitialNavigation = false;

const getScrollBehaviorMode = () => {
  if (typeof window === "undefined") {
    return "auto";
  }

  if (!hasCompletedInitialNavigation) {
    return "auto";
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
};

const authPageTransition = {
  preset: "scale",
  reducedMotionPreset: "reduced",
  level: 0,
};

const defaultPageTransition = {
  preset: "fade",
  reducedMotionPreset: "reduced",
  level: 1,
};

const detailPageTransition = {
  preset: "slide",
  reducedMotionPreset: "reduced",
  level: 2,
};

const layoutFadeTransition = {
  preset: "fade",
  reducedMotionPreset: "reduced",
  level: 0,
};

const routes = [
  {
    path: "/auth",
    component: () => import("@/layouts/AuthLayout.vue"),
    meta: {
      layoutTransition: layoutFadeTransition,
      pageTransition: authPageTransition,
      loadingLabel: "جاري تجهيز بوابة الدخول",
    },
    children: [
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/auth/LoginView.vue"),
        meta: { guest: true, title: "تسجيل الدخول" },
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/auth/RegisterView.vue"),
        meta: { guest: true, title: "إنشاء حساب" },
      },
      {
        path: "/forgot-password",
        name: "ForgotPassword",
        component: () => import("@/views/auth/ForgotPasswordView.vue"),
        meta: { guest: true, title: "استعادة كلمة المرور" },
      },
      {
        path: "/admin/login",
        name: "AdminLogin",
        component: () => import("@/views/auth/AdminLoginView.vue"),
        meta: { adminGuest: true, title: "دخول الإدارة" },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/DashboardLayout.vue"),
    meta: {
      layoutTransition: layoutFadeTransition,
      pageTransition: defaultPageTransition,
      loadingLabel: "جاري تجهيز واجهة المستخدم",
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/dashboard/HomeView.vue"),
        meta: { requiresAuth: true, title: "الرئيسية" },
      },
      {
        path: "search",
        name: "Search",
        component: () => import("@/views/dashboard/SearchView.vue"),
        meta: { requiresAuth: true, featureFlag: "search", title: "البحث" },
      },
      {
        path: "catalogs",
        name: "Catalogs",
        component: () => import("@/views/dashboard/CatalogsView.vue"),
        meta: { requiresAuth: true, featureFlag: "catalogs", title: "الكتالوجات" },
      },
      {
        path: "upload",
        name: "UploadPDF",
        component: () => import("@/views/dashboard/UploadPDFView.vue"),
        meta: { requiresAuth: true, featureFlag: "upload", title: "رفع الملفات" },
      },
      {
        path: "files",
        name: "MyFiles",
        component: () => import("@/views/dashboard/MyFilesView.vue"),
        meta: { requiresAuth: true, featureFlag: "files", title: "ملفاتي" },
      },
      {
        path: "files/:id",
        name: "FileDetail",
        component: () => import("@/views/dashboard/FileDetailView.vue"),
        meta: {
          requiresAuth: true,
          featureFlag: "files",
          title: "تفاصيل الملف",
          pageTransition: detailPageTransition,
        },
      },
      {
        path: "compare",
        name: "Compare",
        component: () => import("@/views/dashboard/CompareView.vue"),
        meta: {
          requiresAuth: true,
          featureFlag: "compare",
          title: "المقارنة",
          pageTransition: detailPageTransition,
        },
      },
      {
        path: "cart",
        name: "Cart",
        component: () => import("@/views/dashboard/CartView.vue"),
        meta: { requiresAuth: true, featureFlag: "cart", title: "السلة" },
      },
      {
        path: "my-orders",
        name: "MyOrders",
        component: () => import("@/views/dashboard/MyOrdersView.vue"),
        meta: { requiresAuth: true, featureFlag: "cart", title: "طلباتي" },
      },
      {
        path: "supplier-orders",
        name: "SupplierOrders",
        component: () => import("@/views/dashboard/SupplierOrdersView.vue"),
        meta: { requiresAuth: true, featureFlag: "cart", title: "طلبات المورد" },
      },
      {
        path: "subscriptions",
        name: "Subscriptions",
        component: () => import("@/views/dashboard/SubscriptionsView.vue"),
        meta: {
          requiresAuth: true,
          featureFlag: "subscriptions",
          title: "الاشتراكات",
        },
      },
      {
        path: "payments",
        name: "Payments",
        component: () => import("@/views/dashboard/PaymentsView.vue"),
        meta: { requiresAuth: true, featureFlag: "payments", title: "المدفوعات" },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/dashboard/ProfileView.vue"),
        meta: { requiresAuth: true, title: "الملف الشخصي" },
      },
      {
        path: "history",
        name: "SearchHistory",
        component: () => import("@/views/dashboard/SearchHistoryView.vue"),
        meta: { requiresAuth: true, featureFlag: "history", title: "سجل البحث" },
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("@/views/NotificationsView.vue"),
        meta: {
          requiresAuth: true,
          featureFlag: "notifications",
          title: "الإشعارات",
        },
      },
      {
        path: "contact",
        name: "Contact",
        component: () => import("@/views/dashboard/ContactView.vue"),
        meta: { requiresAuth: true, title: "تواصل معنا" },
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: {
      requiresAdminAuth: true,
      layoutTransition: layoutFadeTransition,
      pageTransition: defaultPageTransition,
      loadingLabel: "جاري تجهيز لوحة الإدارة",
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("@/views/admin/AdminDashboardView.vue"),
        meta: { featureFlag: "admin_dashboard", title: "لوحة الإدارة" },
      },
      {
        path: "parts",
        name: "AdminParts",
        component: () => import("@/views/admin/AdminPartsView.vue"),
        meta: { title: "إدارة القطع" },
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/views/admin/AdminUsersView.vue"),
        meta: { title: "إدارة المستخدمين" },
      },
      {
        path: "admins",
        name: "AdminAdmins",
        component: () => import("@/views/admin/AdminAdminsView.vue"),
        meta: { title: "إدارة المديرين" },
      },
      {
        path: "suppliers",
        name: "AdminSuppliers",
        component: () => import("@/views/admin/AdminSuppliersView.vue"),
        meta: { title: "إدارة الموردين" },
      },
      {
        path: "payments",
        name: "AdminPayments",
        component: () => import("@/views/admin/AdminPaymentsView.vue"),
        meta: { title: "مدفوعات الإدارة" },
      },
      {
        path: "plans",
        name: "AdminPlans",
        component: () => import("@/views/admin/AdminPlansView.vue"),
        meta: { title: "خطط الاشتراك" },
      },
      {
        path: "files",
        name: "AdminFiles",
        component: () => import("@/views/admin/AdminFilesView.vue"),
        meta: { title: "ملفات الإدارة" },
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("@/views/admin/AdminSettingsView.vue"),
        meta: { title: "إعدادات النظام" },
      },
      {
        path: "ai-providers",
        name: "AdminAIProviders",
        component: () => import("@/views/admin/AdminAIProvidersView.vue"),
        meta: { title: "مزودو الذكاء الاصطناعي" },
      },
      {
        path: "analysis-engines",
        name: "AdminAnalysisEngines",
        component: () => import("@/views/admin/AdminAnalysisEnginesView.vue"),
        meta: { title: "محركات التحليل" },
      },
      {
        path: "notifications",
        name: "AdminNotifications",
        component: () => import("@/views/admin/AdminNotificationsView.vue"),
        meta: { title: "إشعارات الإدارة" },
      },
      {
        path: "monitoring",
        name: "AdminMonitoring",
        component: () => import("@/views/admin/AdminMonitoringView.vue"),
        meta: { featureFlag: "admin_monitoring", title: "المراقبة" },
      },
      {
        path: "advanced-monitoring",
        name: "AdminAdvancedMonitoring",
        component: () =>
          import("@/views/admin/AdminAdvancedMonitoringView.vue"),
        meta: { featureFlag: "admin_advanced_monitoring", title: "المراقبة المتقدمة" },
      },
      {
        path: "activity-logs",
        name: "AdminActivityLogs",
        component: () => import("@/views/admin/AdminActivityLogsView.vue"),
        meta: { featureFlag: "admin_activity_logs", title: "سجل النشاط" },
      },
      {
        path: "support-channels",
        name: "AdminSupportChannels",
        component: () => import("@/views/admin/SupportChannelsView.vue"),
        meta: { title: "قنوات الدعم" },
      },
      {
        path: "support-tickets",
        name: "AdminSupportTickets",
        component: () => import("@/views/admin/SupportTicketsView.vue"),
        meta: { title: "تذاكر الدعم" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return { ...savedPosition, behavior: getScrollBehaviorMode() };
    }
    return { top: 0, behavior: getScrollBehaviorMode() };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { startRouteNavigation, finishRouteNavigation } = useNavigationState();

  if (hasCompletedInitialNavigation && to.fullPath !== from.fullPath) {
    startRouteNavigation(to);
  }

  await authStore.initializeAuth();

  // مسارات المدير
  if (to.meta.requiresAdminAuth && (!authStore.isAuthenticated || !authStore.isAdmin)) {
    finishRouteNavigation();
    return next("/admin/login");
  }

  if (to.meta.adminGuest && authStore.isAuthenticated && authStore.isAdmin) {
    finishRouteNavigation();
    return next(getPostAdminAuthRedirect(to.query.redirect));
  }

  // مسارات المستخدمين العاديين (يسمح للمديرين بالدخول أيضاً)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    finishRouteNavigation();
    return next(buildLoginRedirect(to.fullPath));
  }

  // منع المستخدمين المسجلين (بما في ذلك المديرين) من الوصول لصفحة الدخول
  if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      finishRouteNavigation();
      return next(getPostAdminAuthRedirect(to.query.redirect));
    }
    finishRouteNavigation();
    return next(getPostAuthRedirect(authStore, to.query.redirect));
  }

  if (to.meta.featureFlag) {
    const { isEnabled, initialized, loadFlags } = useFeatureFlags();
    if (!initialized.value) {
      await loadFlags();
    }
    if (!isEnabled(to.meta.featureFlag)) {
      finishRouteNavigation();
      return next("/");
    }
  }

  next();
});

router.afterEach(() => {
  const { finishRouteNavigation } = useNavigationState();
  finishRouteNavigation();
});

router.onError(() => {
  const { finishRouteNavigation } = useNavigationState();
  finishRouteNavigation();
});

router.isReady().finally(() => {
  hasCompletedInitialNavigation = true;
});

export default router;

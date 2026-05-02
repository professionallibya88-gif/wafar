import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  buildLoginRedirect,
  getPostAdminAuthRedirect,
  getPostAuthRedirect,
} from "@/utils/authRedirect";
import { useFeatureFlags } from "@/composables/useFeatureFlags";

const routes = [
  {
    path: "/auth",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/auth/LoginView.vue"),
        meta: { guest: true },
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/auth/RegisterView.vue"),
        meta: { guest: true },
      },
      {
        path: "/forgot-password",
        name: "ForgotPassword",
        component: () => import("@/views/auth/ForgotPasswordView.vue"),
        meta: { guest: true },
      },
      {
        path: "/admin/login",
        name: "AdminLogin",
        component: () => import("@/views/auth/AdminLoginView.vue"),
        meta: { adminGuest: true },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/DashboardLayout.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/dashboard/HomeView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "search",
        name: "Search",
        component: () => import("@/views/dashboard/SearchView.vue"),
        meta: { requiresAuth: true, featureFlag: "search" },
      },
      {
        path: "catalogs",
        name: "Catalogs",
        component: () => import("@/views/dashboard/CatalogsView.vue"),
        meta: { requiresAuth: true, featureFlag: "catalogs" },
      },
      {
        path: "upload",
        name: "UploadPDF",
        component: () => import("@/views/dashboard/UploadPDFView.vue"),
        meta: { requiresAuth: true, featureFlag: "upload" },
      },
      {
        path: "files",
        name: "MyFiles",
        component: () => import("@/views/dashboard/MyFilesView.vue"),
        meta: { requiresAuth: true, featureFlag: "files" },
      },
      {
        path: "files/:id",
        name: "FileDetail",
        component: () => import("@/views/dashboard/FileDetailView.vue"),
        meta: { requiresAuth: true, featureFlag: "files" },
      },
      {
        path: "compare",
        name: "Compare",
        component: () => import("@/views/dashboard/CompareView.vue"),
        meta: { requiresAuth: true, featureFlag: "compare" },
      },
      {
        path: "subscriptions",
        name: "Subscriptions",
        component: () => import("@/views/dashboard/SubscriptionsView.vue"),
        meta: { requiresAuth: true, featureFlag: "subscriptions" },
      },
      {
        path: "payments",
        name: "Payments",
        component: () => import("@/views/dashboard/PaymentsView.vue"),
        meta: { requiresAuth: true, featureFlag: "payments" },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/dashboard/ProfileView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "history",
        name: "SearchHistory",
        component: () => import("@/views/dashboard/SearchHistoryView.vue"),
        meta: { requiresAuth: true, featureFlag: "history" },
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("@/views/NotificationsView.vue"),
        meta: { requiresAuth: true, featureFlag: "notifications" },
      },
      {
        path: "contact",
        name: "Contact",
        component: () => import("@/views/dashboard/ContactView.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAdminAuth: true },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("@/views/admin/AdminDashboardView.vue"),
        meta: { featureFlag: "admin_dashboard" },
      },
      {
        path: "parts",
        name: "AdminParts",
        component: () => import("@/views/admin/AdminPartsView.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/views/admin/AdminUsersView.vue"),
      },
      {
        path: "admins",
        name: "AdminAdmins",
        component: () => import("@/views/admin/AdminAdminsView.vue"),
      },
      {
        path: "suppliers",
        name: "AdminSuppliers",
        component: () => import("@/views/admin/AdminSuppliersView.vue"),
      },
      {
        path: "payments",
        name: "AdminPayments",
        component: () => import("@/views/admin/AdminPaymentsView.vue"),
      },
      {
        path: "plans",
        name: "AdminPlans",
        component: () => import("@/views/admin/AdminPlansView.vue"),
      },
      {
        path: "files",
        name: "AdminFiles",
        component: () => import("@/views/admin/AdminFilesView.vue"),
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("@/views/admin/AdminSettingsView.vue"),
      },
      {
        path: "ai-providers",
        name: "AdminAIProviders",
        component: () => import("@/views/admin/AdminAIProvidersView.vue"),
      },
      {
        path: "analysis-engines",
        name: "AdminAnalysisEngines",
        component: () => import("@/views/admin/AdminAnalysisEnginesView.vue"),
      },
      {
        path: "notifications",
        name: "AdminNotifications",
        component: () => import("@/views/admin/AdminNotificationsView.vue"),
      },
      {
        path: "monitoring",
        name: "AdminMonitoring",
        component: () => import("@/views/admin/AdminMonitoringView.vue"),
        meta: { featureFlag: "admin_monitoring" },
      },
      {
        path: "advanced-monitoring",
        name: "AdminAdvancedMonitoring",
        component: () =>
          import("@/views/admin/AdminAdvancedMonitoringView.vue"),
        meta: { featureFlag: "admin_advanced_monitoring" },
      },
      {
        path: "activity-logs",
        name: "AdminActivityLogs",
        component: () => import("@/views/admin/AdminActivityLogsView.vue"),
        meta: { featureFlag: "admin_activity_logs" },
      },
      {
        path: "support-channels",
        name: "AdminSupportChannels",
        component: () => import("@/views/admin/SupportChannelsView.vue"),
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
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  await authStore.initializeAuth();

  // مسارات المدير
  if (to.meta.requiresAdminAuth && (!authStore.isAuthenticated || !authStore.isAdmin)) {
    return next("/admin/login");
  }

  if (to.meta.adminGuest && authStore.isAuthenticated && authStore.isAdmin) {
    return next(getPostAdminAuthRedirect(to.query.redirect));
  }

  // مسارات المستخدمين العاديين (يسمح للمديرين بالدخول أيضاً)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next(buildLoginRedirect(to.fullPath));
  }

  // منع المستخدمين المسجلين (بما في ذلك المديرين) من الوصول لصفحة الدخول
  if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return next(getPostAdminAuthRedirect(to.query.redirect));
    }
    return next(getPostAuthRedirect(authStore, to.query.redirect));
  }

  const { isEnabled, initialized, loadFlags } = useFeatureFlags();
  if (!initialized.value) {
    await loadFlags();
  }
  if (to.meta.featureFlag && !isEnabled(to.meta.featureFlag)) {
    return next("/");
  }

  next();
});

export default router;

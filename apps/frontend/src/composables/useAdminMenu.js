import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { adminAPI } from "@/services/api";
import { useFeatureFlags } from "@/composables/useFeatureFlags";

export const useAdminMenu = () => {
  const router = useRouter();
  const { isEnabled } = useFeatureFlags();

  const quickStats = ref({
    totalUsers: null,
    totalPDFs: null,
  });

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

  const bottomNavItems = computed(() => {
    const firstFiveItems = filteredAdminMenuSections.value
      .flatMap((section) => section.items)
      .filter((item) => item.showInBottom)
      .slice(0, 5);

    return firstFiveItems.map(({ path, label, icon }) => ({ path, label, icon }));
  });

  return {
    quickStats,
    loadQuickStats,
    filteredAdminMenuSections,
    bottomNavItems,
  };
};

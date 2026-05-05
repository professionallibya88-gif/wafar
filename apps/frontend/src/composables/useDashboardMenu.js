import { computed } from "vue";
import { NavIcons, CategoryIcons } from "./useIcons";
import { useFeatureFlags } from "./useFeatureFlags";
import { useAuthStore } from "@/stores/auth";

/**
 * قوائم التنقل للوحة التحكم
 * معزولة في composable لسهولة الاختبار والصيانة
 * تدعم Feature Flags لإخفاء/إظهار الميزات ديناميكياً
 */
export const useDashboardMenu = () => {
  const { isEnabled } = useFeatureFlags();

  const menuItemMap = {
    home: { path: "/", label: "الرئيسية", icon: NavIcons.home, requiresAuth: false },
    search: {
      path: "/search",
      label: "البحث",
      icon: NavIcons.search,
      requiresAuth: true,
      featureKey: "search",
    },
    catalogs: {
      path: "/catalogs",
      label: "الكتالوجات",
      icon: NavIcons.catalogs,
      requiresAuth: true,
      featureKey: "catalogs",
    },
    upload: {
      path: "/upload",
      label: "رفع ملف PDF",
      icon: NavIcons.upload,
      requiresAuth: true,
      featureKey: "upload",
    },
    files: {
      path: "/files",
      label: "ملفاتي",
      icon: NavIcons.files,
      requiresAuth: true,
      featureKey: "files",
    },
    compare: {
      path: "/compare",
      label: "المقارنة",
      icon: NavIcons.compare,
      requiresAuth: true,
      featureKey: "compare",
    },
    cart: {
      path: "/cart",
      label: "سلة المشتريات",
      icon: "ShoppingCart",
      requiresAuth: true,
      featureKey: "cart",
    },
    myOrders: {
      path: "/my-orders",
      label: "طلباتي",
      icon: "ClipboardDocumentList",
      requiresAuth: true,
      featureKey: "cart",
    },
    supplierOrders: {
      path: "/supplier-orders",
      label: "طلبات العملاء",
      icon: "Inbox",
      requiresAuth: true,
      featureKey: "cart",
    },
    history: {
      path: "/history",
      label: "سجل البحث",
      icon: NavIcons.history,
      requiresAuth: true,
      featureKey: "history",
    },
    subscriptions: {
      path: "/subscriptions",
      label: "الاشتراكات",
      icon: NavIcons.subscriptions,
      requiresAuth: true,
      featureKey: "subscriptions",
    },
    payments: {
      path: "/payments",
      label: "المدفوعات",
      icon: NavIcons.payments,
      requiresAuth: true,
      featureKey: "payments",
    },
    notifications: {
      path: "/notifications",
      label: "الإشعارات",
      icon: CategoryIcons.notifications,
      requiresAuth: true,
      featureKey: "notifications",
    },
    contact: {
      path: "/contact",
      label: "تواصل معنا",
      icon: "ChatBubbleLeftRight",
      requiresAuth: true,
    },
    profile: {
      path: "/profile",
      label: "حسابي",
      icon: NavIcons.profile,
      requiresAuth: true,
    },
  };

  const buildItems = (keys, overrides = {}) =>
    keys.map((key) => ({
      ...menuItemMap[key],
      ...(overrides[key] || {}),
    }));

  const rawMenuItems = buildItems([
    "home",
    "search",
    "catalogs",
    "upload",
    "files",
    "compare",
    "cart",
    "myOrders",
    "supplierOrders",
    "history",
    "subscriptions",
    "payments",
    "notifications",
    "contact",
    "profile",
  ]);

  const rawBottomNavItems = buildItems(
    ["home", "search", "upload", "catalogs", "profile"],
    {
      upload: { label: "رفع ملف" },
    }
  );

  const authStore = useAuthStore();

  const menuItems = computed(() => {
    let items = rawMenuItems.filter(
      (item) => !item.featureKey || isEnabled(item.featureKey)
    );

    // Hide supplier specific items if not supplier
    if (authStore.userRole !== 'supplier') {
      items = items.filter((item) => item.path !== '/supplier-orders');
    }

    // Hide retailer specific items (cart, my-orders) if not retailer
    if (authStore.userRole !== 'retailer') {
      items = items.filter((item) => item.path !== '/cart' && item.path !== '/my-orders');
    }

    if (authStore.isAdmin) {
      items.push({
        path: "/admin",
        label: "لوحة الإدارة",
        icon: "ShieldCheck",
        requiresAuth: true,
        isAdmin: true,
      });
      items.push({
        path: "/admin/support-tickets",
        label: "محادثات الدعم",
        icon: "TicketIcon",
        requiresAuth: true,
        isAdmin: true,
      });
      items.push({
        path: "/admin/support-channels",
        label: "إدارة التواصل والدعم",
        icon: "ChatBubble",
        requiresAuth: true,
        isAdmin: true,
      });
    }

    return items;
  });

  const bottomNavItems = computed(() =>
    rawBottomNavItems.filter(
      (item) => !item.featureKey || isEnabled(item.featureKey)
    )
  );

  return { menuItems, bottomNavItems };
};

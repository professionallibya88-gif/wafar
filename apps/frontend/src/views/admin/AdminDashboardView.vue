<template>
  <div class="page-shell">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          لوحة التحكم
        </h1>
        <p class="page-subtitle">
          نظرة شاملة على أداء المنصة
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <BaseButton
          @click="loadDashboardData"
          :disabled="loading"
          variant="secondary"
          size="sm"
        >
          <AppIcon
            name="Refresh"
            size="lg"
            :customClass="loading ? 'animate-spin' : ''"
          />
          تحدث
        </BaseButton>
        <div
          class="flex items-center gap-2 px-4 py-2 bg-layer-card rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700"
        >
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span class="text-sm text-neutral-600 dark:text-neutral-300"
            >النظام يعمل</span
          >
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(stat, index) in statCards"
        :key="stat.label"
        class="group bg-layer-stats rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-900/50 transition-all duration-300 animate-fade-in-up cursor-pointer"
        :style="{ animationDelay: `${index * 100}ms` }"
        @click="stat.action"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ stat.label }}
            </p>
            <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ stat.value }}
            </p>
          </div>
          <div
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center',
              stat.bgColor,
            ]"
          >
            <AppIcon
              :name="stat.iconName"
              size="xl"
              :customClass="stat.iconColor"
            />
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <span
            :class="[
              'text-sm font-medium',
              stat.trend > 0
                ? 'text-green-600 dark:text-green-400'
                : stat.trend < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400',
            ]"
          >
            {{ stat.trend > 0 ? "+" : "" }}{{ stat.trend }}%
          </span>
          <span class="text-sm text-gray-400 dark:text-gray-500"
            >من الشهر الماضي</span
          >
        </div>
      </div>
    </div>

    <!-- Charts م Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Users -->
      <div
        class="lg:col-span-2 bg-layer-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            أحدث المستخدمين
          </h2>
          <router-link
            to="/admin/users"
            class="text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >عرض الكل</router-link
          >
        </div>
        <div class="space-y-4">
          <div
            v-for="user in recentUsers"
            :key="user.id"
            class="flex items-center gap-4 p-3 bg-brand-50 dark:bg-gray-700/50 hover:bg-brand-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <div
              class="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold"
            >
              {{ user.full_name?.charAt(0) || "م" }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ user.full_name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ user.phone }}
              </p>
            </div>
            <BaseBadge
              :variant="getUserRoleBadgeVariant(user.role)"
              size="sm"
            >
              {{ getUserRoleLabel(user.role) }}
            </BaseBadge>
          </div>
          <div v-if="recentUsers.length === 0" class="text-center py-8">
            <p class="text-gray-400 dark:text-gray-500">
              لا يوجد مستخدمون حتى الآن
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div
        class="bg-layer-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          إجراءات سريعة
        </h2>
        <div class="space-y-3">
          <router-link
            v-for="action in quickActions"
            :key="action.path"
            :to="action.path"
            class="flex items-center gap-3 p-4 bg-brand-50 dark:bg-gray-700/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
          >
            <div
              class="w-10 h-10 bg-white dark:bg-gray-600 rounded-xl shadow-sm flex items-center justify-center"
            >
              <AppIcon
                :name="action.iconName"
                size="lg"
                customClass="text-gray-600 dark:text-gray-300"
              />
            </div>
            <span
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ action.label }}</span
            >
          </router-link>
        </div>
      </div>
    </div>

    <!-- Pending Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pending Payments -->
      <div
        class="bg-layer-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            المدفوعات المعلقة
          </h2>
          <router-link
            to="/admin/payments"
            class="text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >عرض الكل</router-link
          >
        </div>
        <div v-if="pendingPayments.length > 0" class="space-y-3">
          <div
            v-for="payment in pendingPayments.slice(0, 3)"
            :key="payment.id"
            class="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800"
          >
            <div
              class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center"
            >
              <AppIcon
                name="CurrencyDollar"
                size="lg"
                customClass="text-yellow-600 dark:text-yellow-400"
              />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ payment.user?.full_name || "مستخدم" }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ payment.amount }} د. - {{ payment.payment_method }}
              </p>
            </div>
            <BaseBadge variant="warning" size="sm">معلق</BaseBadge>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <div
            class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <AppIcon
              name="CheckCircle"
              size="2xl"
              customClass="text-green-500 dark:text-green-400"
            />
          </div>
          <p class="text-gray-500 dark:text-gray-400">
            لا توجد مدفوعات معلقة
          </p>
        </div>
      </div>

      <!-- Recent Files -->
      <div
        class="bg-layer-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            أحدث الملفات
          </h2>
          <router-link
            to="/admin/files"
            class="text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >عرض الكل</router-link
          >
        </div>
        <div v-if="recentFiles.length > 0" class="space-y-3">
          <div
            v-for="file in recentFiles.slice(0, 3)"
            :key="file.id"
            class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div
              class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"
            >
              <AppIcon
                name="Document"
                size="lg"
                customClass="text-red-600 dark:text-red-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white truncate">
                {{ file.original_name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(file.createdAt) }}
              </p>
            </div>
            <BaseBadge :variant="getFileStatusVariant(file.status)" size="sm">
            {{ getFileStatusLabel(file.status) }}
          </BaseBadge>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-400 dark:text-gray-500">
            لا توجد ملفات حتى الآن
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { adminAPI } from "@/services/api";
import { BaseBadge, BaseButton, BaseToast } from "@/components/base";
import { AppIcon } from "@/components/icons";
import { getUserRoleBadgeVariant, getUserRoleLabel } from "@/utils/roleLabels";
import { getFileStatusLabel, getFileStatusVariant } from "@/utils/statusLabels";

const router = useRouter();
const loading = ref(false);

const recentUsers = ref([]);
const recentFiles = ref([]);
const pendingPayments = ref([]);

const statCards = ref([
  {
    label: "المستخدمون",
    value: 0,
    bgColor: "bg-brand-100 dark:bg-neutral-900/30",
    iconColor: "text-brand-600 dark:text-neutral-400",
    iconName: "Users",
    trend: 12,
    action: () => router.push("/admin/users"),
  },
  {
    label: "الشركات الموردة",
    value: 0,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    iconName: "BuildingOffice",
    trend: 8,
    action: () => router.push("/admin/suppliers"),
  },
  {
    label: "ملفات PDF",
    value: 0,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    iconName: "Document",
    trend: 25,
    action: () => router.push("/admin/files"),
  },
  {
    label: "المدفوعات المعلقة",
    value: 0,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    iconName: "CurrencyDollar",
    trend: 0,
    action: () => router.push("/admin/payments"),
  },
]);

const quickActions = [
  {
    path: "/admin/users",
    label: "إدارة المستخدمين",
    iconName: "Users",
  },
  {
    path: "/admin/suppliers",
    label: "إدارة الموردين",
    iconName: "BuildingOffice",
  },
  {
    path: "/admin/payments",
    label: "مراجعة المدفوعات",
    iconName: "CreditCard",
  },
  {
    path: "/admin/plans",
    label: "إدارة الباقات",
    iconName: "ShieldCheck",
  },
];

const loadDashboardData = async () => {
  loading.value = true;
  try {
    // Get stats
    try {
      const res = await adminAPI.getStats();
      const d = res.data?.data;
      if (d) {
        statCards.value[0].value = d.totalUsers || 0;
        statCards.value[1].value = d.totalSuppliers || 0;
        statCards.value[2].value = d.totalPDFs || 0;
        statCards.value[3].value = d.pendingPayments || 0;
      }
    } catch (e) {
      window.$toast.error("خطأ في جلب الإحصائيات");
    }

    // Get recent users
    try {
      const usersRes = await adminAPI.getUsers({
        limit: 5,
        sort: "createdAt",
        order: "DESC",
      });
      recentUsers.value = usersRes.data?.data?.users || [];
    } catch (e) {
      window.$toast.error("خطأ في جلب المستخدمين");
    }

    // Get recent files
    try {
      const filesRes = await adminAPI.getAllFiles({
        limit: 5,
        sort: "createdAt",
        order: "DESC",
      });
      recentFiles.value = filesRes.data?.data?.files || [];
    } catch (e) {
      window.$toast.error("خطأ في جلب الملفات");
    }

    // Get pending payments
    try {
      const paymentsRes = await adminAPI.getPayments({
        status: "pending",
        limit: 5,
      });
      pendingPayments.value = paymentsRes.data?.data?.payments || [];
    } catch (e) {
      window.$toast.error("خطأ في جلب المدفوعات");
    }
  } catch (e) {
    window.$toast.error("خطأ في تحميل البيانات");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


</script>

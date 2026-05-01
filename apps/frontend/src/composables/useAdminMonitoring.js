import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { processingAPI } from "@/services/api";
import {
  getCpuUsagePercent,
  getQueueTotal,
  mapMonitoringTask,
} from "@/utils/adminMonitoring";

const DEFAULT_OPTIONS = {
  includeAlerts: false,
  includeTasks: false,
  defaultRefreshInterval: 10000,
};

const showToast = (toastRef, type, message) => {
  if (toastRef?.value?.addToast) {
    toastRef.value.addToast({ type, message });
    return;
  }

  if (window.$toast?.[type]) {
    window.$toast[type](message);
  }
};

export const useAdminMonitoring = (toastRef, options = {}) => {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  const loading = ref(false);
  const refreshInterval = ref(settings.defaultRefreshInterval);
  const healthStatus = ref("healthy");
  const healthChecks = ref({});
  const systemStats = ref({});
  const queueStats = ref({});
  const alerts = ref([]);
  const totalRequests = ref(0);
  const todayErrors = ref(0);
  const errorRate = ref(0);
  const avgResponse = ref(0);
  const recentTasks = ref([]);

  let refreshTimer = null;

  const queueTotal = computed(() => getQueueTotal(queueStats.value));
  const cpuUsagePercent = computed(() => getCpuUsagePercent(systemStats.value));

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  const updateAutoRefresh = () => {
    stopAutoRefresh();

    if (refreshInterval.value > 0) {
      refreshTimer = setInterval(refreshData, refreshInterval.value);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await processingAPI.acknowledgeAlert(alertId);
      alerts.value = alerts.value.filter((alert) => alert.id !== alertId);
      showToast(toastRef, "success", "تم تأكيد التنبيه");
    } catch {
      showToast(toastRef, "error", "خطأ في تأكيد التنبيه");
    }
  };

  const removeTasksByStatus = async (status) => {
    try {
      const response = await processingAPI.getTasks({ status });
      const tasks = Array.isArray(response.data?.data) ? response.data.data : [];
      await Promise.all(tasks.map((task) => processingAPI.cancelTask(task.id)));
      await refreshData();
      showToast(toastRef, "success", "تم تنظيف المهام بنجاح");
    } catch {
      showToast(toastRef, "error", "تعذر تنظيف المهام");
    }
  };

  const retryFailedTasks = async () => {
    try {
      const response = await processingAPI.getTasks({ status: "failed" });
      const tasks = Array.isArray(response.data?.data) ? response.data.data : [];
      await Promise.all(tasks.map((task) => processingAPI.retryTask(task.id)));
      await refreshData();
      showToast(toastRef, "success", "تمت إعادة المهام الفاشلة");
    } catch {
      showToast(toastRef, "error", "تعذر إعادة المهام الفاشلة");
    }
  };

  const refreshData = async () => {
    loading.value = true;

    try {
      const requests = [
        processingAPI.getHealth(),
        processingAPI.getSystemStats(),
        processingAPI.getProgress(),
        processingAPI.getMetrics(),
      ];

      if (settings.includeAlerts) {
        requests.push(processingAPI.getAlerts({}));
      }

      if (settings.includeTasks) {
        requests.push(processingAPI.getTasks({}));
      }

      const results = await Promise.allSettled(requests);

      const [healthRes, statsRes, progressRes, metricsRes, alertsRes, tasksRes] = results;

      if (healthRes?.status === "fulfilled") {
        healthStatus.value = healthRes.value.data?.data?.status || "unknown";
        healthChecks.value = healthRes.value.data?.data?.checks || {};
      } else {
        healthStatus.value = "unknown";
        healthChecks.value = {};
        showToast(toastRef, "error", "خطأ في جلب حالة الصحة");
      }

      if (statsRes?.status === "fulfilled") {
        systemStats.value = statsRes.value.data?.data || {};
      } else {
        systemStats.value = {};
        showToast(toastRef, "error", "خطأ في جلب إحصائيات النظام");
      }

      if (progressRes?.status === "fulfilled") {
        queueStats.value = progressRes.value.data?.data || {};
      } else {
        queueStats.value = {};
        showToast(toastRef, "error", "خطأ في جلب تقدم المعالجة");
      }

      if (metricsRes?.status === "fulfilled") {
        const metrics = metricsRes.value.data?.data?.stats || {};
        const total = Number(metrics.requests?.total || 0);
        const errors = Number(metrics.errors?.total || 0);

        totalRequests.value = total;
        todayErrors.value = errors;
        avgResponse.value = Math.round(metrics.requests?.avgDuration || 0);
        errorRate.value = total > 0 ? Math.round((errors / total) * 100) : 0;
      } else {
        totalRequests.value = 0;
        todayErrors.value = 0;
        avgResponse.value = 0;
        errorRate.value = 0;
        showToast(toastRef, "error", "خطأ في جلب المقاييس");
      }

      if (settings.includeAlerts) {
        if (alertsRes?.status === "fulfilled") {
          alerts.value = alertsRes.value.data?.data || [];
        } else {
          alerts.value = [];
          showToast(toastRef, "error", "خطأ في جلب التنبيهات");
        }
      }

      if (settings.includeTasks) {
        if (tasksRes?.status === "fulfilled") {
          const tasks = Array.isArray(tasksRes.value.data?.data) ? tasksRes.value.data.data : [];
          recentTasks.value = tasks.slice(0, 10).map(mapMonitoringTask);
        } else {
          recentTasks.value = [];
          showToast(toastRef, "error", "خطأ في جلب المهام");
        }
      }
    } catch {
      showToast(toastRef, "error", "خطأ في تحديث البيانات");
    } finally {
      loading.value = false;
    }
  };

  watch(refreshInterval, updateAutoRefresh);

  onMounted(() => {
    void refreshData();
    updateAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    acknowledgeAlert,
    alerts,
    avgResponse,
    cpuUsagePercent,
    errorRate,
    healthChecks,
    healthStatus,
    loading,
    queueStats,
    queueTotal,
    recentTasks,
    refreshData,
    refreshInterval,
    removeTasksByStatus,
    retryFailedTasks,
    stopAutoRefresh,
    systemStats,
    todayErrors,
    totalRequests,
    updateAutoRefresh,
  };
};

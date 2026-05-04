<template>
  <div class="space-y-6">

    <!-- Header -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          لوحة مراقبة النظام
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          مراقبة أداء النظام والمعالجة في الوقت
          الحقيقي
        </p>
      </div>
      <div class="flex gap-2">
        <BaseSelect
  v-model.number="refreshIntervalTime"
  select-class="form-select"
  @change="updateAutoRefresh"
  :options="[
    { label: 'كل 10 ثوان', value: 10000 },
    { label: 'كل 30 ثانية', value: 30000 },
    { label: 'كل دقيقة', value: 60000 },
    { label: 'بدون تحديث تلقائي', value: 0 },
  ]"
/>
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 bg-brand-50 dark:bg-gray-700 text-brand-700 dark:text-gray-300 rounded-lg hover:bg-brand-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <BaseSpinner v-if="loading" size="sm" usage="action" />
          <AppIcon v-else name="Refresh" size="lg" />
          تحديث
        </button>
      </div>
    </div>

    <!-- System Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Health Status -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            حالة النظام
          </h3>
          <span
            class="w-3 h-3 rounded-full"
            :class="healthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'"
          ></span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ healthStatus === "healthy" ? "سليم" : "مشكلة" }}
        </p>
      </div>

      <!-- Processing Queue -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            قائمة المعالجة
          </h3>
          <AppIcon name="Server" size="lg" color="info" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ queueStats.active || 0 }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          قيد المعالجة الآن
        </p>
      </div>

      <!-- Memory Usage -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            استخدام الذاكرة
          </h3>
          <AppIcon name="CpuChip" size="lg" customClass="text-purple-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ systemStats.memory?.usagePercent || 0 }}%
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ systemStats.memory?.used || "0 MB" }} م 
          {{ systemStats.memory?.total || "0 MB" }}
        </p>
      </div>

      <!-- CPU Usage -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            استخدام المعالج
          </h3>
          <AppIcon name="Bolt" size="lg" customClass="text-orange-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ cpuUsagePercent }}%
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ systemStats.cpu?.cores || 0 }} cores
        </p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Health Details -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          تفاصيل الصحة
        </h2>
        <div class="space-y-4">
          <div
            v-for="(check, key) in healthChecks"
            :key="key"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <span class="font-medium text-gray-700 dark:text-gray-300">{{
              getCheckLabel(key)
            }}</span>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="
                check.status === 'healthy'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              "
            >
              {{ check.status === "healthy" ? "سليم" : "مشكلة" }}
            </span>
          </div>
        </div>
      </div>

      <!-- System Metrics -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          مقاييس النظام
        </h2>
        <div class="space-y-4">
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <span class="font-medium text-gray-700 dark:text-gray-300"
              >وقت التشغيل</span
            >
            <span class="text-gray-900 dark:text-white">{{
              formatUptime(systemStats.uptime)
            }}</span>
          </div>
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <span class="font-medium text-gray-700 dark:text-gray-300"
              >متوسط الحمل</span
            >
            <span class="text-gray-900 dark:text-white">{{
              formatLoadAverage(systemStats.loadAverage)
            }}</span>
          </div>
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <span class="font-medium text-gray-700 dark:text-gray-300"
              >إجمالي الطلبات</span
            >
            <span class="text-gray-900 dark:text-white">{{
              totalRequests
            }}</span>
          </div>
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <span class="font-medium text-gray-700 dark:text-gray-300"
              >أخطاء اليوم</span
            >
            <span class="text-red-600 dark:text-red-400 font-medium">{{
              todayErrors
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">
          التنبيهات
        </h2>
        <span
          class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ alerts.length }} تنبيه
        </span>
      </div>

      <div
        v-if="alerts.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <AppIcon
          name="CheckCircle"
          size="3xl"
          customClass="text-green-400 mx-auto mb-3"
        />
        <p>لا توجد تنبيهات</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="p-4 rounded-lg border"
          :class="getAlertClass(alert.type)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ alert.message }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formatTime(alert.timestamp) }}
              </p>
            </div>
            <button
              @click="acknowledgeAlert(alert.id)"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              تأكيد
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Progress -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
        تقدم المعالجة
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ queueStats.waiting || 0 }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            في الانتظار
          </p>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">
            {{ queueStats.completed || 0 }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">مكتمل</p>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-3xl font-bold text-red-600 dark:text-red-400">
            {{ queueStats.failed || 0 }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">فاشل</p>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {{ queueTotal }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            الإجمالي
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { AppIcon } from "@/components/icons";
import {  BaseSelect, BaseSpinner } from "@/components/base";
import { useAdminMonitoring } from "@/composables/useAdminMonitoring";
import {
  formatDateTime,
  formatLoadAverage,
  formatUptime,
  getAlertClass,
  getCheckLabel,
} from "@/utils/adminMonitoring";

const toast = ref(null);
const {
  acknowledgeAlert,
  alerts,
  cpuUsagePercent,
  healthChecks,
  healthStatus,
  loading,
  queueStats,
  queueTotal,
  refreshData,
  refreshInterval: refreshIntervalTime,
  systemStats,
  todayErrors,
  totalRequests,
  updateAutoRefresh,
} = useAdminMonitoring(toast, {
  includeAlerts: true,
  defaultRefreshInterval: 30000,
});

const formatTime = formatDateTime;
</script>
